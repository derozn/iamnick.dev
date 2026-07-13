import { expect, test } from '@playwright/test';

const URL = 'http://localhost:3000/api/fortune';
const ORIGIN = 'http://localhost:3000';

/** The route's guardrails, exercised directly (no browser). Stub mode → the 200s
 *  stream a canned reading without a model call. */
test.describe('/api/fortune contract', () => {
  test('200: a well-formed same-origin request streams a reading', async ({ request }) => {
    const res = await request.post(URL, {
      headers: { origin: ORIGIN },
      data: { messages: [{ role: 'user', content: 'What does Nick do?' }] },
    });
    expect(res.status()).toBe(200);
    expect((await res.text()).length).toBeGreaterThan(0);
  });

  test('400: malformed body is rejected', async ({ request }) => {
    const res = await request.post(URL, { headers: { origin: ORIGIN }, data: { nope: true } });
    expect(res.status()).toBe(400);
  });

  test('400: a conversation not ending on a user turn is rejected', async ({ request }) => {
    const res = await request.post(URL, {
      headers: { origin: ORIGIN },
      data: {
        messages: [
          { role: 'user', content: 'hi' },
          { role: 'assistant', content: 'The Lantern\nGreetings.' },
        ],
      },
    });
    expect(res.status()).toBe(400);
  });

  test('403: a cross-origin request is refused', async ({ request }) => {
    const res = await request.post(URL, {
      headers: { origin: 'https://evil.example' },
      data: { messages: [{ role: 'user', content: 'hi' }] },
    });
    expect(res.status()).toBe(403);
  });

  test('413: an oversized body is refused', async ({ request }) => {
    const res = await request.post(URL, {
      headers: { origin: ORIGIN },
      data: { messages: [{ role: 'user', content: 'x' }], pad: 'y'.repeat(40_000) },
    });
    expect(res.status()).toBe(413);
  });
});
