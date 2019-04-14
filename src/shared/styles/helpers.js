export const getVariable = (...keys) => props => keys.reduce((value, key) => value[key], props);

export const getThemeVariable = (...keys) => getVariable('theme', ...keys);

export const getVariableWithModifications = (fn, cb) => (...props) => {
  const result = fn(...props);
  return cb(result);
};
