import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvitationPanel } from "./InvitationPanel";
import type { Invitations } from "./invitationApi";

// 開いたときに読む一覧。まだ使われていないコードと、使われたコード
const list: Invitations = {
  invitations: [
    {
      id: "1",
      code: "ABCD-EFGH",
      expiresAt: "2026-12-09T03:00:00.000Z",
      status: "unused",
    },
    {
      id: "2",
      code: "JKLM-NPQR",
      expiresAt: "2026-12-01T03:00:00.000Z",
      status: "used",
    },
  ],
  remaining: 1,
};

// 本物のAPIの代わり。テストごとに、見たいものだけ差し替える
const base = {
  onLoad: async () => list,
};

describe("InvitationPanel", () => {
  it("開くと、自分のコードと、いつまで使えるか・使われたかを出す", async () => {
    render(<InvitationPanel {...base} />);

    expect(await screen.findByText("ABCD-EFGH")).toBeInTheDocument();
    expect(screen.getByText("12月9日まで")).toBeInTheDocument();
    expect(screen.getByText("使われた")).toBeInTheDocument();
  });

  it("読めなかったら、開き直してもらう", async () => {
    render(
      <InvitationPanel
        {...base}
        onLoad={() => Promise.reject(new Error("offline"))}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("開き直して");
  });
});
