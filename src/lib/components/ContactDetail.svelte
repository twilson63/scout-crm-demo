<script lang="ts">
  import type { Contact, Activity, ActivityType } from '$lib/types';
  import ActivityTimeline from './ActivityTimeline.svelte';

  interface Props {
    contact: Contact;
    activities: Activity[];
    loading: boolean;
    onLogActivity?: (type: ActivityType) => void;
    onClose?: () => void;
    onRefresh?: () => void;
    lastUpdated?: number;
  }

  let { contact, activities, loading, onLogActivity, onClose, onRefresh, lastUpdated }: Props = $props();

  function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
  }

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

  function handleRefresh() {
    onRefresh?.();
  }
</script>

<div class="p-6 space-y-6">
  <!-- Header with Back Button and Refresh -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button class="btn btn-ghost btn-sm" onclick={handleClose}>
        ← Back
      </button>
    </div>
    <div class="flex items-center gap-3">
      {#if lastUpdated}
        <span class="text-xs text-neutral-400">
          Last updated: {formatRelativeTime(lastUpdated)}
        </span>
      {/if}
      <button
        class="btn btn-ghost btn-sm"
        onclick={handleRefresh}
        disabled={loading}
        title="Refresh"
      >
        ↻
      </button>
    </div>
  </div>

  {#if loading}
    <!-- Skeleton: Contact Info Card -->
    <div class="card p-6">
      <div class="flex items-start justify-between">
        <div class="space-y-2">
          <div class="skeleton h-6 w-48"></div>
          <div class="skeleton h-5 w-16 rounded-full"></div>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div class="flex items-center gap-2">
          <div class="skeleton h-4 w-32"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="skeleton h-4 w-32"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="skeleton h-4 w-32"></div>
        </div>
      </div>
    </div>

    <!-- Skeleton: Action Buttons (dimmed) -->
    <div class="card p-4 opacity-50">
      <h3 class="text-sm font-medium text-neutral-500 mb-3">Log Activity</h3>
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-secondary btn-sm" disabled>
          📞 Call
        </button>
        <button class="btn btn-secondary btn-sm" disabled>
          ✉️ Email
        </button>
        <button class="btn btn-secondary btn-sm" disabled>
          📅 Meeting
        </button>
        <button class="btn btn-secondary btn-sm" disabled>
          📝 Note
        </button>
      </div>
    </div>

    <!-- Skeleton: Activity Timeline -->
    <div class="card p-4">
      <h3 class="text-lg font-semibold text-neutral-900 mb-4">Activity History</h3>
      <div class="space-y-4">
        {#each [1, 2, 3, 4] as _}
          <div class="flex gap-3">
            <div class="skeleton h-8 w-8 rounded-full shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-24"></div>
              <div class="skeleton h-3 w-full"></div>
              <div class="skeleton h-3 w-20"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
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
