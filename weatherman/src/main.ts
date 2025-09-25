/**
 * Weather Man - Main Application Entry Point
 * 
 * This is the main application file that handles command line argument parsing,
 * data processing, and report generation. It provides a command-line interface
 * for analyzing weather data and generating various types of reports.
 * 
 * Features:
 * - Command line argument validation
 * - Weather data file parsing
 * - Extreme value reports (-e flag)
 * - Average value reports (-a flag)  
 * - Chart reports (-c flag)
 * - Combined chart reports for single-digit months
 */

import { calculateMonthlyAverages } from "./calculations/averageTemperatures.js";
import { ERROR_MESSAGES, DISPLAY_CONSTANTS, COMMAND_LINE } from "./constants/weatherConstants.js";
import type { WeatherRecord } from "./models/weatherRecord.js";
import { parseWeatherFiles } from "./parser/weatherParser.js";
import { generateReport } from "./reports/reportGenerator.js";
import { generateChartReport, generateCombinedChartReport } from "./reports/chartGenerator.js";

/**
 * Main application entry point
 * 
 * This function orchestrates the entire application flow:
 * 1. Parse and validate command line arguments
 * 2. Load and parse weather data files
 * 3. Generate requested reports based on command line flags
 * 4. Handle errors gracefully with user-friendly messages
 */
function main(): void {
  const commandLineArguments = process.argv.slice(2);  // Get user-provided arguments (skip 'node' and script name)

  const validationResult = validateCommandLineArguments(commandLineArguments);  // Validate command line arguments
  if (!validationResult.isValid) {
    console.error(validationResult.errorMessage);  // Display error message
    if (validationResult.shouldShowUsage) {
      displayUsageInstructions();  // Show usage instructions if needed
    }
    process.exit(1);  // Exit with error code
  }

  const { dataDirectoryPath, commandFlags } = validationResult;  // Extract validated arguments

  try {
    const weatherRecords = parseWeatherFiles(dataDirectoryPath!);  // Parse all weather data files
    console.log(`Parsed ${weatherRecords.length} weather records.`);  // Inform user of data loading success

    if (weatherRecords.length === 0) {
      console.log("⚠️  Warning: No weather data found in the specified directory.");  // Warn about empty data
    }

    // Process all requested report types
    processExtremeValueReports(weatherRecords, commandFlags!);    // Handle -e flags
    processAverageValueReports(weatherRecords, commandFlags!);    // Handle -a flags
    processChartReports(weatherRecords, commandFlags!);           // Handle -c flags
  } catch (error) {
    console.error("❌ Error processing weather data:", error instanceof Error ? error.message : String(error));  // Display error message
    process.exit(1);  // Exit with error code
  }
}

/**
 * Validation result interface
 * 
 * This interface defines the structure of the result returned by command line
 * argument validation. It provides a clean way to communicate validation
 * results and any necessary follow-up actions.
 */
interface ValidationResult {
  isValid: boolean;                    // Whether the arguments are valid
  errorMessage?: string;               // Error message if validation fails
  shouldShowUsage?: boolean;           // Whether to show usage instructions
  dataDirectoryPath?: string;          // Validated data directory path
  commandFlags?: string[];             // Validated command flags
}

/**
 * Validates command line arguments
 * 
 * This function performs comprehensive validation of command line arguments,
 * ensuring that the required data directory is provided and that there are
 * enough arguments to process.
 * 
 * @param commandLineArguments - Array of command line arguments to validate
 * @returns ValidationResult object indicating success/failure and extracted data
 */
function validateCommandLineArguments(commandLineArguments: string[]): ValidationResult {
  if (commandLineArguments.length < COMMAND_LINE.MINIMUM_ARGUMENTS) {  // Check minimum argument count
    return {
      isValid: false,
      errorMessage: "Insufficient arguments provided.",
      shouldShowUsage: true  // Show usage instructions for insufficient arguments
    };
  }

  const dataDirectoryPath = commandLineArguments[0];  // Extract data directory path
  if (!dataDirectoryPath) {  // Check if data directory is provided
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.MISSING_DATA_DIRECTORY
    };
  }

  return {
    isValid: true,
    dataDirectoryPath,
    commandFlags: commandLineArguments.slice(1)  // Extract command flags (everything after data directory)
  };
}

