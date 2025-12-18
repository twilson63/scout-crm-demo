<script lang="ts">
	import type { Contact } from '$lib/types';
	import ContactList from './ContactList.svelte';

	let {
		contacts,
		selectedId = null,
		loading = false,
		onselect,
		onadd,
		onrefresh
	}: {
		contacts: Contact[];
		selectedId?: string | null;
		loading?: boolean;
		onselect?: (id: string) => void;
		onadd?: () => void;
		onrefresh?: () => void;
	} = $props();
</script>

<aside class="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
	<header class="flex items-center justify-between border-b border-gray-200 px-4 py-4">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-500">Contacts</h2>
		<button
			type="button"
			onclick={() => onrefresh?.()}
			disabled={loading}
			class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
			title="Refresh contacts"
		>
			↻
		</button>
	</header>

	<div class="flex-1 overflow-y-auto p-4">
		<ContactList {contacts} {selectedId} {loading} {onselect} {onadd} />
	</div>
</aside>
