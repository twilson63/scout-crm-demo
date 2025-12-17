<script lang="ts">
	import type { ContactStatus } from '$lib/types';

	let { status }: { status: ContactStatus } = $props();

	const badgeClass = $derived(
		status === 'lead'
			? 'badge-lead'
			: status === 'prospect'
				? 'badge-prospect'
				: 'badge-customer'
	);

	const label = $derived(status.charAt(0).toUpperCase() + status.slice(1));
</script>

<span class={badgeClass}>{label}</span>
