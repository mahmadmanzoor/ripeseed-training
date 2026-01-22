/**
 * Weather report generation module
 * 
 * This module provides functionality to generate comprehensive weather reports
 * by aggregating extreme value calculations. It serves as a facade that
 * combines multiple calculation functions into a single report structure.
 */

import { findHottestDay, findColdestDay, findMostHumidDay } from "../calculations/extremeTemperatures.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Weather report interface
 * 
 * This interface defines the structure of a complete weather report containing
 * all extreme values for a given dataset. Each field can be undefined if no
 * valid data is available for that particular metric.
 * 
 * @property hottestDay - The day with the highest maximum temperature
 * @property coldestDay - The day with the lowest minimum temperature
 * @property mostHumidDay - The day with the highest mean humidity
 */
export interface WeatherReport {
  hottestDay: { date: Date; maximumTemperatureCelsius: number } | undefined;    // Hottest day data
  coldestDay: { date: Date; minimumTemperatureCelsius: number } | undefined;    // Coldest day data
  mostHumidDay: { date: Date; humidity: number } | undefined;                   // Most humid day data
}

/**
 * Generates a comprehensive weather report from weather records
 * 
 * This function aggregates all extreme value calculations into a single report
 * structure. It provides a convenient way to get all extreme values at once
 * rather than calling individual calculation functions separately.
 * 
 * @param weatherRecords - Array of weather records to analyze
 * @returns WeatherReport object containing all extreme values
 */
export function generateReport(weatherRecords: WeatherRecord[]): WeatherReport {
  return {
    hottestDay: findHottestDay(weatherRecords),      // Find the hottest day
    coldestDay: findColdestDay(weatherRecords),      // Find the coldest day
    mostHumidDay: findMostHumidDay(weatherRecords),  // Find the most humid day
  };
}
