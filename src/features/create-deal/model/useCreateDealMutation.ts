import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActivity } from '../../../entities/activity';
import { queryKeys } from '../../../shared/api';
import { createDealFromForm } from '../api/createDeal';

export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDealFromForm,
    onSuccess: async (createdDeal, variables) => {
      try {
        await createActivity({
          type: 'note',
          title: `Deal cree: ${createdDeal.title}`,
          description: `Montant ${new Intl.NumberFormat('fr-FR').format(createdDeal.amount)} € · Etape ${createdDeal.stage}`,
          contact_id: variables.contactId,
          deal_id: createdDeal.id,
        });
      } catch (error) {
        console.warn('create activity after deal creation failed', error);
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.deals.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
