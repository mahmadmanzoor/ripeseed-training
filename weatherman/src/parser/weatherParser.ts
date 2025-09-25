/**
 * Weather data file parsing and processing
 * 
 * This module handles the parsing of weather data files (CSV/TXT format) and converts
 * them into structured WeatherRecord objects. It includes robust error handling,
 * data validation, and intelligent parsing strategies for different data formats.
 * 
 * Key features:
 * - Supports multiple file formats (.txt, .csv)
 * - Handles missing or invalid data gracefully
 * - Robust date parsing with timezone support
 * - Data validation and filtering
 * - Business logic for calculating missing values
 */

import fs from "fs";                    // Node.js file system module for file operations
import path from "path";                // Node.js path module for cross-platform path handling

import { parse } from "csv-parse/sync"; // CSV parsing library for converting CSV text to objects

import { WEATHER_DATA_COLUMNS, DATE_PARSING, FILE_PROCESSING } from "../constants/weatherConstants.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * CSV row type definition matching the expected column structure
 * 
 * This type represents a single row from a CSV file. It's a simple Record type
 * that allows any string key with string | undefined values, providing flexibility
 * for different CSV formats while maintaining type safety.
 * 
 * Using Record<string, string | undefined> is an industry standard approach that
 * is simple, understandable, and flexible for CSV parsing scenarios.
 */
type CsvRow = Record<string, string | undefined>;

/**
 * Parses weather values with null for missing data
 * 
 * This function safely converts string values from CSV files to numbers,
 * handling missing or invalid data gracefully. It returns null for any
 * value that cannot be parsed as a valid number.
 * 
 * @param value - The string value to parse (can be undefined)
 * @param type - The type of data being parsed (for future extensibility)
 * @returns The parsed number or null if the value is invalid/missing
 */
function parseWeatherValue(value: string | undefined, type: 'temperature' | 'humidity'): number | null {
  // Check if value exists and is not just whitespace, and if it can be converted to a valid number
  if (!value?.trim() || Number.isNaN(Number(value.trim()))) {
    return null; // Return null for missing/invalid data
  }
  return Number(value.trim()); // Convert to number and return
}

/**
 * Checks if a weather record has valid data (not all null values)
 * 
 * This function determines whether a weather record contains any useful data.
 * A record is considered valid if it has at least one non-null temperature
 * or humidity value. This prevents processing completely empty records.
 * 
 * @param record - The weather record to validate
 * @returns true if the record has at least one valid data point, false otherwise
 */
function hasValidData(record: WeatherRecord): boolean {
  return record.maximumTemperatureCelsius != null ||    // Has maximum temperature data
         record.minimumTemperatureCelsius != null ||    // Has minimum temperature data
         record.meanHumidity != null;                   // Has humidity data
}

/**
 * Safely parses date strings with robust timezone handling
 * 
 * This function implements a multi-strategy approach to parsing date strings
 * from weather data files. It handles various date formats and timezone
 * indicators commonly found in weather data, with graceful fallback strategies.
 * 
 * Key features:
 * - Checks for timezone indicators in the original string before any manipulation
 * - Handles ISO date-only strings (YYYY-MM-DD or YYYY-M-D) with local timezone to prevent day/month drift
 * - Accepts both zero-padded and single-digit month/day formats
 * - Uses local Date constructor for ISO dates to avoid UTC interpretation issues
 * - Avoids adding 'Z' suffix to non-ISO formats
 * - Maintains backward compatibility with existing date formats
 * 
 * The function returns an invalid Date object on failure, which allows
 * downstream filtering to remove problematic records without crashing.
 * 
 * @param dateString - The date string to parse
 * @returns A valid Date object or an invalid Date if parsing fails
 */
