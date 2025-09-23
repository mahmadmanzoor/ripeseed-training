import { describe, it, expect } from 'vitest';

import { calculateMonthlyAverages } from "../calculations/averageTemperatures.js";
import { findHottestDay, findColdestDay, findMostHumidDay } from "../calculations/extremeTemperatures.js";
import { parseWeatherFiles } from "../parser/weatherParser.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

const sampleWeatherRecords: WeatherRecord[] = [
  { 
    date: new Date("2004-08-01"), 
    maximumTemperatureCelsius: 30, 
    minimumTemperatureCelsius: 20, 
    meanTemperatureCelsius: 25,
    maximumHumidity: 80,
    minimumHumidity: 20,
    meanHumidity: 50 
  },
  { 
    date: new Date("2004-08-02"), 
    maximumTemperatureCelsius: 28, 
    minimumTemperatureCelsius: 18, 
    meanTemperatureCelsius: 23,
    maximumHumidity: 90,
    minimumHumidity: 30,
    meanHumidity: 60 
  },
  { 
    date: new Date("2004-08-03"), 
    // Simulate missing data with null values
    maximumTemperatureCelsius: null,
    minimumTemperatureCelsius: null, 
    meanTemperatureCelsius: null,
    maximumHumidity: null,
    minimumHumidity: null,
    meanHumidity: null
  },
];

const emptyWeatherRecords: WeatherRecord[] = [];
const singleRecordWeatherRecords: WeatherRecord[] = [
  { 
    date: new Date("2004-08-01"), 
    maximumTemperatureCelsius: 25, 
    minimumTemperatureCelsius: 15, 
    meanTemperatureCelsius: 20,
    maximumHumidity: 90,
    minimumHumidity: 50,
    meanHumidity: 70 
  }
];

describe("Monthly Averages Calculations", () => {
  it("should calculate correct averages for valid data", () => {
    const monthlyAverages = calculateMonthlyAverages(sampleWeatherRecords);
    expect(monthlyAverages).toBeDefined();
    expect(monthlyAverages!.averageMaximumTemperature).toBeCloseTo(29);
    expect(monthlyAverages!.averageMinimumTemperature).toBeCloseTo(19);
    expect(monthlyAverages!.averageMeanHumidity).toBeCloseTo(55); // (50 + 60) / 2
  });

  it("should return undefined for empty data", () => {
    const monthlyAverages = calculateMonthlyAverages(emptyWeatherRecords);
    expect(monthlyAverages).toBeUndefined();
  });

  it("should handle single record correctly", () => {
    const monthlyAverages = calculateMonthlyAverages(singleRecordWeatherRecords);
    expect(monthlyAverages).toBeDefined();
    expect(monthlyAverages!.averageMaximumTemperature).toBe(25);
    expect(monthlyAverages!.averageMinimumTemperature).toBe(15);
    expect(monthlyAverages!.averageMeanHumidity).toBe(70);
  });

  it("should handle partial data correctly", () => {
    const partialWeatherRecords: WeatherRecord[] = [
      { 
        date: new Date("2004-08-01"), 
        maximumTemperatureCelsius: 30, 
        minimumTemperatureCelsius: null, 
        meanTemperatureCelsius: null,
        maximumHumidity: null,
        minimumHumidity: null,
        meanHumidity: null
      },
      { 
        date: new Date("2004-08-02"), 
        maximumTemperatureCelsius: null, 
        minimumTemperatureCelsius: 18, 
        meanTemperatureCelsius: null,
        maximumHumidity: null,
        minimumHumidity: null,
        meanHumidity: null
      },
      { 
        date: new Date("2004-08-03"), 
        maximumTemperatureCelsius: null, 
        minimumTemperatureCelsius: null, 
        meanTemperatureCelsius: null,
        maximumHumidity: null,
        minimumHumidity: null,
        meanHumidity: 60
      },
    ];

    const monthlyAverages = calculateMonthlyAverages(partialWeatherRecords);
    expect(monthlyAverages).toBeDefined();
    expect(monthlyAverages!.averageMaximumTemperature).toBe(30);
    expect(monthlyAverages!.averageMinimumTemperature).toBe(18);
    expect(monthlyAverages!.averageMeanHumidity).toBe(60);
  });
});

