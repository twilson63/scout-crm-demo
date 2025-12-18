<script lang="ts">
  import type { DashboardData } from '$lib/types';
  import ActivityTimeline from './ActivityTimeline.svelte';
  import SkeletonDashboard from '$lib/components/SkeletonDashboard.svelte';

  interface Props {
    data: DashboardData | null;
    loading: boolean;
    lastUpdated?: number;
    onRefresh?: () => void;
  }

  let { data, loading, lastUpdated, onRefresh }: Props = $props();

  function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
  }
</script>

<div class="p-6 space-y-6">
  {#if loading}
    <SkeletonDashboard />
  {:else if data}
    <!-- Last Updated Indicator -->
    {#if lastUpdated}
      <div class="flex items-center gap-2 text-sm text-neutral-500">
        <span>Last updated: {formatRelativeTime(lastUpdated)}</span>
        {#if onRefresh}
          <button
            type="button"
            onclick={onRefresh}
            class="p-1 rounded hover:bg-neutral-100 transition-colors"
            aria-label="Refresh dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        {/if}
      </div>
    {/if}

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Total Contacts -->
      <div class="card p-4">
        <h3 class="text-sm font-medium text-neutral-500">Total Contacts</h3>
        <p class="text-3xl font-semibold text-neutral-900 mt-1">{data.contactCounts.total}</p>
      </div>

      <!-- Status Breakdown -->
      <div class="card p-4">
        <h3 class="text-sm font-medium text-neutral-500">By Status</h3>
        <div class="flex gap-3 mt-2">
          <div class="flex items-center gap-1">
            <span class="badge badge-lead">Lead</span>
            <span class="text-sm font-medium">{data.contactCounts.lead}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="badge badge-prospect">Prospect</span>
            <span class="text-sm font-medium">{data.contactCounts.prospect}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="badge badge-customer">Customer</span>
            <span class="text-sm font-medium">{data.contactCounts.customer}</span>
          </div>
        </div>
      </div>

      <!-- Activities Count -->
      <div class="card p-4">
        <h3 class="text-sm font-medium text-neutral-500">Total Activities</h3>
        <p class="text-3xl font-semibold text-neutral-900 mt-1">{data.activityCount}</p>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="card p-4">
      <h3 class="text-lg font-semibold text-neutral-900 mb-4">Recent Activities</h3>
      <ActivityTimeline activities={data.recentActivities} />
    </div>

    <!-- Select Contact Message -->
    <div class="text-center py-4 text-neutral-500 border-t border-neutral-200">
      <p>Select a contact to view details</p>
    </div>
  {:else}
    <div class="flex items-center justify-center h-64">
      <div class="text-neutral-500">No dashboard data available</div>
    </div>
  {/if}
</div>
