<script setup lang="ts">
defineOptions({ name: "ImageImportPreviewCanvas" });
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PhotoSealImportedImageSource } from "../../import/imageImportTypes";

const props = defineProps<{
  imageSource: PhotoSealImportedImageSource;
  cropBadgeLabel?: string | null;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const frameRef = ref<HTMLDivElement | null>(null);
const previewDisplaySize = ref({ widthPx: 240, heightPx: 300 });
const statusMessage = ref("WebGPU 미리보기 준비 중");
const previewReady = ref(false);
let resizeObserver: ResizeObserver | null = null;
let renderToken = 0;
let previewTexture: GPUTexture | null = null;
let deviceHandle: GPUDevice | null = null;

const previewAspectRatio = computed(() => {
  const width = Math.max(1, props.imageSource.width);
  const height = Math.max(1, props.imageSource.height);
  return `${width} / ${height}`;
});

const previewOrientation = computed(() =>
  props.imageSource.width >= props.imageSource.height ? "landscape" : "portrait"
);

const previewDisplayStyle = computed(() => ({
  width: `${previewDisplaySize.value.widthPx}px`,
  height: `${previewDisplaySize.value.heightPx}px`,
}));

function destroyPreviewTexture(): void {
  previewTexture?.destroy();
  previewTexture = null;
}

function getBitmapSource(): ImageBitmap | null {
  return props.imageSource.imageBitmap ?? props.imageSource.bitmapSource ?? null;
}

function updatePreviewDisplaySize(): void {
  const frame = frameRef.value;
  if (!frame) {
    return;
  }
  const rect = frame.getBoundingClientRect();
  const style = window.getComputedStyle(frame);
  const horizontalPadding = Number.parseFloat(style.paddingLeft || "0") + Number.parseFloat(style.paddingRight || "0");
  const verticalPadding = Number.parseFloat(style.paddingTop || "0") + Number.parseFloat(style.paddingBottom || "0");
  const availableWidth = Math.max(1, rect.width - horizontalPadding);
  const availableHeight = Math.max(1, rect.height - verticalPadding);
  const sourceAspect = Math.max(1, props.imageSource.width) / Math.max(1, props.imageSource.height);
  const frameAspect = availableWidth / availableHeight;

  let displayWidth = availableWidth;
  let displayHeight = availableWidth / sourceAspect;
  if (frameAspect > sourceAspect) {
    displayHeight = availableHeight;
    displayWidth = availableHeight * sourceAspect;
  }

  previewDisplaySize.value = {
    widthPx: Math.max(1, Math.floor(displayWidth)),
    heightPx: Math.max(1, Math.floor(displayHeight)),
  };
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = Math.max(1, Math.round(previewDisplaySize.value.widthPx * dpr));
  const height = Math.max(1, Math.round(previewDisplaySize.value.heightPx * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

async function renderWebGpuPreview(): Promise<void> {
  const token = ++renderToken;
  const canvas = canvasRef.value;
  const bitmapSource = getBitmapSource();
  previewReady.value = false;

  if (!canvas || !bitmapSource) {
    statusMessage.value = "미리보기 이미지 소스가 없습니다.";
    return;
  }

  if (!navigator.gpu) {
    statusMessage.value = "WebGPU 미리보기를 사용할 수 없습니다.";
    return;
  }

  await nextTick();
  if (token !== renderToken) {
    return;
  }

  try {
    updatePreviewDisplaySize();
    await nextTick();
    resizeCanvasToDisplaySize(canvas);
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      statusMessage.value = "WebGPU 장치를 열지 못했습니다.";
      return;
    }
    deviceHandle = device;

    const context = canvas.getContext("webgpu");
    if (!context) {
      statusMessage.value = "WebGPU 캔버스 컨텍스트를 열지 못했습니다.";
      return;
    }

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format: canvasFormat,
      alphaMode: "premultiplied",
    });

    destroyPreviewTexture();
    previewTexture = device.createTexture({
      label: "tdt-photoseal-h3-r8-r5-import-preview-source-texture",
      size: [props.imageSource.width, props.imageSource.height, 1],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
      { source: bitmapSource },
      { texture: previewTexture, colorSpace: "srgb" },
      [props.imageSource.width, props.imageSource.height]
    );

    const sampler = device.createSampler({
      label: "tdt-photoseal-h3-r8-r5-import-preview-sampler",
      magFilter: "linear",
      minFilter: "linear",
    });

    const shaderModule = device.createShaderModule({
      label: "tdt-photoseal-h3-r8-r5-import-preview-shader",
      code: `
        struct VertexOut {
          @builtin(position) position: vec4f,
          @location(0) uv: vec2f,
        };

        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
          var positions = array<vec2f, 6>(
            vec2f(-1.0, -1.0),
            vec2f( 1.0, -1.0),
            vec2f(-1.0,  1.0),
            vec2f(-1.0,  1.0),
            vec2f( 1.0, -1.0),
            vec2f( 1.0,  1.0)
          );
          var uvs = array<vec2f, 6>(
            vec2f(0.0, 1.0),
            vec2f(1.0, 1.0),
            vec2f(0.0, 0.0),
            vec2f(0.0, 0.0),
            vec2f(1.0, 1.0),
            vec2f(1.0, 0.0)
          );
          var out: VertexOut;
          out.position = vec4f(positions[vertexIndex], 0.0, 1.0);
          out.uv = uvs[vertexIndex];
          return out;
        }

        @group(0) @binding(0) var previewSampler: sampler;
        @group(0) @binding(1) var previewTexture: texture_2d<f32>;

        @fragment
        fn fs_main(in: VertexOut) -> @location(0) vec4f {
          return textureSample(previewTexture, previewSampler, in.uv);
        }
      `,
    });

    const pipeline = device.createRenderPipeline({
      label: "tdt-photoseal-h3-r8-r5-import-preview-pipeline",
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: canvasFormat }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    const bindGroup = device.createBindGroup({
      label: "tdt-photoseal-h3-r8-r5-import-preview-bindgroup",
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: previewTexture.createView() },
      ],
    });

    const encoder = device.createCommandEncoder({
      label: "tdt-photoseal-h3-r8-r5-import-preview-encoder",
    });
    const pass = encoder.beginRenderPass({
      label: "tdt-photoseal-h3-r8-r5-import-preview-pass",
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 1, g: 1, b: 1, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);

    previewReady.value = true;
    statusMessage.value = "WebGPU 미리보기 표시 중";
  } catch (error) {
    statusMessage.value = error instanceof Error
      ? `WebGPU 미리보기 실패: ${error.message}`
      : "WebGPU 미리보기 실패";
  }
}

onMounted(() => {
  if (frameRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updatePreviewDisplaySize();
      void renderWebGpuPreview();
    });
    resizeObserver.observe(frameRef.value);
  }
  updatePreviewDisplaySize();
  void renderWebGpuPreview();
});

