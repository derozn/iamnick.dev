import path from 'path';

export const UI_PACKAGE_NAME = '@iamnick/ui';

const getDirectoryPath = (packageName: string) =>
  path.dirname(require.resolve(`${packageName}/package.json`));

const generateContentPath = (packageName: string) =>
  `${getDirectoryPath(packageName)}/src/**/*.{js,ts,jsx,tsx,mdx}`;

const generateAssetsPath = (packageName: string) => `${getDirectoryPath(packageName)}/src/assets`;

export const host = './src/**/*.{js,ts,jsx,tsx,mdx}';
export const ui = generateContentPath(UI_PACKAGE_NAME);
export const uiAssets = generateAssetsPath(UI_PACKAGE_NAME);