function parseDateSafely(dateString: string): Date {
  try {
    const trimmedDate = dateString.trim();
    
    // Strategy 1: Check for timezone indicators in the original string
    const hasTimezone = DATE_PARSING.SUPPORTED_TIMEZONES.some(timezone =>
      trimmedDate.includes(timezone)
    );

    if (hasTimezone) {
      // If timezone is present, parse the string as-is
      const parsedDate = new Date(trimmedDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Strategy 2: Handle ISO date-only strings (YYYY-MM-DD or YYYY-M-D) with local parsing
    // This prevents day/month drift caused by UTC interpretation
    const isoDateOnlyMatch = trimmedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoDateOnlyMatch && isoDateOnlyMatch[1] && isoDateOnlyMatch[2] && isoDateOnlyMatch[3]) {
      const yearStr = isoDateOnlyMatch[1];
      const monthStr = isoDateOnlyMatch[2];
      const dayStr = isoDateOnlyMatch[3];
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // Convert to 0-based month index
      const day = parseInt(dayStr, 10);
      
      // Create Date using local components to avoid timezone issues
      const localDate = new Date(year, month, day);
      if (!isNaN(localDate.getTime())) {
        return localDate;
      }
    }

    // Strategy 3: Try parsing as local time (no timezone manipulation)
    const parsedDate = new Date(trimmedDate);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Strategy 4: Final fallback - return invalid Date
    return new Date('Invalid Date');
  } catch (error) {
    // Return an invalid Date so the downstream filter can drop the row
    // This approach allows the parsing to continue with other records
    return new Date('Invalid Date');
  }
}

/**
 * Parses all supported weather data files from a directory
 * 
 * This is the main entry point for parsing weather data files. It processes
 * all supported files in a directory and converts them into structured
 * WeatherRecord objects. The function handles file discovery, parsing,
 * data transformation, and validation.
 * 
 * @param directoryPath - Path to the directory containing weather data files
 * @returns Array of WeatherRecord objects. Returns empty array if directory doesn't exist or contains no valid files
 */
export function parseWeatherFiles(directoryPath: string): WeatherRecord[] {
  // Resolve the directory path to handle relative paths correctly
  const resolvedDirectoryPath = path.resolve(directoryPath);
  const weatherDataFiles = getSupportedWeatherFiles(resolvedDirectoryPath);

  let allWeatherRecords: WeatherRecord[] = [];  // Accumulate records from all files

  // Process each supported weather data file
  for (const fileName of weatherDataFiles) {
    const filePath = path.join(resolvedDirectoryPath, fileName);  // Build full file path
    const fileContent = fs.readFileSync(filePath, FILE_PROCESSING.DEFAULT_ENCODING);  // Read file content

    // Parse CSV content using configured options
    const csvRecords = parse(fileContent, FILE_PROCESSING.CSV_OPTIONS);

    // Transform CSV rows into WeatherRecord objects
    const weatherRecords: WeatherRecord[] = (csvRecords as CsvRow[])
      .map((csvRow: CsvRow): WeatherRecord => {
        // Parse all humidity values first
        const maximumHumidity = parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MAXIMUM_HUMIDITY], 'humidity');
        const minimumHumidity = parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MINIMUM_HUMIDITY], 'humidity');
        const meanHumidity = parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MEAN_HUMIDITY], 'humidity');

        // Business logic: calculate mean humidity from max/min if mean is null
        // This provides intelligent defaults for missing data
        const finalMeanHumidity = meanHumidity != null 
          ? meanHumidity  // Use existing mean if available
          : (maximumHumidity != null && minimumHumidity != null)
            ? (maximumHumidity + minimumHumidity) / 2  // Calculate mean from max/min
            : null;  // No data available

        return {
          date: parseDateSafely(String(csvRow[WEATHER_DATA_COLUMNS.DATE])),  // Parse date with robust error handling
          maximumTemperatureCelsius: parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MAXIMUM_TEMPERATURE_CELSIUS], 'temperature'),
          minimumTemperatureCelsius: parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MINIMUM_TEMPERATURE_CELSIUS], 'temperature'),
          meanTemperatureCelsius: parseWeatherValue(csvRow[WEATHER_DATA_COLUMNS.MEAN_TEMPERATURE_CELSIUS], 'temperature'),
          maximumHumidity,
          minimumHumidity,
          meanHumidity: finalMeanHumidity,  // Use calculated or original mean humidity
        };
      })
      // Filter out records with invalid dates or no valid data at all
      .filter((weatherRecord): weatherRecord is WeatherRecord =>
        !Number.isNaN(weatherRecord.date.getTime()) && hasValidData(weatherRecord)
      );

    // Combine records from all files
    allWeatherRecords = allWeatherRecords.concat(weatherRecords);
  }

  return allWeatherRecords;
}

/**
 * Gets list of supported weather data files from a directory
 * 
 * This function discovers all files in a directory that match the supported
 * file extensions (.txt, .csv). It handles the case where the directory
 * doesn't exist gracefully by returning an empty array.
 * 
 * @param directoryPath - Path to the directory to search
 * @returns Array of filenames that match supported extensions, or empty array if directory doesn't exist
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