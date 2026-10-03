import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

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
export type Live = { titulo: string; quando: string; link: string };

type DB = { membros: Membro[]; negocios: Negocio[]; checkins: CheckIn[]; favoritos: string[]; live: Live };

const LIVE: Live = {
  titulo: "Precificação sem medo: como cobrar sem pedir desconto",
  quando: "Sexta-feira, 9 de outubro · 19h30 (horário de Brasília)",
  link: "#",
};

const VAZIO: DB = { membros: [], negocios: [], checkins: [], favoritos: [], live: LIVE };

type NovoCheckIn = { texto: string; valor: number; horas?: number; deuCerto?: string; deuErrado?: string; foto?: string };

type Store = DB & {
  ready: boolean;
  meId: string;
  addCheckIn: (c: NovoCheckIn) => void;
  toggleReacao: (id: string, r: Reacao) => void;
  toggleFavorito: (id: string) => void;
  updateNegocio: (n: Partial<Negocio>) => void;
  recarregar: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(VAZIO);
  const [meId, setMeId] = useState("");
  const [ready, setReady] = useState(false);

  const carregar = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { setDb(VAZIO); setMeId(""); setReady(true); return; }
    setMeId(uid);

    const [perfis, negocios, checkins, reacoes, favoritos] = await Promise.all([
      sb.from("profiles").select("id, nome"),
      sb.from("businesses").select("user_id, nome, descricao, nicho, meta"),
      sb.from("checkins").select("*").order("created_at", { ascending: false }),
      sb.from("reactions").select("checkin_id, user_id, tipo"),
      sb.from("favorites").select("checkin_id").eq("user_id", uid),
    ]);

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
        membroId: n.user_id, nome: n.nome, descricao: n.descricao, nicho: n.nicho, meta: Number(n.meta) || META_PADRAO,
      })),
      checkins: (checkins.data ?? []).map((c) => {
        const r = reacoesPorCheckin.get(c.id);
        return {
          id: c.id, membroId: c.user_id, data: c.created_at, texto: c.texto,
          deuCerto: c.deu_certo ?? undefined, deuErrado: c.deu_errado ?? undefined,
          valor: Number(c.valor) || 0, horas: c.horas != null ? Number(c.horas) : undefined, foto: c.foto ?? undefined,
          reacoes: r?.cont ?? { palmas: 0, bora: 0, executou: 0 }, minhas: r?.minhas ?? [],
        };
      }),
      favoritos: (favoritos.data ?? []).map((f) => f.checkin_id),
      live: LIVE,
    });
    setReady(true);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Recarrega os dados quando o usuário entra na conta (sem recarregar a página).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") carregar();
    });
    return () => subscription.unsubscribe();
  }, [carregar]);

  const addCheckIn = useCallback((c: NovoCheckIn) => {
    if (!meId) return;
    const tempId = `tmp-${Date.now()}`;
    const novo: CheckIn = {
      id: tempId, membroId: meId, data: new Date().toISOString(),
      reacoes: { palmas: 0, bora: 0, executou: 0 }, minhas: [], ...c,
    };
    setDb((d) => ({ ...d, checkins: [novo, ...d.checkins] }));
    sb.from("checkins").insert({
      user_id: meId, texto: c.texto, valor: c.valor,
      horas: c.horas ?? null, deu_certo: c.deuCerto || null, deu_errado: c.deuErrado || null, foto: c.foto || null,
    }).then(({ error }) => { if (error) console.error(error); carregar(); });
  }, [meId, carregar]);

  const toggleReacao = useCallback((id: string, r: Reacao) => {
    if (!meId || id.startsWith("tmp-")) return;
    setDb((d) => ({
      ...d,
      checkins: d.checkins.map((c) => {
        if (c.id !== id) return c;
        const tem = c.minhas.includes(r);
        return { ...c, minhas: tem ? c.minhas.filter((x) => x !== r) : [...c.minhas, r], reacoes: { ...c.reacoes, [r]: c.reacoes[r] + (tem ? -1 : 1) } };
      }),
    }));
    const tinha = db.checkins.find((c) => c.id === id)?.minhas.includes(r);
    const q = tinha
      ? sb.from("reactions").delete().eq("checkin_id", id).eq("user_id", meId).eq("tipo", r)
      : sb.from("reactions").insert({ checkin_id: id, user_id: meId, tipo: r });
    q.then(({ error }) => { if (error) { console.error(error); carregar(); } });
  }, [meId, db.checkins, carregar]);

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
      ...(n.meta !== undefined && { meta: n.meta }),
    }).then(({ error }) => { if (error) { console.error(error); carregar(); } });
  }, [meId, carregar]);

  const value = useMemo(
    () => ({ ...db, ready, meId, addCheckIn, toggleReacao, toggleFavorito, updateNegocio, recarregar: carregar }),
    [db, ready, meId, addCheckIn, toggleReacao, toggleFavorito, updateNegocio, carregar],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

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
  const { membros, negocios, checkins } = useStore();
  return useMemo(() => membros.map((m) => {
    const negocio = negocios.find((n) => n.membroId === m.id) ?? { membroId: m.id, nome: "Meu projeto", descricao: "", nicho: "A definir", meta: META_PADRAO };
    const meus = checkins.filter((c) => c.membroId === m.id);
    const total = meus.reduce((a, c) => a + c.valor, 0);
    return {
      membro: m, negocio, total, relatos: meus.length,
      diasAtivos: new Set(meus.map((c) => dia(c.data))).size,
      sequencia: sequenciaAtual(meus),
      pct: Math.min(100, (total / (negocio.meta || META_PADRAO)) * 100),
    };
  }), [membros, negocios, checkins]);
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
