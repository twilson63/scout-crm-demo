<script lang="ts">
  import type { Contact, Activity, ActivityType } from '$lib/types';
  import ActivityTimeline from './ActivityTimeline.svelte';

  interface Props {
    contact: Contact;
    activities: Activity[];
    loading: boolean;
    onLogActivity?: (type: ActivityType) => void;
    onClose?: () => void;
  }

  let { contact, activities, loading, onLogActivity, onClose }: Props = $props();

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'lead':
        return 'badge badge-lead';
      case 'prospect':
        return 'badge badge-prospect';
      case 'customer':
        return 'badge badge-customer';
      default:
        return 'badge';
    }
  }

  function handleLogActivity(type: ActivityType) {
    onLogActivity?.(type);
  }

  function handleClose() {
    onClose?.();
  }
</script>

<div class="p-6 space-y-6">
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <div class="text-neutral-500">Loading contact...</div>
    </div>
  {:else}
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <button class="btn btn-ghost btn-sm" onclick={handleClose}>
        ← Back
      </button>
    </div>

    <!-- Contact Info Card -->
    <div class="card p-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-neutral-900">{contact.name}</h2>
          <span class={getStatusBadgeClass(contact.status)}>{contact.status}</span>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-neutral-500">Email:</span>
          <a href="mailto:{contact.email}" class="text-blue-600 hover:underline">{contact.email}</a>
        </div>
        {#if contact.phone}
          <div class="flex items-center gap-2 text-sm">
            <span class="text-neutral-500">Phone:</span>
            <a href="tel:{contact.phone}" class="text-blue-600 hover:underline">{contact.phone}</a>
          </div>
        {/if}
        {#if contact.company}
          <div class="flex items-center gap-2 text-sm">
            <span class="text-neutral-500">Company:</span>
            <span class="text-neutral-900">{contact.company}</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card p-4">
      <h3 class="text-sm font-medium text-neutral-500 mb-3">Log Activity</h3>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-secondary btn-sm" onclick={() => handleLogActivity('call')}>
          📞 Call
        </button>
        <button class="btn btn-secondary btn-sm" onclick={() => handleLogActivity('email')}>
          ✉️ Email
        </button>
        <button class="btn btn-secondary btn-sm" onclick={() => handleLogActivity('meeting')}>
          📅 Meeting
        </button>
        <button class="btn btn-secondary btn-sm" onclick={() => handleLogActivity('note')}>
          📝 Note
        </button>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="card p-4">
      <h3 class="text-lg font-semibold text-neutral-900 mb-4">Activity History</h3>
      <ActivityTimeline {activities} />
    </div>
  {/if}
</div>
