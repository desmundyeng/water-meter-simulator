import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import MeterConfig from './components/MeterConfig';
import MeterDisplay from './components/MeterDisplay';
import AlarmsDisplay from './components/AlarmsDisplay';
import ReadingsHistory from './components/ReadingsHistory';
import ConsumptionControls from './components/ConsumptionControls';
import ThresholdStatusPanel from './components/ThresholdStatusPanel';
import { WaterMeterConfig, WaterReading, MeterState } from './types';
import { checkAlarms, calculateConsumption } from './utils/meterUtils';
import { v4 as uuidv4 } from 'uuid';

// Default configuration
const defaultConfig: WaterMeterConfig = {
  updateInterval: 10, // seconds
  flowDirection: 'forward',
  consumptionRate: 0, // m³ per second
  useConstantRate: true, // false = start with random consumption
  alarmConfig: {
    leak: {
      enabled: true,
      thresholdValue: 0.02, // m3
      timeWindow: 30 // 5 minutes in seconds
    },
    noFlow: {
      enabled: true,
      timeWindow: 30 // 10 minutes in seconds
    },
    burst: {
      enabled: true,
      thresholdValue: 0.1, // m3
      timeWindow: 15 // 1 minute in seconds
    },
    backflow: {
      enabled: true,
      thresholdValue: 0.01, // m3
      timeWindow: 30 // 2 minutes in seconds
    }
  }
};

// Timing constants
const ANIMATION_FPS = 30; // Animation frames per second
const ANIMATION_INTERVAL = 1000 / ANIMATION_FPS; // ms between animation frames
const SYSTEM_TICK_INTERVAL = 1000; // System tick - 1 second for alarms and system logic