watch(
  () => props.imageSource,
  () => {
    void renderWebGpuPreview();
  }
);

onBeforeUnmount(() => {
  renderToken += 1;
  resizeObserver?.disconnect();
  resizeObserver = null;
  destroyPreviewTexture();
  deviceHandle = null;
});
</script>

<template>
  <figure
    class="image-import-preview-canvas"
    :style="{ '--photo-seal-import-preview-aspect': previewAspectRatio }"
    data-preview-owner="webgpu-canvas"
    data-preview-contain="source-aspect"
    :data-source-orientation="previewOrientation"
  >
    <div
      ref="frameRef"
      class="image-import-preview-canvas__frame"
      data-preview-display-contract="full-source-contain-no-crop"
    >
      <span
        v-if="props.cropBadgeLabel"
        class="image-import-preview-canvas__badge"
        data-preview-crop-required-badge="true"
      >
        {{ props.cropBadgeLabel }}
      </span>
      <canvas
        ref="canvasRef"
        class="image-import-preview-canvas__surface"
        :style="previewDisplayStyle"
        aria-label="WebGPU 원본 비율 미리보기"
      />
    </div>
    <figcaption class="image-import-preview-canvas__caption" :data-preview-ready="previewReady">
      {{ statusMessage }} · {{ props.imageSource.width }} × {{ props.imageSource.height }} px
    </figcaption>
  </figure>
</template>
