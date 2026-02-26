"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  onMenuPress: () => void;
}

export function Header({ onMenuPress }: HeaderProps) {
  const { t, lang } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push(`/${lang}/auth/login`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuPress}
        aria-label={t("common.toggleSidebar")}
      >
        <MenuIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      </Button>
      <Link href={`/${lang}/dashboard`} passHref legacyBehavior>
        <a className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer">
          {t("header.appName")}
        </a>
      </Link>
      <div className="flex items-center space-x-4">
        {status === "authenticated" ? (
          <>
            <span className="text-gray-700 dark:text-gray-300 hidden md:block">
              {t("header.welcome", { name: session?.user?.name || "" })}
            </span>
            <Button onClick={handleSignOut} variant="outline" className="text-sm">
              {t("header.signOut")}
            </Button>
          </>
        ) : (
          <Link href={`/${lang}/auth/login`} passHref legacyBehavior>
            <Button variant="default" className="text-sm">
              {t("header.signIn")}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

