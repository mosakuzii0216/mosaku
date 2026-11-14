import { XClient } from './x.client';

// Xの代わりに、決まった返事を返す
function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('XClient', () => {
  const client = new XClient(
    'client-id',
    'client-secret',
    'http://127.0.0.1:3000/auth/x/callback',
  );
  // 本物のXには問い合わせずに、何を送ったかだけを見る
  const fetchMock = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('fetchUserId()は引換券と鍵をトークンに替えて、Xの人のIDを読む', async () => {
    fetchMock
      .mockResolvedValueOnce(reply({ access_token: 'token-1' }))
      .mockResolvedValueOnce(reply({ data: { id: 'x-user-1' } }));

    expect(await client.fetchUserId('code-1', 'verifier-1')).toBe('x-user-1');

    // 1回目：引換券と鍵を、アプリのIDと秘密の鍵と一緒に出す
    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe('https://api.x.com/2/oauth2/token');
    const basic = Buffer.from('client-id:client-secret').toString('base64');
    expect(tokenInit?.headers).toEqual({ Authorization: `Basic ${basic}` });
    const body = new URLSearchParams(String(tokenInit?.body));
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe('code-1');
    expect(body.get('code_verifier')).toBe('verifier-1');
    expect(body.get('redirect_uri')).toBe(
      'http://127.0.0.1:3000/auth/x/callback',
    );
    // 2回目：もらったトークンで、自分のIDを読む
    expect(fetchMock.mock.calls[1]).toEqual([
      'https://api.x.com/2/users/me',
      { headers: { Authorization: 'Bearer token-1' } },
    ]);
  });

  it('fetchUserId()はXに断られたら、ステータスを付けてエラーにする', async () => {
    fetchMock.mockResolvedValueOnce(reply({ error: 'invalid_request' }, 400));

    await expect(client.fetchUserId('code-1', 'verifier-1')).rejects.toThrow(
      'Xのトークンをもらえませんでした: 400',
    );
  });
});
