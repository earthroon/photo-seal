<template>
  <section class="preset-institution-note-copy" data-tdt-doc-copy="institution-note">
    <h3>Institution note</h3>
    <pre class="preset-institution-note-copy__text">{{ note.copyText }}</pre>
    <button
      type="button"
      class="preset-institution-note-copy__button"
      aria-label="Copy institution note"
      @click="copyNote"
    >
      Copy institution note
    </button>
    <p
      class="preset-institution-note-copy__status"
      aria-live="polite"
      data-tdt-copy-status
    >
      {{ copyStatus }}: {{ copyMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PhotoSealInstitutionNoteCopy } from "../../documentation/institutionNoteCopy";
import { copyInstitutionNoteToClipboard } from "../../documentation/institutionNoteClipboard";

defineOptions({ name: "PresetInstitutionNoteCopy" });
const props = defineProps<{ note: PhotoSealInstitutionNoteCopy }>();
const copyStatus = ref<"idle" | "copied" | "failed" | "unsupported">("idle");
const copyMessage = ref("Institution note is ready to copy.");

async function copyNote(): Promise<void> {
  const result = await copyInstitutionNoteToClipboard({ note: props.note });
  copyStatus.value = result.status;
  copyMessage.value = result.message;
}
</script>
