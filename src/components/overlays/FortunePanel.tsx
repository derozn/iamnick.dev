'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport, type UIMessage } from 'ai';

// NB: no @react-three/* imports — this lives in the static bundle.

/**
 * FortunePanel — Madame Zara's letterpress chat, raised by ContentOverlay for
 * the fortune-teller wagon (`chat:fortune`). Ephemeral per visit: history lives
 * in useChat state, not the scene store. Streams from /api/fortune via the AI
 * SDK's text-stream transport (the route speaks plain text, NOT the default
 * SSE UI-message protocol — the transport choice is load-bearing).
 *
 * Reply protocol (shared with the route): the first line of a reading is the
 * drawn card's name (rendered as the letterpress heading); the rest is the
 * reading itself. A too-long first line means the model skipped the card —
 * treat the whole reply as body.
 */

const FORTUNE_ROUTE = '/api/fortune';

/** Turns of history sent to the route (the server enforces its own cap too). */
const MAX_TURNS = 12;
/** First lines longer than this aren't card names — render them as body text. */
const MAX_CARD_LEN = 40;

const MIST_REPLY =
  'The Veiled Lamp\nThe mists are thick tonight, dearie — the cards will not settle. Ask again in a moment.';

// NB: keep in step with the CV — these name real employers/roles.
const OPENERS = ['Has Nick led teams?', 'What did he do at Gousto?', 'Why hire Nick?'];

/** Concatenated text of a UIMessage (text streams produce text parts only). */
const textOf = (m: UIMessage): string =>
  m.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('');

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
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: FORTUNE_ROUTE,
        // The route's wire contract predates useChat: {messages: [{role, content}]},
        // capped client-side too. Map UIMessages down rather than change the API.
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages: messages.slice(-MAX_TURNS).map((m) => ({ role: m.role, content: textOf(m) })),
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, stop, status, error, clearError } = useChat({ transport });
  const streaming = status === 'submitted' || status === 'streaming';

  // Focus the wager — er, the question — on open; abort any in-flight reading
  // on close. `stop` rides in a ref (written in an effect — never in render)
  // so the unmount cleanup always calls the latest one without re-running.
  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);
  useEffect(() => {
    inputRef.current?.focus();
    return () => void stopRef.current();
  }, []);

  // Hand the quill back once the cards have spoken.
  useEffect(() => {
    if (status === 'ready') inputRef.current?.focus();
  }, [status]);

  // Keep the newest words in view as the reading streams in.
  // (scrollTop assignment, not scrollTo() — jsdom implements only the former.)
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || streaming) return;
    if (error) clearError();
    setInput('');
    void sendMessage({ text: q });
  };

  // Failures render in character: a 429 carries an in-character reading as the
  // error body (the transport surfaces it as error.message); anything else
  // falls to the mist reply. The errored partial reading is dropped, as before.
  const errorReading = error ? (error.message.includes('\n') ? error.message : MIST_REPLY) : null;
  const visible =
    errorReading && messages[messages.length - 1]?.role === 'assistant'
      ? messages.slice(0, -1)
      : messages;

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
        {visible.length === 0 && !errorReading && (
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
                    onClick={() => ask(o)}
                    className="paper-chip cursor-pointer rounded-[2px] px-2.5 py-1 font-fell text-[13px] hover:text-oxblood"
                  >
                    {o}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {visible.map((m) => {
          const text = textOf(m);
          if (m.role === 'assistant' && text === '') return null;
          return m.role === 'user' ? (
            <p
              key={m.id}
              className="ml-auto max-w-[85%] w-fit rounded-[2px] border border-ink/15 bg-ink/5 px-3 py-2 font-fell text-[14px] text-ink"
            >
              {text}
            </p>
          ) : (
            <Reading key={m.id} content={text} />
          );
        })}
        {errorReading && <Reading content={errorReading} />}
        {streaming &&
          (visible[visible.length - 1]?.role === 'user' ||
            textOf(visible[visible.length - 1]) === '') && (
            <p className="font-fell text-[14px] italic text-ink-soft">
              Madame Zara is reading the cards…
            </p>
          )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
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
