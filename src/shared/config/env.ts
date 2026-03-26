import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const parsedEnv = envSchema.parse({
  VITE_SUPABASE_URL:
    import.meta.env.VITE_SUPABASE_URL ?? 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'development-key',
});

export const env = parsedEnv;
