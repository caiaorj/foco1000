import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Os tipos gerados do banco são atualizados quando o SQL de setup é aplicado;
// até lá, usamos o cliente sem tipagem estrita nas tabelas.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as unknown as SupabaseClient<any>;

export const META_PADRAO = 1000;

export type Membro = { id: string; nome: string };
export type Negocio = { membroId: string; nome: string; descricao: string; nicho: string; meta: number };
export type Reacao = "palmas" | "bora" | "executou";
export type CheckIn = {
  id: string;
  membroId: string;
  data: string; // ISO
  texto: string;
  deuCerto?: string | undefined;
  deuErrado?: string | undefined;
  valor: number;
  horas?: number | undefined;
  foto?: string | undefined;
  reacoes: Record<Reacao, number>;
  minhas: Reacao[];
};
export type Live = { titulo: string; quando: string; link: string; meta?: number };
export type Material = { id: string; titulo: string; tipo: string; descricao: string; link: string; capa: string; publicado: boolean; data: string };

type DB = { membros: Membro[]; negocios: Negocio[]; checkins: CheckIn[]; favoritos: string[]; live: Live; materiais: Material[]; isAdmin: boolean };

const LIVE: Live = {
  titulo: "Precificação sem medo: como cobrar sem pedir desconto",
  quando: "Sexta-feira, 9 de outubro · 19h30 (horário de Brasília)",
  link: "#",
};

const VAZIO: DB = { membros: [], negocios: [], checkins: [], favoritos: [], live: LIVE, materiais: [], isAdmin: false };

type NovoCheckIn = { texto: string; valor: number; horas?: number; deuCerto?: string; deuErrado?: string; foto?: string; arquivo?: File | undefined };

