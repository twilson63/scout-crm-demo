<script lang="ts">
	import type { Contact } from '$lib/types';
	import ContactList from './ContactList.svelte';

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

<aside class="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
	<header class="border-b border-gray-200 px-4 py-4">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-500">Contacts</h2>
	</header>

	<div class="flex-1 overflow-y-auto p-4">
		<ContactList {contacts} {selectedId} {loading} {onselect} {onadd} />
	</div>
</aside>
