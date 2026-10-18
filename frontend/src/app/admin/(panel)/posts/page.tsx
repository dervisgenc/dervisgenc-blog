import type { Metadata } from "next";

import { PostsTable } from "@/components/admin/posts-table";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return <PostsTable />;
}
