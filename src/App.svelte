<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActivityType, CreateContactData, LogActivityData } from '$lib/types';
	
	// Stores
	import { auth, login, logout } from '$lib/stores/auth';
	import { 
		contacts, 
		selectedContactId, 
		selectedContact,
		selectedContactDetails,
		dashboardData, 
		addContact,
		clearContacts
	} from '$lib/stores/contacts';
	import { 
		showContactForm, 
		showActivityForm, 
		activityFormType,
		error,
		successMessage,
		openContactForm,
		closeContactForm,
		openActivityForm,
		closeActivityForm,
		setError,
		setSuccess
	} from '$lib/stores/ui';
	
	// API
	import { 
		listContacts, 
		getDashboard, 
		getContactDetails,
		createContact,
		logActivity
	} from '$lib/api/client';
	
	// Components
	import LoginScreen from '$lib/components/LoginScreen.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MainContent from '$lib/components/MainContent.svelte';
	import ContactForm from '$lib/components/ContactForm.svelte';
	import ActivityForm from '$lib/components/ActivityForm.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	// Granular loading state tracking
	let isLoggingIn = $state(false);
	let isLoadingContacts = $state(false);
	let isLoadingDashboard = $state(false);
	let isLoadingContactDetail = $state(false);

	// Derived state for any loading
	let anyLoading = $derived(
		isLoggingIn || isLoadingContacts || isLoadingDashboard || isLoadingContactDetail
	);

	// Load initial data when authenticated
	async function loadInitialData() {
		if (!$auth.isAuthenticated) return;
		
		isLoadingContacts = true;
		isLoadingDashboard = true;
		
		try {
			// Load contacts and dashboard in parallel
			const [contactsResult, dashboardResult] = await Promise.all([
				listContacts($auth.apiKey).finally(() => { isLoadingContacts = false; }),
				getDashboard($auth.apiKey).finally(() => { isLoadingDashboard = false; })
			]);
			
			if (contactsResult.success && contactsResult.data) {
				$contacts = contactsResult.data;
			} else {
				setError(contactsResult.error || 'Failed to load contacts');
			}
			
			if (dashboardResult.success && dashboardResult.data) {
				$dashboardData = dashboardResult.data;
			}
		} catch (err) {
			setError('Failed to load data. Please try again.');
			isLoadingContacts = false;
			isLoadingDashboard = false;
		}
	}

	// Handle login
	async function handleLogin(data: { username: string; apiKey: string }) {
		isLoggingIn = true;
		
		try {
			// Try to load contacts to validate the API key
			const result = await listContacts(data.apiKey);
			
			if (result.success) {
				login(data.username, data.apiKey);
				$contacts = result.data || [];
				
				// Load dashboard data
				isLoadingDashboard = true;
				const dashResult = await getDashboard(data.apiKey);
				isLoadingDashboard = false;
				if (dashResult.success && dashResult.data) {
					$dashboardData = dashResult.data;
				}
				
				setSuccess('Welcome back, ' + data.username + '!');
			} else {
				setError('Invalid API key. Please check your credentials.');
			}
		} catch (err) {
			setError('Failed to connect. Please try again.');
			isLoadingDashboard = false;
		} finally {
			isLoggingIn = false;
		}
	}

	// Handle logout
	function handleLogout() {
		logout();
		clearContacts();
		$selectedContactId = null;
		$selectedContactDetails = null;
	}

	// Handle contact selection
	async function handleSelectContact(contactId: string) {
		$selectedContactId = contactId;
		isLoadingContactDetail = true;
		
		try {
			const result = await getContactDetails($auth.apiKey, contactId);
			if (result.success && result.data) {
				$selectedContactDetails = result.data;
			} else {
				// If details fail, use basic contact info
				const contact = $contacts.find(c => c.id === contactId);
				if (contact) {
					$selectedContactDetails = { ...contact, activities: [] };
				}
			}
		} catch (err) {
			setError('Failed to load contact details');
		} finally {
			isLoadingContactDetail = false;
		}
	}

	// Handle deselect contact
	function handleDeselectContact() {
		$selectedContactId = null;
		$selectedContactDetails = null;
	}

	// Handle log activity button click
	function handleLogActivityClick(type: ActivityType) {
		openActivityForm(type);
	}

	// Handle create contact
	async function handleCreateContact(data: CreateContactData) {
		try {
			const result = await createContact($auth.apiKey, data);
			
			if (result.success && result.data) {
				addContact(result.data);
				closeContactForm();
				setSuccess('Contact created successfully!');
				
				// Refresh dashboard
				isLoadingDashboard = true;
				const dashResult = await getDashboard($auth.apiKey);
				isLoadingDashboard = false;
				if (dashResult.success && dashResult.data) {
					$dashboardData = dashResult.data;
				}
			} else {
				setError(result.error || 'Failed to create contact');
			}
		} catch (err) {
			setError('Failed to create contact. Please try again.');
			isLoadingDashboard = false;
		}
	}

	// Handle log activity
	async function handleLogActivity(data: LogActivityData) {
		try {
			const result = await logActivity($auth.apiKey, data);
			
			if (result.success) {
				closeActivityForm();
				setSuccess('Activity logged successfully!');
				
				// Refresh contact details if we have one selected
				if ($selectedContactId) {
					isLoadingContactDetail = true;
					const detailsResult = await getContactDetails($auth.apiKey, $selectedContactId);
					isLoadingContactDetail = false;
					if (detailsResult.success && detailsResult.data) {
						$selectedContactDetails = detailsResult.data;
					}
				}
				
				// Refresh dashboard
				isLoadingDashboard = true;
				const dashResult = await getDashboard($auth.apiKey);
				isLoadingDashboard = false;
				if (dashResult.success && dashResult.data) {
					$dashboardData = dashResult.data;
				}
			} else {
				setError(result.error || 'Failed to log activity');
			}
		} catch (err) {
			setError('Failed to log activity. Please try again.');
			isLoadingContactDetail = false;
			isLoadingDashboard = false;
		}
	}

	// Load data on mount if already authenticated
	onMount(() => {
		if ($auth.isAuthenticated) {
			loadInitialData();
		}
	});

	// Derived state for the currently selected contact
	let currentContact = $derived($selectedContactDetails || $selectedContact);
	let currentActivities = $derived($selectedContactDetails?.activities || []);
