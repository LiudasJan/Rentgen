/**
 * Calculates the median value from an array of numbers
 *
 * The median is the middle value in a sorted dataset. For arrays with an odd number
 * of elements, it returns the middle element. For arrays with an even number of
 * elements, it returns the average of the two middle elements.
 *
 * This function is particularly useful for performance analysis where the median
 * provides a more representative central tendency than the mean, as it's less
 * affected by outliers.
 *
 * @param values - Array of numeric values to calculate median from
 * @returns The median value, or 0 if array is empty
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  return sortedValues.length % 2 !== 0
    ? sortedValues[middleIndex]
    : (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
}

/**
 * Calculates a specific percentile from an array of numbers
 *
 * Percentiles indicate the value below which a given percentage of observations fall.
 * For example, the 90th percentile is the value below which 90% of the data points lie.
 * This is extremely useful for performance analysis and SLA monitoring.
 *
 * Common percentiles:
 * - 50th percentile = median
 * - 90th percentile = P90 (performance monitoring)
 * - 95th percentile = P95 (SLA analysis)
 * - 99th percentile = P99 (tail latency analysis)
 *
 * @param values - Array of numeric values to calculate percentile from
 * @param percentile - Percentile to calculate (0-100)
 * @returns The value at the specified percentile, or 0 if array is empty
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (!values.length) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.floor((percentile / 100) * sortedValues.length)));

  return sortedValues[index];
}
