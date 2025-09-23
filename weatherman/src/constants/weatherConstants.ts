/**
 * Centralized configuration constants for weather application
 */

/**
 * Weather data column names for CSV parsing
 */
export const WEATHER_DATA_COLUMNS = {
  DATE: "PKT",
  MAXIMUM_TEMPERATURE_CELSIUS: "Max TemperatureC",
  MINIMUM_TEMPERATURE_CELSIUS: "Min TemperatureC", 
  MEAN_TEMPERATURE_CELSIUS: "Mean TemperatureC",
  MAXIMUM_HUMIDITY: "Max Humidity",
  MINIMUM_HUMIDITY: "Min Humidity",
  MEAN_HUMIDITY: "Mean Humidity"
} as const;

// File processing constants
export const FILE_PROCESSING = {
  SUPPORTED_EXTENSIONS: [".txt", ".csv"],
  DEFAULT_ENCODING: "utf-8",
  CSV_OPTIONS: {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }
} as const;

// Date parsing constants
export const DATE_PARSING = {
  DEFAULT_TIMEZONE: "UTC",
  SUPPORTED_TIMEZONES: ["PKT", "UTC", "GMT", "EST", "PST", "CST", "MST"]
} as const;

// Chart constants
export const CHART_CONSTANTS = {
  BAR_LENGTH: 30,
  MINIMUM_BAR_LENGTH: 1,
  DEFAULT_TEMPERATURE_OFFSET: 1
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_YEAR_FORMAT: "Please provide a valid year after -e (e.g., -e 2004)",
  INVALID_MONTH_FORMAT: "Please provide a valid month after -a (e.g., -a 2004/08)",
  INVALID_CHART_MONTH_FORMAT: "Please provide a valid month after -c (e.g., -c 2011/03)",
  MISSING_DATA_DIRECTORY: "Please provide a data directory path.",
  NO_DATA_AVAILABLE: "No data available",
  NO_DATA_FOUND_FOR_YEAR: "No data found for this year.",
  NO_DATA_FOUND_FOR_MONTH: "No data found for this month.",
  NO_AVERAGES_CALCULATED: "No averages could be calculated for this month."
} as const;

// Display constants
export const DISPLAY_CONSTANTS = {
  CELSIUS_SUFFIX: "C",
  PERCENTAGE_SUFFIX: "%",
  NO_DATA_AVAILABLE_TEXT: "No data available",
  USAGE_MESSAGE: "Usage: node dist/main.js <data-dir> [-e <year>] [-a <year/month>] [-c <year/month>]"
} as const;

// Command line constants
export const COMMAND_LINE = {
  MINIMUM_ARGUMENTS: 2,
  YEAR_REGEX: /^\d{4}$/,
  MONTH_REGEX: /^\d{4}\/\d{1,2}$/,
  COMBINED_CHART_REGEX: /^\d{4}\/\d{1,2}$/,
  TWO_DIGIT_MONTH_REGEX: /^\d{4}\/\d{2}$/,
  EXTREME_FLAG: "-e",
  AVERAGE_FLAG: "-a", 
  CHART_FLAG: "-c"
} as const;

