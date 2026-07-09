/**
 * Madame Zara — the fortune-teller chat endpoint (see
 * docs/redesign/fortune-teller-ai-handoff.md).
 *
 * Currently the STUBBED stream: a canned, in-character reading trickled out
 * chunk by chunk so the panel's fetch + ReadableStream path is exercised for
 * real before any model is involved. The Anthropic call, grounding prompt and
 * abuse guardrails replace the canned deck next.
 *
 * Reply protocol (shared with FortunePanel): plain text; the FIRST line is the
 * drawn card's name, everything after the first newline is the reading.
 */
export const runtime = 'edge';

const STUB_READINGS = [
  'The Lantern\nAh, you wish to know of Nick… The Lantern shows a lead engineer at Travelex, guiding five others through the rebuilding of a website that spans the globe. The cards rarely flatter, dearie — but this is a strong hand.',
  'The Juggler\nI see many things kept aloft — React, Node, TypeScript, a decade of consumer products that never touched the ground. Ask me of a particular feat, and the cards will speak plainer.',
  'The High Striker\nStrength, and the proof of it! The cards recall a kiosk in one hundred and ten stores, a platform reborn, a team led well. Ring the bell yourself — ask what you truly wish to know.',
];

/** Best-effort turn count from the request body — the stub only uses it to vary the canned reading. */
const countTurns = (body: unknown): number => {
  if (typeof body !== 'object' || body === null) return 0;
  const messages = (body as { messages?: unknown }).messages;
  return Array.isArray(messages) ? messages.length : 0;
};

export async function POST(req: Request): Promise<Response> {
  let turns = 0;
  try {
    turns = countTurns(await req.json());
  } catch {
    // malformed body — the stub answers anyway; real validation lands with the model
  }
  const reading = STUB_READINGS[Math.floor(turns / 2) % STUB_READINGS.length];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Word-at-a-time with a short beat, so the panel's streaming UI is honest.
      for (const word of reading.split(/(?<=\s)/)) {
        controller.enqueue(encoder.encode(word));
        await new Promise((r) => setTimeout(r, 24));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
