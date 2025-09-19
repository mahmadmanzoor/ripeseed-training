import { calculateMonthlyAverages } from "./calculations/averageTemps.js";
import { parseWeatherFiles } from "./parser/weatherParser.js";
import { generateReport } from "./reports/reportGenerator.js";
import { generateChartReport, generateCombinedChartReport } from "./reports/chartGenerator.js";

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: node dist/main.js <data-dir> [-e <year>] [-a <year/month>] [-c <year/month>]");
    console.error("Examples:");
    console.error("  node dist/main.js weatherman/data -e 2002");
    console.error("  node dist/main.js weatherman/data -a 2005/6");
    console.error("  node dist/main.js weatherman/data -c 2011/03");
    console.error("  node dist/main.js weatherman/data -c 2011/03 -a 2011/3 -e 2011");
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

  // report generation and chart generation based on flags
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
      // Check if this is the bonus task (single digit month format like -c 2011/3)
      const isBonusTask = monthArg.match(/^\d{4}\/\d{1,2}$/) && !monthArg.match(/^\d{4}\/\d{2}$/);
      
      if (isBonusTask) {
        generateCombinedChartReport(monthReadings, year, month);
      } else {
        generateChartReport(monthReadings, year, month);
      }
    }
    
    // Find next -c flag
    cIndex = flags.indexOf("-c", cIndex + 1);
  }
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "2-digit" };
  return date.toLocaleDateString("en-US", options);
}

function pad2(num: number): string {
  return num.toString().padStart(2, "0");
}

main();
