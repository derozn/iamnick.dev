import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { z } from 'zod';

import {
  buildSystemPrompt,
  BUDGET_READING,
  MAX_MESSAGE_CHARS,
  MAX_TOKENS,
  MAX_TURNS,
  RATE_LIMIT_READING,
  STUB_READINGS,
} from './persona';
import { checkRateLimit } from './rateLimit';

/**
 * Madame Zara — the fortune-teller chat endpoint (see
 * docs/redesign/fortune-teller-ai-handoff.md). The repo's first server-side
 * runtime dependency: an Edge route streaming Claude Haiku, grounded in
 * serializeCv() via the persona prompt, with input validation and best-effort
 * rate limiting (see ./rateLimit.ts for the Upstash upgrade path).
 *
 * Stub mode — no ANTHROPIC_API_KEY, or FORTUNE_STUB=1 — streams a canned
 * in-character reading instead, so dev/headless verification never spends
 * tokens and the panel works before the key is configured.
 *
 * Reply protocol (shared with FortunePanel): plain text; the FIRST line is the
 * drawn card's name, everything after the first newline is the reading.
 */
export const runtime = 'edge';

/** Body ceiling well above 12 × 1k-char messages + JSON overhead. */
const MAX_BODY_BYTES = 32_768;

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
});

const BodySchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
});

type ChatMessage = z.infer<typeof ChatMessageSchema>;

/** Parse + validate the request body; null means reject with 400. */
const parseMessages = (body: unknown): ChatMessage[] | null => {
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return null;
  const capped = parsed.data.messages.slice(-MAX_TURNS);
  if (capped[capped.length - 1].role !== 'user') return null;
  return capped;
};

const textStream = (
  produce: (emit: (chunk: string) => void) => Promise<void>,
  status = 200,
): Response => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await produce((chunk) => controller.enqueue(encoder.encode(chunk)));
      } catch (err) {
        // mid-stream failure — end the reading; the panel keeps what arrived
        console.error('[fortune] stream failed mid-reading:', err);
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

/** Word-at-a-time canned reading, so the panel's streaming UI stays honest. */
const cannedStream = (reading: string, status = 200): Response =>
  textStream(async (emit) => {
    for (const word of reading.split(/(?<=\s)/)) {
      emit(word);
      await new Promise((r) => setTimeout(r, 24));
    }
  }, status);

export async function POST(req: Request): Promise<Response> {
  // Origin check: browser requests carry Origin on cross-site POSTs — reject
  // anything not from this site. (Requests without Origin, e.g. curl, are
  // bounded by the rate limits below.)
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    // A malformed Origin must read as forbidden, not crash the handler with a 500.
    try {
      if (new URL(origin).host !== host) return new Response('forbidden', { status: 403 });
    } catch {
      return new Response('forbidden', { status: 403 });
    }
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return new Response('too large', { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    console.error('[fortune] unparseable body:', raw.slice(0, 120));
    return new Response('bad request', { status: 400 });
  }
  const messages = parseMessages(body);
  if (!messages) return new Response('bad request', { status: 400 });

  // Stub mode — canned reading, no model, no rate limiting (dev + headless).
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || process.env.FORTUNE_STUB === '1') {
    return cannedStream(STUB_READINGS[Math.floor(messages.length / 2) % STUB_READINGS.length]);
  }

  // Abuse/cost controls (in-character replies, honest status codes).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const verdict = checkRateLimit(ip);
  if (verdict === 'rate-limited') return cannedStream(RATE_LIMIT_READING, 429);
  if (verdict === 'budget-exhausted') return cannedStream(BUDGET_READING, 429);

  const anthropic = createAnthropic({ apiKey });
  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    maxOutputTokens: MAX_TOKENS,
    system: buildSystemPrompt(),
    messages,
    // The AI SDK MASKS stream errors — textStream just ends (verified against
    // ai@7: an invalid key yields zero chunks and no throw). onError is the
    // only hook that sees the real failure.
    onError: ({ error }) => console.error('[fortune] model call failed:', error),
  });

  // Deliberately NOT result.toTextStreamResponse(): our wrapper preserves the
  // canned-fallback contract. A model that fails before a single word (bad
  // key, network) must serve a canned Reading, not dead air; a failure
  // mid-reading ends the stream and the panel keeps what arrived. Zara never
  // legitimately replies with nothing, so empty === failed.
  return textStream(async (emit) => {
    let emitted = false;
    for await (const text of result.textStream) {
      emit(text);
      emitted = true;
    }
    if (!emitted) {
      emit(STUB_READINGS[Math.floor(messages.length / 2) % STUB_READINGS.length]);
    }
  });
}
