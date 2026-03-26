import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpcMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
}));

vi.mock('../shared/api', () => ({
  supabaseClient: {
    rpc: rpcMock,
  },
}));

import { updateDealStage } from '../entities/deal/api/dealsApi';

describe('updateDealStage', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('retourne un message explicite en cas d erreur reseau', async () => {
    rpcMock.mockRejectedValueOnce(new TypeError('Network error'));

    await expect(
      updateDealStage({
        dealId: '11111111-1111-4111-8111-111111111111',
        stage: 'proposal',
      })
    ).rejects.toThrow('Erreur reseau lors du deplacement. Verifie la connexion puis reessaie.');
  });
});
