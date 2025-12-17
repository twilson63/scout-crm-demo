<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="skeleton rounded-lg {className}"></div>
