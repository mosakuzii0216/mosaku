import { test, expect } from "@playwright/test";
import { openList } from "./helpers";

test("⌘sを続けて押しても、メモは1件しかできない", async ({ page }) => {
  const title = `連打 ${Date.now()}`;
  await page.goto("/");
  await page.getByPlaceholder("タイトル").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("2回押しても1件");

  await page.keyboard.press("ControlOrMeta+s");
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.reload();
  await openList(page);
  await expect(
    page.getByRole("button", { name: title, exact: true }),
  ).toHaveCount(1);
});
