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

  // TODO: wire parser, calculations and report generation
  console.log("CLI scaffold ready — parser and reports will be wired in next steps");
  process.exit(0);
}

main();
