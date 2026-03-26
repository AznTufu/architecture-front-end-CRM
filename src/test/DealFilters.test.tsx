import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DealFilters } from '../features/filter-deals';
import { useUiStore } from '../shared/store';

describe('DealFilters', () => {
  beforeEach(() => {
    useUiStore.setState((state) => ({ ...state, selectedStage: 'all' }));
  });

  it('rend le select et met a jour le store apres interaction', async () => {
    const user = userEvent.setup();
    render(<DealFilters />);

    const select = screen.getByLabelText('Filtre pipeline');
    await user.selectOptions(select, 'qualification');

    expect(useUiStore.getState().selectedStage).toBe('qualification');
  });
});
