import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AnnouncementBanner, CheckInPost, SectionTitle } from "@/components/app/ui-bits";

export const Route = createFileRoute("/")({
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
  const { checkins } = useStore();
  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <SectionTitle title="Relatos da turma" meta={`${checkins.length} check-ins`} />
      <div className="space-y-4">
        {[...checkins].sort((a, b) => b.data.localeCompare(a.data)).map((c) => <CheckInPost key={c.id} c={c} />)}
      </div>
    </div>
  );
}
