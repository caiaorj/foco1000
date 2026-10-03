import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Flame, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/desafio")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Como ganhar 1000 reais: o desafio Foco Mil Reais" },
      {
        name: "description",
        content:
          "O Foco Mil Reais é um desafio de execução em comunidade, 100% gratuito e com apenas 30 vagas: mostre todo dia o que você fez até faturar seus primeiros R$ 1.000.",
      },
      { property: "og:title", content: "Como ganhar 1000 reais: o desafio Foco Mil Reais" },
      {
        property: "og:description",
        content:
          "Um desafio de execução em comunidade: check-in diário com o que deu certo, o que deu errado e quanto você faturou — até chegar aos primeiros R$ 1.000.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://foco1000.lovable.app/desafio" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://foco1000.lovable.app/desafio" }],
  }),
  component: DesafioPage,
});

const REGRAS = [
  {
    icon: Target,
    titulo: "Uma meta só: R$ 1.000",
    texto:
      "Nada de metas vagas. O desafio tem um único objetivo: faturar os primeiros R$ 1.000 com o seu negócio. Todo mundo corre pela mesma meta.",
  },
  {
    icon: Flame,
    titulo: "Check-in todos os dias",
    texto:
      "Cada dia você registra o que fez: o que deu certo, o que deu errado, quantas horas dedicou e quanto faturou. Sem check-in, a sequência quebra.",
  },
  {
    icon: Users,
    titulo: "Prestação de contas em comunidade",
    texto:
      "Seu progresso fica visível para os outros participantes — e o deles para você. Quem executa aparece no ranking. Quem some, sente a pressão.",
  },
  {
    icon: CheckCircle2,
    titulo: "Prova, não promessa",
    texto:
      "No check-in você anexa a prova do que fez: print de venda, peça publicada, cliente atendido. Aqui vale o que foi executado, não o que foi planejado.",
  },
];

const PASSOS = [
  "Crie sua conta e cadastre o seu negócio",
  "Faça o primeiro check-in contando onde você está",
  "Registre todo dia o que executou e quanto faturou",
  "Acompanhe o ranking e mantenha a sequência",
  "Bata os R$ 1.000 e entre para a lista de quem venceu o desafio",
];

function DesafioPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-10 sm:pt-14">
      <p className="label-mono text-center">Desafio em execução</p>
      <h1 className="mt-2 text-center font-serif text-4xl leading-tight sm:text-5xl">
        Como ganhar 1000 reais com o seu negócio
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
        O <strong>Foco Mil Reais</strong> é um desafio de execução em comunidade. Em vez de mais um
        curso que você nunca termina, aqui você mostra todo dia o que fez — até faturar os seus
        primeiros R$ 1.000.
      </p>
      <p className="label-mono mt-4 text-center text-[11px] text-muted-foreground">
        Apenas 30 vagas · 100% gratuito · Todo mundo aprende junto
      </p>

      <div className="mt-8 flex justify-center">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Quero participar <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">As regras do desafio</h2>
        <div className="mt-5 space-y-4">
          {REGRAS.map((regra) => (
            <article key={regra.titulo} className="border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <regra.icon className="h-5 w-5 shrink-0" />
                <h3 className="font-serif text-lg">{regra.titulo}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{regra.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">Como funciona</h2>
        <ol className="mt-5 space-y-3">
          {PASSOS.map((passo, i) => (
            <li key={passo} className="flex items-start gap-3 border border-border bg-card p-4">
              <span className="num shrink-0 font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm leading-relaxed">{passo}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 border border-foreground bg-card p-6 text-center">
        <h2 className="font-serif text-2xl">Pronto para prestar contas?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          São <strong className="text-foreground">apenas 30 vagas</strong> e a participação é{" "}
          <strong className="text-foreground">100% gratuita</strong> — todo mundo aprende junto. Entre,
          cadastre seu negócio e faça o primeiro check-in hoje.
        </p>
        <Link
          to="/auth"
          className="mt-5 inline-flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Criar minha conta <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
