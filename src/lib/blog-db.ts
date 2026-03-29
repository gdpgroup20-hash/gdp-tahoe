import { getDb, initDb } from "./db";

export interface BlogPostDB {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  readTime: number;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostRow {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string;
  published_at: string;
  read_time: number;
  body: string;
  published: number;
  created_at: string;
  updated_at: string;
}

function rowToPost(row: BlogPostRow): BlogPostDB {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    coverImage: row.cover_image,
    publishedAt: row.published_at,
    readTime: row.read_time,
    body: row.body,
    published: row.published === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllPostsDB(): Promise<BlogPostDB[]> {
  await initDb();
  const sql = getDb();
  const rows = (await sql`SELECT * FROM blog_posts ORDER BY published_at DESC`) as BlogPostRow[];
  return rows.map(rowToPost);
}

export async function getPublishedPostsDB(): Promise<BlogPostDB[]> {
  await initDb();
  const sql = getDb();
  const rows = (await sql`SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC`) as BlogPostRow[];
  return rows.map(rowToPost);
}

export async function getPostDB(slug: string): Promise<BlogPostDB | null> {
  await initDb();
  const sql = getDb();
  const rows = (await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`) as BlogPostRow[];
  return rows.length > 0 ? rowToPost(rows[0]) : null;
}

export async function upsertPost(post: BlogPostDB): Promise<void> {
  await initDb();
  const sql = getDb();
  const now = new Date().toISOString().split("T")[0];
  await sql`
    INSERT INTO blog_posts (slug, title, excerpt, category, cover_image, published_at, read_time, body, published, created_at, updated_at)
    VALUES (${post.slug}, ${post.title}, ${post.excerpt}, ${post.category}, ${post.coverImage}, ${post.publishedAt}, ${post.readTime}, ${post.body}, ${post.published ? 1 : 0}, ${post.createdAt || now}, ${now})
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      category = EXCLUDED.category,
      cover_image = EXCLUDED.cover_image,
      published_at = EXCLUDED.published_at,
      read_time = EXCLUDED.read_time,
      body = EXCLUDED.body,
      published = EXCLUDED.published,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function deletePost(slug: string): Promise<void> {
  await initDb();
  const sql = getDb();
  await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
}
