/**
 * Weather Calculation Tests
 * 
 * This test suite provides comprehensive testing for all weather calculation
 * functions, including monthly averages, extreme values, and file parsing.
 * It covers normal cases, edge cases, and error conditions to ensure
 * robust and reliable weather data processing.
 * 
 * Test categories:
 * - Monthly averages calculations
 * - Extreme temperature and humidity calculations
 * - File parsing and error handling
 * - Edge cases and boundary conditions
 */

import { describe, it, expect } from 'vitest';  // Vitest testing framework

import { calculateMonthlyAverages } from "../calculations/averageTemperatures.js";
import { findHottestDay, findColdestDay, findMostHumidDay } from "../calculations/extremeTemperatures.js";
import { parseWeatherFiles } from "../parser/weatherParser.js";
import type { WeatherRecord } from "../models/weatherRecord.js";

/**
 * Sample weather records for testing
 * 
 * This test data includes a mix of valid records and records with missing data
 * to test the application's ability to handle real-world data scenarios.
 */
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

/**
 * Additional test data for edge cases
 * 
 * These test datasets cover various edge cases including empty data,
 * single records, and partial data scenarios.
 */
const emptyWeatherRecords: WeatherRecord[] = [];  // Empty dataset for testing no-data scenarios
const singleRecordWeatherRecords: WeatherRecord[] = [  // Single record for testing minimal data scenarios
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

/**
 * Test suite for monthly averages calculations
 * 
 * This test suite verifies that the monthly averages calculation function
 * correctly processes weather data and handles various edge cases.
 */
describe("Monthly Averages Calculations", () => {
  it("should calculate correct averages for valid data", () => {
    const monthlyAverages = calculateMonthlyAverages(sampleWeatherRecords);  // Calculate averages
    expect(monthlyAverages).toBeDefined();  // Ensure result is defined
    expect(monthlyAverages!.averageMaximumTemperature).toBeCloseTo(29);  // Test maximum temperature average
    expect(monthlyAverages!.averageMinimumTemperature).toBeCloseTo(19);  // Test minimum temperature average
    expect(monthlyAverages!.averageMeanHumidity).toBeCloseTo(55); // Test humidity average (50 + 60) / 2
  });

  it("should return undefined for empty data", () => {
    const monthlyAverages = calculateMonthlyAverages(emptyWeatherRecords);  // Test with empty data
    expect(monthlyAverages).toBeUndefined();  // Should return undefined for no data
  });

  it("should handle single record correctly", () => {
    const monthlyAverages = calculateMonthlyAverages(singleRecordWeatherRecords);  // Test with single record
    expect(monthlyAverages).toBeDefined();  // Should return defined result
    expect(monthlyAverages!.averageMaximumTemperature).toBe(25);  // Test maximum temperature
    expect(monthlyAverages!.averageMinimumTemperature).toBe(15);  // Test minimum temperature
    expect(monthlyAverages!.averageMeanHumidity).toBe(70);  // Test humidity
  });

  it("should handle partial data correctly", () => {
    // Test data with partial information - each record has only one type of data
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

    const monthlyAverages = calculateMonthlyAverages(partialWeatherRecords);  // Calculate averages from partial data
    expect(monthlyAverages).toBeDefined();  // Should return defined result
    expect(monthlyAverages!.averageMaximumTemperature).toBe(30);  // Test maximum temperature from first record
    expect(monthlyAverages!.averageMinimumTemperature).toBe(18);  // Test minimum temperature from second record
    expect(monthlyAverages!.averageMeanHumidity).toBe(60);  // Test humidity from third record
  });
});

/**
 * Test suite for extreme temperature and humidity calculations
 * 
 * This test suite verifies that the extreme value calculation functions
 * correctly identify the hottest, coldest, and most humid days from
 * weather data.
 */
describe("Extreme Temperature Calculations", () => {
  it("should find the hottest day correctly", () => {
    const hottestDay = findHottestDay(sampleWeatherRecords);  // Find hottest day
    expect(hottestDay).toBeDefined();  // Should return a result
    expect(hottestDay!.maximumTemperatureCelsius).toBe(30);  // Should be 30°C (from first record)
  });

  it("should find the coldest day correctly", () => {
    const coldestDay = findColdestDay(sampleWeatherRecords);  // Find coldest day
    expect(coldestDay).toBeDefined();  // Should return a result
    expect(coldestDay!.minimumTemperatureCelsius).toBe(18);  // Should be 18°C (from second record)
  });

  it("should find the most humid day correctly", () => {
    const mostHumidDay = findMostHumidDay(sampleWeatherRecords);  // Find most humid day
    expect(mostHumidDay).toBeDefined();  // Should return a result
    expect(mostHumidDay!.humidity).toBe(60);  // Should be 60% (from second record)
  });

  it("should return undefined for empty data", () => {
    const hottestDay = findHottestDay(emptyWeatherRecords);  // Test hottest day with empty data
    const coldestDay = findColdestDay(emptyWeatherRecords);  // Test coldest day with empty data
    const mostHumidDay = findMostHumidDay(emptyWeatherRecords);  // Test most humid day with empty data
    
    expect(hottestDay).toBeUndefined();  // Should return undefined
    expect(coldestDay).toBeUndefined();  // Should return undefined
    expect(mostHumidDay).toBeUndefined();  // Should return undefined
  });

  it("should handle single record correctly", () => {
    const hottestDay = findHottestDay(singleRecordWeatherRecords);  // Test hottest day with single record
    const coldestDay = findColdestDay(singleRecordWeatherRecords);  // Test coldest day with single record
    
    expect(hottestDay?.maximumTemperatureCelsius).toBe(25);  // Should return the single record's max temp
    expect(coldestDay?.minimumTemperatureCelsius).toBe(15);  // Should return the single record's min temp
  });
});

/**
 * Test suite for file parsing and error handling
 * 
 * This test suite verifies that the file parsing function handles
 * various error conditions gracefully, including invalid paths and
 * non-existent directories.
 */
describe("File Parsing and Error Handling", () => {
  it("should return empty array for invalid directory path", () => {
    const invalidRecords = parseWeatherFiles("/non/existent/path");  // Test with invalid path
    expect(Array.isArray(invalidRecords)).toBe(true);  // Should return an array
    expect(invalidRecords.length).toBe(0);  // Should be empty array
  });

  it("should return empty array for non-existent directory", () => {
    const invalidRecords = parseWeatherFiles("/path/that/does/not/exist");  // Test with non-existent directory
    expect(Array.isArray(invalidRecords)).toBe(true);  // Should return an array
    expect(invalidRecords.length).toBe(0);  // Should be empty array
  });
});

/**
 * Test suite for edge cases and boundary conditions
 * 
 * This test suite verifies that the application handles edge cases
 * and boundary conditions correctly, including zero values and
 * negative temperatures.
 */
describe("Edge Cases and Boundary Conditions", () => {
  it("should handle zero values correctly", () => {
    // Test data with all zero values to ensure they're processed correctly
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
    
    const monthlyAverages = calculateMonthlyAverages(zeroValueRecords);  // Calculate averages from zero values
    expect(monthlyAverages).toBeDefined();  // Should return defined result
    expect(monthlyAverages!.averageMaximumTemperature).toBe(0);  // Should handle zero max temp
    expect(monthlyAverages!.averageMinimumTemperature).toBe(0);  // Should handle zero min temp
    expect(monthlyAverages!.averageMeanHumidity).toBe(0);  // Should handle zero humidity
  });

  it("should handle negative temperatures correctly", () => {
    // Test data with negative temperatures to ensure they're processed correctly
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
    
    const coldestDay = findColdestDay(negativeTempRecords);  // Find coldest day with negative temps
    expect(coldestDay?.minimumTemperatureCelsius).toBe(-10);  // Should return -10°C
    
    const hottestDay = findHottestDay(negativeTempRecords);  // Find hottest day with negative temps
    expect(hottestDay?.maximumTemperatureCelsius).toBe(-5);  // Should return -5°C
  });
});
