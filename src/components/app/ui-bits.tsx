import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState, type ReactNode } from "react";
import { brl, CURRENT_USER_ID, dataCurta, useStore, type CheckIn } from "@/lib/store";

export function Progress({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}>{children}</div>;
}

export function AnnouncementBanner() {
  const { avisos } = useStore();
  const [i, setI] = useState(0);
  const a = avisos[i % avisos.length];
  if (!a) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground">
      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent-foreground">
        {a.tipo === "aviso" ? "Aviso" : "Atividade"}
      </span>
      <p className="flex-1 text-sm">{a.texto}</p>
      {avisos.length > 1 && (
        <button onClick={() => setI(i + 1)} className="text-xs font-semibold underline underline-offset-2">
          Próximo ({(i % avisos.length) + 1}/{avisos.length})
        </button>
      )}
    </div>
  );
}

export function CheckInPost({ c }: { c: CheckIn }) {
  const { membros, toggleCurtida } = useStore();
  const m = membros.find((x) => x.id === c.membroId);
  const liked = c.curtidas.includes(CURRENT_USER_ID);
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Link to="/perfil/$id" params={{ id: c.membroId }}>
          <img src={m?.avatar} alt="" className="h-10 w-10 rounded-full bg-muted" />
        </Link>
        <div className="flex-1">
          <Link to="/perfil/$id" params={{ id: c.membroId }} className="font-semibold hover:underline">{m?.nome}</Link>
          <p className="text-xs text-muted-foreground">{dataCurta(c.data)}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-display text-sm font-bold text-primary">+{brl(c.valor)}</span>
      </div>
      {c.foto && <img src={c.foto} alt="Foto do check-in" className="max-h-96 w-full object-cover" />}
      <div className="p-4">
        <p className="text-sm leading-relaxed">{c.texto}</p>
        <button onClick={() => toggleCurtida(c.id)} className={`mt-3 inline-flex items-center gap-1.5 text-sm ${liked ? "text-destructive" : "text-muted-foreground"}`}>
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /> {c.curtidas.length}
        </button>
      </div>
    </Card>
  );
}
