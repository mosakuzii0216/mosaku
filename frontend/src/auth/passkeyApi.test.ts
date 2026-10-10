import { describe, it, expect } from "vitest";
import { reasonOf } from "./passkeyApi";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status });

describe("reasonOf", () => {
  it("サーバが返した理由を取り出す", async () => {
    const res = json({ message: "登録されていないパスキーです" }, 400);

    expect(await reasonOf(res, "決まった文")).toBe(
      "登録されていないパスキーです",
    );
  });

  it("サーバの中の事故(500)なら、決まった分にする", async () => {
    const res = json({ message: "Internal server error" }, 500);

    expect(await reasonOf(res, "決まった文")).toBe("決まった文");
  });

  it("JSONでなければ、決まった文にする", async () => {
    const res = new Response("<html>Not Found</html>", { status: 404 });

    expect(await reasonOf(res, "決まった文")).toBe("決まった文");
  });
});
