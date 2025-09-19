import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import type { weatherModel } from "../models/weatherModel.js";

export function parseWeatherFiles(directoryPath: string): weatherModel[] {
  const fullDirPath = path.resolve(directoryPath);
  const files = fs.readdirSync(fullDirPath).filter(file => file.endsWith(".txt"));

  let allReadings: weatherModel[] = [];

  for (const file of files) {
    const filePath = path.join(fullDirPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const readings: weatherModel[] = records.map((row: any) => ({
      date: new Date(row["PKT"]),
      maxTempC: safeNumber(row["Max TemperatureC"]),
      meanTempC: safeNumber(row["Mean TemperatureC"]),
      minTempC: safeNumber(row["Min TemperatureC"]),
      maxHumidity: safeNumber(row["Max Humidity"]),
      meanHumidity: safeNumber(row["Mean Humidity"]),
      minHumidity: safeNumber(row["Min Humidity"]),
    }));

    allReadings = allReadings.concat(readings);
  }

  return allReadings;
}

function safeNumber(value: string | undefined): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}
