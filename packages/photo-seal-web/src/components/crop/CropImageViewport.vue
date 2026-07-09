<script setup lang="ts">
const props = defineProps<{
  imageUrl: string;
}>();
</script>

<template>
  <img class="crop-image" :src="props.imageUrl" alt="크롭할 원본 이미지" draggable="false" />
</template>
