import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const META_PADRAO = 1000;
export const CURRENT_USER_ID = "u-me";

export type Membro = { id: string; nome: string; avatar: string; bio: string };
export type Negocio = { membroId: string; nome: string; descricao: string; nicho: string; meta: number };
export type CheckIn = {
  id: string;
  membroId: string;
  data: string; // ISO
  texto: string;
  valor: number;
  foto?: string;
  curtidas: string[];
};
export type Aviso = { id: string; tipo: "aviso" | "atividade"; texto: string };

type DB = { membros: Membro[]; negocios: Negocio[]; checkins: CheckIn[]; avisos: Aviso[]; favoritos: string[] };

const STORAGE_KEY = "foco-mil-reais:v1";

function seed(): DB {
  const m = (id: string, nome: string, bio: string): Membro => ({
    id, nome, bio, avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(nome)}`,
  });
  return {
    membros: [
      m(CURRENT_USER_ID, "Você", "Começando a jornada rumo aos primeiros R$ 1.000."),
      m("u-ana", "Ana Ribeiro", "Designer vendendo templates de Canva."),
      m("u-bruno", "Bruno Lima", "Brigadeiros gourmet por encomenda."),
      m("u-carla", "Carla Souza", "Aulas particulares de inglês online."),
      m("u-diego", "Diego Martins", "Edição de vídeos para criadores."),
      m("u-elisa", "Elisa Prado", "Velas aromáticas artesanais."),
    ],
    negocios: [
      { membroId: CURRENT_USER_ID, nome: "Meu primeiro negócio", descricao: "Edite para descrever seu projeto.", nicho: "A definir", meta: META_PADRAO },
      { membroId: "u-ana", nome: "Templates Ana", descricao: "Pacotes de templates para pequenos negócios.", nicho: "Design", meta: 1000 },
      { membroId: "u-bruno", nome: "Doce Bruno", descricao: "Brigadeiros gourmet sob encomenda.", nicho: "Alimentação", meta: 1000 },
      { membroId: "u-carla", nome: "Inglês com Carla", descricao: "Conversação para adultos.", nicho: "Educação", meta: 1000 },
      { membroId: "u-diego", nome: "Cortes do Diego", descricao: "Edição de Reels e Shorts.", nicho: "Audiovisual", meta: 1000 },
      { membroId: "u-elisa", nome: "Luz da Elisa", descricao: "Velas artesanais com essências naturais.", nicho: "Artesanato", meta: 1000 },
    ],
    checkins: [
      { id: "c1", membroId: "u-ana", data: "2026-10-03T12:10:00Z", texto: "Fechei mais um pacote com uma clínica de estética! Atingi a meta 🎉", valor: 180, foto: "https://picsum.photos/seed/ana1/800/500", curtidas: ["u-bruno", "u-carla"] },
      { id: "c2", membroId: "u-bruno", data: "2026-10-03T09:30:00Z", texto: "Entreguei 50 brigadeiros para um aniversário.", valor: 125, foto: "https://picsum.photos/seed/bruno1/800/500", curtidas: ["u-ana"] },
      { id: "c3", membroId: "u-carla", data: "2026-10-02T20:00:00Z", texto: "Primeira aluna fechou o pacote mensal.", valor: 240, curtidas: [] },
      { id: "c4", membroId: "u-diego", data: "2026-10-02T15:00:00Z", texto: "Editei 3 Reels para um cliente novo.", valor: 150, foto: "https://picsum.photos/seed/diego1/800/500", curtidas: ["u-elisa"] },
      { id: "c5", membroId: "u-ana", data: "2026-10-01T18:00:00Z", texto: "Vendi 4 templates pelo Instagram.", valor: 420, curtidas: ["u-diego"] },
      { id: "c6", membroId: "u-ana", data: "2026-09-29T18:00:00Z", texto: "Primeira venda! Um kit de stories.", valor: 450, curtidas: [] },
      { id: "c7", membroId: "u-bruno", data: "2026-09-30T11:00:00Z", texto: "Encomenda grande de uma empresa.", valor: 380, curtidas: [] },
      { id: "c8", membroId: "u-elisa", data: "2026-10-01T10:00:00Z", texto: "Feirinha do bairro: vendi 6 velas.", valor: 210, foto: "https://picsum.photos/seed/elisa1/800/500", curtidas: ["u-ana"] },
      { id: "c9", membroId: "u-carla", data: "2026-09-28T10:00:00Z", texto: "Duas aulas experimentais convertidas.", valor: 160, curtidas: [] },
    ],
    favoritos: [],
    avisos: [
      { id: "a1", tipo: "aviso", texto: "Live de mentoria nesta quinta, 20h — traga sua maior dúvida de vendas." },
      { id: "a2", tipo: "atividade", texto: "Desafio da semana: faça 10 ofertas diretas e registre no check-in." },
      { id: "a3", tipo: "atividade", texto: "Ana Ribeiro bateu a meta dos R$ 1.000! Mande um parabéns." },
    ],
  };
}

type Store = DB & {
  ready: boolean;
  addCheckIn: (c: { texto: string; valor: number; foto?: string }) => void;
  toggleCurtida: (id: string) => void;
  toggleFavorito: (id: string) => void;
  updateNegocio: (n: Partial<Negocio>) => void;
  updateMembro: (m: Partial<Membro>) => void;
  resetDados: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => seed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDb({ ...seed(), ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch {}
  }, [db, ready]);

  const addCheckIn = useCallback((c: { texto: string; valor: number; foto?: string }) => {
    setDb((d) => ({
      ...d,
      checkins: [{ id: `c-${Date.now()}`, membroId: CURRENT_USER_ID, data: new Date().toISOString(), curtidas: [], ...c }, ...d.checkins],
    }));
  }, []);
  const toggleCurtida = useCallback((id: string) => {
    setDb((d) => ({
      ...d,
      checkins: d.checkins.map((c) => c.id !== id ? c : {
        ...c,
        curtidas: c.curtidas.includes(CURRENT_USER_ID) ? c.curtidas.filter((x) => x !== CURRENT_USER_ID) : [...c.curtidas, CURRENT_USER_ID],
      }),
    }));
  }, []);
  const toggleFavorito = useCallback((id: string) => {
    setDb((d) => ({ ...d, favoritos: d.favoritos.includes(id) ? d.favoritos.filter((x) => x !== id) : [...d.favoritos, id] }));
  }, []);
  const updateNegocio = useCallback((n: Partial<Negocio>) => {
    setDb((d) => ({ ...d, negocios: d.negocios.map((x) => x.membroId === CURRENT_USER_ID ? { ...x, ...n } : x) }));
  }, []);
  const updateMembro = useCallback((m: Partial<Membro>) => {
    setDb((d) => ({ ...d, membros: d.membros.map((x) => x.id === CURRENT_USER_ID ? { ...x, ...m } : x) }));
  }, []);
  const resetDados = useCallback(() => setDb(seed()), []);

  const value = useMemo(() => ({ ...db, ready, addCheckIn, toggleCurtida, toggleFavorito, updateNegocio, updateMembro, resetDados }), [db, ready, addCheckIn, toggleCurtida, toggleFavorito, updateNegocio, updateMembro, resetDados]);
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

export function useRanking() {
  const { membros, negocios, checkins } = useStore();
  return useMemo(() => membros.map((m) => {
    const neg = negocios.find((n) => n.membroId === m.id)!;
    const total = totalDe(checkins, m.id);
    const qtd = checkins.filter((c) => c.membroId === m.id).length;
    return { membro: m, negocio: neg, total, qtd, pct: Math.min(100, (total / (neg?.meta || META_PADRAO)) * 100) };
  }).sort((a, b) => b.total - a.total), [membros, negocios, checkins]);
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
