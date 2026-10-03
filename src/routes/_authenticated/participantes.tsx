import { createFileRoute, Link } from "@tanstack/react-router";
import { brl, useParticipantes, useStore } from "@/lib/store";
import { AnnouncementBanner, Avatar, Progress, SectionTitle } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/participantes")({
  head: () => ({
    meta: [
      { title: "Participantes — Foco Mil Reais" },
      { name: "description", content: "Participantes do desafio e o negócio de cada um." },
      { property: "og:title", content: "Participantes — Foco Mil Reais" },
      { property: "og:description", content: "Participantes do desafio e o negócio de cada um." },
    ],
  }),
  component: Participantes,
});

function Participantes() {
  const lista = useParticipantes();
  const { meId } = useStore();
  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <SectionTitle title="Participantes & negócios" meta={`${lista.length} projetos ativos`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {lista.map((r) => (
          <Link key={r.membro.id} to={r.membro.id === meId ? "/negocio" : "/perfil/$id"} params={{ id: r.membro.id }}
            className="group border border-border bg-card p-4 hover:border-foreground">
            <div className="flex items-center gap-3">
              <Avatar nome={r.membro.nome} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.negocio.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{r.membro.nome} · {r.negocio.nicho}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between font-mono text-xs">
              <span className="text-accent">{brl(r.total)}</span>
              <span className="text-muted-foreground">{r.sequencia}d seguidos · {r.relatos} relatos</span>
            </div>
            <Progress pct={r.pct} className="mt-1.5" />
            <p className="label-mono mt-4 !text-[10px] group-hover:!text-foreground">Ler diário de bordo →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
