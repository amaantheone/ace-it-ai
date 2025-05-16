-- CreateTable
CREATE TABLE "FlashCard" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "translation" TEXT,
    "partOfSpeech" TEXT,
    "definition" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
