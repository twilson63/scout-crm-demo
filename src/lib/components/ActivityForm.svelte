<script lang="ts">
	import type { ActivityType, LogActivityData } from '$lib/types';
	import Modal from './Modal.svelte';

	let {
		contactId,
		activityType,
		onsubmit,
		oncancel
	}: {
		contactId: string;
		activityType: ActivityType;
		onsubmit: (data: LogActivityData) => void;
		oncancel: () => void;
	} = $props();

	let description = $state('');
	let outcome = $state('');
	let isSubmitting = $state(false);

	let descriptionError = $derived(!description.trim() ? 'Description is required' : '');
	let isValid = $derived(description.trim() !== '');

	const activityLabels: Record<ActivityType, string> = {
		call: 'Call',
		email: 'Email',
		meeting: 'Meeting',
		note: 'Note'
	};

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!isValid || isSubmitting) return;

		isSubmitting = true;

		const data: LogActivityData = {
			contactId,
			type: activityType,
			description: description.trim()
		};

		if (outcome.trim()) {
			data.outcome = outcome.trim();
		}

		onsubmit(data);
	}
</script>

<Modal onclose={oncancel}>
	<form onsubmit={handleSubmit} class="space-y-4">
		<div class="flex items-center gap-2">
			<div class="p-2 bg-gray-100 rounded-md">
				{#if activityType === 'call'}
					<svg
						class="h-5 w-5 text-gray-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
						/>
					</svg>
				{:else if activityType === 'email'}
					<svg
						class="h-5 w-5 text-gray-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				{:else if activityType === 'meeting'}
					<svg
						class="h-5 w-5 text-gray-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				{:else}
					<svg
						class="h-5 w-5 text-gray-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				{/if}
			</div>
			<h2 class="text-lg font-semibold text-gray-900">Log {activityLabels[activityType]}</h2>
		</div>

		<div class="space-y-2">
			<label for="description" class="block text-sm font-medium text-gray-700">
				Description <span class="text-red-500">*</span>
			</label>
			<textarea
				id="description"
				bind:value={description}
				class="input min-h-[100px] resize-none"
				placeholder="Describe what happened..."
				disabled={isSubmitting}
			></textarea>
			{#if descriptionError && description !== ''}
				<p class="text-sm text-red-500">{descriptionError}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="outcome" class="block text-sm font-medium text-gray-700">
				Outcome <span class="text-gray-400">(optional)</span>
			</label>
			<input
				type="text"
				id="outcome"
				bind:value={outcome}
				class="input"
				placeholder="e.g., Scheduled follow-up, Sent proposal"
				disabled={isSubmitting}
			/>
		</div>

		<div class="flex justify-end gap-3 pt-4">
			<button type="button" class="btn-secondary" onclick={oncancel} disabled={isSubmitting}>
				Cancel
			</button>
			<button type="submit" class="btn-primary" disabled={!isValid || isSubmitting}>
				{#if isSubmitting}
					<svg
						class="animate-spin -ml-1 mr-2 h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Logging...
				{:else}
					Log Activity
				{/if}
			</button>
		</div>
	</form>
</Modal>
