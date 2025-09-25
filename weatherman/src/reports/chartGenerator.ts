import chalk from "chalk";
import type { weatherModel } from "../models/weatherModel.js";

export function generateChartReport(data: weatherModel[], year: number, month: number): void {
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long" });
  console.log(`\n${monthName} ${year}`);

  // Get the correct number of days for this month/year
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Create a map of existing data for quick lookup
  const dataMap = new Map<number, weatherModel>();
  for (const record of data) {
    dataMap.set(record.date.getDate(), record);
  }

  // Find min and max temperatures for scaling
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  
  for (const record of data) {
    if (record.maxTempC !== undefined) maxTemp = Math.max(maxTemp, record.maxTempC);
    if (record.minTempC !== undefined) minTemp = Math.min(minTemp, record.minTempC);
  }

  // Handle edge case where all temperatures are the same
  if (minTemp === maxTemp) {
    minTemp = maxTemp - 1;
  }

  // Generate bars for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const record = dataMap.get(day);
    
    if (!record) {
      // No data file exists for this day
      console.log(`${dayStr} No data available`);
      continue;
    }
    
    // Check if we have any temperature data for this day
    const hasMaxTemp = record.maxTempC !== undefined;
    const hasMinTemp = record.minTempC !== undefined;
    
    if (!hasMaxTemp && !hasMinTemp) {
      // Data file exists but no temperature data
      console.log(`${dayStr} No data available`);
      continue;
    }
    
    // Generate max temperature bar (red)
    if (hasMaxTemp) {
      const maxBarLength = Math.max(1, Math.round((record.maxTempC! - minTemp) / (maxTemp - minTemp) * 30));
      const maxBar = "+".repeat(maxBarLength);
      console.log(`${dayStr} ${chalk.red(maxBar)} ${record.maxTempC}C`);
    }
    
    // Generate min temperature bar (blue)
    if (hasMinTemp) {
      const minBarLength = Math.max(1, Math.round((record.minTempC! - minTemp) / (maxTemp - minTemp) * 30));
      const minBar = "+".repeat(minBarLength);
      console.log(`${dayStr} ${chalk.blue(minBar)} ${record.minTempC}C`);
    }
  }
}

export function generateCombinedChartReport(data: weatherModel[], year: number, month: number): void {
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long" });
  console.log(`\n${monthName} ${year}`);

  // Get the correct number of days for this month/year
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Create a map of existing data for quick lookup
  const dataMap = new Map<number, weatherModel>();
  for (const record of data) {
    dataMap.set(record.date.getDate(), record);
  }

  // Find min and max temperatures for scaling
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  
  for (const record of data) {
    if (record.maxTempC !== undefined) maxTemp = Math.max(maxTemp, record.maxTempC);
    if (record.minTempC !== undefined) minTemp = Math.min(minTemp, record.minTempC);
  }

  // Handle edge case where all temperatures are the same
  if (minTemp === maxTemp) {
    minTemp = maxTemp - 1;
  }

  // Generate combined bars for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const record = dataMap.get(day);
    
    if (!record || record.minTempC === undefined || record.maxTempC === undefined) {
      // No data available for this day
      console.log(`${dayStr} No data available`);
      continue;
    }
    
    // Calculate bar lengths
    const minBarLength = Math.max(1, Math.round((record.minTempC - minTemp) / (maxTemp - minTemp) * 30));
    const maxBarLength = Math.max(1, Math.round((record.maxTempC - minTemp) / (maxTemp - minTemp) * 30));
    
    // Create combined bar: blue for min, red for max
    const minBar = "+".repeat(minBarLength);
    const maxBar = "+".repeat(maxBarLength);
    const combinedBar = `${chalk.blue(minBar)} - ${chalk.red(maxBar)}`;
    
    console.log(`${dayStr} ${combinedBar} ${record.minTempC}C - ${record.maxTempC}C`);
  }
}
