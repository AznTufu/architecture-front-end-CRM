import {
  selectSelectedStage,
  useUiStore,
  type DealStageFilter,
} from '../../../shared/store';

export function useDealStageFilter(): [DealStageFilter, (stage: DealStageFilter) => void] {
  const stage = useUiStore(selectSelectedStage);
  const setSelectedStage = useUiStore((state) => state.setSelectedStage);

  return [stage, setSelectedStage];
}
