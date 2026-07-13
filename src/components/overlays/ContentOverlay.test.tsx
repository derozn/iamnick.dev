import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ContentOverlay } from './ContentOverlay';
import { useSceneStore } from '@/store/scene';

const reset = () =>
  useSceneStore.setState({ mode: 'travelling', activeAttraction: null, focusedAttraction: null });

beforeEach(reset);
afterEach(() => {
  reset();
  document.body.style.overflow = '';
});

// Focus-trap behaviour itself is verified in the browser (e2e); here we cover the
// open/close wiring and the body-scroll lock.
describe('ContentOverlay', () => {
  it('renders nothing while travelling', () => {
    render(<ContentOverlay />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('raises a labelled modal dialog for the active attraction', () => {
    useSceneStore.setState({ mode: 'viewing', activeAttraction: 'about' });
    render(<ContentOverlay />);
    const dialog = screen.getByRole('dialog', { name: 'About' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('locks body scroll while open and restores it on close', () => {
    useSceneStore.setState({ mode: 'viewing', activeAttraction: 'about' });
    const { rerender } = render(<ContentOverlay />);
    expect(document.body.style.overflow).toBe('hidden');

    reset();
    rerender(<ContentOverlay />);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('closes on Escape (via the shared keydown hook)', async () => {
    useSceneStore.setState({ mode: 'viewing', activeAttraction: 'about' });
    const user = userEvent.setup();
    render(<ContentOverlay />);
    await user.keyboard('{Escape}');
    expect(useSceneStore.getState().mode).toBe('travelling');
  });

  it('closes when the backdrop is clicked', async () => {
    useSceneStore.setState({ mode: 'viewing', activeAttraction: 'about' });
    const user = userEvent.setup();
    render(<ContentOverlay />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(useSceneStore.getState().mode).toBe('travelling');
  });
});
