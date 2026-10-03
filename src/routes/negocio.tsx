import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { brl, CURRENT_USER_ID, totalDe, useStore } from "@/lib/store";
import { Card, Progress } from "@/components/app/ui-bits";
import { ShareCard } from "@/components/app/ShareCard";
import { CheckInModal } from "@/components/app/CheckInModal";

export const Route = createFileRoute("/negocio")({
  head: () => ({
    meta: [
      { title: "Meu Negócio — Foco Mil Reais" },
      { name: "description", content: "Cadastre seu projeto, defina a meta e acompanhe o faturamento acumulado." },
      { property: "og:title", content: "Meu Negócio — Foco Mil Reais" },
      { property: "og:description", content: "Cadastre seu projeto, defina a meta e acompanhe o faturamento acumulado." },
    ],
  }),
  component: MeuNegocio,
});

function MeuNegocio() {
  const { negocios, membros, checkins, updateNegocio, updateMembro, resetDados } = useStore();
  const neg = negocios.find((n) => n.membroId === CURRENT_USER_ID)!;
  const eu = membros.find((m) => m.id === CURRENT_USER_ID)!;
  const total = totalDe(checkins, CURRENT_USER_ID);
  const pct = Math.min(100, (total / neg.meta) * 100);
  const [form, setForm] = useState({ ...neg, apelido: eu.nome });
  const [salvo, setSalvo] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setForm({ ...neg, apelido: eu.nome }), [neg, eu.nome]);

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    updateNegocio({ nome: form.nome.trim() || "Meu negócio", descricao: form.descricao, nicho: form.nicho, meta: Math.max(1, Number(form.meta) || 1000) });
    updateMembro({ nome: form.apelido.trim() || "Você" });
    setSalvo(true); setTimeout(() => setSalvo(false), 2000);
  };
  const inp = "mt-1 w-full rounded-sm border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl ">Meu Negócio</h1>
      <Card className="bg-primary text-primary-foreground border-0">
        <p className="text-sm opacity-80">Faturamento acumulado</p>
        <p className="num text-4xl font-semibold ">{brl(total)}</p>
        <p className="mt-1 text-sm opacity-80">Meta: {brl(neg.meta)} · faltam {brl(Math.max(0, neg.meta - total))}</p>
        <div className="mt-4 h-3 w-full rounded-full bg-primary-foreground/25">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <button onClick={() => setOpen(true)} className="mt-5 rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground">Registrar check-in</button>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-bold">Cadastro do projeto</h2>
          <form onSubmit={salvar} className="mt-3 space-y-3">
            <div><label className="text-sm font-semibold">Seu nome</label><input className={inp} value={form.apelido} maxLength={60} onChange={(e) => setForm({ ...form, apelido: e.target.value })} /></div>
            <div><label className="text-sm font-semibold">Nome do negócio</label><input className={inp} value={form.nome} maxLength={80} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><label className="text-sm font-semibold">Nicho</label><input className={inp} value={form.nicho} maxLength={40} onChange={(e) => setForm({ ...form, nicho: e.target.value })} /></div>
            <div><label className="text-sm font-semibold">Descrição</label><textarea className={inp} rows={3} value={form.descricao} maxLength={400} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div><label className="text-sm font-semibold">Meta (R$)</label><input type="number" min={1} className={inp} value={form.meta} onChange={(e) => setForm({ ...form, meta: Number(e.target.value) })} /></div>
            <button className="w-full rounded-sm bg-primary py-3 text-sm font-mono text-xs uppercase tracking-widest font-semibold text-primary-foreground">{salvo ? "Salvo ✓" : "Salvar"}</button>
          </form>
          <button onClick={() => confirm("Restaurar os dados de exemplo?") && resetDados()} className="mt-3 text-xs text-muted-foreground underline">Restaurar dados de exemplo</button>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-xl font-bold">Compartilhe seu progresso</h2>
          <ShareCard nome={eu.nome} negocio={neg.nome} total={total} meta={neg.meta} />
        </Card>
      </div>
      <Progress pct={pct} className="hidden" />
      <CheckInModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
