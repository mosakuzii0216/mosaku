import { expect, type Page } from "@playwright/test";

// タイトルと本文を書いて、手を止める。自動で保存されるまで待つ。
export async function createMemo(page: Page, title: string, body: string) {
  await page.getByPlaceholder("タイトル").fill(title);
  await page.locator(".ProseMirror").click();
  await page.keyboard.type(body);
  await expect(page.getByText("保存しました")).toBeVisible();
}

// メモの一覧は引き出しの中にある。ヘッダーの「一覧」を押して開く
export async function openList(page: Page) {
  await page.getByRole("button", { name: "一覧", exact: true }).click();
}
