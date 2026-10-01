import { test, expect } from "@playwright/test";

test("書いて保存したメモは、リロードしても一覧に残る", async ({ page }) => {
  // 毎回違うタイトルにして、前の実行のメモと区別する
  const title = `E2E ${Date.now()}`;

  await page.goto("/");
  await page.getByPlaceholder("タイトル").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("Playwrightから書いた本文");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("button", { name: title, exact: true }),
  ).toBeVisible();
});
