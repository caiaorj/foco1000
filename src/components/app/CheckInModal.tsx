import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useStore } from "@/lib/store";

export function CheckInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCheckIn } = useStore();
  const [texto, setTexto] = useState("");
  const [valor, setValor] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const [erro, setErro] = useState("");
  if (!open) return null;

  const onFile = (f?: File) => {
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return setErro("A foto deve ter até 3 MB.");
    const r = new FileReader();
    r.onload = () => setFoto(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(valor.replace(",", "."));
    if (!texto.trim()) return setErro("Conte o que você fez hoje.");
    if (isNaN(v) || v < 0) return setErro("Informe um valor válido (pode ser 0).");
    addCheckIn({ texto: texto.trim().slice(0, 1000), valor: Math.round(v * 100) / 100, foto });
    setTexto(""); setValor(""); setFoto(undefined); setErro("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-4 sm:items-center" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-sm bg-card p-6 shadow-[var(--shadow-card)] border-2 border-border">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display tabular text-2xl font-bold">Check-in do dia</h2>
          <button type="button" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <label className="text-sm font-semibold">O que você fez hoje?</label>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} maxLength={1000}
          className="mt-1 w-full rounded-sm border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Ex.: Fiz 10 ofertas e fechei 2 vendas..." />
        <label className="mt-4 block text-sm font-semibold">Valor faturado hoje (R$)</label>
        <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="0,00"
          className="mt-1 w-full rounded-sm border border-input bg-background p-3 font-display tabular text-lg outline-none focus:ring-2 focus:ring-ring" />
        <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-input p-3 text-sm text-muted-foreground hover:bg-muted">
          <ImagePlus className="h-5 w-5" /> {foto ? "Trocar foto" : "Adicionar foto (opcional)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {foto && <img src={foto} alt="Prévia" className="mt-3 max-h-48 w-full rounded-sm object-cover" />}
        {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
        <button className="mt-5 w-full rounded-sm bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90">Publicar check-in</button>
      </form>
    </div>
  );
}
