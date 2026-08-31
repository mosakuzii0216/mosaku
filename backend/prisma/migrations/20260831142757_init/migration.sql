-- CreateTable
CREATE TABLE "memos" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "memos_pkey" PRIMARY KEY ("id")
);
