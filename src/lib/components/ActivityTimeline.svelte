<script lang="ts">
  import type { Activity, ActivityType } from '$lib/types';

  interface Props {
    activities: Activity[];
  }

  let { activities }: Props = $props();

  function getActivityIcon(type: ActivityType): string {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '✉️';
      case 'meeting':
        return '📅';
      case 'note':
        return '📝';
      default:
        return '•';
    }
  }

  function getRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
</script>

{#if activities.length === 0}
  <div class="py-8 text-center text-neutral-500">
    <p>No activities yet</p>
  </div>
{:else}
  <div class="space-y-4">
    {#each activities as activity (activity.id)}
      <div class="flex gap-3 border-l-2 border-neutral-200 pl-4 py-2">
        <span class="text-lg" title={activity.type}>
          {getActivityIcon(activity.type)}
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-neutral-900">{activity.description}</p>
          {#if activity.outcome}
            <p class="text-xs text-neutral-500 mt-1">Outcome: {activity.outcome}</p>
          {/if}
          <p class="text-xs text-neutral-400 mt-1">{getRelativeTime(activity.timestamp)}</p>
        </div>
      </div>
    {/each}
  </div>
{/if}