/**
 * Displays usage instructions to the user
 * 
 * This function shows the user how to properly use the application, including
 * the correct command syntax and example commands for different report types.
 */
function displayUsageInstructions(): void {
  console.error(DISPLAY_CONSTANTS.USAGE_MESSAGE);  // Display main usage message
  console.error("Examples:");  // Show example commands
  console.error("  node dist/main.js weatherman/sample-data -e 2002");  // Extreme values example
  console.error("  node dist/main.js weatherman/sample-data -a 2005/6");  // Average values example
  console.error("  node dist/main.js weatherman/sample-data -c 2011/03");  // Chart example
}

/**
 * Processes all extreme value report requests
 * 
 * This function handles all -e flags in the command line arguments, allowing
 * multiple extreme value reports to be generated in a single command. It
 * validates year arguments and filters data appropriately for each request.
 * 
 * @param weatherRecords - Array of all weather records
 * @param commandFlags - Array of command line flags to process
 */
function processExtremeValueReports(weatherRecords: WeatherRecord[], commandFlags: string[]): void {
  let extremeFlagIndex = commandFlags.indexOf(COMMAND_LINE.EXTREME_FLAG);  // Find first -e flag
  while (extremeFlagIndex !== -1) {  // Process all -e flags
    const yearArgument = commandFlags[extremeFlagIndex + 1];  // Get year argument after -e flag
    if (!yearArgument || !COMMAND_LINE.YEAR_REGEX.test(yearArgument)) {  // Validate year format
      handleInvalidInput(ERROR_MESSAGES.INVALID_YEAR_FORMAT);
    }
    const year = parseInt(yearArgument, 10);  // Convert year to number
    const yearWeatherRecords = weatherRecords.filter((weatherRecord) => weatherRecord.date.getFullYear() === year);  // Filter data for this year

    displayExtremeValueReport(year, yearWeatherRecords);  // Generate and display report

    extremeFlagIndex = commandFlags.indexOf(COMMAND_LINE.EXTREME_FLAG, extremeFlagIndex + 1);  // Find next -e flag
  }
}

/**
 * Displays an extreme value report for a specific year
 * 
 * This function generates and displays a comprehensive extreme value report
 * showing the hottest day, coldest day, and most humid day for the specified year.
 * It handles cases where no data is available gracefully.
 * 
 * @param year - Year for the report
 * @param yearWeatherRecords - Weather records filtered for this year
 */
function displayExtremeValueReport(year: number, yearWeatherRecords: WeatherRecord[]): void {
  console.log(`\nExtreme Values Report (${year})`);  // Display report header
  
  if (yearWeatherRecords.length === 0) {  // Check if data is available
    console.log(ERROR_MESSAGES.NO_DATA_FOUND_FOR_YEAR);  // Show no data message
  } else {
    const weatherReport = generateReport(yearWeatherRecords);  // Generate extreme value report
    
    if (weatherReport.hottestDay) {  // Display hottest day if available
      console.log(`Highest: ${weatherReport.hottestDay.maximumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX} on ${formatDate(weatherReport.hottestDay.date)}`);
    }
    if (weatherReport.coldestDay) {  // Display coldest day if available
      console.log(`Lowest: ${weatherReport.coldestDay.minimumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX} on ${formatDate(weatherReport.coldestDay.date)}`);
    }
    if (weatherReport.mostHumidDay) {  // Display most humid day if available
      console.log(`Humidity: ${weatherReport.mostHumidDay.humidity}${DISPLAY_CONSTANTS.PERCENTAGE_SUFFIX} on ${formatDate(weatherReport.mostHumidDay.date)}`);
    }
  }
}

