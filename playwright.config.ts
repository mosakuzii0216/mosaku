import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  // DBを1つ共有しているので、1本ずつ順番に走らせる
  workers: 1,
  use: {
    baseURL: "http://localhost:5173",
    // 失敗したときだけ、何が起きたかを後から再生できる記録を残す
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // テストの前にbackendとfrontendを立ち上げる。もう動いていればそれを使う
  webServer: [
    {
      command: "npm run -w backend start:dev",
      url: "http://localhost:3000/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run -w frontend dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
