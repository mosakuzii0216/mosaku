import { test, expect } from "@playwright/test";
import { createMemo, openList } from "./helpers";

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
  await openList(page);

  await expect(
    page.getByRole("button", { name: title, exact: true }),
  ).toBeVisible();
});

test("一覧からメモを選ぶと、引き出しが閉じてエディタに入る", async ({
  page,
}) => {
  const title = `一覧 ${Date.now()}`;
  await page.goto("/");
  await createMemo(page, title, "引き出しから開くメモ");
  await page.getByRole("button", { name: "新規" }).click();

  await openList(page);
  await page.getByRole("button", { name: title, exact: true }).click();

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByPlaceholder("タイトル")).toHaveValue(title);
});
