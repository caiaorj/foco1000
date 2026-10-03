import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useStore } from "@/lib/store";

const inp = "w-full border border-input bg-muted/60 p-2.5 text-sm outline-none focus:border-foreground";

export function CheckInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCheckIn } = useStore();
  const [f, setF] = useState({ valor: "", horas: "", texto: "", deuCerto: "", deuErrado: "" });
  const [foto, setFoto] = useState<string | undefined>();
  const [erro, setErro] = useState("");
  if (!open) return null;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return setErro("A imagem deve ter até 3 MB.");
    const r = new FileReader();
    r.onload = () => setFoto(r.result as string);
    r.readAsDataURL(file);
  };

  const pronto = f.texto.trim().length > 0;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number((f.valor || "0").replace(",", "."));
    const h = Number((f.horas || "0").replace(",", "."));
    if (!pronto) return setErro("Escreva o relato do dia.");
    if (isNaN(v) || v < 0 || isNaN(h) || h < 0 || h > 24) return setErro("Confira o valor e as horas.");
    addCheckIn({
      texto: f.texto.trim().slice(0, 1000), valor: Math.round(v * 100) / 100,
      ...(h ? { horas: h } : {}),
      ...(f.deuCerto.trim() ? { deuCerto: f.deuCerto.trim().slice(0, 300) } : {}),
      ...(f.deuErrado.trim() ? { deuErrado: f.deuErrado.trim().slice(0, 300) } : {}),
      ...(foto ? { foto } : {}),
    });
    setF({ valor: "", horas: "", texto: "", deuCerto: "", deuErrado: "" }); setFoto(undefined); setErro("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md overflow-y-auto bg-card p-5 text-foreground">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="label-mono">Check-in de execução</p>
            <h2 className="font-display text-2xl font-semibold">O que você fez hoje?</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label><span className="label-mono">Vendido hoje (R$)</span><input className={`${inp} mt-1.5 num`} inputMode="decimal" placeholder="0" value={f.valor} onChange={set("valor")} /></label>
          <label><span className="label-mono">Horas investidas</span><input className={`${inp} mt-1.5 num`} inputMode="decimal" placeholder="0" value={f.horas} onChange={set("horas")} /></label>
        </div>
        <label className="mt-5 block"><span className="label-mono">Relato do dia *</span>
          <textarea className={`${inp} mt-1.5`} rows={3} maxLength={1000} placeholder="O que você executou, vendeu, entregou..." value={f.texto} onChange={set("texto")} /></label>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <label><span className="label-mono">O que deu certo</span><textarea className={`${inp} mt-1.5`} rows={2} maxLength={300} value={f.deuCerto} onChange={set("deuCerto")} /></label>
          <label><span className="label-mono">O que deu errado</span><textarea className={`${inp} mt-1.5`} rows={2} maxLength={300} value={f.deuErrado} onChange={set("deuErrado")} /></label>
        </div>
        <p className="label-mono mt-5">Prova (foto / comprovante)</p>
        <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-muted">
          <ImagePlus className="h-4 w-4" /> {foto ? "Trocar imagem" : "Anexar imagem"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {foto && <img src={foto} alt="Prévia" className="mt-2 max-h-44 w-full object-cover" />}
        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
        <button disabled={!pronto} className="mt-5 w-full bg-primary py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-40">Registrar execução</button>
      </form>
    </div>
  );
}
