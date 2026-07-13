import { type Page, expect } from '@playwright/test';

/** The debug bridge exposes the zustand store on window under ?debug=1. */
interface SceneStoreState {
  sceneReady: boolean;
  started: boolean;
  mode: string;
  activeAttraction: string | null;
  open: (id: string) => void;
  close: () => void;
  focus: (id: string) => void;
  start: () => void;
}
declare global {
  interface Window {
    __sceneStore?: { getState: () => SceneStoreState };
  }
}

/** Load the scene, wait for assets, and click through the intro to the live overview. */
export async function bootScene(page: Page, query = '') {
  await page.goto(`/?debug=1&bloom=0${query}`, { waitUntil: 'load' });
  await expect
    .poll(() => page.evaluate(() => window.__sceneStore?.getState().sceneReady === true), {
      // SwiftShader on CI loads the 250+ GLBs far slower than a real GPU.
      timeout: process.env.CI ? 120_000 : 45_000,
    })
    .toBe(true);
  await page.evaluate(() => window.__sceneStore!.getState().start());
  await expect
    .poll(() => page.evaluate(() => window.__sceneStore?.getState().started === true))
    .toBe(true);
}

export const store = (page: Page) => ({
  get: () => page.evaluate(() => window.__sceneStore!.getState()),
  open: (id: string) => page.evaluate((i) => window.__sceneStore!.getState().open(i), id),
  close: () => page.evaluate(() => window.__sceneStore!.getState().close()),
  focus: (id: string) => page.evaluate((i) => window.__sceneStore!.getState().focus(i), id),
});
