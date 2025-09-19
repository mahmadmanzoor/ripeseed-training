// test/run-tests.ts
import assert from "assert";
import type { weatherModel } from "../models/weatherModel.js";
import { calculateMonthlyAverages } from "../calculations/averageTemps.js";
import { findHottestDay, findColdestDay, findMostHumidDay } from "../calculations/extremeTemps.js";

function ok(msg: string) {
  console.log("✔", msg);
}

(function run() {
  console.log("Running unit tests for calculations...");

  const sample: weatherModel[] = [
    { date: new Date("2004-08-01"), maxTempC: 30, minTempC: 20, meanHumidity: 50 },
    { date: new Date("2004-08-02"), maxTempC: 28, minTempC: 18, meanHumidity: 60 },
    { date: new Date("2004-08-03"), /* missing values to simulate real data */ },
  ];

  // averages
  const averages = calculateMonthlyAverages(sample);
  assert(averages !== undefined, "Averages should not be undefined");
  assert(Math.abs((averages!.avgMaxTemp) - 29) < 1e-9, `avgMaxTemp expected 29, got ${averages!.avgMaxTemp}`);
  assert(Math.abs((averages!.avgMinTemp) - 19) < 1e-9, `avgMinTemp expected 19, got ${averages!.avgMinTemp}`);
  assert(Math.abs((averages!.avgMeanHumidity) - 55) < 1e-9, `avgMeanHumidity expected 55, got ${averages!.avgMeanHumidity}`);
  ok("calculateMonthlyAverages");

  // extremes
  const hottest = findHottestDay(sample);
  assert(hottest && hottest.maxTempC === 30, `Expected hottest 30, got ${hottest?.maxTempC}`);
  ok("findHottestDay");

  const coldest = findColdestDay(sample);
  assert(coldest && coldest.minTempC === 18, `Expected coldest 18, got ${coldest?.minTempC}`);
  ok("findColdestDay");

  const humid = findMostHumidDay(sample);
  assert(humid && humid.humidity === 60, `Expected most humid 60, got ${humid?.humidity}`);
  ok("findMostHumidDay");

  console.log("\nAll tests passed.");
})();
