import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
});

export const signUpSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Le nom complet est requis'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