</script>

{#if !$auth.isAuthenticated}
	<LoginScreen onlogin={handleLogin} loading={isLoggingIn} />
{:else}
	<ProgressBar visible={anyLoading} />
	<div class="flex h-screen flex-col">
		<!-- Header -->
		<header class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
			<h1 class="text-xl font-semibold text-gray-900">Scout CRM</h1>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-600">Welcome, {$auth.username}</span>
				<button 
					class="btn-ghost btn-sm text-gray-600 hover:text-gray-900"
					onclick={handleLogout}
				>
					Logout
				</button>
			</div>
		</header>

		<!-- Main content area -->
		<div class="flex flex-1 overflow-hidden">
			<Sidebar 
				contacts={$contacts}
				selectedId={$selectedContactId}
				loading={isLoadingContacts}
				onselect={handleSelectContact}
				onadd={openContactForm}
			/>
			
			<MainContent
				selectedContact={currentContact}
				activities={currentActivities}
				dashboardData={$dashboardData}
				loading={anyLoading}
				onLogActivity={handleLogActivityClick}
				onDeselectContact={handleDeselectContact}
			/>
		</div>

		<!-- Toast notifications -->
		{#if $error}
			<div class="fixed bottom-4 right-4 z-50 rounded-lg bg-red-100 border border-red-200 px-4 py-3 text-red-800 shadow-lg">
				<div class="flex items-center gap-2">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{$error}</span>
				</div>
			</div>
		{/if}

		{#if $successMessage}
			<div class="fixed bottom-4 right-4 z-50 rounded-lg bg-green-100 border border-green-200 px-4 py-3 text-green-800 shadow-lg">
				<div class="flex items-center gap-2">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{$successMessage}</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Modals -->
	{#if $showContactForm}
		<ContactForm 
			onsubmit={handleCreateContact}
			oncancel={closeContactForm}
		/>
	{/if}

	{#if $showActivityForm && $selectedContactId && $activityFormType}
		<ActivityForm
			contactId={$selectedContactId}
			activityType={$activityFormType}
			onsubmit={handleLogActivity}
			oncancel={closeActivityForm}
		/>
	{/if}
{/if}
