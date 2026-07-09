import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "packages/photo-seal-web/e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-webgpu-runtime",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan,UseSkiaRenderer",
            "--ignore-gpu-blocklist",
          ],
        },
      },
    },
  ],
  webServer: {
    command: "pnpm --filter photo-seal-web dev --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

export const TDT_PHOTOSEAL_07_R1_PLAYWRIGHT_CONFIG_SEAL =
  "playwright.config for browser WebGPU runtime harness. Assembly PASS is not runtime PASS.";
