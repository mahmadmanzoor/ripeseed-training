import type { weatherModel } from "../models/weatherModel.js";

export interface MonthlyAverages {
  avgMaxTemp: number | undefined;
  avgMinTemp: number | undefined;
  avgMeanHumidity: number | undefined;
}


export function calculateMonthlyAverages(data: weatherModel[]): MonthlyAverages | undefined {
  if (!data.length) return undefined;

  let maxSum = 0, maxCount = 0;
  let minSum = 0, minCount = 0;
  let humiditySum = 0, humidityCount = 0;

  for (const r of data) {
    if (r.maxTempC !== undefined) {
      maxSum += r.maxTempC;
      maxCount++;
    }
    if (r.minTempC !== undefined) {
      minSum += r.minTempC;
      minCount++;
    }
    if (r.meanHumidity !== undefined) {
      humiditySum += r.meanHumidity;
      humidityCount++;
    }
  }

  if (maxCount === 0 && minCount === 0 && humidityCount === 0) return undefined;

  return {
    avgMaxTemp: maxCount ? maxSum / maxCount : undefined,
    avgMinTemp: minCount ? minSum / minCount : undefined,
    avgMeanHumidity: humidityCount ? humiditySum / humidityCount : undefined,
  };
}
