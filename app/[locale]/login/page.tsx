import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { signIn } from "@/auth";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { ShellCard } from "@/components/design/shell-card";
import { Button } from "@/components/ui/button";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({
  params,
}: Pick<LoginPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "login" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("title")} · ${meta("title")}`,
    description: t("subtitle"),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl?.startsWith("/") ? callbackUrl : "/";
  const t = await getTranslations("login");
  const nav = await getTranslations("nav");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 py-8">
      <Reveal>
        <PageHeader title={t("title")} description={t("subtitle")} />
      </Reveal>
      <Reveal delay={0.06}>
        <ShellCard innerClassName="flex flex-col gap-3 p-6">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo });
            }}
          >
            <Button type="submit" className="w-full rounded-full">
              {nav("github")}
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo });
            }}
          >
            <Button type="submit" variant="outline" className="w-full rounded-full">
              {nav("google")}
            </Button>
          </form>
        </ShellCard>
      </Reveal>
    </div>
  );
}