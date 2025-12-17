<script lang="ts">
	let {
		onlogin
	}: {
		onlogin?: (data: { username: string; apiKey: string }) => void;
	} = $props();

	let username = $state('');
	let apiKey = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (username.trim() && apiKey.trim()) {
			onlogin?.({ username: username.trim(), apiKey: apiKey.trim() });
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="card w-full max-w-md p-8">
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-semibold text-gray-900">Scout CRM</h1>
			<p class="mt-2 text-sm text-gray-500">Sign in to your account</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			<div>
				<label for="username" class="mb-2 block text-sm font-medium text-gray-700">
					Username
				</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					class="input"
					placeholder="Enter your username"
					required
				/>
			</div>

			<div>
				<label for="apiKey" class="mb-2 block text-sm font-medium text-gray-700">
					API Key
				</label>
				<input
					id="apiKey"
					type="password"
					bind:value={apiKey}
					class="input"
					placeholder="Enter your API key"
					required
				/>
			</div>

			<button type="submit" class="btn-primary w-full">
				Sign In
			</button>
		</form>
	</div>
</div>
