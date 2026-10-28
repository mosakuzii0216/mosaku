-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedbacks_user_id_idx" ON "feedbacks"("user_id");

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
