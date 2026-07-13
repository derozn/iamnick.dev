import demoInstances from './demo-instances.json';

/**
 * The Synty demo scene's per-prefab transforms, keyed by prefab name — each
 * value is a list of `[..unityTRS]` rows. The JSON import is typed once here so
 * consumers don't each re-cast it.
 */
export const demoData = demoInstances as Record<string, number[][]>;
