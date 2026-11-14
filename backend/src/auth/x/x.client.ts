// Xとのやりとり。Googleと違ってライブラリを使わないので、fetchで直接話す
export class XClient {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {}

  // 帰りにもらった引換券(code)と鍵をトークンに替えて、そのトークンでXの人のIDを読む
  async fetchUserId(code: string, verifier: string): Promise<string> {
    // アプリのIDと秘密の鍵を「ID:鍵」の形にして、base64に送る(Basic認証)
    const pair = `${this.clientId}:${this.clientSecret}`;
    const basic = Buffer.from(pair).toString('base64');
    const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}` },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier: verifier,
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(`Xのトークンをもらえませんでした: ${tokenRes.status}`);
    }
    const token = (await tokenRes.json()) as { access_token: string };

    const meRes = await fetch('https://api.x.com/2/users/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!meRes.ok) {
      throw new Error(`Xの人を読み込めませんでした: ${meRes.status}`);
    }
    const me = (await meRes.json()) as { data: { id: string } };
    return me.data.id;
  }
}
