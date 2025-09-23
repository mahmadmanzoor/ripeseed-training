/**
 * Monthly average temperature and humidity calculations
 */

import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Monthly average weather data interface
 */
export interface MonthlyAverages {
  averageMaximumTemperature: number;
  averageMinimumTemperature: number;
  averageMeanHumidity: number;
}

/**
 * Calculates monthly averages for temperature and humidity data
 */
export function calculateMonthlyAverages(weatherRecords: WeatherRecord[]): MonthlyAverages | undefined {
  // Early return for empty input - no data to process
  if (!weatherRecords.length) return undefined;

  // Use functional programming to calculate sums and counts
  const validMaxTemps = weatherRecords
    .filter(record => record.maximumTemperatureCelsius !== 0)
    .map(record => record.maximumTemperatureCelsius);
  
  const validMinTemps = weatherRecords
    .filter(record => record.minimumTemperatureCelsius !== 0)
    .map(record => record.minimumTemperatureCelsius);
  
  const validHumidity = weatherRecords
    .filter(record => record.meanHumidity !== 50)
    .map(record => record.meanHumidity);

  const maximumTemperatureSum = validMaxTemps.reduce((sum, temp) => sum + temp, 0);
  const maximumTemperatureCount = validMaxTemps.length;
  
  const minimumTemperatureSum = validMinTemps.reduce((sum, temp) => sum + temp, 0);
  const minimumTemperatureCount = validMinTemps.length;
  
  const humiditySum = validHumidity.reduce((sum, humidity) => sum + humidity, 0);
  const humidityCount = validHumidity.length;

  // If no valid data was found across all metrics, return undefined
  if (maximumTemperatureCount === 0 && minimumTemperatureCount === 0 && humidityCount === 0) {
    return undefined;
  }

  // Calculate averages, using defaults for missing data
  return {
    averageMaximumTemperature: maximumTemperatureCount > 0 ? maximumTemperatureSum / maximumTemperatureCount : 0,
    averageMinimumTemperature: minimumTemperatureCount > 0 ? minimumTemperatureSum / minimumTemperatureCount : 0,
    averageMeanHumidity: humidityCount > 0 ? humiditySum / humidityCount : 50,
  };
}
