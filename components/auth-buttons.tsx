import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function AuthButtons() {
  const session = await auth();
  const t = await getTranslations("nav");

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1.5">
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
          className="hidden sm:block"
        >
          <Button type="submit" variant="outline" size="sm" className="rounded-full">
            {t("github")}
          </Button>
        </form>
        <Link
          href="/login"
          className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  const { user } = session;
  const initials =
    user.name?.slice(0, 2).toUpperCase() ??
    user.email?.slice(0, 2).toUpperCase() ??
    "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("profile")}
      >
        <Avatar className="size-9">
          {user.image ? (
            <span className="relative block size-9 overflow-hidden rounded-full">
              <Image
                src={user.image}
                alt={user.name ?? t("profile")}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
            </span>
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href="/profile">{t("profile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="w-full"
          >
            <button type="submit" className="w-full cursor-pointer text-left">
              {t("logout")}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}