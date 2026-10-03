import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Nova senha — Foco Mil Reais" },
      { name: "description", content: "Crie uma nova senha para sua conta do Foco Mil Reais." },
      { property: "og:title", content: "Nova senha — Foco Mil Reais" },
      { property: "og:description", content: "Crie uma nova senha para sua conta do Foco Mil Reais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

const inp = "w-full border border-border bg-background px-3 py-2.5 pr-11 text-sm outline-none focus:border-accent";

function ResetPassword() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha !== confirmar) return setErro("As senhas não coincidem.");
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) return setErro("Não foi possível trocar a senha. Abra o link do e-mail de novo.");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={salvar} className="w-full max-w-sm space-y-4 border border-border bg-card p-8">
        <span className="label-mono block">Recuperar acesso</span>
        <h1 className="font-display text-3xl font-semibold">Crie uma nova senha</h1>
        {[["Nova senha", senha, setSenha], ["Confirmar senha", confirmar, setConfirmar]].map(([l, v, set]) => (
          <div key={l as string}>
            <label className="label-mono mb-1.5 block">{l as string}</label>
            <div className="relative">
              <input type={ver ? "text" : "password"} required minLength={6} value={v as string}
                onChange={(e) => (set as (s: string) => void)(e.target.value)} className={inp} />
              <button type="button" onClick={() => setVer((x) => !x)} aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground">
                {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
        {erro && <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>}
        <button disabled={carregando} className="w-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50">
          {carregando ? "Aguarde…" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
