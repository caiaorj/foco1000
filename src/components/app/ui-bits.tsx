import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, CalendarDays, Heart } from "lucide-react";
import { type ReactNode } from "react";
import { brl, CURRENT_USER_ID, dataCurta, useStore, type CheckIn } from "@/lib/store";

export function Progress({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full bg-muted ${className}`}>
      <div className="h-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-border bg-card p-5 ${className}`}>{children}</div>;
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
  const { avisos } = useStore();
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 bg-secondary p-5 text-secondary-foreground sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-secondary-foreground/30">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="label-mono !text-secondary-foreground/60">Próxima live de alinhamento</p>
          <p className="mt-1 font-display text-xl font-semibold leading-snug">Precificação sem medo: como cobrar sem pedir desconto</p>
          <p className="mt-1 font-mono text-xs text-secondary-foreground/70">Sexta-feira, 9 de outubro · 19h30 (horário de Brasília)</p>
        </div>
        <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center justify-center gap-2 bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground">
          Entrar na live <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
      {avisos.filter((a) => a.tipo === "atividade").slice(0, 2).map((a) => (
        <p key={a.id} className="flex gap-3 border-l-2 border-accent pl-3 text-sm">
          <span className="label-mono shrink-0 pt-0.5">Atividade</span>{a.texto}
        </p>
      ))}
    </div>
  );
}

export function CheckInPost({ c }: { c: CheckIn }) {
  const { membros, negocios, toggleCurtida, toggleFavorito, favoritos } = useStore();
  const m = membros.find((x) => x.id === c.membroId);
  const neg = negocios.find((x) => x.membroId === c.membroId);
  const liked = c.curtidas.includes(CURRENT_USER_ID);
  const fav = favoritos.includes(c.id);
  return (
    <article className="border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <Link to="/perfil/$id" params={{ id: c.membroId }}>
          <img src={m?.avatar} alt="" className="h-9 w-9 border border-border bg-muted" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to="/perfil/$id" params={{ id: c.membroId }} className="text-sm font-semibold hover:underline">{m?.nome}</Link>
          <p className="label-mono truncate">{neg?.nome} · {dataCurta(c.data)}</p>
        </div>
        <span className="num text-sm font-semibold text-accent">+{brl(c.valor)}</span>
      </div>
      {c.foto && <img src={c.foto} alt="Foto do check-in" className="max-h-96 w-full border-y border-border object-cover" />}
      <div className="p-4">
        <p className="text-[15px] leading-relaxed">{c.texto}</p>
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
          <button onClick={() => toggleCurtida(c.id)} className={`inline-flex items-center gap-1.5 font-mono text-xs ${liked ? "text-destructive" : "text-muted-foreground"}`}>
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {c.curtidas.length}
          </button>
          <button onClick={() => toggleFavorito(c.id)} aria-label="Favoritar" className={`ml-auto ${fav ? "text-foreground" : "text-muted-foreground"}`}>
            <Bookmark className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
}
