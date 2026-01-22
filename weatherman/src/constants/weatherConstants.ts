/**
 * Centralized configuration constants for weather application
 * 
 * This module contains all configuration constants used throughout the application.
 * Centralizing these values makes the application easier to maintain and modify.
 * All constants are marked as 'const' to prevent accidental modifications.
 */

/**
 * Weather data column names for CSV parsing
 * 
 * These constants map the expected column names in CSV files to our internal
 * property names. This abstraction allows us to handle different CSV formats
 * by simply changing these mappings.
 * 
 * Note: The actual CSV files use "PKT" as the date column header, which we
 * map to our internal "DATE" constant for consistency.
 */
export const WEATHER_DATA_COLUMNS = {
  DATE: "PKT",                                    // Date column header in CSV files
  MAXIMUM_TEMPERATURE_CELSIUS: "Max TemperatureC", // Maximum temperature column
  MINIMUM_TEMPERATURE_CELSIUS: "Min TemperatureC", // Minimum temperature column
  MEAN_TEMPERATURE_CELSIUS: "Mean TemperatureC",   // Average temperature column
  MAXIMUM_HUMIDITY: "Max Humidity",               // Maximum humidity column
  MINIMUM_HUMIDITY: "Min Humidity",               // Minimum humidity column
  MEAN_HUMIDITY: "Mean Humidity"                  // Average humidity column
} as const;

/**
 * File processing configuration constants
 * 
 * These constants define how the application handles file I/O operations.
 * They ensure consistent behavior across all file processing operations.
 */
export const FILE_PROCESSING = {
  SUPPORTED_EXTENSIONS: [".txt", ".csv"],  // File extensions that the app can process
  DEFAULT_ENCODING: "utf-8",               // Character encoding for file reading
  CSV_OPTIONS: {                           // Configuration for CSV parsing library
    columns: true,                         // Use first row as column headers
    skip_empty_lines: true,                // Ignore empty lines in CSV files
    trim: true                             // Remove whitespace from cell values
  }
} as const;

/**
 * Date parsing configuration constants
 * 
 * These constants handle timezone and date parsing logic. They ensure
 * consistent date handling across different timezone formats found in
 * weather data files.
 */
export const DATE_PARSING = {
  DEFAULT_TIMEZONE: "UTC",                                    // Fallback timezone for ambiguous dates
  SUPPORTED_TIMEZONES: ["PKT", "UTC", "GMT", "EST", "PST", "CST", "MST"]  // Recognized timezone abbreviations
} as const;

/**
 * Chart generation configuration constants
 * 
 * These constants control the visual appearance and behavior of temperature
 * charts. They ensure consistent chart formatting and handle edge cases
 * like when all temperatures are the same value.
 */
export const CHART_CONSTANTS = {
  BAR_LENGTH: 30,                    // Maximum length of temperature bars in characters
  MINIMUM_BAR_LENGTH: 1,             // Minimum bar length to ensure visibility
  DEFAULT_TEMPERATURE_OFFSET: 1      // Temperature offset when min equals max (prevents division by zero)
} as const;

/**
 * User-facing error messages
 * 
 * These constants provide consistent, user-friendly error messages throughout
 * the application. Centralizing them makes it easier to maintain consistent
 * messaging and enables future internationalization.
 */
export const ERROR_MESSAGES = {
  INVALID_YEAR_FORMAT: "Please provide a valid year after -e (e.g., -e 2004)",           // Invalid year format error
  INVALID_MONTH_FORMAT: "Please provide a valid month after -a (e.g., -a 2004/08)",     // Invalid month format error
  INVALID_CHART_MONTH_FORMAT: "Please provide a valid month after -c (e.g., -c 2011/03)", // Invalid chart month format error
  MISSING_DATA_DIRECTORY: "Please provide a data directory path.",                      // Missing data directory error
  NO_DATA_AVAILABLE: "No data available",                                               // No data available message
  NO_DATA_FOUND_FOR_YEAR: "No data found for this year.",                              // No data for year message
  NO_DATA_FOUND_FOR_MONTH: "No data found for this month.",                            // No data for month message
  NO_AVERAGES_CALCULATED: "No averages could be calculated for this month."            // No averages calculated message
} as const;

/**
 * Display formatting constants
 * 
 * These constants control how data is formatted and displayed to users.
 * They ensure consistent formatting across all output operations.
 */
export const DISPLAY_CONSTANTS = {
  CELSIUS_SUFFIX: "C",                                                                  // Temperature unit suffix
  PERCENTAGE_SUFFIX: "%",                                                               // Humidity unit suffix
  USAGE_MESSAGE: "Usage: node dist/main.js <data-dir> [-e <year>] [-a <year/month>] [-c <year/month>]"  // Help message template
} as const;

/**
 * Command line interface constants
 * 
 * These constants define the command line interface behavior, including
 * argument validation patterns and flag definitions. They ensure consistent
 * CLI behavior and make it easy to modify the interface.
 */
export const COMMAND_LINE = {
  MINIMUM_ARGUMENTS: 2,                    // Minimum required arguments (data-dir + at least one flag)
  YEAR_REGEX: /^\d{4}$/,                   // Regex to validate 4-digit year format
  MONTH_REGEX: /^\d{4}\/\d{1,2}$/,         // Regex to validate year/month format (1-2 digit month)
  COMBINED_CHART_REGEX: /^\d{4}\/\d{1,2}$/, // Regex for combined chart detection
  TWO_DIGIT_MONTH_REGEX: /^\d{4}\/\d{2}$/, // Regex to validate 2-digit month format
  EXTREME_FLAG: "-e",                      // Flag for extreme value reports
  AVERAGE_FLAG: "-a",                      // Flag for average value reports
  CHART_FLAG: "-c"                         // Flag for chart reports
} as const;

