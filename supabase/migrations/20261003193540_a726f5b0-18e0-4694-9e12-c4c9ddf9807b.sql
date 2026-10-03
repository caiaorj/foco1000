CREATE TABLE public.page_visits (
  id integer NOT NULL DEFAULT 1 PRIMARY KEY,
  visitas bigint NOT NULL DEFAULT 0,
  ultima_visita timestamp with time zone
);

INSERT INTO public.page_visits (id, visitas) VALUES (1, 0);

GRANT SELECT ON public.page_visits TO authenticated;
GRANT ALL ON public.page_visits TO service_role;

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin ve o contador de visitas"
ON public.page_visits FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.registrar_visita()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.page_visits
  SET visitas = visitas + 1, ultima_visita = now()
  WHERE id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_visita() TO anon, authenticated;