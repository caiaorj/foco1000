import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const META_PADRAO = 1000;
export const CURRENT_USER_ID = "u-me";

export type Membro = { id: string; nome: string; sequenciaBase: number };
export type Negocio = { membroId: string; nome: string; descricao: string; nicho: string; meta: number };
export type Reacao = "palmas" | "bora" | "executou";
export type CheckIn = {
  id: string;
  membroId: string;
  data: string; // ISO
  texto: string;
  deuCerto?: string;
  deuErrado?: string;
  valor: number;
  horas?: number;
  foto?: string;
  reacoes: Record<Reacao, number>;
  minhas: Reacao[];
};
export type Live = { titulo: string; quando: string; link: string };

type DB = { membros: Membro[]; negocios: Negocio[]; checkins: CheckIn[]; favoritos: string[]; live: Live };

const STORAGE_KEY = "foco-mil-reais:v2";

function seed(): DB {
  const now = Date.now();
  const d = (diasAtras: number, h = 0) => new Date(now - diasAtras * 864e5 - h * 36e5).toISOString();
  const r = (palmas: number, bora: number, executou: number) => ({ palmas, bora, executou });
  const ph = (q: string) => `https://images.unsplash.com/${q}?w=1000&q=70&auto=format&fit=crop`;
  return {
    membros: [
      { id: CURRENT_USER_ID, nome: "Você", sequenciaBase: 0 },
      { id: "u-marcos", nome: "Marcos Tavares", sequenciaBase: 12 },
      { id: "u-juliana", nome: "Juliana Prado", sequenciaBase: 9 },
      { id: "u-rafael", nome: "Rafael Lima", sequenciaBase: 7 },
      { id: "u-camila", nome: "Camila Nunes", sequenciaBase: 6 },
      { id: "u-diego", nome: "Diego Ferreira", sequenciaBase: 4 },
      { id: "u-patricia", nome: "Patrícia Melo", sequenciaBase: 3 },
      { id: "u-bruno", nome: "Bruno Costa", sequenciaBase: 1 },
    ],
    negocios: [
      { membroId: CURRENT_USER_ID, nome: "Meu projeto", descricao: "", nicho: "A definir", meta: META_PADRAO },
      { membroId: "u-marcos", nome: "Reformas Tavares", descricao: "Pequenas reformas residenciais no bairro.", nicho: "Pequenas reformas", meta: 1000 },
      { membroId: "u-juliana", nome: "Doce Prado", descricao: "Brigadeiros e doces sob encomenda.", nicho: "Doces artesanais", meta: 1000 },
      { membroId: "u-rafael", nome: "RL Imports", descricao: "Acessórios de celular pela internet.", nicho: "Revenda online", meta: 1000 },
      { membroId: "u-camila", nome: "CN Social Media", descricao: "Instagram de pequenos comércios locais.", nicho: "Gestão de redes", meta: 1000 },
      { membroId: "u-diego", nome: "DF Marmitas", descricao: "Marmitas fitness congeladas.", nicho: "Marmitas fitness", meta: 1000 },
      { membroId: "u-patricia", nome: "Ateliê PM", descricao: "Ajustes e consertos de roupa.", nicho: "Costura", meta: 1000 },
      { membroId: "u-bruno", nome: "BC Fretes", descricao: "Pequenos fretes e mudanças.", nicho: "Fretes", meta: 1000 },
    ],
    checkins: [
      { id: "c1", membroId: "u-juliana", data: d(0, 1), texto: "Produção de 9 caixas de brigadeiro para encomendas do fim de semana. Vendi tudo pelo WhatsApp antes de terminar.", deuCerto: "Foto boa no status vende mais que qualquer texto.", valor: 186, horas: 5, foto: ph("photo-1606313564200-e75d5e30476c"), reacoes: r(21, 7, 11), minhas: [] },
      { id: "c2", membroId: "u-marcos", data: d(0, 3), texto: "Fechei o piso do quarto da dona Célia e já emendei o orçamento do banheiro. Dia puxado, mas o dinheiro entrou na conta.", deuCerto: "Cobrar 50% de entrada antes de começar mudou meu caixa.", deuErrado: "Subestimei o material de novo. Comprei argamassa a mais do bolso.", valor: 350, horas: 9, foto: ph("photo-1581858726788-75bc0f6a952d"), reacoes: r(34, 12, 18), minhas: [] },
      { id: "c3", membroId: "u-rafael", data: d(1, 2), texto: "Primeiro lote de capinhas esgotou. Postei no grupo do condomínio e no Marketplace.", deuErrado: "Esqueci de calcular o frete na margem.", valor: 240, horas: 4, reacoes: r(15, 6, 9), minhas: [] },
      { id: "c4", membroId: "u-camila", data: d(1, 5), texto: "Fechei a padaria da esquina: 12 posts por mês. Mandei proposta simples em PDF.", deuCerto: "Mostrar o antes e depois do perfil de outro cliente.", valor: 150, horas: 3, reacoes: r(12, 4, 7), minhas: [] },
      { id: "c5", membroId: "u-diego", data: d(2, 1), texto: "30 marmitas entregues na academia do bairro. O dono deixou eu colocar um cartaz.", valor: 210, horas: 6, foto: ph("photo-1547592180-85f173990554"), reacoes: r(19, 8, 10), minhas: [] },
      { id: "c6", membroId: "u-juliana", data: d(3), texto: "Teste de sabores novos com vizinhos. Dois pediram para o aniversário.", valor: 92, horas: 3, reacoes: r(8, 3, 4), minhas: [] },
      { id: "c7", membroId: "u-patricia", data: d(3, 4), texto: "Ajustei 4 calças e uma barra de vestido. Divulguei no grupo da igreja.", deuErrado: "Cobrei barato demais pela barra.", valor: 65, horas: 4, reacoes: r(9, 2, 5), minhas: [] },
      { id: "c8", membroId: "u-camila", data: d(4), texto: "Reunião com a loja de roupas. Ainda não fechou, mas pediram proposta.", valor: 0, horas: 2, reacoes: r(5, 6, 3), minhas: [] },
      { id: "c9", membroId: "u-marcos", data: d(5), texto: "Troquei a resistência do chuveiro e instalei duas tomadas.", valor: 0, horas: 3, reacoes: r(6, 2, 4), minhas: [] },
      { id: "c10", membroId: "u-bruno", data: d(5, 2), texto: "Primeiro frete feito: mudança de um quarto para o bairro vizinho.", deuCerto: "Pedir indicação logo depois de terminar.", valor: 120, horas: 5, reacoes: r(11, 5, 6), minhas: [] },
    ],
    favoritos: [],
    live: { titulo: "Precificação sem medo: como cobrar sem pedir desconto", quando: "Sexta-feira, 9 de outubro · 19h30 (horário de Brasília)", link: "#" },
  };
}

