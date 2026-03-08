-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "keycloak_id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "display_name" VARCHAR(100),
    "profile_image_url" VARCHAR(500),
    "bio" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "blog_post_drafts" (
    "draft_id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "published_post_id" INTEGER,
    "submitted_at" TIMESTAMP(6),
    "approved_at" TIMESTAMP(6),
    "approved_by" INTEGER,
    "rejected_at" TIMESTAMP(6),
    "rejected_by" INTEGER,
    "rejection_reason" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "blog_post_drafts_pkey" PRIMARY KEY ("draft_id")
);

-- CreateTable
CREATE TABLE "blog_post_published" (
    "post_id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "approved_at" TIMESTAMP(6) NOT NULL,
    "approved_by" INTEGER NOT NULL,
    "published_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(6) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_post_published_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "blog_post_histories" (
    "history_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "approved_at" TIMESTAMP(6) NOT NULL,
    "approved_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_post_histories_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "blog_image_drafts" (
    "image_id" SERIAL NOT NULL,
    "draft_id" INTEGER NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "is_thumbnail" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_image_drafts_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "blog_image_published" (
    "image_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "is_thumbnail" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_image_published_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "masters" (
    "master_id" SERIAL NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "masters_pkey" PRIMARY KEY ("master_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloak_id_key" ON "users"("keycloak_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_published_slug_key" ON "blog_post_published"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "masters_category_code_key" ON "masters"("category", "code");

-- AddForeignKey
ALTER TABLE "blog_post_drafts" ADD CONSTRAINT "blog_post_drafts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_drafts" ADD CONSTRAINT "blog_post_drafts_published_post_id_fkey" FOREIGN KEY ("published_post_id") REFERENCES "blog_post_published"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_drafts" ADD CONSTRAINT "blog_post_drafts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_drafts" ADD CONSTRAINT "blog_post_drafts_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_published" ADD CONSTRAINT "blog_post_published_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_published" ADD CONSTRAINT "blog_post_published_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_histories" ADD CONSTRAINT "blog_post_histories_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_post_published"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_image_drafts" ADD CONSTRAINT "blog_image_drafts_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "blog_post_drafts"("draft_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_image_published" ADD CONSTRAINT "blog_image_published_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_post_published"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;
