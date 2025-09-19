import type { weatherModel } from "../models/weatherModel.js";

export function findHottestDay(data: weatherModel[]): { date: Date; maxTempC: number } | undefined {
  let hottest: { date: Date; maxTempC: number } | undefined;
  for (const record of data) {
    if (record.maxTempC !== undefined) {
      if (!hottest || record.maxTempC > hottest.maxTempC) {
        hottest = { date: record.date, maxTempC: record.maxTempC };
      }
    }
  }
  return hottest;
}

export function findColdestDay(data: weatherModel[]): { date: Date; minTempC: number } | undefined {
  let coldest: { date: Date; minTempC: number } | undefined;
  for (const record of data) {
    if (record.minTempC !== undefined) {
      if (!coldest || record.minTempC < coldest.minTempC) {
        coldest = { date: record.date, minTempC: record.minTempC };
      }
    }
  }
  return coldest;
}

export function findMostHumidDay(data: weatherModel[]): { date: Date; humidity: number } | undefined {
  let humid: { date: Date; humidity: number } | undefined;
  for (const record of data) {
    if (record.maxHumidity !== undefined) {
      if (!humid || record.maxHumidity > humid.humidity) {
        humid = { date: record.date, humidity: record.maxHumidity };
      }
    }
  }
  return humid;
}
