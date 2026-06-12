// Stub for Phase 1 — full token-based config arrives in Phase 2
export interface ITwMergeConfig {
  prefix?: string;
}

export const createTwMergeConfig = ({ prefix }: ITwMergeConfig = {}) => ({
  prefix,
  cacheSize: 2000,
});

export const twMergeConfig = createTwMergeConfig({ prefix: 'ui-' });
