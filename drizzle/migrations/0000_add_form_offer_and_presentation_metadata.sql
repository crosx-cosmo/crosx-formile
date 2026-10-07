ALTER TABLE public.forms
  ADD COLUMN redirect_url TEXT,
  ADD COLUMN offer_id TEXT,
  ADD COLUMN offer_name TEXT,
  ADD COLUMN offer_logo_url TEXT,
  ADD COLUMN layout_type TEXT NOT NULL DEFAULT 'executive';

ALTER TABLE public.templates
  ADD COLUMN redirect_url TEXT,
  ADD COLUMN offer_id TEXT,
  ADD COLUMN offer_name TEXT,
  ADD COLUMN offer_logo_url TEXT,
  ADD COLUMN layout_type TEXT NOT NULL DEFAULT 'executive';

ALTER TABLE public.forms
  ADD CONSTRAINT forms_layout_type_check CHECK (layout_type IN ('executive', 'centered', 'split')) NOT VALID;

ALTER TABLE public.templates
  ADD CONSTRAINT templates_layout_type_check CHECK (layout_type IN ('executive', 'centered', 'split')) NOT VALID;