function App() {
  // State for meter configuration
  const [config, setConfig] = useState<WaterMeterConfig>(defaultConfig);

  // State for meter data
  const [meterState, setMeterState] = useState<MeterState>({
    currentReading: 0,
    lastReadings: [],
    alarms: [],
    activeAlarms: [],
    thresholdStatus: {
      leak: { isThresholdMet: false, duration: 0 },
      noFlow: { isThresholdMet: false, duration: 0 },
      burst: { isThresholdMet: false, duration: 0 },
      backflow: { isThresholdMet: false, duration: 0 }
    }
  });

  // Display reading (for smooth animation between actual readings)
  const [displayReading, setDisplayReading] = useState<number>(0);
  // Ref to track the current display reading 
  const currentReadingRef = useRef<number>(0);

  // References for timers and state tracking
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const systemTickRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnimationTimeRef = useRef<number>(Date.now());
  const nextReadingTimeRef = useRef<number>(Date.now() + config.updateInterval * 1000);
  const appliedRateRef = useRef<number>(0);

  // Update display reading and always keep the ref in sync
  const updateDisplayReading = useCallback((value: number | ((prevValue: number) => number)) => {
    setDisplayReading(currentValue => {
      // Handle both direct value and function updates
      const newValue = typeof value === 'function'
        ? (value as (prev: number) => number)(currentValue)
        : value;

      // Update ref with the new value
      currentReadingRef.current = newValue;
      return newValue;
    });
  }, []);

  // Update the consumption rate
  const handleApplyRate = useCallback((rate: number) => {
    appliedRateRef.current = rate;

    setConfig(prev => {
      if (prev.consumptionRate === rate && prev.useConstantRate === true) {
        return prev;
      }

      return {
        ...prev,
        useConstantRate: true,
        consumptionRate: rate
      };
    });
  }, []);

  // Record a reading for history
  const recordReading = useCallback(() => {
    const now = Date.now();

    setMeterState(prevState => {
      // Use the current reading ref instead of the stale displayReading closure
      const currentValue = currentReadingRef.current;

      // Calculate consumption since last reading
      const lastReading = prevState.lastReadings.length > 0 ? prevState.lastReadings[0] : null;
      const lastReadingValue = lastReading ? lastReading.reading : prevState.currentReading;
      const consumption = currentValue - lastReadingValue;

      // Create a new reading record
      const waterReading: WaterReading = {
        id: uuidv4(),
        timestamp: new Date(),
        reading: currentValue,
        consumption: consumption
      };

      // Update readings history (keep last 100 readings)
      const lastReadings = [
        waterReading,
        ...prevState.lastReadings
      ].slice(0, 100);

      return {
        ...prevState,
        currentReading: currentValue,
        lastReadings
      };
    });

    // Schedule next reading
    nextReadingTimeRef.current = now + (config.updateInterval * 1000);
  }, [config.updateInterval]);

  // Check for alarms based on current state
  const checkForAlarms = useCallback(() => {
    setMeterState(prevState => {
      // Use the current reading ref instead of the stale displayReading closure
      const currentValue = currentReadingRef.current;

      // Check for alarms
      const result = checkAlarms(
        { ...prevState, currentReading: currentValue },
        config
      );

      // Update alarms history
      const newAlarms = [...prevState.alarms];

      // Add any new alarms that weren't in the previous state
      result.activeAlarms.forEach(alarm => {
        if (!prevState.activeAlarms.some(a => a.id === alarm.id)) {
          newAlarms.push(alarm);
        }
      });

      // Update end time for alarms that are no longer active
      prevState.activeAlarms.forEach(alarm => {
        if (!result.activeAlarms.some(a => a.id === alarm.id)) {
          const alarmIndex = newAlarms.findIndex(a => a.id === alarm.id);
          if (alarmIndex !== -1) {
            newAlarms[alarmIndex] = {
              ...newAlarms[alarmIndex],
              endTime: new Date(),
              active: false
            };
          }
        }
      });

      return {
        ...prevState,
        alarms: newAlarms,
        activeAlarms: result.activeAlarms,
        thresholdStatus: result.thresholdStatus
      };
    });
  }, [config]);

  // Set up animation timer
  useEffect(() => {
    // Clear any existing animation timer
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    // Create a stable animation function
    const animateReading = () => {
      const now = Date.now();
      const elapsed = now - lastAnimationTimeRef.current;

      // Cap elapsed time to avoid large jumps after tab inactivity
      const effectiveElapsed = Math.min(elapsed, 1000);

      // Calculate new reading based on consumption mode
      if (config.useConstantRate) {
        // Use constant rate
        const consumption = calculateConsumption(appliedRateRef.current, effectiveElapsed);
        updateDisplayReading(prevReading => prevReading + consumption);
      } else {
        // Use random consumption scaled to elapsed time
        const randomFactor = 0.05; // Maximum random consumption per second
        const scaledRandomConsumption =
          (Math.random() * randomFactor * effectiveElapsed / 1000) *
          (config.flowDirection === 'forward' ? 1 : -1);

        updateDisplayReading(prevReading => prevReading + scaledRandomConsumption);
      }

      lastAnimationTimeRef.current = now;
    };

    // Initialize time tracking
    lastAnimationTimeRef.current = Date.now();

    // Create animation timer
    animationTimerRef.current = setInterval(animateReading, ANIMATION_INTERVAL);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [config.useConstantRate, config.flowDirection, updateDisplayReading]);

  // Set up system tick timer
  useEffect(() => {
    // Clear any existing system timer
    if (systemTickRef.current) {
      clearInterval(systemTickRef.current);
    }

    // Create system tick timer - this should stay stable
    const runTick = () => {
      const now = Date.now();

      // Check if it's time to record a reading
      if (now >= nextReadingTimeRef.current) {
        recordReading();
      }

      // Always check for alarms on every tick
      checkForAlarms();
    };

    // Initialize next reading time
    nextReadingTimeRef.current = Date.now() + (config.updateInterval * 1000);

    // Create system tick timer
    systemTickRef.current = setInterval(runTick, SYSTEM_TICK_INTERVAL);

    // Record initial reading
    recordReading();

    return () => {
      if (systemTickRef.current) {
        clearInterval(systemTickRef.current);
      }
    };
  }, [recordReading, checkForAlarms, config.updateInterval]);

  // Update next reading time when interval changes
  useEffect(() => {
    nextReadingTimeRef.current = Date.now() + (config.updateInterval * 1000);
  }, [config.updateInterval]);

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      <div className="max-w-full mx-auto py-0">
        <header className="bg-white border-4 border-black rounded-md mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center py-2 px-6">
            <h1 className="text-xl font-black uppercase text-black">
              Water Meter Simulator
            </h1>
            <a href="https://github.com/desmundyeng/water-meter-simulator" target="_blank" rel="noreferrer">
              <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="40" />
            </a>
            {/* <p className="text-base mt-2 font-bold">Monitor your water consumption in real-time</p> */}
          </div>
        </header>

        <main>
          <div className="max-w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Panel: Configuration & Controls */}
              <div className="flex flex-col ">
                <ConsumptionControls
                  onApply={handleApplyRate}
                  flowDirection={config.flowDirection}
                />
                <ReadingsHistory
                  config={config}
                  onChange={setConfig}
                  readings={meterState.lastReadings}
                  maxItems={20}
                />
              </div>

              {/* Right Panel: Display & History */}
              <div className="flex flex-col">
                <MeterConfig
                  config={config}
                  onChange={setConfig}
                />
              </div>
              {/* Right Panel: Display & History */}
              <div className="flex flex-col">
                <ThresholdStatusPanel
                  thresholdStatus={meterState.thresholdStatus}
                  config={config}
                />
              </div>


              {/* Right Panel: Display & History */}
              <div className="flex flex-col">

                <MeterDisplay
                  currentReading={displayReading}
                  lastReading={meterState.lastReadings[0]}
                />

                <AlarmsDisplay
                  alarms={meterState.activeAlarms}
                />
              </div>
            </div>
          </div>
        </main>

        {/* <footer className="mt-12 text-center">
          <p className="font-bold">Water Meter Simulator - Built with Neobrutalism Design</p>
        </footer> */}
      </div>
    </div>
  );
}

export default App;
