import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useStore } from "@/lib/store";
import { AnnouncementBanner, CheckInPost, EmptyState, SectionTitle } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — Foco Mil Reais" },
      { name: "description", content: "Relatos da comunidade que você salvou para consultar depois." },
      { property: "og:title", content: "Favoritos — Foco Mil Reais" },
      { property: "og:description", content: "Relatos da comunidade que você salvou para consultar depois." },
    ],
  }),
  component: Favoritos,
});

function Favoritos() {
  const { checkins, favoritos } = useStore();
  const lista = checkins.filter((c) => favoritos.includes(c.id));
  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <SectionTitle title="Relatos favoritos" meta={`${lista.length} salvos`} />
      {lista.length ? (
        <div className="space-y-4">{lista.map((c) => <CheckInPost key={c.id} c={c} />)}</div>
      ) : (
        <EmptyState icon={<Bookmark className="h-5 w-5" />} title="Nenhum relato favoritado ainda"
          text="Toque no marcador de qualquer relato no feed para guardá-lo aqui e acessar rápido depois." />
      )}
    </div>
  );
}
