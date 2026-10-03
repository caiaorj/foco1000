import { createFileRoute } from "@tanstack/react-router";
import { brl, totalDe, useRanking, useStore } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import { AnnouncementBanner, CheckInPost, SectionTitle } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Feed — Foco Mil Reais" },
      { name: "description", content: "Relatos e check-ins diários dos participantes rumo aos primeiros R$ 1.000." },
      { property: "og:title", content: "Feed — Foco Mil Reais" },
      { property: "og:description", content: "Relatos e check-ins diários dos participantes rumo aos primeiros R$ 1.000." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { checkins, membros, meId } = useStore();
  const nomeCompleto = membros.find((m) => m.id === meId)?.nome ?? "";
  const primeiroNome = nomeCompleto.split(" ").filter(Boolean)[0] ?? "";
  const ranking = useRanking();
  const hoje = new Date().toDateString();
  const fezHoje = checkins.some((c) => c.membroId === meId && new Date(c.data).toDateString() === hoje);
  const campeoes = ranking.filter((r) => r.total >= r.negocio.meta && r.negocio.meta > 0);
  const meu = ranking.find((r) => r.membro.id === meId);
  const bati = !!meu && meu.total >= meu.negocio.meta;
  void totalDe;
  return (
    <div className="space-y-6">
      <div>
        <span className="label-mono block">OLÁ{primeiroNome ? "," : ""}</span>
        <span className="font-display text-2xl font-semibold leading-tight">{primeiroNome || "bem-vindo(a)"}</span>
      </div>
      {meId && !fezHoje && (
        <div className="border border-dashed border-accent bg-accent/10 p-4">
          <p className="label-mono !text-accent">Check-in de hoje pendente</p>
          <p className="mt-1 text-sm">Você ainda não mostrou o que fez hoje. Toque em <b>Novo check-in</b> para manter sua sequência.</p>
        </div>
      )}
      {bati && meu && (
        <div className="border-2 border-foreground bg-primary p-5 text-primary-foreground">
          <p className="label-mono !text-primary-foreground/80">Meta batida</p>
          <p className="font-display mt-1 text-2xl font-semibold">Você chegou aos {brl(meu.negocio.meta)}!</p>
          <p className="mt-1 text-sm opacity-90">Faturamento total: {brl(meu.total)}. Compartilhe essa conquista no seu diário.</p>
        </div>
      )}
      <AnnouncementBanner />
      {campeoes.length > 0 && (
        <div className="border border-border bg-card p-4">
          <p className="label-mono">Bateram a meta</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {campeoes.map((r) => (
              <Link key={r.membro.id} to="/perfil/$id" params={{ id: r.membro.id }} className="border border-foreground px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                ★ {r.membro.nome} · {brl(r.total)}
              </Link>
            ))}
          </div>
        </div>
      )}
      <SectionTitle title="Feed da comunidade" meta={`${checkins.length} check-ins`} />
      <div className="space-y-5">
        {[...checkins].sort((a, b) => b.data.localeCompare(a.data)).map((c) => <CheckInPost key={c.id} c={c} />)}
      </div>
    </div>
  );
}
