export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  return sortedValues.length % 2 !== 0
    ? sortedValues[middleIndex]
    : (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (!values.length) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.floor((percentile / 100) * sortedValues.length)));

  return sortedValues[index];
}
