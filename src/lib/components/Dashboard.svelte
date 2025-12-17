<script lang="ts">
  import type { DashboardData } from '$lib/types';
  import ActivityTimeline from './ActivityTimeline.svelte';
  import SkeletonDashboard from '$lib/components/SkeletonDashboard.svelte';

  interface Props {
    data: DashboardData | null;
    loading: boolean;
  }

  let { data, loading }: Props = $props();
</script>

<div class="p-6 space-y-6">
  {#if loading}
    <SkeletonDashboard />
  {:else if data}
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
