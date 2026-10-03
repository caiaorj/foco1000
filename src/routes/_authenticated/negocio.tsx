import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Share2, X } from "lucide-react";
import { brl, quando, totalDe, useStore } from "@/lib/store";
import { AnnouncementBanner, Card, Progress } from "@/components/app/ui-bits";
import { ShareCard } from "@/components/app/ShareCard";

export const Route = createFileRoute("/_authenticated/negocio")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Meu Negócio — Foco Mil Reais" },
      { name: "description", content: "Seu projeto, sua meta e o faturamento acumulado rumo aos R$ 1.000." },
      { property: "og:title", content: "Meu Negócio — Foco Mil Reais" },
      { property: "og:description", content: "Seu projeto, sua meta e o faturamento acumulado rumo aos R$ 1.000." },
    ],
  }),
  component: MeuNegocio,
});

const inp = "mt-1.5 w-full border border-input bg-muted/60 p-2.5 text-sm outline-none focus:border-foreground";

function MeuNegocio() {
  const { negocios, checkins, updateNegocio, meId, live } = useStore();
  let neg = negocios.find((n) => n.membroId === meId) ?? { membroId: meId, nome: "Meu projeto", descricao: "", nicho: "A definir", meta: 1000 };
  neg = { ...neg, meta: Number(live.meta) || 1000 };
  const total = totalDe(checkins, meId);
  const pct = Math.min(100, (total / neg.meta) * 100);
  const meus = checkins.filter((c) => c.membroId === meId);
  const [edit, setEdit] = useState(false);
  const [share, setShare] = useState(false);
  const [form, setForm] = useState(neg);

  const abrir = () => { setForm(neg); setEdit(true); };
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    updateNegocio({ nome: form.nome.trim().slice(0, 80) || "Meu projeto", nicho: form.nicho.trim().slice(0, 40) || "A definir", descricao: form.descricao.trim().slice(0, 300) });
    setEdit(false);
  };

  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <Card>
        <div className="border-b border-border p-5">
          {edit ? (
            <form onSubmit={salvar} className="space-y-3">
              <p className="label-mono">Editar negócio</p>
              <label className="block"><span className="label-mono">Nome</span><input className={inp} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
              <label className="block"><span className="label-mono">Nicho</span><input className={inp} value={form.nicho} onChange={(e) => setForm({ ...form, nicho: e.target.value })} /></label>
              <label className="block"><span className="label-mono">Breve descrição</span><textarea className={inp} rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
              <p className="text-xs text-muted-foreground">Meta do desafio: <b className="num">{brl(neg.meta)}</b> — definida pela organização, igual para todos.</p>
              <div className="flex gap-2">
                <button className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground">Salvar</button>
                <button type="button" onClick={() => setEdit(false)} className="border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="label-mono">Meu negócio</p>
                <h1 className="mt-1 font-display text-2xl font-semibold">{neg.nome}</h1>
                <p className="text-sm text-muted-foreground">{neg.nicho}</p>
                {neg.descricao ? <p className="mt-2 text-sm">{neg.descricao}</p> : (
                  <button onClick={abrir} className="mt-2 border-b border-dashed border-foreground font-mono text-[11px] uppercase tracking-wider">+ Adicionar breve descrição</button>
                )}
              </div>
              <button onClick={abrir} aria-label="Editar negócio" className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="label-mono">Rumo aos {brl(neg.meta)}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="font-display text-4xl font-semibold text-accent">{brl(total)}</p>
            <div className="flex items-center gap-3 pb-1">
              <span className="num text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
              <button onClick={() => setShare(true)} className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider hover:bg-muted">
                <Share2 className="h-3.5 w-3.5" /> Compartilhar
              </button>
            </div>
          </div>
          <Progress pct={pct} className="mt-3 !h-1.5" />
          <p className="mt-3 text-xs text-muted-foreground">
            {total >= neg.meta ? "Meta batida. Hora de mirar a próxima." : <>Faltam <b className="num text-foreground">{brl(neg.meta - total)}</b> para bater a meta do desafio.</>}
          </p>
        </div>
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <p className="label-mono">Histórico</p>
          <h2 className="font-display text-xl font-semibold">Seus check-ins ({meus.length})</h2>
        </div>
        {meus.length ? (
          <ul>
            {meus.map((c) => (
              <li key={c.id} className="flex items-start gap-4 border-b border-border p-5 last:border-0">
                <span className="label-mono w-16 shrink-0 pt-0.5">{quando(c.data)}</span>
                <p className="flex-1 text-sm">{c.texto}</p>
                <span className="num text-sm font-semibold text-accent">{brl(c.valor)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 py-8 text-sm text-muted-foreground">Nenhum check-in ainda. Registre sua primeira execução pelo botão "Novo check-in".</p>
        )}
      </Card>

      {share && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4" onClick={() => setShare(false)}>
          <div className="w-full max-w-sm bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="label-mono">Compartilhar progresso</p>
              <button onClick={() => setShare(false)} aria-label="Fechar"><X className="h-4 w-4" /></button>
            </div>
            <ShareCard nome="Você" negocio={neg.nome} total={total} meta={neg.meta} />
          </div>
        </div>
      )}
    </div>
  );
}
