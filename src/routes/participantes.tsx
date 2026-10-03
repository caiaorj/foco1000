import { createFileRoute, Link } from "@tanstack/react-router";
import { brl, useRanking } from "@/lib/store";
import { Progress, SectionTitle } from "@/components/app/ui-bits";

export const Route = createFileRoute("/participantes")({
  head: () => ({
    meta: [
      { title: "Participantes — Foco Mil Reais" },
      { name: "description", content: "Conheça quem está no desafio e o negócio de cada participante." },
      { property: "og:title", content: "Participantes — Foco Mil Reais" },
      { property: "og:description", content: "Conheça quem está no desafio e o negócio de cada participante." },
    ],
  }),
  component: Participantes,
});

function Participantes() {
  const lista = [...useRanking()].sort((a, b) => a.membro.nome.localeCompare(b.membro.nome));
  return (
    <div className="space-y-6">
      <SectionTitle title="Participantes" meta={`${lista.length} na turma`} />
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
        {lista.map((r) => (
          <Link key={r.membro.id} to="/perfil/$id" params={{ id: r.membro.id }} className="bg-card p-4 hover:bg-muted">
            <div className="flex items-center gap-3">
              <img src={r.membro.avatar} alt="" className="h-10 w-10 border border-border bg-muted" />
              <div className="min-w-0">
                <p className="font-semibold">{r.membro.nome}</p>
                <p className="label-mono truncate">{r.negocio.nome} · {r.negocio.nicho}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{r.negocio.descricao}</p>
            <div className="mt-3 flex justify-between num text-xs"><span className="text-accent">{brl(r.total)}</span><span className="text-muted-foreground">{r.pct.toFixed(0)}%</span></div>
            <Progress pct={r.pct} className="mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
