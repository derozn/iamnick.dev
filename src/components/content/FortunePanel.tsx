'use client';

import { useEffect, useRef, useState } from 'react';

// NB: no @react-three/* imports — this lives in the static bundle.

/**
 * FortunePanel — Madame Zara's letterpress chat, raised by ContentOverlay for
 * the fortune-teller wagon (`chat:fortune`). Ephemeral per visit: history lives
 * in component state, not the scene store. Streams from /api/fortune with a
 * plain fetch + ReadableStream reader.
 *
 * Reply protocol (shared with the route): the first line of a reading is the
 * drawn card's name (rendered as the letterpress heading); the rest is the
 * reading itself. A too-long first line means the model skipped the card —
 * treat the whole reply as body.
 */

interface FortuneMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Turns of history sent to the route (the server enforces its own cap too). */
const MAX_TURNS = 12;
/** First lines longer than this aren't card names — render them as body text. */
const MAX_CARD_LEN = 40;

const MIST_REPLY =
  'The Veiled Lamp\nThe mists are thick tonight, dearie — the cards will not settle. Ask again in a moment.';

const OPENERS = ['Has Nick led teams?', 'What did he do at Gousto?', 'Why hire Nick?'];

const splitCard = (text: string): { card: string | null; body: string } => {
  const nl = text.indexOf('\n');
  const first = nl === -1 ? text : text.slice(0, nl);
  if (nl === -1 || first.length > MAX_CARD_LEN) return { card: null, body: text };
  return { card: first.trim(), body: text.slice(nl + 1).trim() };
};

function Reading({ content }: { content: string }) {
  const { card, body } = splitCard(content);
  return (
    <div>
      {card && (
        <p className="font-rye letterpress text-[17px] leading-tight text-oxblood">{card}</p>
      )}
      <p className="mt-1 whitespace-pre-wrap font-fell text-[14px] leading-relaxed text-ink/90">
        {body}
      </p>
    </div>
  );
}

export function FortunePanel() {
  const [messages, setMessages] = useState<FortuneMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Focus the wager — er, the question — on open; abort any in-flight reading on close.
  useEffect(() => {
    inputRef.current?.focus();
    const ac = abortRef;
    return () => ac.current?.abort();
  }, []);

  // Keep the newest words in view as the reading streams in.
  // (scrollTop assignment, not scrollTo() — jsdom implements only the former.)
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || streaming) return;
    const history = [...messages, { role: 'user' as const, content: q }];
    setMessages(history);
    setInput('');
    setStreaming(true);
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-MAX_TURNS) }),
        signal: controller.signal,
      });
      // 429s stream an in-character reading too (rate limit / daily budget) —
      // render those; anything else falls to the mist reply.
      if ((!res.ok && res.status !== 429) || !res.body) throw new Error(`fortune: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      setMessages((m) => [...m, { role: 'assistant', content: '' }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const snapshot = text;
        setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: snapshot }]);
      }
    } catch {
      if (abortRef.current?.signal.aborted) return; // panel closed mid-reading
      setMessages((m) => {
        const kept = m[m.length - 1]?.role === 'assistant' ? m.slice(0, -1) : m;
        return [...kept, { role: 'assistant', content: MIST_REPLY }];
      });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex max-h-[70vh] min-h-[380px] flex-col">
      <div className="mb-3 flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-6 shrink-0 bg-brass/70" />
        <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">
          She sees all · Ask of Nick
        </p>
      </div>
      <h2 className="font-rye letterpress text-[30px] leading-tight text-ink md:text-[38px]">
        Madame Zara
      </h2>

      <div
        ref={listRef}
        role="log"
        aria-label="Readings"
        aria-live="polite"
        className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1"
      >
        {messages.length === 0 && (
          <div>
            <p className="max-w-prose font-fell text-[15px] italic leading-relaxed text-ink/80">
              &ldquo;Sit, sit. The cards know this carnival&rsquo;s keeper well — his craft, his
              travels, his works. Ask, and they will speak.&rdquo;
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {OPENERS.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => void ask(o)}
                    className="paper-chip cursor-pointer rounded-[2px] px-2.5 py-1 font-fell text-[13px] hover:text-oxblood"
                  >
                    {o}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'assistant' && m.content === '' ? null : m.role === 'user' ? (
            <p
              key={i}
              className="ml-auto max-w-[85%] w-fit rounded-[2px] border border-ink/15 bg-ink/5 px-3 py-2 font-fell text-[14px] text-ink"
            >
              {m.content}
            </p>
          ) : (
            <Reading key={i} content={m.content} />
          ),
        )}
        {streaming &&
          (messages[messages.length - 1]?.role === 'user' ||
            messages[messages.length - 1]?.content === '') && (
            <p className="font-fell text-[14px] italic text-ink-soft">
              Madame Zara is reading the cards…
            </p>
          )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="mt-5 flex items-end gap-3 border-t border-ink/20 pt-4"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cross my palm with a question…"
          aria-label="Ask Madame Zara about Nick"
          maxLength={280}
          className="w-full border-b border-ink/40 bg-transparent pb-1 font-fell text-[15px] text-ink outline-none placeholder:text-ink-soft/70 focus:border-oxblood"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="paper-button shrink-0 rounded-[3px] px-4 py-2 font-fell-sc text-[13px] tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
