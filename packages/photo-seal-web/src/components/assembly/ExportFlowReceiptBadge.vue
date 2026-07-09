<script setup lang="ts">
defineProps<{
  label: string;
  present: boolean;
}>();
</script>

<template>
  <span class="export-flow-receipt-badge" :data-present="present ? 'true' : 'false'">
    {{ label }} receipt: {{ present ? "present" : "missing" }}
  </span>
</template>
