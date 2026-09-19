export type Memo = {
  id: string;
  title: string;
  content: unknown;
  createdAt: string;
  updatedAt: string;
  trashedAt: string | null;
};

export interface MemoRepository {
  create(input: { title: string; content: unknown }): Promise<Memo>;
  update(id: string, input: { title: string; content: unknown }): Promise<Memo>;
  remove(id: string): Promise<void>;
  findAll(): Promise<Memo[]>;
  findTrashed(): Promise<Memo[]>;
  restore(id: string): Promise<Memo>;
  purge(id: string): Promise<void>;
}
