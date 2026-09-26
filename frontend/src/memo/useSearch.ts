import { useEffect, useState } from "react";
import { apiMemoRepository } from "./apiMemoRepository";
import type { Memo } from "./types";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Memo[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q === "") {
      setResults([]);
      return;
    }

    // 打つたびに叩かず、300ms止まってから1回だけ投げる
    const timer = setTimeout(() => {
      apiMemoRepository
        .search(q)
        .then(setResults)
        .catch(() => setResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    // 検索中かどうかを、呼ぶ側が query.trim() で判断しなくて済むようにする
    isSearching: query.trim() !== "",
  };
}
