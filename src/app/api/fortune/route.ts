import Anthropic from '@anthropic-ai/sdk';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const isChatMessage = (m: unknown): m is ChatMessage => {
  if (typeof m !== 'object' || m === null) return false;
  const { role, content } = m as { role?: unknown; content?: unknown };
  return (
    (role === 'user' || role === 'assistant') &&
    typeof content === 'string' &&
    content.length > 0 &&
    content.length <= MAX_MESSAGE_CHARS
  );
};

/** Parse + validate the request body; null means reject with 400. */
const parseMessages = (body: unknown): ChatMessage[] | null => {
  if (typeof body !== 'object' || body === null) return null;
  const { messages } = body as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;
  if (!messages.every(isChatMessage)) return null;
  const capped = messages.slice(-MAX_TURNS);
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
      } catch {
        // mid-stream failure — end the reading; the panel keeps what arrived
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
  if (origin && host && new URL(origin).host !== host) {
    return new Response('forbidden', { status: 403 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return new Response('too large', { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
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

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: MAX_TOKENS,
    system: buildSystemPrompt(),
    messages,
  });

  return textStream(async (emit) => {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        emit(event.delta.text);
      }
    }
  });
}
