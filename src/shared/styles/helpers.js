export const getVariable = (...keys) => props => keys.reduce((value, key) => value[key], props);

export const getThemeVariable = (...keys) => getVariable('theme', ...keys);
