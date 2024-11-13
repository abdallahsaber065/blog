-- CreateTable
CREATE TABLE "FileLibrary" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT,
    "file_size" INTEGER,
    "file_url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by_id" INTEGER,

    CONSTRAINT "FileLibrary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileLibrary" ADD CONSTRAINT "FileLibrary_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
