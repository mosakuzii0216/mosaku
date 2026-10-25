import { test, expect } from "@playwright/test";
import { createMemo, openList } from "./helpers";

test("書いて手を止めれば、保存を押さなくても一覧に残る", async ({ page }) => {
  // 毎回違うタイトルにして、前の実行のメモと区別する
  const title = `E2E ${Date.now()}`;

  await page.goto("/");
  await page.getByPlaceholder("タイトル").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("Playwrightから書いた本文");
  // 押さなくても、手を止めて1.5秒たてば保存される
  await expect(page.getByText("保存しました")).toBeVisible();

  await page.reload();
  await openList(page);

  await expect(
    page.getByRole("button", { name: title, exact: true }),
  ).toBeVisible();
});

test("書いてすぐ読み直しても、書いたことは残る", async ({ page }) => {
  const title = `すぐ ${Date.now()}`;

  await page.goto("/");
  await page.getByPlaceholder("タイトル").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("1.5秒待たずに閉じた本文");
  // 自動で保存されるのを待たずに読み直す。閉じるときと同じく、画面がいったん隠れる
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

test("はじめて一覧を開くと、並ぶ場所と登録の案内が出る", async ({ page }) => {
  await page.goto("/");
  await openList(page);

  await expect(page.getByText("書いたメモは、ここに並びます")).toBeVisible();
  await expect(page.getByText(/「設定」から登録すると/)).toBeVisible();
});
