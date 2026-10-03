import { createFileRoute, Link } from "@tanstack/react-router";
import { brl, useRanking, useStore } from "@/lib/store";
import { AnnouncementBanner, Avatar, Card, Progress } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — Foco Mil Reais" },
      { name: "description", content: "Ranking de execução: consistência primeiro, faturamento depois." },
      { property: "og:title", content: "Ranking — Foco Mil Reais" },
      { property: "og:description", content: "Ranking de execução: consistência primeiro, faturamento depois." },
    ],
  }),
  component: Ranking,
});

function Ranking() {
  const ranking = useRanking();
  const { meId } = useStore();
  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <Card>
        <div className="border-b border-border p-5">
          <p className="label-mono">Ranking de execução</p>
          <h1 className="font-display text-xl font-semibold">Consistência primeiro, faturamento depois</h1>
        </div>
        <ol>
          {ranking.map((r, i) => (
            <li key={r.membro.id} className="border-b border-border last:border-0">
              <Link to="/perfil/$id" params={{ id: r.membro.id }} className={`flex items-center gap-4 px-5 py-3 hover:bg-muted/60 ${r.membro.id === meId ? "bg-muted/50" : ""}`}>
                <span className="num w-6 text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <Avatar nome={r.membro.nome} tone="light" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.membro.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.negocio.nome}</p>
                </div>
                <div className="hidden w-24 text-right sm:block">
                  <p className="label-mono !text-[10px] whitespace-nowrap">Sequência</p>
                  <p className="num text-sm font-semibold">{r.sequencia}d</p>
                </div>
                <div className="hidden w-24 text-right sm:block">
                  <p className="label-mono !text-[10px] whitespace-nowrap">Dias ativos</p>
                  <p className="num text-sm">{r.diasAtivos}</p>
                </div>
                <div className="w-24 text-right">
                  <p className="label-mono !text-[10px] whitespace-nowrap">Acumulado</p>
                  <p className="num text-sm font-semibold text-accent">{brl(r.total)}</p>
                  <Progress pct={r.pct} className="mt-1" />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
