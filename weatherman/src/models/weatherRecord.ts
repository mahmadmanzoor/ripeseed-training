/**
 * Weather data type definitions
 * 
 * This module defines the core data structures used throughout the application.
 * It uses interface composition to create a flexible and maintainable type system
 * that clearly separates concerns between temperature and humidity data.
 */

/**
 * Temperature-related weather data interface
 * 
 * This interface defines all temperature-related properties for a weather record.
 * All temperature values are in Celsius and can be null to represent missing data.
 * 
 * @property maximumTemperatureCelsius - The highest temperature recorded for the day
 * @property minimumTemperatureCelsius - The lowest temperature recorded for the day  
 * @property meanTemperatureCelsius - The average temperature for the day
 */
export interface TemperatureData {
  maximumTemperatureCelsius: number | null;  // Daily maximum temperature in Celsius
  minimumTemperatureCelsius: number | null;  // Daily minimum temperature in Celsius
  meanTemperatureCelsius: number | null;     // Daily average temperature in Celsius
}

/**
 * Humidity-related weather data interface
 * 
 * This interface defines all humidity-related properties for a weather record.
 * All humidity values are percentages (0-100) and can be null to represent missing data.
 * 
 * @property maximumHumidity - The highest humidity percentage recorded for the day
 * @property meanHumidity - The average humidity percentage for the day
 * @property minimumHumidity - The lowest humidity percentage recorded for the day
 */
export interface HumidityData {
  maximumHumidity: number | null;  // Daily maximum humidity percentage (0-100)
  meanHumidity: number | null;     // Daily average humidity percentage (0-100)
  minimumHumidity: number | null;  // Daily minimum humidity percentage (0-100)
}

/**
 * Complete weather record combining temperature and humidity data
 * 
 * This is the main data structure used throughout the application. It combines
 * temperature and humidity data with a date to represent a complete daily
 * weather record.
 * 
 * The interface uses composition by extending both TemperatureData and HumidityData,
 * which provides better separation of concerns and makes the code more maintainable.
 * 
 * @property date - The date this weather record represents
 */
export interface WeatherRecord extends TemperatureData, HumidityData {
  date: Date;  // The date this weather record represents
}