/**
 * Processes all average value report requests
 * 
 * This function handles all -a flags in the command line arguments, allowing
 * multiple average value reports to be generated in a single command. It
 * validates month arguments and filters data appropriately for each request.
 * 
 * @param weatherRecords - Array of all weather records
 * @param commandFlags - Array of command line flags to process
 */
function processAverageValueReports(weatherRecords: WeatherRecord[], commandFlags: string[]): void {
  let averageFlagIndex = commandFlags.indexOf(COMMAND_LINE.AVERAGE_FLAG);  // Find first -a flag
  while (averageFlagIndex !== -1) {  // Process all -a flags
    const monthArgument = commandFlags[averageFlagIndex + 1];  // Get month argument after -a flag
    if (!monthArgument || !COMMAND_LINE.MONTH_REGEX.test(monthArgument)) {  // Validate month format
      handleInvalidInput(ERROR_MESSAGES.INVALID_MONTH_FORMAT);
    }
    const [yearString, monthString] = monthArgument.split("/") as [string, string];  // Split year/month
    const year = parseInt(yearString, 10);  // Convert year to number
    const month = parseInt(monthString, 10);  // Convert month to number

    const monthWeatherRecords = weatherRecords.filter(  // Filter data for this month
      (weatherRecord) => weatherRecord.date.getFullYear() === year && weatherRecord.date.getMonth() + 1 === month
    );

    displayAverageValueReport(year, monthString, monthWeatherRecords);  // Generate and display report

    averageFlagIndex = commandFlags.indexOf(COMMAND_LINE.AVERAGE_FLAG, averageFlagIndex + 1);  // Find next -a flag
  }
}

/**
 * Displays an average value report for a specific month
 * 
 * This function generates and displays a comprehensive average value report
 * showing the average maximum temperature, average minimum temperature, and
 * average mean humidity for the specified month. It handles cases where no
 * data is available or averages cannot be calculated gracefully.
 * 
 * @param year - Year for the report
 * @param monthString - Month string for display
 * @param monthWeatherRecords - Weather records filtered for this month
 */
function displayAverageValueReport(year: number, monthString: string, monthWeatherRecords: WeatherRecord[]): void {
  console.log(`\nAverage Values Report (${year}/${monthString})`);  // Display report header

  if (monthWeatherRecords.length === 0) {  // Check if data is available
    console.log(ERROR_MESSAGES.NO_DATA_FOUND_FOR_MONTH);  // Show no data message
  } else {
    const monthlyAverages = calculateMonthlyAverages(monthWeatherRecords);  // Calculate monthly averages

    if (!monthlyAverages) {  // Check if averages could be calculated
      console.log(ERROR_MESSAGES.NO_AVERAGES_CALCULATED);  // Show no averages message
    } else {
      // Format averages with proper units, handling NaN values
      const highestAverage = !isNaN(monthlyAverages.averageMaximumTemperature) 
        ? Math.round(monthlyAverages.averageMaximumTemperature) + DISPLAY_CONSTANTS.CELSIUS_SUFFIX 
        : "N/A";
      const lowestAverage = !isNaN(monthlyAverages.averageMinimumTemperature) 
        ? Math.round(monthlyAverages.averageMinimumTemperature) + DISPLAY_CONSTANTS.CELSIUS_SUFFIX 
        : "N/A";
      const averageHumidity = !isNaN(monthlyAverages.averageMeanHumidity) 
        ? Math.round(monthlyAverages.averageMeanHumidity) + DISPLAY_CONSTANTS.PERCENTAGE_SUFFIX 
        : "N/A";

      console.log(`Highest Average: ${highestAverage}`);  // Display highest average
      console.log(`Lowest Average: ${lowestAverage}`);    // Display lowest average
      console.log(`Average Mean Humidity: ${averageHumidity}`);  // Display average humidity
    }
  }
}

