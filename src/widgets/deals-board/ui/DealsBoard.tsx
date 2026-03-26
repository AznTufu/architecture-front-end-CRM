import {
  DealColumn,
  dealStageSchema,
  type DealStage,
  useDealsQuery,
  useUpdateDealStageMutation,
} from '../../../entities/deal';
import { DealFilters, useDealStageFilter } from '../../../features/filter-deals';
import {
  selectGlobalSearchScope,
  selectGlobalSearchTerm,
  selectSelectedSavedView,
  useUiStore,
} from '../../../shared/store';
import { useState } from 'react';

const stages = dealStageSchema.options;

export function DealsBoard() {
  const [selectedStage] = useDealStageFilter();
  const selectedSavedView = useUiStore(selectSelectedSavedView);
  const globalSearchTerm = useUiStore(selectGlobalSearchTerm);
  const globalSearchScope = useUiStore(selectGlobalSearchScope);
  const { data, isPending, isError, error } = useDealsQuery('all');
  const updateStageMutation = useUpdateDealStageMutation();
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [dropTargetStage, setDropTargetStage] = useState<DealStage | null>(null);
  const showAllColumnsContent = selectedStage === 'all' || draggingDealId !== null;

  const handleDropDeal = (dealId: string, targetStage: DealStage) => {
    updateStageMutation.mutate(
      { dealId, stage: targetStage },
      {
        onSettled: () => {
          setDraggingDealId(null);
          setDropTargetStage(null);
        },
      }
    );
  };

  if (isPending) {
    return <section className="panel">Chargement du pipeline...</section>;
  }

  if (isError) {
    return <section className="panel">Erreur deals: {error.message}</section>;
  }

  const savedViewFilteredDeals = data.filter((deal) => {
    if (selectedSavedView === 'deals_over_10k') {
      return deal.amount > 10000;
    }

    if (selectedSavedView === 'hot_prospects') {
      return (
        deal.amount >= 5000 ||
        deal.stage === 'qualification' ||
        deal.stage === 'proposal' ||
        deal.stage === 'negotiation'
      );
    }

    return true;
  });

  const normalizedSearch = globalSearchTerm.toLowerCase();
  const finalDeals = savedViewFilteredDeals.filter((deal) => {
    if (!normalizedSearch) {
      return true;
    }

    if (globalSearchScope !== 'deal' && globalSearchScope !== 'all') {
      return true;
    }

    return deal.title.toLowerCase().includes(normalizedSearch);
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Pipeline opportunites</h2>
        <DealFilters />
      </div>

      {finalDeals.length === 0 ? (
        <p className="meta">
          Aucun deal visible. Verifie le filtre pipeline ou tes permissions d'acces.
        </p>
      ) : null}

      {globalSearchTerm && (globalSearchScope === 'deal' || globalSearchScope === 'all') ? (
        <p className="meta">
          Recherche active sur deals: {finalDeals.length}{' '}
          {finalDeals.length > 1 ? 'resultats' : 'resultat'}
        </p>
      ) : null}

      {updateStageMutation.isError ? (
        <p className="meta">Erreur de deplacement: {updateStageMutation.error.message}</p>
      ) : null}

      <div className="board-grid">
        {stages.map((stage) => {
          const stageDeals =
            showAllColumnsContent
              ? finalDeals.filter((deal) => deal.stage === stage)
              : stage === selectedStage
                ? finalDeals.filter((deal) => deal.stage === stage)
                : [];

          return (
          <DealColumn
            key={stage}
            stage={stage}
            deals={stageDeals}
            draggingDealId={draggingDealId}
            isDropTarget={dropTargetStage === stage}
            onDragStartDeal={(dealId) => setDraggingDealId(dealId)}
            onDragEndDeal={() => {
              setDraggingDealId(null);
              setDropTargetStage(null);
            }}
            onDragEnterStage={setDropTargetStage}
            onDragLeaveStage={(stageId) => {
              setDropTargetStage((current) => (current === stageId ? null : current));
            }}
            onDropDeal={handleDropDeal}
          />
          );
        })}
      </div>
    </section>
  );
}
