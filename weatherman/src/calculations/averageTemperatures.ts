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
  // Filter based on reasonable bounds: temperature between -100°C and 60°C, humidity between 0% and 100%
  const validMaxTemps = weatherRecords
    .filter(record => 
      record.maximumTemperatureCelsius != null && 
      Number.isFinite(record.maximumTemperatureCelsius) &&
      record.maximumTemperatureCelsius >= -100 && 
      record.maximumTemperatureCelsius <= 60
    )
    .map(record => record.maximumTemperatureCelsius!);
  
  const validMinTemps = weatherRecords
    .filter(record => 
      record.minimumTemperatureCelsius != null && 
      Number.isFinite(record.minimumTemperatureCelsius) &&
      record.minimumTemperatureCelsius >= -100 && 
      record.minimumTemperatureCelsius <= 60
    )
    .map(record => record.minimumTemperatureCelsius!);
  
  const validHumidity = weatherRecords
    .filter(record => 
      record.meanHumidity != null && 
      Number.isFinite(record.meanHumidity) &&
      record.meanHumidity >= 0 && 
      record.meanHumidity <= 100
    )
    .map(record => record.meanHumidity!);

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

  // Calculate averages, using NaN for missing data to indicate no valid data available
  return {
    averageMaximumTemperature: maximumTemperatureCount > 0 ? maximumTemperatureSum / maximumTemperatureCount : NaN,
    averageMinimumTemperature: minimumTemperatureCount > 0 ? minimumTemperatureSum / minimumTemperatureCount : NaN,
    averageMeanHumidity: humidityCount > 0 ? humiditySum / humidityCount : NaN,
  };
}
