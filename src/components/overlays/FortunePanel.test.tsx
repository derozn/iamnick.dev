import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FortunePanel } from './FortunePanel';

/** A one-shot text/plain streaming Response, like the /api/fortune route's. */
const streamResponse = (text: string) =>
  new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FortunePanel', () => {
  it('shows the invitation and opener questions before any reading', () => {
    render(<FortunePanel />);
    expect(screen.getByText(/the cards know this carnival/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Has Nick led teams?' })).toBeInTheDocument();
  });

  it('streams a reading and renders the first line as the card heading', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(streamResponse('The Juggler\nMany things kept aloft, dearie.'));
    const user = userEvent.setup();
    render(<FortunePanel />);

    await user.type(screen.getByRole('textbox'), 'Has Nick led teams?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await waitFor(() => expect(screen.getByText('The Juggler')).toBeInTheDocument());
    expect(screen.getByText(/many things kept aloft/i)).toBeInTheDocument();
    // The question itself is echoed into the log…
    expect(screen.getByText('Has Nick led teams?', { selector: 'p' })).toBeInTheDocument();
    // …and the route got the history, capped client-side.
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      messages: { role: string; content: string }[];
    };
    expect(body.messages).toEqual([{ role: 'user', content: 'Has Nick led teams?' }]);
  });

  it('renders a card-less reply entirely as body text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      streamResponse(
        'A first line far too long to be the name of any card in the deck, dearie.\nMore.',
      ),
    );
    const user = userEvent.setup();
    render(<FortunePanel />);

    await user.click(screen.getByRole('button', { name: 'Why hire Nick?' }));
    await waitFor(() =>
      expect(screen.getByText(/far too long to be the name/i)).toBeInTheDocument(),
    );
  });

  it('answers a failed request with the in-character mist reply', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));
    const user = userEvent.setup();
    render(<FortunePanel />);

    await user.type(screen.getByRole('textbox'), 'Anything there?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await waitFor(() =>
      expect(screen.getByText(/the mists are thick tonight/i)).toBeInTheDocument(),
    );
    expect(screen.getByText('The Veiled Lamp')).toBeInTheDocument();
  });
});
