import { test, expect } from "@playwright/test";

test("窓の背が低くても、設定の一番下まで見られる", async ({ page }) => {
  // 設定の中身より低い窓にする
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/");
  await page.getByRole("button", { name: "設定" }).click();

  // 一番下にある目安箱の「送る」スクロールして、全部が窓に入るか見る
  const send = page.getByRole("button", { name: "送る" });
  await send.scrollIntoViewIfNeeded();
  await expect(send).toBeInViewport({ ratio: 1 });
});
