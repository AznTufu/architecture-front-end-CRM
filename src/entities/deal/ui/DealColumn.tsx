import type { DragEventHandler } from 'react';
import { z } from 'zod';
import type { Deal, DealStage } from '../model/schema';

const draggedDealPayloadSchema = z.object({
  dealId: z.string().min(1),
  sourceStage: z.enum([
    'prospecting',
    'qualification',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost',
  ]),
});

const stageLabel: Record<DealStage, string> = {
  prospecting: 'Lead',
  qualification: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

interface DealColumnProps {
  stage: DealStage;
  deals: Deal[];
  draggingDealId: string | null;
  isDropTarget: boolean;
  onDragStartDeal: (dealId: string) => void;
  onDragEndDeal: () => void;
  onDragEnterStage: (stage: DealStage) => void;
  onDragLeaveStage: (stage: DealStage) => void;
  onDropDeal: (dealId: string, targetStage: DealStage) => void;
}

export function DealColumn({
  stage,
  deals,
  draggingDealId,
  isDropTarget,
  onDragStartDeal,
  onDragEndDeal,
  onDragEnterStage,
  onDragLeaveStage,
  onDropDeal,
}: DealColumnProps) {
  const handleDrop: DragEventHandler<HTMLElement> = (event) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData('text/plain');

    if (!payload) {
      return;
    }

    try {
      const rawPayload = JSON.parse(payload);
      const parsedPayload = draggedDealPayloadSchema.safeParse(rawPayload);

      if (!parsedPayload.success) {
        return;
      }

      const draggedDealId = parsedPayload.data.dealId;
      const sourceStage = parsedPayload.data.sourceStage;

      if (sourceStage === stage) {
        return;
      }

      onDropDeal(draggedDealId, stage);
      onDragLeaveStage(stage);
    } catch {
      return;
    }
  };

  return (
    <article
      className={`deal-column${isDropTarget ? ' is-drop-target' : ''}`}
      data-testid={`deal-column-${stage}`}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        onDragEnterStage(stage);
      }}
      onDragEnter={() => onDragEnterStage(stage)}
      onDragLeave={() => onDragLeaveStage(stage)}
      onDrop={handleDrop}
    >
      <header>
        <h3>{stageLabel[stage]}</h3>
        <span>{deals.length}</span>
      </header>
      <ul className="deal-list">
        {deals.map((deal) => (
          <li
            key={deal.id}
            className={`deal-card${draggingDealId === deal.id ? ' is-dragging' : ''}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData(
                'text/plain',
                JSON.stringify({ dealId: deal.id, sourceStage: deal.stage })
              );
              onDragStartDeal(deal.id);
            }}
            onDragEnd={onDragEndDeal}
          >
            <p>{deal.title}</p>
            <strong>{new Intl.NumberFormat('fr-FR').format(deal.amount)} €</strong>
            <small>{deal.owner}</small>
          </li>
        ))}
      </ul>
    </article>
  );
}
