import { useRef } from "react";
import { Download } from "lucide-react";
import { brl } from "@/lib/store";

type Props = { nome: string; negocio: string; total: number; meta: number };

export function ShareCard({ nome, negocio, total, meta }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = Math.min(100, (total / meta) * 100);

  const baixar = () => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor, fg = cs.color;
    const accent = getComputedStyle(el.querySelector("[data-accent]")!).backgroundColor;
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1080;
    const x = c.getContext("2d")!;
    x.fillStyle = bg; x.fillRect(0, 0, 1080, 1080);
    x.fillStyle = fg;
    x.font = "bold 44px sans-serif"; x.fillText("FOCO MIL REAIS", 90, 150);
    x.font = "40px sans-serif"; x.fillText(`${nome} · ${negocio}`, 90, 380);
    x.font = "bold 150px sans-serif"; x.fillText(brl(total), 90, 560);
    x.font = "40px sans-serif"; x.fillText(`de ${brl(meta)} — ${pct.toFixed(0)}% da meta`, 90, 640);
    x.globalAlpha = 0.25; x.fillRect(90, 720, 900, 40); x.globalAlpha = 1;
    x.fillStyle = accent; x.fillRect(90, 720, 900 * pct / 100, 40);
    x.fillStyle = fg; x.font = "36px sans-serif"; x.fillText("Rumo aos primeiros R$ 1.000 🚀", 90, 950);
    const a = document.createElement("a");
    a.download = "meu-progresso.png"; a.href = c.toDataURL("image/png"); a.click();
  };

  return (
    <div>
      <div ref={ref} className="aspect-square w-full rounded-3xl bg-foreground p-8 text-background flex flex-col justify-between">
        <p className="font-display text-sm font-bold tracking-[0.2em]">FOCO MIL REAIS</p>
        <div>
          <p className="text-sm opacity-80">{nome} · {negocio}</p>
          <p className="font-display text-5xl font-extrabold">{brl(total)}</p>
          <p className="mt-1 text-sm opacity-80">de {brl(meta)} — {pct.toFixed(0)}% da meta</p>
          <div className="mt-4 h-3 w-full rounded-full bg-background/25">
            <div data-accent className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="text-sm opacity-80">Rumo aos primeiros R$ 1.000 🚀</p>
      </div>
      <button onClick={baixar} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-muted">
        <Download className="h-4 w-4" /> Baixar imagem para compartilhar
      </button>
    </div>
  );
}
