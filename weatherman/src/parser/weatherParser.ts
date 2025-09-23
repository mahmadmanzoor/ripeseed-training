/**
 * Weather data file parsing and processing
 */

import fs from "fs";
import path from "path";

import { parse } from "csv-parse/sync";

import { WEATHER_DATA_COLUMNS, DATE_PARSING, FILE_PROCESSING } from "../constants/weatherConstants.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Parses weather values with intelligent defaults based on data type
 */
function parseWeatherValue(value: string | undefined, type: 'temperature' | 'humidity'): number {
  return !value?.trim() || Number.isNaN(Number(value.trim())) 
    ? (type === 'temperature' ? 0 : 50) 
    : Number(value.trim());
}

/**
 * Checks if a weather record has valid data (not all default values)
 */
function hasValidData(record: WeatherRecord): boolean {
  return record.maximumTemperatureCelsius !== 0 ||
         record.minimumTemperatureCelsius !== 0 ||
         record.meanHumidity !== 50;
}

/**
 * Safely parses date strings with robust timezone handling
 */
function parseDateSafely(dateString: string): Date {
  try {
    // Strategy 1: Try parsing the date string as-is first
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Strategy 2: Handle different timezone formats
    const trimmedDate = dateString.trim();

    // Check if the date string contains any known timezone indicators
    const hasTimezone = DATE_PARSING.SUPPORTED_TIMEZONES.some(timezone =>
      trimmedDate.includes(timezone)
    );

    if (hasTimezone) {
      // If it has a recognized timezone, parse it directly
      return new Date(trimmedDate);
    } else {
      // Strategy 3: If no timezone detected, treat as UTC to avoid timezone issues
      const utcDateString = trimmedDate.endsWith('Z') ? trimmedDate : trimmedDate + 'Z';
      const utcDate = new Date(utcDateString);

      if (!isNaN(utcDate.getTime())) {
        return utcDate;
      }
    }

    // Strategy 4: Final fallback - try parsing as local time
    return new Date(trimmedDate);
  } catch (error) {
    // Strategy 5: Ultimate fallback - return current date with warning
    console.warn(`Failed to parse date: ${dateString}. Using current date as fallback.`);
    return new Date();
  }
}

/**
 * Parses all supported weather data files from a directory
 */
export function parseWeatherFiles(directoryPath: string): WeatherRecord[] {
  // Resolve the directory path to handle relative paths
  const resolvedDirectoryPath = path.resolve(directoryPath);
  const weatherDataFiles = getSupportedWeatherFiles(resolvedDirectoryPath);

  let allWeatherRecords: WeatherRecord[] = [];

  // Process each supported weather data file
  for (const fileName of weatherDataFiles) {
    const filePath = path.join(resolvedDirectoryPath, fileName);
    const fileContent = fs.readFileSync(filePath, FILE_PROCESSING.DEFAULT_ENCODING);

    // Parse CSV content using configured options
    const csvRecords = parse(fileContent, FILE_PROCESSING.CSV_OPTIONS);

    // Transform CSV rows into WeatherRecord objects
    const weatherRecords: WeatherRecord[] = csvRecords
      .map((csvRow: any): WeatherRecord => {
        // Parse all values with intelligent defaults
        const maximumHumidity = parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MAXIMUM_HUMIDITY], 'humidity');
        const minimumHumidity = parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MINIMUM_HUMIDITY], 'humidity');
        const meanHumidity = parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MEAN_HUMIDITY], 'humidity');

        // Business logic: calculate mean humidity from max/min if mean is default value
        const finalMeanHumidity = meanHumidity !== 50 
          ? meanHumidity 
          : (maximumHumidity !== 50 && minimumHumidity !== 50)
            ? (maximumHumidity + minimumHumidity) / 2 
            : 50;

        return {
          date: parseDateSafely(String(csvRow[WEATHER_DATA_COLUMNS.DATE])),
          maximumTemperatureCelsius: parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MAXIMUM_TEMPERATURE_CELSIUS], 'temperature'),
          minimumTemperatureCelsius: parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MINIMUM_TEMPERATURE_CELSIUS], 'temperature'),
          meanTemperatureCelsius: parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MEAN_TEMPERATURE_CELSIUS], 'temperature'),
          maximumHumidity,
          minimumHumidity,
          meanHumidity: finalMeanHumidity,
        };
      })
      // Filter out records with invalid dates or no valid data at all
      .filter((weatherRecord): weatherRecord is WeatherRecord => 
        !isNaN(weatherRecord.date.getTime()) && hasValidData(weatherRecord)
      );

    // Combine records from all files
    allWeatherRecords = allWeatherRecords.concat(weatherRecords);
  }

  return allWeatherRecords;
}

/**
 * Gets list of supported weather data files from a directory
 */
function getSupportedWeatherFiles(directoryPath: string): string[] {
  // Return empty array if directory doesn't exist
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  // Filter files by supported extensions
  return fs.readdirSync(directoryPath).filter(file =>
    FILE_PROCESSING.SUPPORTED_EXTENSIONS.some(extension => file.endsWith(extension))
  );
}
