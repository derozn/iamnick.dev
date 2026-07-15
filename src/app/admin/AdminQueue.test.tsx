import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WallTile } from '@/lib/doodle-wall/types';

import { AdminQueue } from './AdminQueue';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const TILES: WallTile[] = [
  { id: 'tile-a', imageUrl: 'data:image/png;base64,', createdAt: '2026-07-15T10:00:00.000Z' },
  { id: 'tile-b', imageUrl: 'data:image/png;base64,', createdAt: '2026-07-15T11:00:00.000Z' },
];

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'tile-a', status: 'approved' })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('AdminQueue', () => {
  it('shows one card per pending tile with both verdicts', () => {
    render(<AdminQueue initialTiles={TILES} />);
    expect(screen.getByText(/2 awaiting review/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Approve' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Reject' })).toHaveLength(2);
  });

  it('PATCHes a verdict and strikes the card', async () => {
    const user = userEvent.setup();
    render(<AdminQueue initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Approve' })[0]);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/tiles/tile-a',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ verdict: 'approve' }) }),
    );
    expect(screen.getByText(/1 awaiting review/i)).toBeInTheDocument();
  });

  it('drops a stale card on 409 without an error banner', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid-transition' }), { status: 409 }),
    );
    const user = userEvent.setup();
    render(<AdminQueue initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Reject' })[0]);

    expect(screen.getByText(/1 awaiting review/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the card on a bare platform 404 (no tile-level reason) — deploy skew must not eat verdicts', async () => {
    fetchMock.mockResolvedValue(new Response('Not Found', { status: 404 }));
    const user = userEvent.setup();
    render(<AdminQueue initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Approve' })[0]);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/2 awaiting review/i)).toBeInTheDocument();
  });

  it('surfaces a transient failure and keeps the card', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(<AdminQueue initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Approve' })[0]);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/2 awaiting review/i)).toBeInTheDocument();
  });

  it('offers Check again when the queue is clear', async () => {
    const user = userEvent.setup();
    render(<AdminQueue initialTiles={[]} />);
    await user.click(screen.getByRole('button', { name: 'Check again' }));
    expect(refresh).toHaveBeenCalled();
  });
});
