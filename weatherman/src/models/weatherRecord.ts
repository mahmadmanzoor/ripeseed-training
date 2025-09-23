/**
 * Weather data type definitions
 */

/**
 * Temperature-related weather data interface
 */
export interface TemperatureData {
  maximumTemperatureCelsius: number;
  minimumTemperatureCelsius: number;
  meanTemperatureCelsius: number;
}

/**
 * Humidity-related weather data interface
 */
export interface HumidityData {
  maximumHumidity: number;
  meanHumidity: number;
  minimumHumidity: number;
}

/**
 * Complete weather record combining temperature and humidity data
 */
export interface WeatherRecord extends TemperatureData, HumidityData {
  date: Date;
}
