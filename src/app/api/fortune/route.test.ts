import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetRateLimit } from './rateLimit';

/**
 * Route-handler tests. The Anthropic SDK is mocked — the "stream" it returns
 * yields two text deltas — so these cover validation, stub mode, rate limits
 * and the streaming plumbing without spending tokens.
 */

const mockStream = vi.fn(() =>
  (async function* () {
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'The Ringmaster\n' } };
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'He leads, dearie.' } };
  })(),
);

// A real class — the route `new`s the client, and arrow-fn mocks can't be constructed.
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: mockStream };
  },
}));

import { POST } from './route';

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request('https://iamnick.dev/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', host: 'iamnick.dev', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const ask = (content = 'Has Nick led teams?') => ({ messages: [{ role: 'user', content }] });

beforeEach(() => {
  resetRateLimit();
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  vi.stubEnv('FORTUNE_STUB', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  mockStream.mockClear();
});

describe('POST /api/fortune — validation', () => {
  it('rejects malformed JSON', async () => {
    expect((await post('{nope')).status).toBe(400);
  });

  it('rejects a missing or empty messages array', async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ messages: [] })).status).toBe(400);
  });

  it('rejects bad roles, non-string content and over-long messages', async () => {
    expect((await post({ messages: [{ role: 'system', content: 'x' }] })).status).toBe(400);
    expect((await post({ messages: [{ role: 'user', content: 42 }] })).status).toBe(400);
    expect((await post({ messages: [{ role: 'user', content: 'x'.repeat(1001) }] })).status).toBe(
      400,
    );
  });

  it('rejects a conversation that does not end on a user turn', async () => {
    const res = await post({
      messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'The Lantern\nGreetings.' },
      ],
    });
    expect(res.status).toBe(400);
  });

  it('rejects oversized bodies with 413', async () => {
    expect((await post({ messages: [], pad: 'x'.repeat(40_000) })).status).toBe(413);
  });

  it('rejects cross-origin requests with 403', async () => {
    const res = await post(ask(), { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
  });

  it('rejects a malformed Origin header with 403, not a crash', async () => {
    const res = await post(ask(), { origin: 'not a url' });
    expect(res.status).toBe(403);
  });

  it('accepts a same-origin request', async () => {
    const res = await post(ask(), { origin: 'https://iamnick.dev' });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/fortune — model path', () => {
  it('streams the mocked model reply and caps history at 12 turns', async () => {
    const long = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 ? 'assistant' : 'user',
      content: `turn ${i}`,
    }));
    const res = await post({ messages: long });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('The Ringmaster\nHe leads, dearie.');
    const sent = mockStream.mock.calls[0][0] as unknown as {
      messages: unknown[];
      system: string;
      model: string;
    };
    expect(sent.messages).toHaveLength(12);
    expect(sent.model).toBe('claude-haiku-4-5-20251001');
    // Grounding + guardrails ride in the system prompt.
    expect(sent.system).toContain('Madame Zara');
    expect(sent.system).toContain('<cv>');
    expect(sent.system).toContain('Travelex');
  });

  it('falls back to a canned reading when the model call fails before any text', async () => {
    // The SDK defers auth/connection errors into stream iteration — an invalid
    // key must serve an in-character Reading, not dead air (empty 200).
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing = {
      [Symbol.asyncIterator]: () => ({
        next: () => Promise.reject(Object.assign(new Error('invalid x-api-key'), { status: 401 })),
      }),
    };
    mockStream.mockImplementationOnce(() => failing as unknown as ReturnType<typeof mockStream>);
    const res = await post(ask());
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0); // a full canned reading, not dead air
    expect(text).toContain('\n'); // card-name first line, body after
    expect(consoleError).toHaveBeenCalledWith('[fortune] model call failed:', expect.anything());
    consoleError.mockRestore();
  });

  it('rate-limits the 11th request in a minute with an in-character 429', async () => {
    for (let i = 0; i < 10; i++) expect((await post(ask())).status).toBe(200);
    const res = await post(ask());
    expect(res.status).toBe(429);
    expect(await res.text()).toContain('the spirits grow dizzy');
  });
});

describe('POST /api/fortune — stub mode', () => {
  it('streams a canned reading without touching the model when no key is set', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const res = await post(ask());
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.split('\n')[0]).toBe('The Lantern');
    expect(mockStream).not.toHaveBeenCalled();
  });

  it('honours FORTUNE_STUB=1 even with a key present', async () => {
    vi.stubEnv('FORTUNE_STUB', '1');
    const res = await post(ask());
    expect(res.status).toBe(200);
    expect(mockStream).not.toHaveBeenCalled();
  });
});
