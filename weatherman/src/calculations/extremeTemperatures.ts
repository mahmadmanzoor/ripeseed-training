/**
 * Extreme temperature and humidity calculations
 * 
 * This module provides functionality to find extreme values (highest/lowest) in weather data.
 * It uses a generic approach to eliminate code duplication while maintaining type safety.
 * All functions include comprehensive data validation to ensure only realistic values
 * are considered for extreme value calculations.
 */

import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Finds the day with the highest maximum temperature
 * 
 * This function searches through all weather records to find the day with the
 * highest maximum temperature. It delegates to the generic findExtremeValue
 * function with appropriate parameters.
 * 
 * @param weatherRecords - Array of weather records to search through
 * @returns Object containing the date and temperature of the hottest day, or undefined if no valid data
 */
export function findHottestDay(weatherRecords: WeatherRecord[]): { date: Date; maximumTemperatureCelsius: number } | undefined {
  return findExtremeValue(weatherRecords, 'maximum', 'temperature') as { date: Date; maximumTemperatureCelsius: number } | undefined;
}

/**
 * Finds the day with the lowest minimum temperature
 * 
 * This function searches through all weather records to find the day with the
 * lowest minimum temperature. It delegates to the generic findExtremeValue
 * function with appropriate parameters.
 * 
 * @param weatherRecords - Array of weather records to search through
 * @returns Object containing the date and temperature of the coldest day, or undefined if no valid data
 */
export function findColdestDay(weatherRecords: WeatherRecord[]): { date: Date; minimumTemperatureCelsius: number } | undefined {
  return findExtremeValue(weatherRecords, 'minimum', 'temperature') as { date: Date; minimumTemperatureCelsius: number } | undefined;
}

/**
 * Finds the day with the highest mean humidity
 * 
 * This function searches through all weather records to find the day with the
 * highest mean humidity percentage. It delegates to the generic findExtremeValue
 * function with appropriate parameters.
 * 
 * @param weatherRecords - Array of weather records to search through
 * @returns Object containing the date and humidity of the most humid day, or undefined if no valid data
 */
export function findMostHumidDay(weatherRecords: WeatherRecord[]): { date: Date; humidity: number } | undefined {
  return findExtremeValue(weatherRecords, 'maximum', 'humidity') as { date: Date; humidity: number } | undefined;
}

/**
 * Type definitions for the generic extreme value finder
 * 
 * These types enable the generic findExtremeValue function to work with different
 * extreme value types while maintaining type safety.
 */

// Defines whether we're looking for maximum or minimum values
type ExtremeType = 'maximum' | 'minimum';

// Defines whether we're working with temperature or humidity data
type ValueType = 'temperature' | 'humidity';

// Union type representing all possible return types from findExtremeValue
type ExtremeResult = 
  | { date: Date; maximumTemperatureCelsius: number }    // Hottest day result
  | { date: Date; minimumTemperatureCelsius: number }    // Coldest day result
  | { date: Date; humidity: number }                     // Most humid day result
  | undefined;                                           // No valid data found

// Type for tracking extreme records during iteration
type TemperatureRecord = 
  | { date: Date; maximumTemperatureCelsius: number }    // Maximum temperature record
  | { date: Date; minimumTemperatureCelsius: number }    // Minimum temperature record
  | { date: Date; humidity: number }                     // Humidity record
  | undefined;                                           // No record yet

/**
 * Generic function to find extreme values - eliminates code duplication
 * 
 * This function provides a unified approach to finding extreme values (maximum or minimum)
 * for different data types (temperature or humidity). It eliminates code duplication
 * while maintaining type safety through careful use of TypeScript's type system.
 * 
 * @param weatherRecords - Array of weather records to search through
 * @param extremeType - Whether to find 'maximum' or 'minimum' values
 * @param valueType - Whether to work with 'temperature' or 'humidity' data
 * @returns The extreme record found, or undefined if no valid data exists
 */
function findExtremeValue(
  weatherRecords: WeatherRecord[], 
  extremeType: ExtremeType, 
  valueType: ValueType
): ExtremeResult {
  let extremeRecord: TemperatureRecord = undefined;  // Track the current extreme record
  
  // Iterate through all weather records to find the extreme value
  for (const weatherRecord of weatherRecords) {
    let currentValue: number;    // The value we're examining from this record
    let propertyName: string;    // The property name for building the result object
    
    // Determine which property to examine based on value type
    if (valueType === 'temperature') {
      if (extremeType === 'maximum') {
        currentValue = weatherRecord.maximumTemperatureCelsius ?? NaN;  // Use nullish coalescing for safety
        propertyName = 'maximumTemperatureCelsius';
      } else {
        currentValue = weatherRecord.minimumTemperatureCelsius ?? NaN;  // Use nullish coalescing for safety
        propertyName = 'minimumTemperatureCelsius';
      }
    } else {
      // For humidity, we always look for maximum (most humid)
      currentValue = weatherRecord.meanHumidity ?? NaN;  // Use nullish coalescing for safety
      propertyName = 'humidity';
    }
    
    // Only process records with valid values (finite numbers within reasonable bounds)
    const isValidTemperature = valueType === 'temperature' && 
      currentValue != null &&                    // Must not be null/undefined
      Number.isFinite(currentValue) &&           // Must be a finite number (not NaN/Infinity)
      currentValue >= -100 &&                    // Realistic minimum temperature
      currentValue <= 60;                        // Realistic maximum temperature
      
    const isValidHumidity = valueType === 'humidity' && 
      currentValue != null &&                    // Must not be null/undefined
      Number.isFinite(currentValue) &&           // Must be a finite number
      currentValue >= 0 &&                       // Humidity cannot be negative
      currentValue <= 100;                       // Humidity cannot exceed 100%
    
    if (isValidTemperature || isValidHumidity) {
      // Check if this record should become the new extreme
      // For maximum: current > existing, for minimum: current < existing
      let shouldUpdate = !extremeRecord;  // First valid record becomes the initial extreme
      
      if (extremeRecord && propertyName in extremeRecord) {
        const existingValue = (extremeRecord as any)[propertyName];  // Type assertion needed for dynamic property access
        shouldUpdate = extremeType === 'maximum' ? currentValue > existingValue : currentValue < existingValue;
      }
        
      if (shouldUpdate) {
        // Create new extreme record with computed property name
        extremeRecord = { date: weatherRecord.date, [propertyName]: currentValue } as TemperatureRecord;
      }
    }
  }
  
  return extremeRecord;
}
