import { createFileRoute, Link } from "@tanstack/react-router";
import { brl, useRanking, useStore } from "@/lib/store";
import { Avatar, Card, CheckInPost, Progress, SectionTitle } from "@/components/app/ui-bits";
import { ShareCard } from "@/components/app/ShareCard";

export const Route = createFileRoute("/_authenticated/perfil/$id")({
  head: () => ({
    meta: [
      { title: "Diário de bordo — Foco Mil Reais" },
      { name: "description", content: "Histórico de check-ins e progresso do participante rumo aos R$ 1.000." },
      { property: "og:title", content: "Diário de bordo — Foco Mil Reais" },
      { property: "og:description", content: "Histórico de check-ins e progresso do participante rumo aos R$ 1.000." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { id } = Route.useParams();
  const { checkins } = useStore();
  const ranking = useRanking();
  const pos = ranking.findIndex((r) => r.membro.id === id);
  const r = ranking[pos];
  if (!r) return <div className="py-20 text-center"><p>Participante não encontrado.</p><Link to="/participantes" className="text-accent underline">Ver participantes</Link></div>;
  const hist = checkins.filter((c) => c.membroId === id).sort((a, b) => b.data.localeCompare(a.data));
  const stats = [["Posição", `#${pos + 1}`], ["Sequência", `${r.sequencia}d`], ["Dias ativos", r.diasAtivos], ["Relatos", r.relatos]] as const;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4 border-b border-border p-5">
          <Avatar nome={r.membro.nome} />
          <div>
            <p className="label-mono">Diário de bordo</p>
            <h1 className="font-display text-2xl font-semibold">{r.negocio.nome}</h1>
            <p className="text-sm text-muted-foreground">{r.membro.nome} · {r.negocio.nicho}</p>
          </div>
        </div>
        {r.negocio.descricao && <p className="border-b border-border p-5 text-sm">{r.negocio.descricao}</p>}
        <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="border-b border-r border-border p-4 even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0">
              <p className="label-mono !text-[10px]">{k}</p>
              <p className="num mt-1 text-lg font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="flex justify-between font-mono text-xs"><span className="text-accent">{brl(r.total)}</span><span className="text-muted-foreground">meta {brl(r.negocio.meta)}</span></div>
          <Progress pct={r.pct} className="mt-2 !h-1.5" />
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <SectionTitle title="Relatos" meta={`${hist.length} check-ins`} />
          {hist.length ? hist.map((c) => <CheckInPost key={c.id} c={c} />) : <p className="text-sm text-muted-foreground">Nenhum relato ainda.</p>}
        </div>
        <div><ShareCard nome={r.membro.nome} negocio={r.negocio.nome} total={r.total} meta={r.negocio.meta} /></div>
      </div>
    </div>
  );
}
