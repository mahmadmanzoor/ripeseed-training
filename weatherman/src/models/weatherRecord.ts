/**
 * Weather data type definitions
 */

/**
 * Temperature-related weather data interface
 */
export interface TemperatureData {
  maximumTemperatureCelsius: number | null;
  minimumTemperatureCelsius: number | null;
  meanTemperatureCelsius: number | null;
}

/**
 * Humidity-related weather data interface
 */
export interface HumidityData {
  maximumHumidity: number | null;
  meanHumidity: number | null;
  minimumHumidity: number | null;
}

/**
 * Complete weather record combining temperature and humidity data
 */
export interface WeatherRecord extends TemperatureData, HumidityData {
  date: Date;
}
