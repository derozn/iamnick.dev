import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CareerTickets } from './CareerTickets';
import { roles } from '@/content/cv';

// The deck is newest-first (same sort the component applies).
const DECK = [...roles].sort((a, b) => (a.start < b.start ? 1 : -1));

describe('CareerTickets', () => {
  it('opens on the most recent role', () => {
    render(<CareerTickets />);
    expect(screen.getByText(DECK[0].company)).toBeInTheDocument();
  });

  it('steps forward and back through the deck with the arrow keys (useKeyDown)', async () => {
    const user = userEvent.setup();
    render(<CareerTickets />);
    expect(screen.getByText(DECK[0].company)).toBeInTheDocument();

    // findByText retries while the card-swap animation settles.
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByText(DECK[1].company)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByText(DECK[0].company)).toBeInTheDocument();
  });

  it('wraps from the first card back to the last when stepping left', async () => {
    const user = userEvent.setup();
    render(<CareerTickets />);
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByText(DECK[DECK.length - 1].company)).toBeInTheDocument();
  });
});
