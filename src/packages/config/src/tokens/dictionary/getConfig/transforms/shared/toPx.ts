export const toPx = (val: string | number) => {
  const value = val.toString();

  return value.includes('px') ? value : `${value}px`;
};
