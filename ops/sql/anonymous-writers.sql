-- Googleがつながっていないのに、日記がある人を見る
-- 画面の呼び先を mosaku.jp/api に切り替えると、29-1のあと一度もmosakuを開いていない人には
-- mosaku_uidが届かず、日記が見えなくなる。切り替える前に、そういう人がいないか確かめる
-- SupabaseのSQL Editorに貼って流す。数と日付だけを見て、日記の中身は読まない
select
  right(m.user_id, 6) as "ユーザー",
  count(*) as "日記の数",
  -- 日付は日本時間にする
  (max(m.updated_at) + interval '9 hours')::date as "最後に書いた日",
  -- 29-1を出したあと(11/26から)に書いた人は、そのとき開いた画面でmosaku_uidを付け直してある
  max(m.updated_at) + interval '9 hours' >= '2026-11-26' as "付け直し済み"
from memos m
-- ゴミ箱の日記は数えない
where m.trashed_at is null
  -- Googleがつながっている人は、ログインし直せば日記に戻れるので数えない
  and not exists (select 1 from accounts a where a.user_id = m.user_id)
group by m.user_id
-- 古い順。取り残されていそうな人が上に来る
order by max(m.updated_at);
