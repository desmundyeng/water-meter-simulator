import { WaterMeterConfig, Alarm, MeterState } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { subSeconds, differenceInSeconds } from 'date-fns';

export const generateRandomConsumption = (flowDirection: 'forward' | 'reverse'): number => {
  const baseValue = Math.random() * 0.05; // Random consumption between 0 and 0.05 m3
  return flowDirection === 'forward' ? baseValue : -baseValue;
};

// Calculate consumption amount based on rate and elapsed time
export const calculateConsumption = (
  rate: number, // m³ per second
  elapsedTimeMs: number // milliseconds
): number => {
  const elapsedTimeSeconds = elapsedTimeMs / 1000;
  return rate * elapsedTimeSeconds;
};

export const formatMeterReading = (reading: number): string => {
  // Format as #######.#### (7 integers, 4 decimals)
  return reading.toFixed(4).padStart(12, '0');
};

export const checkAlarms = (
  state: MeterState,
  config: WaterMeterConfig
): { activeAlarms: Alarm[], thresholdStatus: MeterState['thresholdStatus'] } => {
  const now = new Date();
  const activeAlarms: Alarm[] = [...state.activeAlarms];
  const thresholdStatus = { ...state.thresholdStatus };

  // Helper to get readings within a time window (now in seconds)
  const getReadingsInTimeWindow = (timeWindowSeconds: number) => {
    const timeThreshold = subSeconds(now, timeWindowSeconds);
    return state.lastReadings.filter(reading =>
      reading.timestamp >= timeThreshold
    );
  };

  // Get the current rate of consumption
  const getCurrentRate = (): number => {
    // If we have at least 2 readings, calculate the rate based on the most recent readings
    if (state.lastReadings.length >= 2) {
      const latestReading = state.lastReadings[0];
      const previousReading = state.lastReadings[1];

      // Calculate time difference in seconds
      const timeDiffMs = latestReading.timestamp.getTime() - previousReading.timestamp.getTime();
      const timeDiffSeconds = timeDiffMs / 1000;

      if (timeDiffSeconds > 0) {
        // Calculate consumption rate in m³ per second
        return (latestReading.reading - previousReading.reading) / timeDiffSeconds;
      }
    }

    // Use current - last reading to estimate current rate if we don't have 2 full readings yet
    if (state.lastReadings.length === 1) {
      const latestReading = state.lastReadings[0];
      const currentConsumption = state.currentReading - latestReading.reading;

      // Estimate time since last reading in seconds
      const timeSinceLastReadingMs = now.getTime() - latestReading.timestamp.getTime();
      const timeSinceLastReadingSeconds = timeSinceLastReadingMs / 1000;

      if (timeSinceLastReadingSeconds > 0) {
        return currentConsumption / timeSinceLastReadingSeconds;
      }
    }

    // Default to zero if we can't calculate
    return 0;
  };

  // Helper to update threshold status
  const updateThresholdStatus = (
    alarmType: keyof MeterState['thresholdStatus'],
    isConditionMet: boolean,
    currentAverage?: number
  ): void => {
    const currentStatus = thresholdStatus[alarmType];

    if (isConditionMet) {
      // If condition is newly met, set the start time
      if (!currentStatus.isThresholdMet) {
        thresholdStatus[alarmType] = {
          isThresholdMet: true,
          metSince: now,
          duration: 0,
          currentAverage
        };
      } else {
        // If condition was already met, update the duration
        const metSince = currentStatus.metSince || now;
        const durationSeconds = differenceInSeconds(now, metSince);
        thresholdStatus[alarmType] = {
          ...currentStatus,
          duration: durationSeconds,
          currentAverage
        };
      }
    } else {
      // Reset if condition is no longer met
      thresholdStatus[alarmType] = {
        isThresholdMet: false,
        duration: 0,
        currentAverage
      };
    }
  };

  // Check for leak alarm - non-zero consumption over period
  if (config.alarmConfig.leak.enabled) {
    const timeWindow = config.alarmConfig.leak.timeWindow;
    const threshold = config.alarmConfig.leak.thresholdValue;
    const readings = getReadingsInTimeWindow(timeWindow);

    if (readings.length > 0) {
      // Calculate average flow rate over the period
      const totalTime = (now.getTime() - readings[readings.length - 1].timestamp.getTime()) / 1000; // in seconds
      const totalConsumption = state.currentReading - readings[readings.length - 1].reading;

      // Calculate current rate and average consumption over the window
      const currentRate = getCurrentRate();
      const averageRate = totalTime > 0 ? totalConsumption / totalTime : 0;

      // Check if we have consistent small flow
      const hasLeak = totalTime > 0 &&
        totalConsumption > 0 &&
        averageRate < threshold &&
        averageRate > 0 &&
        currentRate > 0; // Additional check to ensure current consumption is happening

      // Update threshold status with the average rate
      updateThresholdStatus('leak', hasLeak, averageRate);

      // Check if duration threshold is met for alarm
      if (hasLeak && thresholdStatus.leak.duration >= timeWindow) {
        const existingAlarm = activeAlarms.find(a => a.type === 'leak' && a.active);

        if (!existingAlarm) {
          activeAlarms.push({
            id: uuidv4(),
            type: 'leak',
            startTime: thresholdStatus.leak.metSince || now,
            value: totalConsumption,
            active: true
          });
        }
      } else if (!hasLeak) {
        // Deactivate leak alarm if conditions no longer met
        const leakAlarmIndex = activeAlarms.findIndex(a => a.type === 'leak' && a.active);
        if (leakAlarmIndex !== -1) {
          activeAlarms[leakAlarmIndex] = {
            ...activeAlarms[leakAlarmIndex],
            endTime: now,
            active: false
          };
        }
      }
    }
  }

  // Check for no flow alarm - zero consumption over period
  if (config.alarmConfig.noFlow.enabled) {
    const timeWindow = config.alarmConfig.noFlow.timeWindow;

    // Get the current rate of consumption
    const currentRate = getCurrentRate();

    // For No Flow, check if there's any consumption happening right now
    // We consider "no flow" if the current rate is extremely small
    const hasNoFlow = Math.abs(currentRate) < 0.0001;

    // Update threshold status - this will maintain the duration timer
    // as long as hasNoFlow remains true
    updateThresholdStatus('noFlow', hasNoFlow, currentRate);

    // Check if duration threshold is met for alarm
    if (hasNoFlow && thresholdStatus.noFlow.duration >= timeWindow) {
      const existingAlarm = activeAlarms.find(a => a.type === 'noFlow' && a.active);

      if (!existingAlarm) {
        activeAlarms.push({
          id: uuidv4(),
          type: 'noFlow',
          startTime: thresholdStatus.noFlow.metSince || now,
          value: 0,
          active: true
        });
      }
    } else if (!hasNoFlow) {
      // Deactivate no flow alarm if conditions no longer met
      const noFlowAlarmIndex = activeAlarms.findIndex(a => a.type === 'noFlow' && a.active);
      if (noFlowAlarmIndex !== -1) {
        activeAlarms[noFlowAlarmIndex] = {
          ...activeAlarms[noFlowAlarmIndex],
          endTime: now,
          active: false
        };
      }
    }
  }

  // Check for burst alarm - high consumption over period
  if (config.alarmConfig.burst.enabled) {
    const timeWindow = config.alarmConfig.burst.timeWindow;
    const threshold = config.alarmConfig.burst.thresholdValue;

    // Get current flow rate and readings for the time window
    const currentRate = getCurrentRate();
    const readings = getReadingsInTimeWindow(timeWindow);
    let averageRate = currentRate;

    if (readings.length > 0) {
      // Calculate average rate over the time window
      const totalTime = (now.getTime() - readings[readings.length - 1].timestamp.getTime()) / 1000;
      const totalConsumption = state.currentReading - readings[readings.length - 1].reading;

      if (totalTime > 0) {
        averageRate = totalConsumption / totalTime;
      }
    }

    // Check for burst condition - if average rate exceeds threshold
    // Only consider it a burst if the rate is positive (consumption happening)
    const hasBurst = averageRate >= threshold && averageRate > 0;

    // Update threshold status with the average rate
    updateThresholdStatus('burst', hasBurst, averageRate);

    // Check if duration threshold is met for alarm
    if (hasBurst && thresholdStatus.burst.duration >= timeWindow) {
      const existingAlarm = activeAlarms.find(a => a.type === 'burst' && a.active);

      if (!existingAlarm) {
        activeAlarms.push({
          id: uuidv4(),
          type: 'burst',
          startTime: thresholdStatus.burst.metSince || now,
          value: averageRate,
          active: true
        });
      }
    } else if (!hasBurst) {
      // Deactivate burst alarm if conditions no longer met
      const burstAlarmIndex = activeAlarms.findIndex(a => a.type === 'burst' && a.active);
      if (burstAlarmIndex !== -1) {
        activeAlarms[burstAlarmIndex] = {
          ...activeAlarms[burstAlarmIndex],
          endTime: now,
          active: false
        };
      }
    }
  }

  // Check for backflow alarm - reverse consumption over threshold
  if (config.alarmConfig.backflow.enabled) {
    const timeWindow = config.alarmConfig.backflow.timeWindow;
    const threshold = config.alarmConfig.backflow.thresholdValue;

    // Get current flow rate
    const currentRate = getCurrentRate();

    // Get readings to calculate average over the sample period
    const readings = getReadingsInTimeWindow(timeWindow);
    let averageRate = currentRate;

    if (readings.length > 0) {
      // Calculate average rate over the time window
      const totalTime = (now.getTime() - readings[readings.length - 1].timestamp.getTime()) / 1000;
      const totalConsumption = state.currentReading - readings[readings.length - 1].reading;

      if (totalTime > 0) {
        averageRate = totalConsumption / totalTime;
      }
    }

    // Check for backflow condition - negative rate exceeding threshold
    // Only consider it backflow if the rate is negative (and not zero)
    const hasBackflow = averageRate < 0 && Math.abs(averageRate) >= threshold;

    // Update threshold status with the average rate
    updateThresholdStatus('backflow', hasBackflow, averageRate);

    // Check if duration threshold is met for alarm
    if (hasBackflow && thresholdStatus.backflow.duration >= timeWindow) {
      const existingAlarm = activeAlarms.find(a => a.type === 'backflow' && a.active);

      if (!existingAlarm) {
        activeAlarms.push({
          id: uuidv4(),
          type: 'backflow',
          startTime: thresholdStatus.backflow.metSince || now,
          value: currentRate,
          active: true
        });
      }
    } else if (!hasBackflow) {
      // Deactivate backflow alarm if conditions no longer met
      const backflowAlarmIndex = activeAlarms.findIndex(a => a.type === 'backflow' && a.active);
      if (backflowAlarmIndex !== -1) {
        activeAlarms[backflowAlarmIndex] = {
          ...activeAlarms[backflowAlarmIndex],
          endTime: now,
          active: false
        };
      }
    }
  }

  return { activeAlarms, thresholdStatus };
}; 