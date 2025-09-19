import type { weatherModel } from "../models/weatherModel.js";

export function findHottestDay(_data: weatherModel[]) {
  return undefined as { date: Date; maxTempC: number } | undefined;
}
export function findColdestDay(_data: weatherModel[]) {
  return undefined as { date: Date; minTempC: number } | undefined;
}
export function findMostHumidDay(_data: weatherModel[]) {
  return undefined as { date: Date; humidity: number } | undefined;
}
