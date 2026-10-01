import { test, expect } from "@playwright/test";
import { createMemo } from "./helpers";

test("本文の言葉で検索して、結果から開ける", async ({ page }) => {
  const title = `検索 ${Date.now()}`;
  await page.goto("/");
  await createMemo(page, title, "森の奥でキノコを見つけた");

  await page.getByPlaceholder("検索").fill("キノコ");

  // 検索中はエディタが隠れて、結果だけが出る
  await expect(
    page.getByRole("heading", { name: "「キノコ」の検索結果" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("タイトル")).toBeHidden();

  await page.getByRole("button", { name: title, exact: true }).click();

  // 開いたら検索が閉じて、そのメモがエディタに入る
  await expect(page.getByPlaceholder("検索")).toHaveValue("");
  await expect(page.getByPlaceholder("タイトル")).toHaveValue(title);
});

test("見つからない言葉では、見つからなかったと出る", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("検索").fill(`無い言葉${Date.now()}`);

  await expect(page.getByText("見つかりませんでした")).toBeVisible();
});
