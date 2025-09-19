import type { weatherModel } from "../models/weatherModel.js";

export interface MonthlyAverages {
  avgMaxTemp: number;
  avgMinTemp: number;
  avgMeanHumidity: number;
}

export function calculateMonthlyAverages(_data: weatherModel[]): MonthlyAverages | undefined {
  // TODO: implement average calculation logic
  return undefined;
}
