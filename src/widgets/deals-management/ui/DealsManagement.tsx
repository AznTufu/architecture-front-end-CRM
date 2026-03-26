import { useMemo, useState } from 'react';
import { useContactsQuery } from '../../../entities/contact';
import {
  dealStageSchema,
  useDealsQuery,
  useDeleteDealMutation,
  useUpdateDealMutation,
  type DealStage,
} from '../../../entities/deal';

interface DealEditState {
  id: string;
  title: string;
  amount: number;
  stage: DealStage;
  contactId: string;
}

export function DealsManagement() {
  const dealsQuery = useDealsQuery('all');
  const contactsQuery = useContactsQuery();
  const updateDealMutation = useUpdateDealMutation();
  const deleteDealMutation = useDeleteDealMutation();
  const [editState, setEditState] = useState<DealEditState | null>(null);
  const [dealPendingDelete, setDealPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const contactsByName = useMemo(
    () => [...(contactsQuery.data ?? [])].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [contactsQuery.data]
  );

  if (dealsQuery.isPending || contactsQuery.isPending) {
    return <section className="panel">Chargement des deals...</section>;
  }

  if (dealsQuery.isError || contactsQuery.isError) {
    const message = dealsQuery.error?.message ?? contactsQuery.error?.message ?? 'Erreur inconnue';
    return <section className="panel">Erreur deals: {message}</section>;
  }

  const startEdit = (deal: {
    id: string;
    title: string;
    amount: number;
    stage: DealStage;
    contact_id?: string | null;
  }) => {
    setEditState({
      id: deal.id,
      title: deal.title,
      amount: deal.amount,
      stage: deal.stage,
      contactId: deal.contact_id ?? '',
    });
  };

  const submitEdit = async () => {
    if (!editState) {
      return;
    }

    await updateDealMutation.mutateAsync({
      deal_id: editState.id,
      title: editState.title.trim(),
      amount: editState.amount,
      stage: editState.stage,
      contact_id: editState.contactId || null,
    });

    setEditState(null);
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Gestion des deals</h2>
        <p className="meta">
          {dealsQuery.data.length} {dealsQuery.data.length > 1 ? 'deals' : 'deal'}
        </p>
      </div>

      <ul className="contact-list">
        {dealsQuery.data.map((deal) => (
          <li key={deal.id} className="contact-card">
            {editState?.id === deal.id ? (
              <div className="crm-form deals-management__form">
                <label>
                  Titre
                  <input
                    value={editState.title}
                    onChange={(event) =>
                      setEditState((current) =>
                        current ? { ...current, title: event.target.value } : current
                      )
                    }
                  />
                </label>
                <label>
                  Montant
                  <input
                    type="number"
                    min="0"
                    value={editState.amount}
                    onChange={(event) =>
                      setEditState((current) =>
                        current
                          ? {
                              ...current,
                              amount: Number(event.target.value) || 0,
                            }
                          : current
                      )
                    }
                  />
                </label>
                <label>
                  Etape
                  <select
                    value={editState.stage}
                    onChange={(event) =>
                      setEditState((current) =>
                        current
                          ? { ...current, stage: event.target.value as DealStage }
                          : current
                      )
                    }
                  >
                    {dealStageSchema.options.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Contact
                  <select
                    value={editState.contactId}
                    onChange={(event) =>
                      setEditState((current) =>
                        current ? { ...current, contactId: event.target.value } : current
                      )
                    }
                  >
                    <option value="">Aucun</option>
                    {contactsByName.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="deals-management__actions">
                  <button
                    type="button"
                    onClick={() => void submitEdit()}
                    disabled={updateDealMutation.isPending}
                  >
                    {updateDealMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button type="button" className="ghost-toggle" onClick={() => setEditState(null)}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3>{deal.title}</h3>
                  <p>{deal.stage}</p>
                  <p>{deal.owner}</p>
                </div>
                <div className="contact-meta">
                  <span>{new Intl.NumberFormat('fr-FR').format(deal.amount)} €</span>
                  <div className="deals-management__actions">
                    <button type="button" className="ghost-toggle" onClick={() => startEdit(deal)}>
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="ghost-toggle"
                      onClick={() => setDealPendingDelete({ id: deal.id, title: deal.title })}
                      disabled={deleteDealMutation.isPending}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {dealPendingDelete ? (
        <div className="confirm-overlay" role="presentation" onClick={() => setDealPendingDelete(null)}>
          <div
            className="confirm-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmation suppression deal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Supprimer le deal ?</h3>
            <p className="meta">
              Cette action est irreversible: {dealPendingDelete.title}
            </p>
            <div className="deals-management__actions">
              <button
                type="button"
                onClick={() => {
                  void deleteDealMutation.mutateAsync({ deal_id: dealPendingDelete.id });
                  setDealPendingDelete(null);
                }}
                disabled={deleteDealMutation.isPending}
              >
                {deleteDealMutation.isPending ? 'Suppression...' : 'Confirmer'}
              </button>
              <button
                type="button"
                className="ghost-toggle"
                onClick={() => setDealPendingDelete(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {updateDealMutation.isError ? <p className="meta">Erreur update: {updateDealMutation.error.message}</p> : null}
      {deleteDealMutation.isError ? <p className="meta">Erreur suppression: {deleteDealMutation.error.message}</p> : null}
    </section>
  );
}