/**
 * Processes all chart report requests
 * 
 * This function handles all -c flags in the command line arguments, allowing
 * multiple chart reports to be generated in a single command. It validates
 * month arguments and filters data appropriately for each request.
 * 
 * @param weatherRecords - Array of all weather records
 * @param commandFlags - Array of command line flags to process
 */
function processChartReports(weatherRecords: WeatherRecord[], commandFlags: string[]): void {
  let chartFlagIndex = commandFlags.indexOf(COMMAND_LINE.CHART_FLAG);  // Find first -c flag
  while (chartFlagIndex !== -1) {  // Process all -c flags
    const monthArgument = commandFlags[chartFlagIndex + 1];  // Get month argument after -c flag
    if (!monthArgument || !COMMAND_LINE.MONTH_REGEX.test(monthArgument)) {  // Validate month format
      handleInvalidInput(ERROR_MESSAGES.INVALID_CHART_MONTH_FORMAT);
    }
    const [yearString, monthString] = monthArgument.split("/") as [string, string];  // Split year/month
    const year = parseInt(yearString, 10);  // Convert year to number
    const month = parseInt(monthString, 10);  // Convert month to number

    const monthWeatherRecords = weatherRecords.filter(  // Filter data for this month
      (weatherRecord) => weatherRecord.date.getFullYear() === year && weatherRecord.date.getMonth() + 1 === month
    );

    displayChartReport(year, monthString, monthWeatherRecords, monthArgument);  // Generate and display chart

    chartFlagIndex = commandFlags.indexOf(COMMAND_LINE.CHART_FLAG, chartFlagIndex + 1);  // Find next -c flag
  }
}

/**
 * Displays a chart report for a specific month
 * 
 * This function determines whether to generate a standard chart or a combined
 * chart based on the month argument format. Single-digit months get combined
 * charts, while two-digit months get standard charts.
 * 
 * @param year - Year for the chart
 * @param monthString - Month string for display
 * @param monthWeatherRecords - Weather records filtered for this month
 * @param monthArgument - Original month argument for chart type detection
 */
function displayChartReport(year: number, monthString: string, monthWeatherRecords: WeatherRecord[], monthArgument: string): void {
  if (monthWeatherRecords.length === 0) {  // Check if data is available
    console.log(`\nChart Report (${year}/${monthString})`);  // Display chart header
    console.log(ERROR_MESSAGES.NO_DATA_FOUND_FOR_MONTH);  // Show no data message
  } else {
    // Determine chart type based on month argument format
    const isCombinedChartTask = COMMAND_LINE.COMBINED_CHART_REGEX.test(monthArgument) && !COMMAND_LINE.TWO_DIGIT_MONTH_REGEX.test(monthArgument);

    if (isCombinedChartTask) {  // Generate combined chart for single-digit months
      generateCombinedChartReport(monthWeatherRecords, year, parseInt(monthString, 10));
    } else {  // Generate standard chart for two-digit months
      generateChartReport(monthWeatherRecords, year, parseInt(monthString, 10));
    }
  }
}

/**
 * Handles invalid input by displaying error message and exiting
 * 
 * This function provides a consistent way to handle invalid input errors
 * by displaying the error message and exiting the application with an
 * error code.
 * 
 * @param errorMessage - Error message to display
 */
function handleInvalidInput(errorMessage: string): never {
  console.error(errorMessage);  // Display error message
  process.exit(1);  // Exit with error code
}

/**
 * Formats a date for display in reports
 * 
 * This function converts a Date object into a user-friendly string format
 * showing the month name and day number.
 * 
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "August 15")
 */
function formatDate(date: Date): string {
  const dateFormatOptions: Intl.DateTimeFormatOptions = { month: "long", day: "2-digit" };  // Format options
  return date.toLocaleDateString("en-US", dateFormatOptions);  // Format and return date string
}

main();  // Start the application
