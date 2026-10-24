import { test, expect, type Page } from "@playwright/test";
import { createMemo } from "./helpers";

// 話しかける欄に書いて、送る
async function say(page: Page, text: string) {
  await page.getByRole("textbox", { name: "AIに話しかける" }).fill(text);
  await page.getByRole("button", { name: "送る" }).click();
}

// 会話に並んだ言葉
const said = (page: Page) =>
  page.getByRole("list", { name: "AIとの会話" }).getByRole("listitem");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "AI", exact: true }).click();
});

test("ログインしていなければ、Googleでログインするように伝えて、書いたことは残す", async ({
  page,
}) => {
  await say(page, "聞いて");

  await expect(page.getByRole("alert")).toHaveText(
    "AIはGoogleでログインすると使えます",
  );
  await expect(said(page)).toHaveText(["聞いて"]);
});

test("考え中のあとに返事が並び、新規にすると会話は最初から", async ({
  page,
}) => {
  // ブラウザのテストではGoogleでログインできないので、返事は偽物にする。少し待たせて考え中を見る
  await page.route("**/ai/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ json: { reply: "どうしたの？" } });
  });
  await createMemo(page, `AI ${Date.now()}`, "仕事でミスをした");

  await say(page, "聞いて");
  await expect(page.getByText("考え中...")).toBeVisible();
  await expect(said(page)).toHaveText(["聞いて", "どうしたの？"]);

  await page.getByRole("button", { name: "新規" }).click();
  await expect(said(page)).toHaveCount(0);
});

test("つながらなければ、もう一度話しかけるように伝える", async ({ page }) => {
  await page.route("**/ai/chat", (route) => route.abort());

  await say(page, "聞いて");

  await expect(page.getByRole("alert")).toHaveText(
    "うまく届きませんでした。少し待って、もう一度話しかけてください",
  );
});
