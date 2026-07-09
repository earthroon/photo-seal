<script setup lang="ts">
const props = defineProps<{
  canConfirm: boolean;
  aspectGuardPassed: boolean;
  boundsGuardPassed: boolean;
  snapEnabled: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  reset: [];
  cancel: [];
  "toggle-snap": [enabled: boolean];
}>();
</script>

<template>
  <footer class="crop-confirm-bar">
    <div class="crop-confirm-status">
      <span :data-pass="props.aspectGuardPassed">비율 가드 {{ props.aspectGuardPassed ? "통과" : "불일치" }}</span>
      <span :data-pass="props.boundsGuardPassed">경계 가드 {{ props.boundsGuardPassed ? "통과" : "오류" }}</span>
      <span>스냅 {{ props.snapEnabled ? "ON" : "OFF" }}</span>
    </div>
    <div class="crop-confirm-actions">
      <button type="button" class="secondary-action crop-confirm-action" @click="emit('toggle-snap', !props.snapEnabled)">스냅 {{ props.snapEnabled ? "끄기" : "켜기" }}</button>
      <button type="button" class="secondary-action crop-confirm-action" @click="emit('reset')">초기화</button>
      <button type="button" class="secondary-action crop-confirm-action" @click="emit('cancel')">취소</button>
      <button type="button" class="primary-action crop-confirm-action crop-confirm-action--confirm" :disabled="!props.canConfirm" @click="emit('confirm')">크롭 적용</button>
    </div>
  </footer>
</template>
