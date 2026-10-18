import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditPost } from "@/components/admin/edit-post";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <EditPost id={id} />;
}
