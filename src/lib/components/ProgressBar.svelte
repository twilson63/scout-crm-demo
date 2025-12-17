<script lang="ts">
	let { visible }: { visible: boolean } = $props();
</script>

<div
	class="fixed top-0 left-0 right-0 h-1 z-50 bg-gray-400 progress-bar-indeterminate transition-opacity duration-300 {visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
	role="progressbar"
	aria-hidden={!visible}
></div>
