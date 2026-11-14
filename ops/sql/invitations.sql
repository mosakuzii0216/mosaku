-- 招待で登録した人が、書き始めたか・続いているか・AIを使ったかを見る
-- SupabaseのSQL Editorに貼って流す。数と日付だけを見て、日記の中身は読まない
select
  -- 日付は日本時間にする
  (i.used_at + interval '9 hours')::date as "登録した日",
  -- 誰が誰を招待したか。IDは長いので、終わりの6文字だけ出す
  case when c.is_developer then '開発者' else right(c.id, 6) end as "招待した人",
  right(i.used_by_id, 6) as "登録した人",
  count(m.id) as "日記の数",
  (min(m.created_at) + interval '9 hours')::date as "最初に書いた日",
  -- 登録して1週間たってからも、書いたり直したりしたか
  coalesce(bool_or(m.updated_at >= i.used_at + interval '7days'), false) as "1週間後も書いた",
  (select count(*) from ai_usages a where a.user_id = i.used_by_id) as "AIの回数"
from invitations i
join users c on c.id = i.created_by_id
-- ゴミ箱の日記は数えない
left join memos m on m.user_id = i.used_by_id and m.trashed_at is null
where i.used_at is not null
group by i.id, c.id
order by i.used_at;
