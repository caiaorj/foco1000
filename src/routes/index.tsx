import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { AnnouncementBanner, CheckInPost } from "@/components/app/ui-bits";
import { CheckInModal } from "@/components/app/CheckInModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feed da comunidade — Foco Mil Reais" },
      { name: "description", content: "Check-ins diários dos membros rumo aos primeiros R$ 1.000 faturados." },
      { property: "og:title", content: "Feed da comunidade — Foco Mil Reais" },
      { property: "og:description", content: "Check-ins diários dos membros rumo aos primeiros R$ 1.000 faturados." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { checkins } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <AnnouncementBanner />
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display tabular text-3xl ">Feed da comunidade</h1>
          <p className="text-sm text-muted-foreground">Cada check-in é um passo rumo aos R$ 1.000.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Check-in
        </button>
      </div>
      <div className="space-y-4">
        {[...checkins].sort((a, b) => b.data.localeCompare(a.data)).map((c) => <CheckInPost key={c.id} c={c} />)}
      </div>
      <CheckInModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
