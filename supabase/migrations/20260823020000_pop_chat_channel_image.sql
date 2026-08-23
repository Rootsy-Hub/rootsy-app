ALTER TABLE public.pop_chat_channels
  ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.pop_chat_channels.image_url IS
  'Avatar público del canal (Storage).';
