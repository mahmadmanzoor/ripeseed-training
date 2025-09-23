import { findHottestDay, findColdestDay, findMostHumidDay } from "../calculations/extremeTemperatures.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

export interface WeatherReport {
  hottestDay: { date: Date; maximumTemperatureCelsius: number } | undefined;
  coldestDay: { date: Date; minimumTemperatureCelsius: number } | undefined;
  mostHumidDay: { date: Date; humidity: number } | undefined;
}

export function generateReport(weatherRecords: WeatherRecord[]): WeatherReport {
  return {
    hottestDay: findHottestDay(weatherRecords),
    coldestDay: findColdestDay(weatherRecords),
    mostHumidDay: findMostHumidDay(weatherRecords),
  };
}
