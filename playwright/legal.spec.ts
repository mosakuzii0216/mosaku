import { test, expect } from "@playwright/test";

test("利用規約からプライバシーポリシーへ進んで、mosakuへ戻れる", async ({
  page,
}) => {
  await page.goto("/terms.html");
  await expect(
    page.getByRole("heading", { name: "mosaku 利用規約" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "プライバシーポリシー" }).click();
  await expect(
    page.getByRole("heading", { name: "mosaku プライバシーポリシー" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "mosakuへ戻る" }).click();
  await expect(page.getByPlaceholder("タイトル")).toBeVisible();
});
