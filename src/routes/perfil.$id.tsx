import { createFileRoute, Link } from "@tanstack/react-router";
import { brl, useRanking, useStore } from "@/lib/store";
import { Card, CheckInPost, Progress } from "@/components/app/ui-bits";
import { ShareCard } from "@/components/app/ShareCard";

export const Route = createFileRoute("/perfil/$id")({
  head: () => ({
    meta: [
      { title: "Perfil do participante — Foco Mil Reais" },
      { name: "description", content: "Histórico de check-ins e progresso do participante rumo aos R$ 1.000." },
      { property: "og:title", content: "Perfil do participante — Foco Mil Reais" },
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
  if (!r) return <div className="py-20 text-center"><p>Participante não encontrado.</p><Link to="/ranking" className="text-accent underline">Ver ranking</Link></div>;
  const hist = checkins.filter((c) => c.membroId === id).sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img src={r.membro.avatar} alt="" className="h-20 w-20 rounded-full bg-muted" />
        <div className="flex-1">
          <h1 className="font-display text-3xl ">{r.membro.nome}</h1>
          <p className="text-sm text-muted-foreground">{r.membro.bio}</p>
          <p className="mt-1 text-sm"><b>{r.negocio.nome}</b> · {r.negocio.nicho}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Posição</p>
          <p className="num text-3xl font-semibold  text-accent">#{pos + 1}</p>
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <div className="flex justify-between text-sm"><span>{brl(r.total)}</span><span className="text-muted-foreground">meta {brl(r.negocio.meta)}</span></div>
            <Progress pct={r.pct} className="mt-2" />
          </Card>
          <h2 className="font-display text-xl font-bold">Histórico ({hist.length})</h2>
          {hist.length ? hist.map((c) => <CheckInPost key={c.id} c={c} />) : <p className="text-sm text-muted-foreground">Nenhum check-in ainda.</p>}
        </div>
        <div><ShareCard nome={r.membro.nome} negocio={r.negocio.nome} total={r.total} meta={r.negocio.meta} /></div>
      </div>
    </div>
  );
}
