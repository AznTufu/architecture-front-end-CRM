import '@testing-library/jest-dom/vitest';

Object.assign(import.meta.env, {
	VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? 'https://test.supabase.co',
	VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'test-anon-key',
});
