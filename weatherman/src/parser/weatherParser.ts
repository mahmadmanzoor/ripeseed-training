import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import type { weatherModel } from "../models/weatherModel.js";

function safeNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isNaN(num) ? undefined : num;
}

export function parseWeatherFiles(directoryPath: string): weatherModel[] {
  const fullDirPath = path.resolve(directoryPath);
  const files = fs.existsSync(fullDirPath)
    ? fs.readdirSync(fullDirPath).filter(file => file.endsWith(".txt"))
    : [];

  let allReadings: weatherModel[] = [];

  for (const file of files) {
    const filePath = path.join(fullDirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const readings: weatherModel[] = records
      .map((row: any) => {
        const maxH = safeNumber(row["Max Humidity"]);
        const minH = safeNumber(row["Min Humidity"]);
        const meanH = safeNumber(row["Mean Humidity"]);

        return {
          date: new Date(String(row["PKT"])),
          maxTempC: safeNumber(row["Max TemperatureC"]),
          minTempC: safeNumber(row["Min TemperatureC"]),
          meanTempC: safeNumber(row["Mean TemperatureC"]),
          maxHumidity: maxH,
          minHumidity: minH,
          // fallback: if Mean Humidity missing but Max and Min present, use their average
          meanHumidity: meanH ?? (maxH !== undefined && minH !== undefined ? (maxH + minH) / 2 : undefined),
        };
      })
      // remove rows with invalid dates and rows that are completely empty (no useful data)
      .filter(r => !isNaN(r.date.getTime()) && (r.maxTempC !== undefined || r.minTempC !== undefined || r.meanHumidity !== undefined));

    allReadings = allReadings.concat(readings);
  }

  return allReadings;
}
