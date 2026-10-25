import { BlogEditor } from "@/components/admin/BlogEditor";

export const metadata = { title: "Edit post" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditor id={id} />;
}
