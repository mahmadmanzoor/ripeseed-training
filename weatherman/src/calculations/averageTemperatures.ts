/**
 * Monthly average temperature and humidity calculations
 * 
 * This module provides functionality to calculate monthly averages for temperature
 * and humidity data. It includes robust data validation and handles missing data
 * gracefully by using NaN to indicate when averages cannot be calculated.
 */

import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Monthly average weather data interface
 * 
 * This interface represents the calculated monthly averages for weather data.
 * Values can be NaN if no valid data was available for that particular metric.
 * 
 * @property averageMaximumTemperature - Average of daily maximum temperatures
 * @property averageMinimumTemperature - Average of daily minimum temperatures  
 * @property averageMeanHumidity - Average of daily mean humidity percentages
 */
export interface MonthlyAverages {
  averageMaximumTemperature: number;    // Average maximum temperature for the month
  averageMinimumTemperature: number;    // Average minimum temperature for the month
  averageMeanHumidity: number;          // Average mean humidity for the month
}

/**
 * Calculates monthly averages for temperature and humidity data
 * 
 * This function processes an array of weather records and calculates the monthly
 * averages for maximum temperature, minimum temperature, and mean humidity.
 * 
 * The function includes comprehensive data validation to ensure only valid,
 * realistic values are included in the calculations. Invalid or missing data
 * is filtered out, and NaN is returned for metrics where no valid data exists.
 * 
 * @param weatherRecords - Array of weather records to process
 * @returns MonthlyAverages object with calculated averages, or undefined if no data
 */
export function calculateMonthlyAverages(weatherRecords: WeatherRecord[]): MonthlyAverages | undefined {
  // Early return for empty input - no data to process
  if (!weatherRecords.length) return undefined;

  // Use functional programming to calculate sums and counts
  // Filter based on reasonable bounds: temperature between -100°C and 60°C, humidity between 0% and 100%
  
  // Extract and validate maximum temperatures
  const validMaxTemps = weatherRecords
    .filter(record => 
      record.maximumTemperatureCelsius != null &&           // Must not be null/undefined
      Number.isFinite(record.maximumTemperatureCelsius) &&  // Must be a finite number (not NaN/Infinity)
      record.maximumTemperatureCelsius >= -100 &&           // Realistic minimum temperature
      record.maximumTemperatureCelsius <= 60                // Realistic maximum temperature
    )
    .map(record => record.maximumTemperatureCelsius!);      // Extract the validated values
  
  // Extract and validate minimum temperatures
  const validMinTemps = weatherRecords
    .filter(record => 
      record.minimumTemperatureCelsius != null &&           // Must not be null/undefined
      Number.isFinite(record.minimumTemperatureCelsius) &&  // Must be a finite number
      record.minimumTemperatureCelsius >= -100 &&           // Realistic minimum temperature
      record.minimumTemperatureCelsius <= 60                // Realistic maximum temperature
    )
    .map(record => record.minimumTemperatureCelsius!);      // Extract the validated values
  
  // Extract and validate humidity data
  const validHumidity = weatherRecords
    .filter(record => 
      record.meanHumidity != null &&           // Must not be null/undefined
      Number.isFinite(record.meanHumidity) &&  // Must be a finite number
      record.meanHumidity >= 0 &&              // Humidity cannot be negative
      record.meanHumidity <= 100               // Humidity cannot exceed 100%
    )
    .map(record => record.meanHumidity!);      // Extract the validated values

  // Calculate sums and counts for each metric using functional programming
  const maximumTemperatureSum = validMaxTemps.reduce((sum, temp) => sum + temp, 0);    // Sum of all valid max temps
  const maximumTemperatureCount = validMaxTemps.length;                                // Count of valid max temp records
  
  const minimumTemperatureSum = validMinTemps.reduce((sum, temp) => sum + temp, 0);    // Sum of all valid min temps
  const minimumTemperatureCount = validMinTemps.length;                                // Count of valid min temp records
  
  const humiditySum = validHumidity.reduce((sum, humidity) => sum + humidity, 0);      // Sum of all valid humidity values
  const humidityCount = validHumidity.length;                                          // Count of valid humidity records

  // If no valid data was found across all metrics, return undefined
  if (maximumTemperatureCount === 0 && minimumTemperatureCount === 0 && humidityCount === 0) {
    return undefined;
  }

  // Calculate averages, using NaN for missing data to indicate no valid data available
  // This approach clearly distinguishes between "no data" (NaN) and "zero result" (0)
  return {
    averageMaximumTemperature: maximumTemperatureCount > 0 ? maximumTemperatureSum / maximumTemperatureCount : NaN,
    averageMinimumTemperature: minimumTemperatureCount > 0 ? minimumTemperatureSum / minimumTemperatureCount : NaN,
    averageMeanHumidity: humidityCount > 0 ? humiditySum / humidityCount : NaN,
  };
}