describe("Extreme Temperature Calculations", () => {
  it("should find the hottest day correctly", () => {
    const hottestDay = findHottestDay(sampleWeatherRecords);
    expect(hottestDay).toBeDefined();
    expect(hottestDay!.maximumTemperatureCelsius).toBe(30);
  });

  it("should find the coldest day correctly", () => {
    const coldestDay = findColdestDay(sampleWeatherRecords);
    expect(coldestDay).toBeDefined();
    expect(coldestDay!.minimumTemperatureCelsius).toBe(18);
  });

  it("should find the most humid day correctly", () => {
    const mostHumidDay = findMostHumidDay(sampleWeatherRecords);
    expect(mostHumidDay).toBeDefined();
    expect(mostHumidDay!.humidity).toBe(60);
  });

  it("should return undefined for empty data", () => {
    const hottestDay = findHottestDay(emptyWeatherRecords);
    const coldestDay = findColdestDay(emptyWeatherRecords);
    const mostHumidDay = findMostHumidDay(emptyWeatherRecords);
    
    expect(hottestDay).toBeUndefined();
    expect(coldestDay).toBeUndefined();
    expect(mostHumidDay).toBeUndefined();
  });

  it("should handle single record correctly", () => {
    const hottestDay = findHottestDay(singleRecordWeatherRecords);
    const coldestDay = findColdestDay(singleRecordWeatherRecords);
    
    expect(hottestDay?.maximumTemperatureCelsius).toBe(25);
    expect(coldestDay?.minimumTemperatureCelsius).toBe(15);
  });
});

describe("File Parsing and Error Handling", () => {
  it("should return empty array for invalid directory path", () => {
    const invalidRecords = parseWeatherFiles("/non/existent/path");
    expect(Array.isArray(invalidRecords)).toBe(true);
    expect(invalidRecords.length).toBe(0);
  });

  it("should return empty array for non-existent directory", () => {
    const invalidRecords = parseWeatherFiles("/path/that/does/not/exist");
    expect(Array.isArray(invalidRecords)).toBe(true);
    expect(invalidRecords.length).toBe(0);
  });
});

describe("Edge Cases and Boundary Conditions", () => {
  it("should handle zero values correctly", () => {
    const zeroValueRecords: WeatherRecord[] = [
      { 
        date: new Date("2004-08-01"), 
        maximumTemperatureCelsius: 0, 
        minimumTemperatureCelsius: 0, 
        meanTemperatureCelsius: 0,
        maximumHumidity: 0,
        minimumHumidity: 0,
        meanHumidity: 0 
      }
    ];
    
    const monthlyAverages = calculateMonthlyAverages(zeroValueRecords);
    expect(monthlyAverages).toBeDefined();
    expect(monthlyAverages!.averageMaximumTemperature).toBe(0);
    expect(monthlyAverages!.averageMinimumTemperature).toBe(0);
    expect(monthlyAverages!.averageMeanHumidity).toBe(0);
  });

  it("should handle negative temperatures correctly", () => {
    const negativeTempRecords: WeatherRecord[] = [
      { 
        date: new Date("2004-08-01"), 
        maximumTemperatureCelsius: -5, 
        minimumTemperatureCelsius: -10,
        meanTemperatureCelsius: -7.5,
        maximumHumidity: 80,
        minimumHumidity: 60,
        meanHumidity: 70
      }
    ];
    
    const coldestDay = findColdestDay(negativeTempRecords);
    expect(coldestDay?.minimumTemperatureCelsius).toBe(-10);
    
    const hottestDay = findHottestDay(negativeTempRecords);
    expect(hottestDay?.maximumTemperatureCelsius).toBe(-5);
  });
});
