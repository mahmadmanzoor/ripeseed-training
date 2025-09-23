import { calculateMonthlyAverages } from "./calculations/averageTemperatures.js";
import { ERROR_MESSAGES, DISPLAY_CONSTANTS, COMMAND_LINE } from "./constants/weatherConstants.js";
import type { WeatherRecord } from "./models/weatherRecord.js";
import { parseWeatherFiles } from "./parser/weatherParser.js";
import { generateReport } from "./reports/reportGenerator.js";
import { generateChartReport, generateCombinedChartReport } from "./reports/chartGenerator.js";

function main(): void {
  const commandLineArguments = process.argv.slice(2);

  const validationResult = validateCommandLineArguments(commandLineArguments);
  if (!validationResult.isValid) {
    console.error(validationResult.errorMessage);
    if (validationResult.shouldShowUsage) {
      displayUsageInstructions();
    }
    process.exit(1);
  }

  const { dataDirectoryPath, commandFlags } = validationResult;

  try {
    const weatherRecords = parseWeatherFiles(dataDirectoryPath!);
    console.log(`Parsed ${weatherRecords.length} weather records.`);

    if (weatherRecords.length === 0) {
      console.log("⚠️  Warning: No weather data found in the specified directory.");
    }

    processExtremeValueReports(weatherRecords, commandFlags!);
    processAverageValueReports(weatherRecords, commandFlags!);
    processChartReports(weatherRecords, commandFlags!);
  } catch (error) {
    console.error("❌ Error processing weather data:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  shouldShowUsage?: boolean;
  dataDirectoryPath?: string;
  commandFlags?: string[];
}

function validateCommandLineArguments(commandLineArguments: string[]): ValidationResult {
  if (commandLineArguments.length < COMMAND_LINE.MINIMUM_ARGUMENTS) {
    return {
      isValid: false,
      errorMessage: "Insufficient arguments provided.",
      shouldShowUsage: true
    };
  }

  const dataDirectoryPath = commandLineArguments[0];
  if (!dataDirectoryPath) {
    return {
      isValid: false,
      errorMessage: ERROR_MESSAGES.MISSING_DATA_DIRECTORY
    };
  }

  return {
    isValid: true,
    dataDirectoryPath,
    commandFlags: commandLineArguments.slice(1)
  };
}

function displayUsageInstructions(): void {
  console.error(DISPLAY_CONSTANTS.USAGE_MESSAGE);
  console.error("Examples:");
  console.error("  node dist/main.js weatherman/sample-data -e 2002");
  console.error("  node dist/main.js weatherman/sample-data -a 2005/6");
  console.error("  node dist/main.js weatherman/sample-data -c 2011/03");
}

function processExtremeValueReports(weatherRecords: WeatherRecord[], commandFlags: string[]): void {
  let extremeFlagIndex = commandFlags.indexOf(COMMAND_LINE.EXTREME_FLAG);
  while (extremeFlagIndex !== -1) {
    const yearArgument = commandFlags[extremeFlagIndex + 1];
    if (!yearArgument || !COMMAND_LINE.YEAR_REGEX.test(yearArgument)) {
      handleInvalidInput(ERROR_MESSAGES.INVALID_YEAR_FORMAT);
    }
    const year = parseInt(yearArgument, 10);
    const yearWeatherRecords = weatherRecords.filter((weatherRecord) => weatherRecord.date.getFullYear() === year);

    displayExtremeValueReport(year, yearWeatherRecords);

    extremeFlagIndex = commandFlags.indexOf(COMMAND_LINE.EXTREME_FLAG, extremeFlagIndex + 1);
  }
}

function displayExtremeValueReport(year: number, yearWeatherRecords: WeatherRecord[]): void {
  console.log(`\nExtreme Values Report (${year})`);
  
  if (yearWeatherRecords.length === 0) {
    console.log(ERROR_MESSAGES.NO_DATA_FOUND_FOR_YEAR);
  } else {
    const weatherReport = generateReport(yearWeatherRecords);
    if (weatherReport.hottestDay) {
      console.log(`Highest: ${weatherReport.hottestDay.maximumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX} on ${formatDate(weatherReport.hottestDay.date)}`);
    }
    if (weatherReport.coldestDay) {
      console.log(`Lowest: ${weatherReport.coldestDay.minimumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX} on ${formatDate(weatherReport.coldestDay.date)}`);
    }
    if (weatherReport.mostHumidDay) {
      console.log(`Humidity: ${weatherReport.mostHumidDay.humidity}${DISPLAY_CONSTANTS.PERCENTAGE_SUFFIX} on ${formatDate(weatherReport.mostHumidDay.date)}`);
    }
  }
}

function processAverageValueReports(weatherRecords: WeatherRecord[], commandFlags: string[]): void {
  let averageFlagIndex = commandFlags.indexOf(COMMAND_LINE.AVERAGE_FLAG);
  while (averageFlagIndex !== -1) {
    const monthArgument = commandFlags[averageFlagIndex + 1];
    if (!monthArgument || !COMMAND_LINE.MONTH_REGEX.test(monthArgument)) {
      handleInvalidInput(ERROR_MESSAGES.INVALID_MONTH_FORMAT);
    }
    const [yearString, monthString] = monthArgument.split("/") as [string, string];
    const year = parseInt(yearString, 10);
    const month = parseInt(monthString, 10);

    const monthWeatherRecords = weatherRecords.filter(
      (weatherRecord) => weatherRecord.date.getFullYear() === year && weatherRecord.date.getMonth() + 1 === month
    );

    displayAverageValueReport(year, monthString, monthWeatherRecords);

    averageFlagIndex = commandFlags.indexOf(COMMAND_LINE.AVERAGE_FLAG, averageFlagIndex + 1);
  }
}

function displayAverageValueReport(year: number, monthString: string, monthWeatherRecords: WeatherRecord[]): void {
  console.log(`\nAverage Values Report (${year}/${monthString})`);

  if (monthWeatherRecords.length === 0) {
    console.log(ERROR_MESSAGES.NO_DATA_FOUND_FOR_MONTH);
  } else {
    const monthlyAverages = calculateMonthlyAverages(monthWeatherRecords);

    if (!monthlyAverages) {
      console.log(ERROR_MESSAGES.NO_AVERAGES_CALCULATED);
    } else {
      const highestAverage = !isNaN(monthlyAverages.averageMaximumTemperature) 
        ? Math.round(monthlyAverages.averageMaximumTemperature) + DISPLAY_CONSTANTS.CELSIUS_SUFFIX 
        : "N/A";
      const lowestAverage = !isNaN(monthlyAverages.averageMinimumTemperature) 
        ? Math.round(monthlyAverages.averageMinimumTemperature) + DISPLAY_CONSTANTS.CELSIUS_SUFFIX 
        : "N/A";
      const averageHumidity = !isNaN(monthlyAverages.averageMeanHumidity) 
        ? Math.round(monthlyAverages.averageMeanHumidity) + DISPLAY_CONSTANTS.PERCENTAGE_SUFFIX 
        : "N/A";

      console.log(`Highest Average: ${highestAverage}`);
      console.log(`Lowest Average: ${lowestAverage}`);
      console.log(`Average Mean Humidity: ${averageHumidity}`);
    }
  }
}

function processChartReports(weatherRecords: WeatherRecord[], commandFlags: string[]): void {
  let chartFlagIndex = commandFlags.indexOf(COMMAND_LINE.CHART_FLAG);
  while (chartFlagIndex !== -1) {
    const monthArgument = commandFlags[chartFlagIndex + 1];
    if (!monthArgument || !COMMAND_LINE.MONTH_REGEX.test(monthArgument)) {
      handleInvalidInput(ERROR_MESSAGES.INVALID_CHART_MONTH_FORMAT);
    }
    const [yearString, monthString] = monthArgument.split("/") as [string, string];
    const year = parseInt(yearString, 10);
    const month = parseInt(monthString, 10);

    const monthWeatherRecords = weatherRecords.filter(
      (weatherRecord) => weatherRecord.date.getFullYear() === year && weatherRecord.date.getMonth() + 1 === month
    );

    displayChartReport(year, monthString, monthWeatherRecords, monthArgument);

    chartFlagIndex = commandFlags.indexOf(COMMAND_LINE.CHART_FLAG, chartFlagIndex + 1);
  }
}

function displayChartReport(year: number, monthString: string, monthWeatherRecords: WeatherRecord[], monthArgument: string): void {
  if (monthWeatherRecords.length === 0) {
    console.log(`\nChart Report (${year}/${monthString})`);
    console.log(ERROR_MESSAGES.NO_DATA_FOUND_FOR_MONTH);
  } else {
    const isCombinedChartTask = COMMAND_LINE.COMBINED_CHART_REGEX.test(monthArgument) && !COMMAND_LINE.TWO_DIGIT_MONTH_REGEX.test(monthArgument);

    if (isCombinedChartTask) {
      generateCombinedChartReport(monthWeatherRecords, year, parseInt(monthString, 10));
    } else {
      generateChartReport(monthWeatherRecords, year, parseInt(monthString, 10));
    }
  }
}

function handleInvalidInput(errorMessage: string): never {
  console.error(errorMessage);
  process.exit(1);
}

function formatDate(date: Date): string {
  const dateFormatOptions: Intl.DateTimeFormatOptions = { month: "long", day: "2-digit" };
  return date.toLocaleDateString("en-US", dateFormatOptions);
}

main();
