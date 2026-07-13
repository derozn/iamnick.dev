import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SiteNav } from './SiteNav';
import { useSceneStore } from '@/store/scene';
import { ATTRACTIONS } from '@/components/three/synty/attractions';

const reset = () =>
  useSceneStore.setState({ mode: 'travelling', activeAttraction: null, focusedAttraction: null });

beforeEach(reset);
afterEach(reset);

describe('SiteNav', () => {
  it('opens the quick-view drawer and lists every attraction except the intro', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const drawer = screen.getByRole('navigation', { name: 'Quick view' });
    expect(drawer).toBeInTheDocument();
    for (const a of ATTRACTIONS.filter((x) => x.id !== 'intro')) {
      expect(screen.getByRole('button', { name: new RegExp(a.title) })).toBeInTheDocument();
    }
    expect(screen.queryByText('Nick de Rozarieux', { selector: 'nav *' })).not.toBeInTheDocument();
  });

  it('quick-views a non-game attraction by opening its content panel in place', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('button', { name: /Career/ }));

    expect(useSceneStore.getState().mode).toBe('viewing');
    expect(useSceneStore.getState().activeAttraction).toBe('work');
  });

  it('routes a game attraction through the camera fly-in, not an in-place panel', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('button', { name: /Ball Toss/i }));

    // games need the scene: focus() flies the camera, mode stays travelling
    expect(useSceneStore.getState().focusedAttraction).toBe('ball-toss');
    expect(useSceneStore.getState().mode).toBe('travelling');
  });

  it('hides the burger while a panel or game owns the top-right', () => {
    useSceneStore.setState({ mode: 'viewing', activeAttraction: 'work' });
    render(<SiteNav />);
    expect(screen.queryByRole('button', { name: /menu/i })).not.toBeInTheDocument();
  });
});
