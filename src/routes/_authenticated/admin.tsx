import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { sb, useStore, type Material } from "@/lib/store";
import { Card, SectionTitle } from "@/components/app/ui-bits";
import { TIPOS, tipoLabel } from "./materias";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel admin — Foco Mil Reais" },
      { name: "description", content: "Gerencie matérias e avisos da comunidade Foco Mil Reais." },
      { property: "og:title", content: "Painel admin — Foco Mil Reais" },
      { property: "og:description", content: "Gerencie matérias e avisos da comunidade Foco Mil Reais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const input = "w-full border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none";
const btn = "bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-50";
const vazio = { titulo: "", tipo: "curso", descricao: "", link: "", capa: "", publicado: true };

function Admin() {
  const { isAdmin, ready, materiais, live, membros, checkins, recarregar } = useStore();
  const [form, setForm] = useState(vazio);
  const [editId, setEditId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(live);
  useEffect(() => setAviso(live), [live]);

  if (!ready) return <p className="label-mono">Carregando…</p>;
  if (!isAdmin)
    return (
      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold">Acesso restrito</h2>
        <p className="mt-2 text-sm text-muted-foreground">Esta área é só para a administração.</p>
        <Link to="/" className="mt-4 inline-block underline">Voltar ao feed</Link>
      </Card>
    );

  async function salvarMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) { toast.error("Dê um título à matéria."); return; }
    setSalvando(true);
    const { error } = editId
      ? await sb.from("materials").update(form).eq("id", editId)
      : await sb.from("materials").insert(form);
    setSalvando(false);
    if (error) { toast.error("Não foi possível salvar."); return; }
    toast.success(editId ? "Matéria atualizada." : "Matéria publicada.");
    setForm(vazio); setEditId(null); recarregar();
  }
  function editar(m: Material) {
    setEditId(m.id);
    setForm({ titulo: m.titulo, tipo: m.tipo, descricao: m.descricao, link: m.link, capa: m.capa, publicado: m.publicado });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function alternar(m: Material) {
    await sb.from("materials").update({ publicado: !m.publicado }).eq("id", m.id); recarregar();
  }
  async function apagar(m: Material) {
    if (!confirm(`Apagar "${m.titulo}"?`)) return;
    await sb.from("materials").delete().eq("id", m.id); recarregar();
  }
  async function salvarAviso(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await sb.from("live_settings").upsert({ id: 1, ...aviso });
    if (error) { toast.error("Não foi possível salvar o aviso."); return; }
    toast.success("Aviso atualizado."); recarregar();
  }

  return (
    <div className="space-y-8">
      <SectionTitle title="Painel admin" meta={`${membros.length} participantes · ${checkins.length} check-ins · ${materiais.length} matérias`} />

      <Card className="p-5">
        <span className="label-mono">{editId ? "Editando matéria" : "Nova matéria"}</span>
        <form onSubmit={salvarMaterial} className="mt-3 grid gap-3">
          <input className={input} placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <select className={input} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
          <textarea className={input} rows={4} placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          <input className={input} placeholder="Link (YouTube, Drive, plataforma do curso…)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <input className={input} placeholder="Imagem de capa (endereço da imagem, opcional)" value={form.capa} onChange={(e) => setForm({ ...form, capa: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />
            Publicar agora (visível para todos)
          </label>
          <div className="flex gap-2">
            <button disabled={salvando} className={btn}>{editId ? "Salvar alterações" : "Publicar"}</button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(vazio); }} className="px-4 text-xs uppercase underline">Cancelar</button>}
          </div>
        </form>
      </Card>

      <div className="space-y-2">
        <span className="label-mono">Matérias cadastradas</span>
        {materiais.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ainda.</p>}
        {materiais.map((m) => (
          <Card key={m.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <span className="label-mono">{tipoLabel(m.tipo)}{m.publicado ? "" : " · rascunho"}</span>
              <p className="truncate font-semibold">{m.titulo}</p>
            </div>
            <button onClick={() => alternar(m)} title={m.publicado ? "Ocultar" : "Publicar"} className="p-2 text-muted-foreground hover:text-foreground">
              {m.publicado ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button onClick={() => editar(m)} title="Editar" className="p-2 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => apagar(m)} title="Apagar" className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <span className="label-mono">Aviso da próxima live</span>
        <form onSubmit={salvarAviso} className="mt-3 grid gap-3">
          <input className={input} placeholder="Título da live" value={aviso.titulo} onChange={(e) => setAviso({ ...aviso, titulo: e.target.value })} />
          <input className={input} placeholder="Quando (ex.: Sexta, 9/10 · 19h30)" value={aviso.quando} onChange={(e) => setAviso({ ...aviso, quando: e.target.value })} />
          <input className={input} placeholder="Link da live" value={aviso.link} onChange={(e) => setAviso({ ...aviso, link: e.target.value })} />
          <button className={`${btn} justify-self-start`}>Salvar aviso</button>
        </form>
      </Card>
    </div>
  );
}
