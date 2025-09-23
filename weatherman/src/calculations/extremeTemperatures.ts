/**
 * Extreme temperature and humidity calculations
 */

import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Finds the day with the highest maximum temperature
 */
export function findHottestDay(weatherRecords: WeatherRecord[]): { date: Date; maximumTemperatureCelsius: number } | undefined {
  return findExtremeValue(weatherRecords, 'maximum', 'temperature') as { date: Date; maximumTemperatureCelsius: number } | undefined;
}

/**
 * Finds the day with the lowest minimum temperature
 */
export function findColdestDay(weatherRecords: WeatherRecord[]): { date: Date; minimumTemperatureCelsius: number } | undefined {
  return findExtremeValue(weatherRecords, 'minimum', 'temperature') as { date: Date; minimumTemperatureCelsius: number } | undefined;
}

/**
 * Finds the day with the highest mean humidity
 */
export function findMostHumidDay(weatherRecords: WeatherRecord[]): { date: Date; humidity: number } | undefined {
  return findExtremeValue(weatherRecords, 'maximum', 'humidity') as { date: Date; humidity: number } | undefined;
}

// Type definitions for the generic extreme value finder
type ExtremeType = 'maximum' | 'minimum';
type ValueType = 'temperature' | 'humidity';
type ExtremeResult = 
  | { date: Date; maximumTemperatureCelsius: number }
  | { date: Date; minimumTemperatureCelsius: number }
  | { date: Date; humidity: number }
  | undefined;

/**
 * Generic function to find extreme values - eliminates code duplication
 */
function findExtremeValue(
  weatherRecords: WeatherRecord[], 
  extremeType: ExtremeType, 
  valueType: ValueType
): ExtremeResult {
  let extremeRecord: any;
  
  // Iterate through all weather records to find the extreme value
  for (const weatherRecord of weatherRecords) {
    let currentValue: number;
    let propertyName: string;
    
    // Determine which property to examine based on value type
    if (valueType === 'temperature') {
      if (extremeType === 'maximum') {
        currentValue = weatherRecord.maximumTemperatureCelsius;
        propertyName = 'maximumTemperatureCelsius';
      } else {
        currentValue = weatherRecord.minimumTemperatureCelsius;
        propertyName = 'minimumTemperatureCelsius';
      }
    } else {
      // For humidity, we always look for maximum (most humid)
      currentValue = weatherRecord.meanHumidity;
      propertyName = 'humidity';
    }
    
    // Only process records with non-default values
    const isValidTemperature = valueType === 'temperature' && currentValue !== 0;
    const isValidHumidity = valueType === 'humidity' && currentValue !== 50;
    
    if (isValidTemperature || isValidHumidity) {
      // Check if this record should become the new extreme
      // For maximum: current > existing, for minimum: current < existing
      const shouldUpdate = !extremeRecord || 
        (extremeType === 'maximum' ? currentValue > extremeRecord[propertyName] : currentValue < extremeRecord[propertyName]);
        
      if (shouldUpdate) {
        extremeRecord = { date: weatherRecord.date, [propertyName]: currentValue };
      }
    }
  }
  
  return extremeRecord;
}
