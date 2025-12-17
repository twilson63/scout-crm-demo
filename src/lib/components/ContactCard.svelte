<script lang="ts">
	import type { Contact } from '$lib/types';
	import StatusBadge from './StatusBadge.svelte';

	let {
		contact,
		selected = false,
		onclick
	}: {
		contact: Contact;
		selected?: boolean;
		onclick?: () => void;
	} = $props();
</script>

<button
	type="button"
	class="w-full cursor-pointer rounded-lg border p-3 text-left transition-colors {selected
		? 'border-gray-400 bg-gray-100'
		: 'border-gray-200 bg-white hover:bg-gray-50'}"
	onclick={onclick}
>
	<div class="flex items-start justify-between">
		<div class="min-w-0 flex-1">
			<h3 class="truncate text-sm font-medium text-gray-900">{contact.name}</h3>
			{#if contact.company}
				<p class="mt-0.5 truncate text-xs text-gray-500">{contact.company}</p>
			{/if}
		</div>
		<div class="ml-2 flex-shrink-0">
			<StatusBadge status={contact.status} />
		</div>
	</div>
</button>
