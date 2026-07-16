import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WallTile } from '@/lib/doodle-wall/types';

import { AdminWall } from './AdminWall';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const TILES: WallTile[] = [
  { id: 'hung-a', imageUrl: 'data:image/png;base64,', createdAt: '2026-07-16T10:00:00.000Z' },
  { id: 'hung-b', imageUrl: 'data:image/png;base64,', createdAt: '2026-07-16T09:00:00.000Z' },
];

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'hung-a', status: 'rejected' })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('AdminWall — housekeeping', () => {
  it('shows the hung tiles with a take-down each', () => {
    render(<AdminWall initialTiles={TILES} />);
    expect(screen.getByText(/2 hanging/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Take down' })).toHaveLength(2);
  });

  it('a single tap only ARMS the button — nothing is sent', async () => {
    const user = userEvent.setup();
    render(<AdminWall initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Take down' })[0]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /tap again — final/i })).toBeInTheDocument();
    expect(screen.getByText(/2 hanging/i)).toBeInTheDocument();
  });

  it('the second tap sends the reject verdict and strikes the tile', async () => {
    const user = userEvent.setup();
    render(<AdminWall initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Take down' })[0]);
    await user.click(screen.getByRole('button', { name: /tap again — final/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/tiles/hung-a',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ verdict: 'reject' }) }),
    );
    expect(screen.getByText(/1 hanging/i)).toBeInTheDocument();
  });

  it('arming one tile then tapping another re-arms instead of committing', async () => {
    const user = userEvent.setup();
    render(<AdminWall initialTiles={TILES} />);

    const buttons = screen.getAllByRole('button', { name: 'Take down' });
    await user.click(buttons[0]);
    await user.click(screen.getAllByRole('button', { name: 'Take down' })[0]); // now tile b's button

    // Still nothing sent: the second click armed hung-b, not committed hung-a.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getAllByRole('button', { name: /tap again — final/i })).toHaveLength(1);
  });

  it('drops a stale tile (already ruled on) without an error banner', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid-transition' }), { status: 409 }),
    );
    const user = userEvent.setup();
    render(<AdminWall initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Take down' })[0]);
    await user.click(screen.getByRole('button', { name: /tap again — final/i }));

    expect(screen.getByText(/1 hanging/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the tile and surfaces an error on transient failure', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(<AdminWall initialTiles={TILES} />);

    await user.click(screen.getAllByRole('button', { name: 'Take down' })[0]);
    await user.click(screen.getByRole('button', { name: /tap again — final/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/2 hanging/i)).toBeInTheDocument();
  });

  it('offers Check again when the wall is bare', async () => {
    const user = userEvent.setup();
    render(<AdminWall initialTiles={[]} />);
    await user.click(screen.getByRole('button', { name: 'Check again' }));
    expect(refresh).toHaveBeenCalled();
  });
});
