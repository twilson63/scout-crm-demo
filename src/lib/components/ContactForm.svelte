<script lang="ts">
	import type { CreateContactData } from '$lib/types';
	import Modal from './Modal.svelte';

	let {
		onsubmit,
		oncancel
	}: {
		onsubmit: (data: CreateContactData) => void;
		oncancel: () => void;
	} = $props();

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let company = $state('');
	let isSubmitting = $state(false);

	let nameError = $derived(!name.trim() ? 'Name is required' : '');
	let emailError = $derived(!email.trim() ? 'Email is required' : '');
	let isValid = $derived(name.trim() !== '' && email.trim() !== '');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!isValid || isSubmitting) return;

		isSubmitting = true;

		const data: CreateContactData = {
			name: name.trim(),
			email: email.trim(),
			status: 'lead'
		};

		if (phone.trim()) {
			data.phone = phone.trim();
		}

		if (company.trim()) {
			data.company = company.trim();
		}

		onsubmit(data);
	}
</script>

<Modal onclose={oncancel}>
	<form onsubmit={handleSubmit} class="space-y-4">
		<h2 class="text-lg font-semibold text-gray-900">Create New Contact</h2>

		<div class="space-y-2">
			<label for="name" class="block text-sm font-medium text-gray-700">
				Name <span class="text-red-500">*</span>
			</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				class="input"
				placeholder="John Doe"
				disabled={isSubmitting}
			/>
			{#if nameError && name !== ''}
				<p class="text-sm text-red-500">{nameError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="email" class="block text-sm font-medium text-gray-700">
				Email <span class="text-red-500">*</span>
			</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="input"
				placeholder="john@example.com"
				disabled={isSubmitting}
			/>
			{#if emailError && email !== ''}
				<p class="text-sm text-red-500">{emailError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
			<input
				type="tel"
				id="phone"
				bind:value={phone}
				class="input"
				placeholder="+1 (555) 123-4567"
				disabled={isSubmitting}
			/>
		</div>

		<div class="space-y-2">
			<label for="company" class="block text-sm font-medium text-gray-700">Company</label>
			<input
				type="text"
				id="company"
				bind:value={company}
				class="input"
				placeholder="Acme Inc."
				disabled={isSubmitting}
			/>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<button type="button" class="btn-secondary" onclick={oncancel} disabled={isSubmitting}>
				Cancel
			</button>
			<button type="submit" class="btn-primary" disabled={!isValid || isSubmitting}>
				{#if isSubmitting}
					<svg
						class="animate-spin -ml-1 mr-2 h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Creating...
				{:else}
					Create Contact
				{/if}
			</button>
		</div>
	</form>
</Modal>
