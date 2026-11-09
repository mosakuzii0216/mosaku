import { test, expect } from "@playwright/test";

test("Googleのログインに失敗して戻ったら、知らせを出してURLから消す", async ({
  page,
}) => {
  await page.goto("/?login=failed");

  await expect(page.getByRole("alert")).toContainText(
    "Googleでログインできませんでした",
  );
  // リロードしてもまた出ないように、URLからは消えている
  expect(new URL(page.url()).search).toBe("");

  await page.getByRole("button", { name: "閉じる" }).click();
  await expect(page.getByRole("alert")).toBeHidden();
});

test("招待コードを使えずに戻ったら、理由を知らせてURLから消す", async ({
  page,
}) => {
  await page.goto("/?invite=used");

  await expect(page.getByRole("alert")).toContainText(
    "この招待コードは、もう使われています",
  );
  expect(new URL(page.url()).search).toBe("");
});
