import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, CalendarDays, Check, Flame, Hand, Trash2 } from "lucide-react";
import { type ReactNode } from "react";
import { brl, iniciais, quando, useStore, type CheckIn, type Reacao } from "@/lib/store";

export function Progress({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-1 w-full bg-muted ${className}`}>
      <div className="h-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-border bg-card ${className}`}>{children}</div>;
}

export function Avatar({ nome, tone = "dark", size = "md" }: { nome: string; tone?: "dark" | "light"; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  const t = tone === "dark" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground";
  return <span className={`inline-flex shrink-0 items-center justify-center font-mono font-semibold ${s} ${t}`}>{iniciais(nome)}</span>;
}

export function SectionTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {meta && <span className="label-mono">{meta}</span>}
    </div>
  );
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="border border-dashed border-border px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex justify-center text-foreground">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function AnnouncementBanner() {
  const { live } = useStore();
  return (
    <div className="flex flex-col gap-4 bg-secondary p-5 text-secondary-foreground sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-secondary-foreground/30">
        <CalendarDays className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="label-mono !text-secondary-foreground/60">Próxima live de alinhamento</p>
        <p className="mt-1 font-display text-xl font-semibold leading-snug">{live.titulo}</p>
        <p className="mt-1 font-mono text-xs text-secondary-foreground/70">{live.quando}</p>
      </div>
      <a href={live.link} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground">
        Entrar na live <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

const REACOES: { k: Reacao; label: string; Icon: typeof Hand }[] = [
  { k: "palmas", label: "Palmas", Icon: Hand },
  { k: "bora", label: "Bora", Icon: Flame },
  { k: "executou", label: "Executou", Icon: Check },
];

function Nota({ titulo, texto, tom }: { titulo: string; texto: string; tom: "certo" | "errado" }) {
  return (
    <div className={`border-l-2 pl-3 ${tom === "certo" ? "border-accent" : "border-destructive"}`}>
      <p className={`label-mono ${tom === "certo" ? "!text-accent" : "!text-destructive"}`}>{titulo}</p>
      <p className="mt-1 text-sm leading-relaxed">{texto}</p>
    </div>
  );
}

export function CheckInPost({ c }: { c: CheckIn }) {
  const { membros, negocios, toggleReacao, toggleFavorito, favoritos, isAdmin, removerCheckIn } = useStore();
  const m = membros.find((x) => x.id === c.membroId);
  const neg = negocios.find((x) => x.membroId === c.membroId);
  const fav = favoritos.includes(c.id);
  const novo = quando(c.data) === "hoje";
  return (
    <article className="border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border p-5">
        <Link to="/perfil/$id" params={{ id: c.membroId }}><Avatar nome={m?.nome ?? ""} /></Link>
        <div className="min-w-0 flex-1">
          <Link to="/perfil/$id" params={{ id: c.membroId }} className="text-sm font-semibold hover:underline">{m?.nome}</Link>
          <p className="truncate text-xs text-muted-foreground">
            {neg?.nome} · {quando(c.data)}
            {novo && <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">● novo</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="label-mono">Faturado</p>
          <p className="num text-lg font-semibold text-accent">{brl(c.valor)}</p>
        </div>
        <button onClick={() => toggleFavorito(c.id)} aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
          className={`flex h-8 w-8 items-center justify-center border border-border ${fav ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
          <Bookmark className="h-3.5 w-3.5" fill={fav ? "currentColor" : "none"} />
        </button>
        {isAdmin && !c.id.startsWith("tmp-") && (
          <button onClick={() => { if (confirm("Apagar este check-in? Não dá para desfazer.")) removerCheckIn(c.id); }} aria-label="Apagar check-in (admin)" title="Apagar check-in (admin)"
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </header>
      <div className="space-y-4 p-5">
        <div>
          <p className="label-mono">O que foi feito</p>
          <p className="mt-1.5 text-[15px] leading-relaxed">{c.texto}</p>
        </div>
        {(c.deuCerto || c.deuErrado) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {c.deuCerto && <Nota titulo="Deu certo" texto={c.deuCerto} tom="certo" />}
            {c.deuErrado && <Nota titulo="Deu errado" texto={c.deuErrado} tom="errado" />}
          </div>
        )}
        {c.foto && (
          <div>
            <p className="label-mono mb-2">Prova anexada</p>
            <img src={c.foto} alt="Prova do check-in" className="max-h-[420px] w-full border border-border object-cover" />
          </div>
        )}
        {!!c.horas && <p className="label-mono">{c.horas}h investidas</p>}
      </div>
      <footer className="flex flex-wrap gap-2 border-t border-border p-4">
        {REACOES.map(({ k, label, Icon }) => {
          const on = c.minhas.includes(k);
          return (
            <button key={k} onClick={() => toggleReacao(c.id, k)}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
              <Icon className="h-3.5 w-3.5" /> {label} <b>{c.reacoes[k]}</b>
            </button>
          );
        })}
      </footer>
    </article>
  );
}
