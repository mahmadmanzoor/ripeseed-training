import { calculateMonthlyAverages } from "./calculations/averageTemps.js";
import { parseWeatherFiles } from "./parser/weatherParser.js";
import { generateReport } from "./reports/reportGenerator.js";
import { generateChartReport, generateCombinedChartReport } from "./reports/chartGenerator.js";

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: node dist/main.js <data-dir> [-e <year>] [-a <year/month>] [-c <year/month>]");
    console.error("Examples:");
    console.error("  node dist/main.js weatherman/sample-data -e 2002");
    console.error("  node dist/main.js weatherman/sample-data -a 2005/6");
    console.error("  node dist/main.js weatherman/sample-data -c 2011/03");
    process.exit(1);
  }

  const dataDir = args[0];
  if (!dataDir) {
    console.error("Please provide a data directory path.");
    process.exit(1);
  }

  const flags = args.slice(1);

  const readings = parseWeatherFiles(dataDir);
  console.log(`Parsed ${readings.length} records.`);

  // ----- Extreme Values -----
  let eIndex = flags.indexOf("-e");
  while (eIndex !== -1) {
    const yearArg = flags[eIndex + 1];
    if (!yearArg || !/^\d{4}$/.test(yearArg)) {
      console.error("Please provide a valid year after -e (e.g., -e 2004)");
      process.exit(1);
    }
    const year = parseInt(yearArg, 10);
    const yearReadings = readings.filter((r) => r.date.getFullYear() === year);

    if (yearReadings.length === 0) {
      console.log(`\nExtreme Values Report (${year})`);
      console.log("No data found for this year.");
    } else {
      const report = generateReport(yearReadings);
      console.log(`\nExtreme Values Report (${year})`);
      if (report.hottestDay)
        console.log(`Highest: ${report.hottestDay.maxTempC}C on ${formatDate(report.hottestDay.date)}`);
      if (report.coldestDay)
        console.log(`Lowest: ${report.coldestDay.minTempC}C on ${formatDate(report.coldestDay.date)}`);
      if (report.mostHumidDay)
        console.log(`Humidity: ${report.mostHumidDay.humidity}% on ${formatDate(report.mostHumidDay.date)}`);
    }

    eIndex = flags.indexOf("-e", eIndex + 1);
  }

  // ----- Average Values -----
  let aIndex = flags.indexOf("-a");
  while (aIndex !== -1) {
    const monthArg = flags[aIndex + 1];
    if (!monthArg || !/^\d{4}\/\d{1,2}$/.test(monthArg)) {
      console.error("Please provide a valid month after -a (e.g., -a 2004/08)");
      process.exit(1);
    }
    const [yearStr, monthStr] = monthArg.split("/") as [string, string];
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const monthReadings = readings.filter(
      (r) => r.date.getFullYear() === year && r.date.getMonth() + 1 === month
    );

    console.log(`\nAverage Values Report (${year}/${monthStr})`);

    if (monthReadings.length === 0) {
      console.log("No data found for this month.");
    } else {
      const averages = calculateMonthlyAverages(monthReadings);

      if (!averages) {
        console.log("No averages could be calculated for this month.");
      } else {
        const hAvg = averages.avgMaxTemp !== undefined ? Math.round(averages.avgMaxTemp) + "C" : "N/A";
        const lAvg = averages.avgMinTemp !== undefined ? Math.round(averages.avgMinTemp) + "C" : "N/A";
        const hum = averages.avgMeanHumidity !== undefined ? Math.round(averages.avgMeanHumidity) + "%" : "N/A";

        console.log(`Highest Average: ${hAvg}`);
        console.log(`Lowest Average: ${lAvg}`);
        console.log(`Average Mean Humidity: ${hum}`);
      }
    }

    aIndex = flags.indexOf("-a", aIndex + 1);
  }

  // ----- Chart Reports -----
  let cIndex = flags.indexOf("-c");
  while (cIndex !== -1) {
    const monthArg = flags[cIndex + 1];
    if (!monthArg || !/^\d{4}\/\d{1,2}$/.test(monthArg)) {
      console.error("Please provide a valid month after -c (e.g., -c 2011/03)");
      process.exit(1);
    }
    const [yearStr, monthStr] = monthArg.split("/") as [string, string];
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const monthReadings = readings.filter(
      (r) => r.date.getFullYear() === year && r.date.getMonth() + 1 === month
    );

    if (monthReadings.length === 0) {
      console.log(`\nChart Report (${year}/${monthStr})`);
      console.log("No data found for this month.");
    } else {
      const isBonusTask = monthArg.match(/^\d{4}\/\d{1,2}$/) && !monthArg.match(/^\d{4}\/\d{2}$/);

      if (isBonusTask) {
        generateCombinedChartReport(monthReadings, year, month);
      } else {
        generateChartReport(monthReadings, year, month);
      }
    }

    cIndex = flags.indexOf("-c", cIndex + 1);
  }
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "2-digit" };
  return date.toLocaleDateString("en-US", options);
}

main();
