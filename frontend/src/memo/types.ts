export type Memo = {
  id: string;
  title: string;
  content: unknown;
  createdAt: string;
  updatedAt: string;
};

export interface MemoRepository {
  create(input: { title: string; content: unknown }): Promise<Memo>;
  findAll(): Promise<Memo[]>;
}