type NovoCheckIn = { texto: string; valor: number; horas?: number; deuCerto?: string; deuErrado?: string; foto?: string };

type Store = DB & {
  ready: boolean;
  addCheckIn: (c: NovoCheckIn) => void;
  toggleReacao: (id: string, r: Reacao) => void;
  toggleFavorito: (id: string) => void;
  updateNegocio: (n: Partial<Negocio>) => void;
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

  const addCheckIn = useCallback((c: NovoCheckIn) => {
    setDb((d) => ({
      ...d,
      checkins: [{ id: `c-${Date.now()}`, membroId: CURRENT_USER_ID, data: new Date().toISOString(), reacoes: { palmas: 0, bora: 0, executou: 0 }, minhas: [], ...c }, ...d.checkins],
    }));
  }, []);
  const toggleReacao = useCallback((id: string, r: Reacao) => {
    setDb((d) => ({
      ...d,
      checkins: d.checkins.map((c) => {
        if (c.id !== id) return c;
        const tem = c.minhas.includes(r);
        return { ...c, minhas: tem ? c.minhas.filter((x) => x !== r) : [...c.minhas, r], reacoes: { ...c.reacoes, [r]: c.reacoes[r] + (tem ? -1 : 1) } };
      }),
    }));
  }, []);
  const toggleFavorito = useCallback((id: string) => {
    setDb((d) => ({ ...d, favoritos: d.favoritos.includes(id) ? d.favoritos.filter((x) => x !== id) : [...d.favoritos, id] }));
  }, []);
  const updateNegocio = useCallback((n: Partial<Negocio>) => {
    setDb((d) => ({ ...d, negocios: d.negocios.map((x) => x.membroId === CURRENT_USER_ID ? { ...x, ...n } : x) }));
  }, []);
  const resetDados = useCallback(() => setDb(seed()), []);

  const value = useMemo(() => ({ ...db, ready, addCheckIn, toggleReacao, toggleFavorito, updateNegocio, resetDados }), [db, ready, addCheckIn, toggleReacao, toggleFavorito, updateNegocio, resetDados]);
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
    const negocio = negocios.find((n) => n.membroId === m.id)!;
    const meus = checkins.filter((c) => c.membroId === m.id);
    const total = meus.reduce((a, c) => a + c.valor, 0);
    const seqCalc = sequenciaAtual(meus);
    return {
      membro: m, negocio, total, relatos: meus.length,
      diasAtivos: new Set(meus.map((c) => dia(c.data))).size,
      sequencia: Math.max(m.sequenciaBase, seqCalc),
      pct: Math.min(100, (total / (negocio?.meta || META_PADRAO)) * 100),
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
