/**
 * Weather chart generation module
 * 
 * This module provides functionality to generate visual temperature charts
 * in the terminal. It supports both individual temperature charts and
 * combined charts showing both maximum and minimum temperatures on the same line.
 * 
 * Key features:
 * - Visual temperature bars with color coding (red for hot, blue for cold)
 * - Automatic scaling based on temperature range
 * - Support for missing data with graceful handling
 * - Combined charts for side-by-side temperature comparison
 * - Professional formatting with proper alignment
 */

import chalk from "chalk";  // Terminal color library for colored output

import { CHART_CONSTANTS, DISPLAY_CONSTANTS, ERROR_MESSAGES } from "../constants/weatherConstants.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Generates a standard temperature chart report
 * 
 * This function creates a visual chart showing daily maximum and minimum
 * temperatures as horizontal bars. Each day is displayed on a separate line
 * with colored bars representing the temperature values.
 * 
 * @param weatherRecords - Array of weather records to display
 * @param year - Year for the chart
 * @param month - Month for the chart
 */
export function generateChartReport(weatherRecords: WeatherRecord[], year: number, month: number): void {
  const chartContext = createChartContext(weatherRecords, year, month);  // Prepare chart data
  renderChart(chartContext, (weatherRecord, temperatureRange, formattedDay) => 
    displayTemperatureBars(weatherRecord, temperatureRange, formattedDay)  // Render individual temperature bars
  );
}

/**
 * Displays the chart header with month and year
 * 
 * This function creates a user-friendly header for the chart by converting
 * the numeric month to a readable month name.
 * 
 * @param year - Year to display
 * @param month - Month to display (1-12)
 */
function displayChartHeader(year: number, month: number): void {
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long" });  // Convert to month name
  console.log(`\n${monthName} ${year}`);  // Display formatted header
}

/**
 * Creates a map of weather data indexed by day of month
 * 
 * This function converts an array of weather records into a Map for efficient
 * O(1) lookup by day number. This optimization allows quick access to data
 * for specific days during chart rendering.
 * 
 * @param weatherRecords - Array of weather records to index
 * @returns Map with day number as key and WeatherRecord as value
 */
function createWeatherDataMap(weatherRecords: WeatherRecord[]): Map<number, WeatherRecord> {
  const dataMap = new Map<number, WeatherRecord>();  // Initialize empty map
  for (const weatherRecord of weatherRecords) {
    dataMap.set(weatherRecord.date.getDate(), weatherRecord);  // Index by day of month (1-31)
  }
  return dataMap;
}

/**
 * Calculates the temperature range for chart scaling
 * 
 * This function finds the minimum and maximum temperatures from all weather records
 * to determine the scale for the chart bars. It handles the edge case where all
 * temperatures are the same by creating an artificial range to prevent division by zero.
 * 
 * @param weatherRecords - Array of weather records to analyze
 * @returns Object containing minimum and maximum temperatures
 */
function calculateTemperatureRange(weatherRecords: WeatherRecord[]): { minimum: number; maximum: number } {
  let minimumTemperature = Infinity;   // Start with infinity to ensure any real temperature is lower
  let maximumTemperature = -Infinity;  // Start with negative infinity to ensure any real temperature is higher
  
  // Find the actual min and max temperatures from the data
  for (const weatherRecord of weatherRecords) {
    if (weatherRecord.maximumTemperatureCelsius != null) {
      maximumTemperature = Math.max(maximumTemperature, weatherRecord.maximumTemperatureCelsius);
    }
    if (weatherRecord.minimumTemperatureCelsius != null) {
      minimumTemperature = Math.min(minimumTemperature, weatherRecord.minimumTemperatureCelsius);
    }
  }

  // Handle edge cases where only one series exists or no data is available
  // This prevents NaN values in normalization and .repeat() calls
  
  // If minimum is still Infinity (no minimum temperatures found)
  if (minimumTemperature === Infinity) {
    if (maximumTemperature === -Infinity) {
      // No temperature data at all - use default range
      minimumTemperature = 0;
      maximumTemperature = CHART_CONSTANTS.DEFAULT_TEMPERATURE_OFFSET;
    } else {
      // Only maximum temperatures found - set minimum relative to maximum
      minimumTemperature = maximumTemperature - CHART_CONSTANTS.DEFAULT_TEMPERATURE_OFFSET;
    }
  }
  
  // If maximum is still -Infinity (no maximum temperatures found)
  if (maximumTemperature === -Infinity) {
    if (minimumTemperature === Infinity) {
      // No temperature data at all - use default range
      minimumTemperature = 0;
      maximumTemperature = CHART_CONSTANTS.DEFAULT_TEMPERATURE_OFFSET;
    } else {
      // Only minimum temperatures found - set maximum relative to minimum
      maximumTemperature = minimumTemperature + CHART_CONSTANTS.DEFAULT_TEMPERATURE_OFFSET;
    }
  }

  // Handle edge case where all temperatures are the same
  // This prevents division by zero in bar length calculations
  if (minimumTemperature === maximumTemperature) {
    minimumTemperature = maximumTemperature - CHART_CONSTANTS.DEFAULT_TEMPERATURE_OFFSET;
  }
  
  return { minimum: minimumTemperature, maximum: maximumTemperature };
}

