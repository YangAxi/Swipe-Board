import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pages",
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "pages-playwright-report", open: "never" }],
  ],
  outputDir: "pages-test-results",
  use: {
    baseURL: "http://127.0.0.1:4174/Swipe-Board/",
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      timeout: 20000,
    },
  },
  webServer: {
    command: "npm run preview:pages",
    url: "http://127.0.0.1:4174/Swipe-Board/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