type Store = DB & {
  ready: boolean;
  meId: string;
  addCheckIn: (c: NovoCheckIn) => void;
  toggleReacao: (id: string, r: Reacao) => void;
  toggleFavorito: (id: string) => void;
  updateNegocio: (n: Partial<Negocio>) => void;
  recarregar: () => void;
  removerCheckIn: (id: string) => Promise<void>;
  removerParticipante: (id: string) => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(VAZIO);
  const [meId, setMeId] = useState("");
  const [ready, setReady] = useState(false);

  const carregar = useCallback(async () => {
    // getSession lê do aparelho (rápido); getUser faria uma ida ao servidor.
    const { data: sess } = await supabase.auth.getSession();
    const userData = { user: sess.session?.user ?? null };
    const uid = userData.user?.id;
    if (!uid) { setDb(VAZIO); setMeId(""); setReady(true); return; }
    setMeId(uid);

    // Garante que o perfil existe (contas antigas podem não ter linha em profiles).
    const { data: meuPerfil } = await sb.from("profiles").select("id").eq("id", uid).maybeSingle();
    if (!meuPerfil) {
      const nome = (userData.user?.user_metadata?.["nome"] as string | undefined) || userData.user?.email?.split("@")[0] || "Participante";
      await sb.from("profiles").upsert({ id: uid, nome }, { onConflict: "id" });
    }

    const [perfis, negocios, checkins, reacoes, favoritos, live, materiais, papel] = await Promise.all([
      sb.from("profiles").select("id, nome"),
      sb.from("businesses").select("user_id, nome, descricao, nicho, meta"),
      sb.from("checkins").select("*").order("created_at", { ascending: false }),
      sb.from("reactions").select("checkin_id, user_id, tipo"),
      sb.from("favorites").select("checkin_id").eq("user_id", uid),
      sb.from("live_settings").select("titulo, quando, link, meta").eq("id", 1).maybeSingle(),
      sb.from("materials").select("*").order("created_at", { ascending: false }),
      sb.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
    ]);

    const caminhos = (checkins.data ?? []).map((c) => c.foto).filter((f): f is string => !!f && !/^(https?:|data:)/.test(f));
    const urls = new Map<string, string>();
    if (caminhos.length) {
      const { data: assinadas } = await sb.storage.from("checkins").createSignedUrls(caminhos, 60 * 60 * 24);
      for (const a of assinadas ?? []) if (a.path && a.signedUrl) urls.set(a.path, a.signedUrl);
    }

    const reacoesPorCheckin = new Map<string, { cont: Record<Reacao, number>; minhas: Reacao[] }>();
    for (const r of reacoes.data ?? []) {
      const tipo = r.tipo as Reacao;
      if (tipo !== "palmas" && tipo !== "bora" && tipo !== "executou") continue;
      const entry = reacoesPorCheckin.get(r.checkin_id) ?? { cont: { palmas: 0, bora: 0, executou: 0 }, minhas: [] };
      entry.cont[tipo]++;
      if (r.user_id === uid) entry.minhas.push(tipo);
      reacoesPorCheckin.set(r.checkin_id, entry);
    }

    setDb({
      membros: (perfis.data ?? []).map((p) => ({ id: p.id, nome: p.nome })),
      negocios: (negocios.data ?? []).map((n) => ({
        membroId: n.user_id, nome: n.nome, descricao: n.descricao, nicho: n.nicho, meta: Number(live.data?.meta) || META_PADRAO,
      })),
      checkins: (checkins.data ?? []).map((c) => {
        const r = reacoesPorCheckin.get(c.id);
        return {
          id: c.id, membroId: c.user_id, data: c.created_at, texto: c.texto,
          deuCerto: c.deu_certo ?? undefined, deuErrado: c.deu_errado ?? undefined,
          valor: Number(c.valor) || 0, horas: c.horas != null ? Number(c.horas) : undefined, foto: c.foto ? (urls.get(c.foto) ?? (/^(https?:|data:)/.test(c.foto) ? c.foto : undefined)) : undefined,
          reacoes: r?.cont ?? { palmas: 0, bora: 0, executou: 0 }, minhas: r?.minhas ?? [],
        };
      }),
      favoritos: (favoritos.data ?? []).map((f) => f.checkin_id),
      live: live.data ?? LIVE,
      materiais: (materiais.data ?? []).map((m) => ({
        id: m.id, titulo: m.titulo, tipo: m.tipo, descricao: m.descricao, link: m.link, capa: m.capa, publicado: m.publicado, data: m.created_at,
      })),
      isAdmin: !!papel.data,
    });
    setReady(true);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Recarrega só quando a conta muda de verdade. O Supabase dispara SIGNED_IN
  // também ao voltar para a aba / renovar a sessão — antes isso apagava tudo.
  const uidAtual = useRef<string>("");
  useEffect(() => { uidAtual.current = meId; }, [meId]);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { uidAtual.current = ""; setDb(VAZIO); setMeId(""); return; }
      const novo = session?.user?.id ?? "";
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && novo && novo !== uidAtual.current) {
        const trocou = uidAtual.current !== "";
        uidAtual.current = novo;
        if (trocou) setDb(VAZIO);
        setTimeout(() => { carregar(); }, 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [carregar]);

  const addCheckIn = useCallback((c: NovoCheckIn) => {
    if (!meId) return;
    const { arquivo, ...resto } = c;
    const tempId = `tmp-${Date.now()}`;
    const novo: CheckIn = {
      id: tempId, membroId: meId, data: new Date().toISOString(),
      reacoes: { palmas: 0, bora: 0, executou: 0 }, minhas: [], ...resto,
    };
    setDb((d) => ({ ...d, checkins: [novo, ...d.checkins] }));
    (async () => {
      let foto: string | null = null;
      if (arquivo) {
        const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const caminho = `${meId}/${Date.now()}.${ext}`;
        const { error: upErr } = await sb.storage.from("checkins").upload(caminho, arquivo, { contentType: arquivo.type });
        if (upErr) toast.error("A foto não foi enviada. O relato foi salvo sem ela.");
        else foto = caminho;
      }
      const { error } = await sb.from("checkins").insert({
        user_id: meId, texto: c.texto, valor: c.valor,
        horas: c.horas ?? null, deu_certo: c.deuCerto || null, deu_errado: c.deuErrado || null, foto,
      });
      if (error) toast.error("Não foi possível salvar o check-in.");
      carregar();
    })();
  }, [meId, carregar]);

  const removerCheckIn = useCallback(async (id: string) => {
    const { error } = await sb.from("checkins").delete().eq("id", id);
    if (error) toast.error("Não foi possível apagar.");
    else { setDb((d) => ({ ...d, checkins: d.checkins.filter((x) => x.id !== id) })); toast.success("Check-in apagado."); }
  }, []);

  const removerParticipante = useCallback(async (id: string) => {
    const { error } = await sb.rpc("admin_remover_participante", { _user_id: id });
    if (error) toast.error("Não foi possível remover o participante.");
    else { toast.success("Participante removido."); carregar(); }
  }, [carregar]);

  const toggleReacao = useCallback(async (id: string, r: Reacao) => {
    if (id.startsWith("tmp-")) return;
    const { data: u } = await supabase.auth.getSession();
    const uid = u.session?.user.id;
    if (!uid) { toast.error("Entre na sua conta para reagir."); return; }
    const tinha = db.checkins.find((c) => c.id === id)?.minhas.includes(r) ?? false;
    setDb((d) => ({
      ...d,
      checkins: d.checkins.map((c) => {
        if (c.id !== id) return c;
        return { ...c, minhas: tinha ? c.minhas.filter((x) => x !== r) : [...c.minhas, r], reacoes: { ...c.reacoes, [r]: Math.max(0, c.reacoes[r] + (tinha ? -1 : 1)) } };
      }),
    }));
    const { error } = tinha
      ? await sb.from("reactions").delete().eq("checkin_id", id).eq("user_id", uid).eq("tipo", r)
      : await sb.from("reactions").upsert({ checkin_id: id, user_id: uid, tipo: r }, { onConflict: "checkin_id,user_id,tipo", ignoreDuplicates: true });
    if (error) { console.error(error); toast.error("Não foi possível salvar a reação: " + error.message); carregar(); }
  }, [db.checkins, carregar]);

  const toggleFavorito = useCallback((id: string) => {
    if (!meId || id.startsWith("tmp-")) return;
    const tinha = db.favoritos.includes(id);
    setDb((d) => ({ ...d, favoritos: tinha ? d.favoritos.filter((x) => x !== id) : [...d.favoritos, id] }));
    const q = tinha
      ? sb.from("favorites").delete().eq("checkin_id", id).eq("user_id", meId)
      : sb.from("favorites").insert({ checkin_id: id, user_id: meId });
    q.then(({ error }) => { if (error) { console.error(error); carregar(); } });
  }, [meId, db.favoritos, carregar]);

  const updateNegocio = useCallback((n: Partial<Negocio>) => {
    if (!meId) return;
    setDb((d) => ({ ...d, negocios: d.negocios.map((x) => x.membroId === meId ? { ...x, ...n } : x) }));
    sb.from("businesses").upsert({
      user_id: meId,
      ...(n.nome !== undefined && { nome: n.nome }),
      ...(n.descricao !== undefined && { descricao: n.descricao }),
      ...(n.nicho !== undefined && { nicho: n.nicho }),
    }, { onConflict: "user_id" }).then(({ error }) => { if (error) { console.error(error); toast.error("Não foi possível salvar: " + error.message); carregar(); } else toast.success("Negócio salvo"); });
  }, [meId, carregar]);

  const value = useMemo(
    () => ({ ...db, ready, meId, addCheckIn, toggleReacao, toggleFavorito, updateNegocio, recarregar: carregar, removerCheckIn, removerParticipante }),
    [db, ready, meId, addCheckIn, toggleReacao, toggleFavorito, updateNegocio, carregar, removerCheckIn, removerParticipante],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { sb };

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore fora do StoreProvider");
  return s;
}

export function totalDe(checkins: CheckIn[], membroId: string) {
  return checkins.filter((c) => c.membroId === membroId).reduce((a, c) => a + c.valor, 0);
}

const dia = (iso: string) => new Date(iso).toLocaleDateString("en-CA");

/** Dias seguidos com check-in terminando hoje ou ontem. */
export function sequenciaAtual(checkins: CheckIn[]) {
  const dias = new Set(checkins.map((c) => dia(c.data)));
  let n = 0;
  const t = new Date();
  if (!dias.has(dia(t.toISOString()))) t.setDate(t.getDate() - 1);
  while (dias.has(dia(t.toISOString()))) { n++; t.setDate(t.getDate() - 1); }
  return n;
}

export type Linha = { membro: Membro; negocio: Negocio; total: number; relatos: number; diasAtivos: number; sequencia: number; pct: number };

export function useParticipantes(): Linha[] {
  const { membros, negocios, checkins, live } = useStore();
  return useMemo(() => membros.map((m) => {
    const negocio = negocios.find((n) => n.membroId === m.id) ?? { membroId: m.id, nome: "Meu projeto", descricao: "", nicho: "A definir", meta: Number(live.meta) || META_PADRAO };
    const meus = checkins.filter((c) => c.membroId === m.id);
    const total = meus.reduce((a, c) => a + c.valor, 0);
    return {
      membro: m, negocio, total, relatos: meus.length,
      diasAtivos: new Set(meus.map((c) => dia(c.data))).size,
      sequencia: sequenciaAtual(meus),
      pct: Math.min(100, (total / (negocio.meta || META_PADRAO)) * 100),
    };
  }), [membros, negocios, checkins, live]);
}

export function useRanking() {
  const lista = useParticipantes();
  return useMemo(() => [...lista].sort((a, b) => b.sequencia - a.sequencia || b.total - a.total), [lista]);
}

export const brl = (v: number) => "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
export const iniciais = (nome: string) => nome === "Você" ? "VC" : nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
export function quando(iso: string) {
  const d = new Date(iso), hoje = new Date();
  const diff = Math.round((new Date(hoje.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5);
  if (diff === 0) return "hoje";
  if (diff === 1) return "ontem";
  if (diff < 7) return `há ${diff} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
