# Weather Man

Weather Man is a robust Node.js/TypeScript application that parses daily weather data and generates comprehensive reports in the console. Built with clean architecture principles and comprehensive testing.

## 🏗️ Architecture

This application follows SOLID principles and clean code practices:
- **Single Responsibility Principle**: Each module has one clear purpose
- **DRY (Don't Repeat Yourself)**: Eliminated code duplication
- **Type Safety**: Full TypeScript coverage with proper typing
- **Error Handling**: Comprehensive error handling and validation
- **Testing**: Custom test framework with 13+ test cases

## Features

- Extreme Values Report (`-e`): Highest, lowest temperatures and most humid day for a year.
- Average Values Report (`-a`): Average max/min temperature and mean humidity for a month.
- Chart Report (`-c`): Daily horizontal bar charts for max and min temperatures.
- Bonus: Combined chart with min/max on the same line.

## Installation

```bash
git clone https://github.com/mahmadmanzoor/ripeseed-training.git
cd ripeseed-training/weatherman
npm install
npm run build
```

## Usage

```bash
# Extreme values for a year
node dist/main.js sample-data -e 2004

# Average values for a month
node dist/main.js sample-data -a 2004/8

# Chart report for a month
node dist/main.js sample-data -c 2004/8

# Combine multiple reports
node dist/main.js sample-data -e 2004 -a 2004/8 -c 2004/8
```

## 🧪 Testing

The application includes a comprehensive custom testing framework:

```bash
npm test
```

**Test Coverage:**
- 13+ individual test cases
- 4 test suites organized by functionality
- Edge cases and error conditions
- Boundary value testing
- Professional test reporting with success rates

## 📁 Project Structure

```
src/
├── calculations/     # Weather calculation logic
├── constants/        # Configuration constants
├── models/          # Type definitions
├── parser/          # File parsing utilities
├── reports/         # Report generation
└── tests/           # Comprehensive test suite
```

## 🛠️ Development Scripts

```bash
npm run build        # Compile TypeScript
npm run clean        # Clean build artifacts
npm run rebuild      # Clean and rebuild
npm run dev          # Development mode
npm run test         # Run test suite
```

## 📋 Code Quality

- **Type Safety**: No `any` types, full TypeScript coverage
- **Error Handling**: Graceful error handling with user-friendly messages
- **Documentation**: JSDoc comments for all public functions
- **Clean Code**: Descriptive naming, single responsibility functions
- **Testing**: Comprehensive test coverage with professional reporting

## 📄 Sample Data

Place CSV/TXT files in `./sample-data` folder. Example file included: `sample-data/sample_Murree_2004_Aug.txt`

**Supported file formats:**
- `.txt` files with CSV data
- `.csv` files
- Multiple timezone support (PKT, UTC, GMT, etc.)
