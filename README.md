# Water Meter Simulator

A web application that simulates a physical water meter tracking water usage and generating alarms based on water consumption patterns.

![Demo](https://raw.githubusercontent.com/desmundyeng/water-meter-simulator/refs/heads/master/demo.png)

## Features

- **Water Meter Display**: Simulates a physical water meter with readings in cubic meters (m³)
- **Configurable Flow Direction**: Support for both forward and reverse water flow
- **Alarm Detection**:
  - **Leak**: Detects small, continuous water flow over time
  - **No Flow**: Detects when there is zero water consumption over time
  - **Burst**: Detects high water consumption over a short period
  - **Backflow**: Detects reverse water flow over a threshold
- **Configurable Parameters**: All alarm thresholds and time windows are configurable
- **Reading History**: Tracks and displays water meter readings and consumption

## Technical Details

- Built with React and TypeScript
- Styled with Tailwind CSS
- State management with React hooks
- Date formatting with date-fns

## Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Start the development server:
```
npm start
```

## Configuration Options

The simulator allows configuration of the following parameters:

- **Update interval**: How frequently the meter reading updates (in seconds)
- **Flow direction**: Forward or reverse
- **Leak alarm**: Configure threshold value and time window
- **No flow alarm**: Configure time window
- **Burst alarm**: Configure threshold value and time window
- **Backflow alarm**: Configure threshold value and time window

## Usage

1. Adjust the configuration settings as needed
2. The meter will automatically start simulating water consumption
3. Active alarms will be displayed in the alarms table
4. Reading history shows the last 20 meter readings

## License

MIT
