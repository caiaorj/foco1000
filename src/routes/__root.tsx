import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider, useStore, totalDe } from "../lib/store";
import { CheckInModal } from "../components/app/CheckInModal";
import { Plus, LogOut } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
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
      { title: "Foco Mil Reais" },
      { name: "description", content: "Accountability para chegar aos primeiros R$ 1.000 faturados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
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

const nav = [
  { to: "/", label: "Feed" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/negocio", label: "Meu Negócio" },
  { to: "/ranking", label: "Ranking" },
  { to: "/participantes", label: "Participantes" },
  { to: "/materias", label: "Matérias" },
] as const;

function Header() {
  const { checkins, negocios, membros, meId, isAdmin } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const meta = negocios.find((n) => n.membroId === meId)?.meta ?? 1000;
  const total = totalDe(checkins, meId);
  const nomeCompleto = membros.find((m) => m.id === meId)?.nome ?? "";
  const primeiroNome = nomeCompleto.split(" ").filter(Boolean)[0] ?? "";

  async function sair() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }
  const fmt = (v: number) => "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="leading-tight">
            <span className="label-mono block">Desafio em execução</span>
            <span className="font-display text-xl font-semibold">Foco <span className="text-accent">Mil Reais</span></span>
          </Link>
          <div className="ml-auto hidden text-right sm:block">
            <span className="label-mono block">OLÁ{primeiroNome ? "," : ""}</span>
            <span className="num text-sm">{primeiroNome || "bem-vindo(a)"}</span>
          </div>
          <div className="text-right">
            <span className="label-mono block">Sua meta</span>
            <span className="num text-sm"><span className="text-accent">{fmt(total)}</span> / {fmt(meta)}</span>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo check-in
          </button>
          <button onClick={sair} aria-label="Sair" title="Sair" className="p-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="-mx-1 mt-3 flex gap-1 overflow-x-auto pb-3">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="whitespace-nowrap px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              activeProps={{ className: "bg-primary !text-primary-foreground font-semibold" }}>
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin"
              className="whitespace-nowrap border border-accent px-3 py-2 font-mono text-xs uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent !text-accent-foreground font-semibold" }}>
              Admin
            </Link>
          )}
        </nav>
      </div>
      <CheckInModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  const ehAuth = router.state.location.pathname === "/auth";
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        {ehAuth ? (
          <Outlet />
        ) : (
          <>
            <Header />
            <main className="mx-auto max-w-3xl px-4 py-6">
              <Outlet />
            </main>
          </>
        )}
      </StoreProvider>
    </QueryClientProvider>
  );
}
