import { notFound } from "next/navigation";

import { getPublicUser } from "@/lib/queries/users";

type UserLayoutProps = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export default async function UserLayout({ params, children }: UserLayoutProps) {
  const { id } = await params;
  const user = await getPublicUser(id);
  if (!user) {
    notFound();
  }
  return children;
}