/**
 * Formats day number with zero padding for consistent alignment
 * 
 * This function ensures that single-digit days are padded with a leading zero
 * for consistent visual alignment in the chart output.
 * 
 * @param day - Day number to format (1-31)
 * @returns Zero-padded day string (e.g., "01", "02", "15")
 */
function formatDayNumber(day: number): string {
  return day.toString().padStart(2, "0");
}

/**
 * Checks if a weather record has any temperature data
 * 
 * This function determines whether a weather record contains any temperature
 * information that can be displayed in a chart.
 * 
 * @param weatherRecord - Weather record to check
 * @returns true if the record has maximum or minimum temperature data
 */
function hasTemperatureData(weatherRecord: WeatherRecord): boolean {
  return weatherRecord.maximumTemperatureCelsius != null ||    // Has maximum temperature
         weatherRecord.minimumTemperatureCelsius != null;      // Has minimum temperature
}

/**
 * Displays a "no data available" message for a specific day
 * 
 * This function shows a consistent message when no temperature data is available
 * for a particular day in the chart.
 * 
 * @param formattedDay - Zero-padded day string to display
 */
function displayNoDataMessage(formattedDay: string): void {
  console.log(`${formattedDay} ${ERROR_MESSAGES.NO_DATA_AVAILABLE}`);
}

/**
 * Displays temperature bars for a weather record
 * 
 * This function displays both maximum and minimum temperature bars for a given
 * weather record, if the data is available. Each temperature type is displayed
 * on a separate line with appropriate color coding.
 * 
 * @param weatherRecord - Weather record containing temperature data
 * @param temperatureRange - Temperature range for bar scaling
 * @param formattedDay - Zero-padded day string for display
 */
function displayTemperatureBars(
  weatherRecord: WeatherRecord, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  if (weatherRecord.maximumTemperatureCelsius != null) {
    displayMaximumTemperatureBar(weatherRecord.maximumTemperatureCelsius, temperatureRange, formattedDay);
  }
  
  if (weatherRecord.minimumTemperatureCelsius != null) {
    displayMinimumTemperatureBar(weatherRecord.minimumTemperatureCelsius, temperatureRange, formattedDay);
  }
}

/**
 * Displays a maximum temperature bar with red color coding
 * 
 * This function creates and displays a horizontal bar representing the maximum
 * temperature for a specific day. The bar is colored red to indicate hot temperatures.
 * 
 * @param maximumTemperature - Maximum temperature value to display
 * @param temperatureRange - Temperature range for bar scaling
 * @param formattedDay - Zero-padded day string for display
 */
function displayMaximumTemperatureBar(
  maximumTemperature: number, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  const barLength = calculateBarLength(maximumTemperature, temperatureRange);  // Calculate bar length
  const temperatureBar = "+".repeat(barLength);  // Create bar string
  console.log(`${formattedDay} ${chalk.red(temperatureBar)} ${maximumTemperature}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX}`);  // Display with red color
}

/**
 * Displays a minimum temperature bar with blue color coding
 * 
 * This function creates and displays a horizontal bar representing the minimum
 * temperature for a specific day. The bar is colored blue to indicate cold temperatures.
 * 
 * @param minimumTemperature - Minimum temperature value to display
 * @param temperatureRange - Temperature range for bar scaling
 * @param formattedDay - Zero-padded day string for display
 */
function displayMinimumTemperatureBar(
  minimumTemperature: number, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  const barLength = calculateBarLength(minimumTemperature, temperatureRange);  // Calculate bar length
  const temperatureBar = "+".repeat(barLength);  // Create bar string
  console.log(`${formattedDay} ${chalk.blue(temperatureBar)} ${minimumTemperature}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX}`);  // Display with blue color
}

/**
 * Calculates the length of a temperature bar based on the temperature value
 * 
 * This function converts a temperature value into a bar length for visual display.
 * It uses linear scaling to map the temperature range to the available bar length,
 * ensuring that the bar is always at least 1 character long for visibility.
 * 
 * @param temperature - Temperature value to convert to bar length
 * @param temperatureRange - Temperature range for scaling
 * @returns Bar length in characters (minimum 1)
 */
function calculateBarLength(
  temperature: number, 
  temperatureRange: { minimum: number; maximum: number }
): number {
  const normalizedTemperature = (temperature - temperatureRange.minimum) / (temperatureRange.maximum - temperatureRange.minimum);  // Normalize to 0-1 range
  return Math.max(
    CHART_CONSTANTS.MINIMUM_BAR_LENGTH,  // Ensure minimum visibility
    Math.round(normalizedTemperature * CHART_CONSTANTS.BAR_LENGTH)  // Scale to bar length and round
  );
}

/**
 * Generates a combined temperature chart report
 * 
 * This function creates a chart that displays both maximum and minimum temperatures
 * on the same line, separated by a dash. This provides a compact view of the
 * daily temperature range.
 * 
 * @param weatherRecords - Array of weather records to display
 * @param year - Year for the chart
 * @param month - Month for the chart
 */
