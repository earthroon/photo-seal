<script setup lang="ts">
import type { PhotoSealCropReceipt } from "../../crop/cropReceipt";

const props = defineProps<{
  cropRequired: boolean;
  cropReceipt: PhotoSealCropReceipt | null;
  selectedPresetLabel: string;
}>();

const emit = defineEmits<{
  "open-crop": [];
}>();
</script>

<template>
  <section class="crop-requirement-card" :data-crop-required="props.cropRequired" :data-crop-confirmed="Boolean(props.cropReceipt)">
    <div>
      <strong>{{ props.cropRequired ? "크롭 확인 필요" : "크롭 선택 사항" }}</strong>
      <p v-if="props.cropRequired && !props.cropReceipt">
        {{ props.selectedPresetLabel }} 프리셋은 내보내기 전에 보이는 크롭 박스를 직접 확정해야 합니다.
      </p>
      <p v-else-if="props.cropRequired && props.cropReceipt">
        사용자 확정 크롭이 적용되었습니다. 보이는 크롭 영역만 resize 입력으로 전달됩니다.
      </p>
      <p v-else>
        사용자 지정 프리셋은 크롭 없이 내보낼 수 있습니다. 필요하면 직접 크롭을 켤 수 있습니다.
      </p>
    </div>
    <button type="button" class="secondary-action" @click="emit('open-crop')">
      {{ props.cropReceipt ? "크롭 다시 조정" : "크롭 조정" }}
    </button>
  </section>
</template>
