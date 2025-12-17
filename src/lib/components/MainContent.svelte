<script lang="ts">
  import type { Contact, Activity, DashboardData, ActivityType } from '$lib/types';
  import Dashboard from './Dashboard.svelte';
  import ContactDetail from './ContactDetail.svelte';

  interface Props {
    selectedContact: Contact | null;
    activities: Activity[];
    dashboardData: DashboardData | null;
    loading: boolean;
    onLogActivity?: (type: ActivityType) => void;
    onDeselectContact?: () => void;
  }

  let { 
    selectedContact, 
    activities, 
    dashboardData, 
    loading,
    onLogActivity,
    onDeselectContact
  }: Props = $props();

  function handleLogActivity(type: ActivityType) {
    onLogActivity?.(type);
  }

  function handleClose() {
    onDeselectContact?.();
  }
</script>

<main class="flex-1 overflow-auto bg-neutral-50">
  {#if selectedContact}
    <ContactDetail 
      contact={selectedContact} 
      {activities} 
      {loading}
      onLogActivity={handleLogActivity}
      onClose={handleClose}
    />
  {:else}
    <Dashboard data={dashboardData} {loading} />
  {/if}
</main>
