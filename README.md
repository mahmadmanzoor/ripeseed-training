# Weather Man

Weather Man is a Node.js/TypeScript application that parses daily weather data and generates reports in the console.

## Features

- Extreme Values Report (`-e`): Highest, lowest temperatures and most humid day for a year.
- Average Values Report (`-a`): Average max/min temperature and mean humidity for a month.
- Chart Report (`-c`): Daily horizontal bar charts for max and min temperatures.
- Bonus: Combined chart with min/max on the same line.

## Installation

```bash
git clone <your-repo-url>
cd ripeseed-training/weatherman
npm install
npm run build
```

## Usage

```bash
# Extreme values for a year
node dist/main.js ./sample-data -e 2004

# Average values for a month
node dist/main.js ./sample-data -a 2004/8

# Chart report for a month
node dist/main.js ./sample-data -c 2004/8

# Combine multiple reports
node dist/main.js ./sample-data -e 2004 -a 2004/8 -c 2004/8
```

## Testing

```bash
npm test
```

## Sample Data

Place CSV/TXT files in `./sample-data` folder. Example file included: `sample-data/sample_Murree_2004_Aug.txt`
