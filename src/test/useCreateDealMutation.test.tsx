import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryKeys } from '../shared/api';

const { createDealFromFormMock, createActivityMock } = vi.hoisted(() => ({
  createDealFromFormMock: vi.fn(),
  createActivityMock: vi.fn(),
}));

vi.mock('../features/create-deal/api/createDeal', () => ({
  createDealFromForm: createDealFromFormMock,
}));

vi.mock('../entities/activity', () => ({
  createActivity: createActivityMock,
}));

import { useCreateDealMutation } from '../features/create-deal/model/useCreateDealMutation';

describe('useCreateDealMutation', () => {
  beforeEach(() => {
    createDealFromFormMock.mockReset();
    createActivityMock.mockReset();
  });

  it('invalide les caches deals et activities apres creation', async () => {
    createDealFromFormMock.mockResolvedValue({
      id: '44444444-4444-4444-8444-444444444444',
      title: 'Deal test',
      amount: 12000,
      stage: 'negotiation',
      owner: 'demo.user@crm.fr',
      contact_id: '33333333-3333-4333-8333-333333333333',
    });
    createActivityMock.mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useCreateDealMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Deal test',
        amount: 12000,
        stage: 'negotiation',
        contactId: '33333333-3333-4333-8333-333333333333',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.deals.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.activities.all });
  });
});
