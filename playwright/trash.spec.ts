import { test, expect } from "@playwright/test";
import { createMemo } from "./helpers";

test("消したメモはゴミ箱から戻せて、完全に削除もできる", async ({ page }) => {
  const title = `消す ${Date.now()}`;
  const inList = page.getByRole("button", { name: title, exact: true });
  await page.goto("/");
  await createMemo(page, title, "消してまた戻すメモ");

  // 消す → 一覧から消えて、ゴミ箱に入る
  await page.getByRole("button", { name: `${title}を削除` }).click();
  await expect(page.getByText("ゴミ箱に移動しました")).toBeVisible();
  await expect(inList).toBeHidden();
  await page.getByRole("button", { name: /ゴミ箱/ }).click();

  // 戻す → 一覧に帰ってくる
  await page.getByRole("button", { name: `${title}を復元` }).click();
  await expect(page.getByText("復元しました")).toBeVisible();
  await expect(inList).toBeVisible();

  // もう一度消して、完全に削除。確認ダイアログには「OK」と答える
  await page.getByRole("button", { name: `${title}を削除` }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: `${title}を完全に削除` }).click();
  await expect(page.getByText("完全に削除しました")).toBeVisible();
  await expect(page.getByText(title)).toBeHidden();
});
