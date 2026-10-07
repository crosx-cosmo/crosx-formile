CREATE OR REPLACE FUNCTION public.increment_form_view(form_slug TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.forms SET views = views + 1 WHERE slug = form_slug AND status = 'published';
$$;
REVOKE EXECUTE ON FUNCTION public.increment_form_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_form_view(TEXT) TO anon, authenticated;