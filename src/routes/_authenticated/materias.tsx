import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, EmptyState, SectionTitle } from "@/components/app/ui-bits";

export const TIPOS = [
  { v: "curso", l: "Curso" },
  { v: "video", l: "Vídeo" },
  { v: "artigo", l: "Artigo" },
  { v: "material", l: "Material" },
  { v: "link", l: "Link" },
] as const;
export const tipoLabel = (t: string) => TIPOS.find((x) => x.v === t)?.l ?? t;

export const Route = createFileRoute("/_authenticated/materias")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Matérias — Foco Mil Reais" },
      { name: "description", content: "Cursos, vídeos e materiais publicados para a comunidade Foco Mil Reais." },
      { property: "og:title", content: "Matérias — Foco Mil Reais" },
      { property: "og:description", content: "Cursos, vídeos e materiais publicados para a comunidade Foco Mil Reais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Materias,
});

function Materias() {
  const { materiais } = useStore();
  const [filtro, setFiltro] = useState("todos");
  const lista = materiais.filter((m) => m.publicado && (filtro === "todos" || m.tipo === filtro));
  return (
    <div className="space-y-6">
      <SectionTitle title="Matérias" meta={`${lista.length} publicadas`} />
      <div className="flex flex-wrap gap-1">
        {[{ v: "todos", l: "Todos" }, ...TIPOS].map((t) => (
          <button key={t.v} onClick={() => setFiltro(t.v)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${filtro === t.v ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
            {t.l}
          </button>
        ))}
      </div>
      {lista.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {lista.map((m) => (
            <Card key={m.id} className="flex flex-col overflow-hidden">
              {m.capa && <img src={m.capa} alt="" className="aspect-video w-full object-cover" />}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="label-mono text-accent">{tipoLabel(m.tipo)}</span>
                <h3 className="font-display text-lg font-semibold leading-snug">{m.titulo}</h3>
                {m.descricao && <p className="whitespace-pre-line text-sm text-muted-foreground">{m.descricao}</p>}
                {m.link && (
                  <a href={m.link} target="_blank" rel="noreferrer"
                    className="mt-auto inline-flex items-center gap-2 self-start bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:opacity-90">
                    Acessar <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={<BookOpen className="h-5 w-5" />} title="Nenhuma matéria por aqui ainda"
          text="Quando a organização publicar cursos, vídeos ou materiais, eles aparecem nesta tela." />
      )}
    </div>
  );
}
