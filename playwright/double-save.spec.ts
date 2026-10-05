import { test, expect } from "@playwright/test";

test("保存ボタンを連打しても、メモは1件しかできない", async ({ page }) => {
  const title = `連打 ${Date.now()}`;
  await page.goto("/");
  await page.getByPlaceholder("タイトル").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("2回押しても1件");

  await page.getByRole("button", { name: "保存" }).dblclick();
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("button", { name: title, exact: true }),
  ).toHaveCount(1);
});
