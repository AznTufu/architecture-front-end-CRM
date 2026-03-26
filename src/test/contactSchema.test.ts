import { describe, expect, it } from 'vitest';
import { contactSchema } from '../entities/contact';

describe('contactSchema', () => {
  it('valide une réponse API correcte', () => {
    const parsed = contactSchema.parse({
      id: '8e30e4be-5985-4187-b4cf-594f6c6d49d6',
      full_name: 'Alice Bernard',
      last_name: 'Bernard',
      email: 'alice@pulsecrm.io',
      phone: '+33612345678',
      company: 'Pulse',
      status: 'customer',
      created_at: '2026-03-01T10:00:00.000Z',
    });

    expect(parsed.full_name).toBe('Alice Bernard');
  });

  it('rejette une réponse API invalide', () => {
    const result = contactSchema.safeParse({
      id: 'id-1',
      full_name: '',
      last_name: '',
      email: 'wrong-email',
      phone: '',
      company: null,
      status: 'unknown',
    });

    expect(result.success).toBe(false);
  });
});
