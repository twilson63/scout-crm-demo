<script lang="ts">
	import type { Contact } from '$lib/types';
	import ContactCard from './ContactCard.svelte';
	import SkeletonContactCard from '$lib/components/SkeletonContactCard.svelte';

	let {
		contacts,
		selectedId = null,
		loading = false,
		onselect,
		onadd
	}: {
		contacts: Contact[];
		selectedId?: string | null;
		loading?: boolean;
		onselect?: (id: string) => void;
		onadd?: () => void;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	<button type="button" class="btn-primary w-full" onclick={onadd}>
		Add New
	</button>

	<div class="flex flex-col gap-2">
		{#if contacts.length > 0}
			{#each contacts as contact (contact.id)}
				<ContactCard
					{contact}
					selected={contact.id === selectedId}
					onclick={() => onselect?.(contact.id)}
				/>
			{/each}
		{:else if loading}
			{#each Array(4) as _}
				<SkeletonContactCard />
			{/each}
		{:else}
			<p class="py-4 text-center text-sm text-gray-500">No contacts yet</p>
		{/if}
	</div>
</div>
