import type { weatherModel } from "../models/weatherModel.js";
import { findHottestDay, findColdestDay, findMostHumidDay } from "../calculations/extremeTemps.js";

export interface WeatherReport {
  hottestDay: { date: Date; maxTempC: number } | undefined;
  coldestDay: { date: Date; minTempC: number } | undefined;
  mostHumidDay: { date: Date; humidity: number } | undefined;
}

export function generateReport(data: weatherModel[]): WeatherReport {
  return {
    hottestDay: findHottestDay(data),
    coldestDay: findColdestDay(data),
    mostHumidDay: findMostHumidDay(data),
  };
}
