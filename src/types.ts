export interface WaterMeterConfig {
  updateInterval: number; // in seconds
  flowDirection: 'forward' | 'reverse';
  consumptionRate: number; // in m³ per second (constant rate)
  useConstantRate: boolean; // whether to use constant rate or random
  alarmConfig: {
    leak: {
      enabled: boolean;
      thresholdValue: number; // minimum flow rate to consider as leak
      timeWindow: number; // in seconds (was minutes)
    };
    noFlow: {
      enabled: boolean;
      timeWindow: number; // in seconds (was minutes)
    };
    burst: {
      enabled: boolean;
      thresholdValue: number; // flow rate to consider as burst
      timeWindow: number; // in seconds (was minutes)
    };
    backflow: {
      enabled: boolean;
      thresholdValue: number; // minimum reverse flow to consider as backflow
      timeWindow: number; // in seconds (was minutes)
    };
  };
}

export interface WaterReading {
  timestamp: Date;
  reading: number; // total meter reading in m3
  consumption: number; // consumption since last reading in m3
  id?: string; // optional unique identifier for each reading
}

export interface Alarm {
  id: string;
  type: 'leak' | 'noFlow' | 'burst' | 'backflow';
  startTime: Date;
  endTime?: Date;
  value: number; // the value that triggered the alarm
  active: boolean;
}

export interface ThresholdStatus {
  isThresholdMet: boolean; // whether the current threshold condition is met
  metSince?: Date; // when the threshold was first met in current period
  duration: number; // how long the threshold has been met (in seconds)
  currentAverage?: number; // current average consumption within the sampling period
}

export interface ThresholdStatuses {
  leak: ThresholdStatus;
  noFlow: ThresholdStatus;
  burst: ThresholdStatus;
  backflow: ThresholdStatus;
}

export interface MeterState {
  currentReading: number;
  lastReadings: WaterReading[];
  alarms: Alarm[];
  activeAlarms: Alarm[];
  thresholdStatus: ThresholdStatuses;
} 