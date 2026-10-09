export function arraySum(arr: number[]): number {
  return arr.reduce((acc, curr) => acc + curr, 0);
}
