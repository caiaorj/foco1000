import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Foco Mil Reais" },
      { name: "description", content: "Entre ou crie sua conta para participar do desafio Foco Mil Reais." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/" });
        } else {
          setAviso("Conta criada! Confira seu e-mail para confirmar o cadastro e depois entre.");
          setModo("entrar");
        }
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Algo deu errado. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-card p-8">
        <span className="label-mono block">Desafio em execução</span>
        <h1 className="font-display mt-1 text-3xl font-semibold">
          Foco <span className="text-accent">Mil Reais</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accountability diário até os primeiros R$ 1.000 faturados.
        </p>

        <div className="mt-6 grid grid-cols-2 border border-border font-mono text-xs uppercase tracking-wider">
          {(["entrar", "cadastrar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setModo(m); setErro(null); setAviso(null); }}
              className={`py-2.5 ${modo === m ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m === "entrar" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          {modo === "cadastrar" && (
            <div>
              <label className="label-mono mb-1.5 block" htmlFor="nome">Seu nome</label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Como você aparece na comunidade"
                className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
          )}
          <div>
            <label className="label-mono mb-1.5 block" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="voce@email.com"
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="label-mono mb-1.5 block" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo de 6 caracteres"
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          {erro && <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>}
          {aviso && <p className="border border-accent/40 bg-accent/10 px-3 py-2 text-sm">{aviso}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
