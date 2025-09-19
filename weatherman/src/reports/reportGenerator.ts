import type { weatherModel } from "../models/weatherModel.js";

export interface WeatherReport {
  hottestDay: { date: Date; maxTempC: number } | undefined;
  coldestDay: { date: Date; minTempC: number } | undefined;
  mostHumidDay: { date: Date; humidity: number } | undefined;
}

export function generateReport(_data: weatherModel[]): WeatherReport {
  // TODO: implement report generation logic
  return { hottestDay: undefined, coldestDay: undefined, mostHumidDay: undefined };
}
