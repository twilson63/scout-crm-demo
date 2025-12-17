<script lang="ts">
  // Skeleton loading placeholder for Dashboard component
</script>

<div class="p-6 space-y-6">
  <!-- Stat Cards Skeleton -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Total Contacts Skeleton -->
    <div class="card p-4">
      <div class="skeleton h-3 w-16"></div>
      <div class="skeleton h-8 w-24 mt-2"></div>
    </div>

    <!-- Status Breakdown Skeleton -->
    <div class="card p-4">
      <div class="skeleton h-3 w-16"></div>
      <div class="flex gap-3 mt-2">
        <div class="skeleton h-6 w-16 rounded-full"></div>
        <div class="skeleton h-6 w-20 rounded-full"></div>
        <div class="skeleton h-6 w-20 rounded-full"></div>
      </div>
    </div>

    <!-- Activities Count Skeleton -->
    <div class="card p-4">
      <div class="skeleton h-3 w-20"></div>
      <div class="skeleton h-8 w-16 mt-2"></div>
    </div>
  </div>

  <!-- Recent Activities Skeleton -->
  <div class="card p-4">
    <div class="skeleton h-5 w-32 mb-4"></div>
    <div class="space-y-4">
      {#each [1, 2, 3, 4] as _}
        <div class="flex gap-3 border-l-2 border-neutral-200 pl-4 py-2">
          <div class="skeleton h-6 w-6 rounded"></div>
          <div class="flex-1 min-w-0">
            <div class="skeleton h-4 w-3/4"></div>
            <div class="skeleton h-3 w-1/4 mt-2"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Select Contact Message Skeleton -->
  <div class="text-center py-4 border-t border-neutral-200">
    <div class="skeleton h-4 w-40 mx-auto"></div>
  </div>
</div>
