export const arrayEquality = (a, b) => {
  if (a.length !== b.length) return false;
  a.sort();
  b.sort();

  return a.every((el, i) => {
    return el === b[i];
  });
};
