import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LanguageThemePill } from "@/components/nav/LanguageThemePill";

export function AppHeader({
  lang,
  setLang,
  rightCta,
}: {
  lang: "en" | "pt";
  setLang: (lang: "en" | "pt") => void;
  rightCta?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-[20px] border-b border-border/60 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <img
                src="/logo.svg"
                alt="THE HUB"
                className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-lg font-semibold tracking-tight text-foreground">THE HUB</span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/hub-dub/login" className="hover:text-foreground transition-colors">
            HubDub
          </Link>
          <Link href="/hubschool" className="hover:text-foreground transition-colors">
            HubSchool
          </Link>
          <Link href="/hub-align" className="hover:text-foreground transition-colors">
            HubAlign
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageThemePill lang={lang} setLang={setLang} />
          {rightCta ? (
            rightCta.href ? (
              <Link href={rightCta.href}>
                <Button variant="outline" className="rounded-full px-5 h-10">
                  {rightCta.label}
                </Button>
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5 h-10"
                onClick={rightCta.onClick}
              >
                {rightCta.label}
              </Button>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
