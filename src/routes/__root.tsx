import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useState } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { store, seedIfEmpty } from "@/lib/election";
import { supabase } from "@/integrations/supabase/client";
import { SchoolBrand } from "@/components/SchoolBrand";

const SITE_PASSWORD = "dawn2026";
const SITE_UNLOCK_KEY = "site.unlocked";

function SiteGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SITE_UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070d] px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(20,184,166,0.22), transparent 60%), radial-gradient(700px 400px at 50% 50%, rgba(244,114,182,0.15), transparent 60%)",
        }}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw === SITE_PASSWORD) {
            try {
              sessionStorage.setItem(SITE_UNLOCK_KEY, "1");
            } catch {}
            setUnlocked(true);
            setError(false);
          } else {
            setError(true);
          }
        }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-6 flex justify-center">
          <SchoolBrand size="md" showSubtitle={false} />
        </div>
        <h1 className="text-center text-xl font-bold text-white">Restricted Access</h1>
        <p className="mt-2 text-center text-sm text-white/60">
          Enter the password to continue.
        </p>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            if (error) setError(false);
          }}
          placeholder="Password"
          className="mt-6 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/40"
        />
        {error && (
          <p className="mt-2 text-center text-sm text-rose-400">Incorrect password</p>
        )}
        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-white/90"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dawn Shikshalaya Public School" },
      { name: "description", content: "Lumina Vote is a futuristic web app for school house elections, offering an immersive and elegant voting experience." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Dawn Shikshalaya Public School" },
      { property: "og:description", content: "Lumina Vote is a futuristic web app for school house elections, offering an immersive and elegant voting experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Dawn Shikshalaya Public School" },
      { name: "twitter:description", content: "Lumina Vote is a futuristic web app for school house elections, offering an immersive and elegant voting experience." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a064acf9-f749-464e-b38c-a8cecc3c1450/id-preview-1b7203ee--79a740d3-feaf-4b1f-83f2-38f682ce96b9.lovable.app-1781890534259.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a064acf9-f749-464e-b38c-a8cecc3c1450/id-preview-1b7203ee--79a740d3-feaf-4b1f-83f2-38f682ce96b9.lovable.app-1781890534259.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Keep the school logo synced from the shared backend on every device.
  useEffect(() => {
    void store.refreshSchoolLogo();
    void seedIfEmpty();
    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => {
          void store.refreshSchoolLogo();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SiteGate>
        <Outlet />
      </SiteGate>
    </QueryClientProvider>
  );
}
