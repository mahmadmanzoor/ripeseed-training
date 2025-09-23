import chalk from "chalk";

import { CHART_CONSTANTS, DISPLAY_CONSTANTS, ERROR_MESSAGES } from "../constants/weatherConstants.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

export function generateChartReport(weatherRecords: WeatherRecord[], year: number, month: number): void {
  const chartContext = createChartContext(weatherRecords, year, month);
  renderChart(chartContext, (weatherRecord, temperatureRange, formattedDay) => 
    displayTemperatureBars(weatherRecord, temperatureRange, formattedDay)
  );
}

function displayChartHeader(year: number, month: number): void {
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long" });
  console.log(`\n${monthName} ${year}`);
}

function createWeatherDataMap(weatherRecords: WeatherRecord[]): Map<number, WeatherRecord> {
  const dataMap = new Map<number, WeatherRecord>();
  for (const weatherRecord of weatherRecords) {
    dataMap.set(weatherRecord.date.getDate(), weatherRecord);
  }
  return dataMap;
}

function calculateTemperatureRange(weatherRecords: WeatherRecord[]): { minimum: number; maximum: number } {
  let minimumTemperature = Infinity;
  let maximumTemperature = -Infinity;
  
  for (const weatherRecord of weatherRecords) {
    if (weatherRecord.maximumTemperatureCelsius != null) {
      maximumTemperature = Math.max(maximumTemperature, weatherRecord.maximumTemperatureCelsius);
    }
    if (weatherRecord.minimumTemperatureCelsius != null) {
      minimumTemperature = Math.min(minimumTemperature, weatherRecord.minimumTemperatureCelsius);
    }
  }

  // Handle edge case where all temperatures are the same
  if (minimumTemperature === maximumTemperature) {
    minimumTemperature = maximumTemperature - CHART_CONSTANTS.DEFAULT_TEMPERATURE_OFFSET;
  }
  
  return { minimum: minimumTemperature, maximum: maximumTemperature };
}

function formatDayNumber(day: number): string {
  return day.toString().padStart(2, "0");
}

function hasTemperatureData(weatherRecord: WeatherRecord): boolean {
  return weatherRecord.maximumTemperatureCelsius != null || 
         weatherRecord.minimumTemperatureCelsius != null;
}

function displayNoDataMessage(formattedDay: string): void {
  console.log(`${formattedDay} ${ERROR_MESSAGES.NO_DATA_AVAILABLE}`);
}

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

function displayMaximumTemperatureBar(
  maximumTemperature: number, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  const barLength = calculateBarLength(maximumTemperature, temperatureRange);
  const temperatureBar = "+".repeat(barLength);
  console.log(`${formattedDay} ${chalk.red(temperatureBar)} ${maximumTemperature}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX}`);
}

function displayMinimumTemperatureBar(
  minimumTemperature: number, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  const barLength = calculateBarLength(minimumTemperature, temperatureRange);
  const temperatureBar = "+".repeat(barLength);
  console.log(`${formattedDay} ${chalk.blue(temperatureBar)} ${minimumTemperature}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX}`);
}

function calculateBarLength(
  temperature: number, 
  temperatureRange: { minimum: number; maximum: number }
): number {
  const normalizedTemperature = (temperature - temperatureRange.minimum) / (temperatureRange.maximum - temperatureRange.minimum);
  return Math.max(
    CHART_CONSTANTS.MINIMUM_BAR_LENGTH, 
    Math.round(normalizedTemperature * CHART_CONSTANTS.BAR_LENGTH)
  );
}

export function generateCombinedChartReport(weatherRecords: WeatherRecord[], year: number, month: number): void {
  const chartContext = createChartContext(weatherRecords, year, month);
  renderChart(chartContext, (weatherRecord, temperatureRange, formattedDay) => 
    displayCombinedTemperatureBars(weatherRecord, temperatureRange, formattedDay)
  );
}

interface ChartContext {
  daysInMonth: number;
  weatherDataMap: Map<number, WeatherRecord>;
  temperatureRange: { minimum: number; maximum: number };
}

function createChartContext(weatherRecords: WeatherRecord[], year: number, month: number): ChartContext {
  displayChartHeader(year, month);
  
  return {
    daysInMonth: new Date(year, month, 0).getDate(),
    weatherDataMap: createWeatherDataMap(weatherRecords),
    temperatureRange: calculateTemperatureRange(weatherRecords)
  };
}

function renderChart(
  chartContext: ChartContext, 
  renderFunction: (weatherRecord: WeatherRecord, temperatureRange: { minimum: number; maximum: number }, formattedDay: string) => void
): void {
  for (let day = 1; day <= chartContext.daysInMonth; day++) {
    const formattedDay = formatDayNumber(day);
    const weatherRecord = chartContext.weatherDataMap.get(day);
    
    if (!weatherRecord || !hasTemperatureData(weatherRecord)) {
      displayNoDataMessage(formattedDay);
      continue;
    }
    
    renderFunction(weatherRecord, chartContext.temperatureRange, formattedDay);
  }
}

function hasCompleteTemperatureData(weatherRecord: WeatherRecord): boolean {
  return weatherRecord.minimumTemperatureCelsius != null && 
         weatherRecord.maximumTemperatureCelsius != null;
}

function displayCombinedTemperatureBars(
  weatherRecord: WeatherRecord, 
  temperatureRange: { minimum: number; maximum: number }, 
  formattedDay: string
): void {
  // Validate that both temperature values are available before proceeding
  if (weatherRecord.minimumTemperatureCelsius == null || weatherRecord.maximumTemperatureCelsius == null) {
    displayNoDataMessage(formattedDay);
    return;
  }
  
  const minimumBarLength = calculateBarLength(weatherRecord.minimumTemperatureCelsius, temperatureRange);
  const maximumBarLength = calculateBarLength(weatherRecord.maximumTemperatureCelsius, temperatureRange);
  
  const minimumBar = "+".repeat(minimumBarLength);
  const maximumBar = "+".repeat(maximumBarLength);
  const combinedBar = `${chalk.blue(minimumBar)} - ${chalk.red(maximumBar)}`;
  
  console.log(`${formattedDay} ${combinedBar} ${weatherRecord.minimumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX} - ${weatherRecord.maximumTemperatureCelsius}${DISPLAY_CONSTANTS.CELSIUS_SUFFIX}`);
}
