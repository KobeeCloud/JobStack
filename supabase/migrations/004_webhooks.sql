-- Webhook integrations for external notifications

CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    events TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id
  ON public.webhooks (user_id);

-- RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhooks_select" ON public.webhooks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "webhooks_insert" ON public.webhooks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "webhooks_update" ON public.webhooks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "webhooks_delete" ON public.webhooks FOR DELETE USING (user_id = auth.uid());

-- Grant access
GRANT ALL ON public.webhooks TO authenticated;

-- Updated at trigger
CREATE TRIGGER set_webhooks_updated_at BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
