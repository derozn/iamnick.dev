import { describe, expect, it } from 'vitest';

import { serializeCv } from './serializeCv';
import { roles, sideProjects, skillGroups } from './cv';

describe('serializeCv', () => {
  it('is deterministic and matches the snapshot (Madame Zara grounding prompt)', () => {
    const text = serializeCv();
    expect(text).toBe(serializeCv());
    expect(text).toMatchSnapshot();
  });

  it('carries every role, project and skill group — nothing silently dropped', () => {
    const text = serializeCv();
    for (const r of roles) expect(text).toContain(r.company);
    for (const p of sideProjects) expect(text).toContain(p.name);
    for (const g of skillGroups) expect(text).toContain(g.label);
  });
});