export function generateCombinedChartReport(weatherRecords: WeatherRecord[], year: number, month: number): void {
  const chartContext = createChartContext(weatherRecords, year, month);  // Prepare chart data
  renderChart(chartContext, (weatherRecord, temperatureRange, formattedDay) => 
    displayCombinedTemperatureBars(weatherRecord, temperatureRange, formattedDay)  // Render combined bars
  );
}

/**
 * Chart context interface
 * 
 * This interface defines the data structure that contains all the information
 * needed to render a temperature chart. It encapsulates the chart state and
 * provides a clean interface for chart rendering functions.
 */
interface ChartContext {
  daysInMonth: number;                                    // Number of days in the month
  weatherDataMap: Map<number, WeatherRecord>;            // Weather data indexed by day
  temperatureRange: { minimum: number; maximum: number }; // Temperature range for scaling
}

/**
 * Creates a chart context with all necessary data for rendering
 * 
 * This function prepares all the data needed for chart rendering, including
 * the chart header, weather data mapping, and temperature range calculation.
 * 
 * @param weatherRecords - Array of weather records to process
 * @param year - Year for the chart
 * @param month - Month for the chart
 * @returns ChartContext object containing all chart data
 */
function createChartContext(weatherRecords: WeatherRecord[], year: number, month: number): ChartContext {
  displayChartHeader(year, month);  // Display the chart header
  
  return {
    daysInMonth: new Date(year, month, 0).getDate(),  // Get number of days in month
    weatherDataMap: createWeatherDataMap(weatherRecords),  // Create data lookup map
    temperatureRange: calculateTemperatureRange(weatherRecords)  // Calculate temperature range
  };
}

/**
 * Generic chart rendering function
 * 
 * This function provides a generic way to render charts by iterating through
 * all days in a month and calling a provided render function for each day
 * that has valid temperature data. It handles missing data gracefully.
 * 
 * @param chartContext - Chart context containing all necessary data
 * @param renderFunction - Function to call for rendering each day's data
 */
function renderChart(
  chartContext: ChartContext, 
  renderFunction: (weatherRecord: WeatherRecord, temperatureRange: { minimum: number; maximum: number }, formattedDay: string) => void
): void {
  for (let day = 1; day <= chartContext.daysInMonth; day++) {  // Iterate through all days in month
    const formattedDay = formatDayNumber(day);  // Format day with zero padding
    const weatherRecord = chartContext.weatherDataMap.get(day);  // Get weather data for this day
    
    if (!weatherRecord || !hasTemperatureData(weatherRecord)) {  // Check if data exists and is valid
      displayNoDataMessage(formattedDay);  // Show "no data" message
      continue;  // Skip to next day
    }
    
    renderFunction(weatherRecord, chartContext.temperatureRange, formattedDay);  // Render the day's data
  }
}

/**
 * Checks if a weather record has complete temperature data
 * 
 * This function determines whether a weather record has both maximum and
 * minimum temperature data, which is required for combined chart display.
 * 
 * @param weatherRecord - Weather record to check
 * @returns true if both maximum and minimum temperatures are available
 */
function hasCompleteTemperatureData(weatherRecord: WeatherRecord): boolean {
  return weatherRecord.minimumTemperatureCelsius != null &&    // Has minimum temperature
         weatherRecord.maximumTemperatureCelsius != null;     // Has maximum temperature
}

/**
 * Displays combined temperature bars on a single line
 * 
 * This function creates a combined display showing both minimum and maximum
 * temperatures on the same line, separated by a dash. The minimum temperature
 * is shown in blue and the maximum in red for easy visual distinction.
 * 
 * @param weatherRecord - Weather record containing temperature data
 * @param temperatureRange - Temperature range for bar scaling
 * @param formattedDay - Zero-padded day string for display
 */
function displayCombinedTemperatureBars(
  weatherRecord: WeatherRecord, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  // Validate that both temperature values are available before proceeding
  if (weatherRecord.minimumTemperatureCelsius == null || weatherRecord.maximumTemperatureCelsius == null) {
    displayNoDataMessage(formattedDay);  // Show "no data" message if either temperature is missing
    return;
  }
  
  const minimumBarLength = calculateBarLength(weatherRecord.minimumTemperatureCelsius, temperatureRange);  // Calculate minimum bar length
  const maximumBarLength = calculateBarLength(weatherRecord.maximumTemperatureCelsius, temperatureRange);  // Calculate maximum bar length
  
  const minimumBar = "+".repeat(minimumBarLength);  // Create minimum temperature bar
  const maximumBar = "+".repeat(maximumBarLength);  // Create maximum temperature bar
  const combinedBar = `${chalk.blue(minimumBar)} - ${chalk.red(maximumBar)}`;  // Combine bars with color coding
  
  console.log(`${formattedDay} ${combinedBar} ${weatherRecord.minimumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX} - ${weatherRecord.maximumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX}`);  // Display combined chart line
}