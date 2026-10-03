import { createFileRoute, Link } from "@tanstack/react-router";
import { brl, CURRENT_USER_ID, useRanking } from "@/lib/store";
import { Card, Progress } from "@/components/app/ui-bits";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — Foco Mil Reais" },
      { name: "description", content: "Quem está mais perto dos primeiros R$ 1.000 na comunidade." },
      { property: "og:title", content: "Ranking — Foco Mil Reais" },
      { property: "og:description", content: "Quem está mais perto dos primeiros R$ 1.000 na comunidade." },
    ],
  }),
  component: Ranking,
});

function Ranking() {
  const ranking = useRanking();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold ">Ranking</h1>
      <div className="space-y-3">
        {ranking.map((r, i) => (
          <Link key={r.membro.id} to="/perfil/$id" params={{ id: r.membro.id }} className="block">
            <Card className={`flex items-center gap-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5 ${r.membro.id === CURRENT_USER_ID ? "ring-2 ring-accent" : ""}`}>
              <span className={`w-8 text-center font-display text-2xl  ${i < 3 ? "text-accent" : "text-muted-foreground"}`}>{i + 1}</span>
              <img src={r.membro.avatar} alt="" className="h-11 w-11  bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-semibold">{r.membro.nome} <span className="text-xs font-normal text-muted-foreground">· {r.negocio.nome}</span></p>
                  <p className="num font-semibold">{brl(r.total)}</p>
                </div>
                <Progress pct={r.pct} className="mt-2 h-2" />
                <p className="mt-1 text-xs text-muted-foreground">{r.pct.toFixed(0)}% da meta · {r.qtd} check-ins {r.pct >= 100 && "· Meta batida"}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
