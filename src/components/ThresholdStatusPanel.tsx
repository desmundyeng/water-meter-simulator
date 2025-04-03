import React from 'react';
import { WaterMeterConfig, ThresholdStatuses } from '../types';
import ThresholdStatus from './ThresholdStatus';

interface ThresholdStatusPanelProps {
  thresholdStatus: ThresholdStatuses;
  config: WaterMeterConfig;
}

const ThresholdStatusPanel: React.FC<ThresholdStatusPanelProps> = ({ 
  thresholdStatus,
  config
}) => {
  return (
    <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">Alarm Status</h2>
      
      <div className="space-y-3">
        
        <ThresholdStatus 
          alarmType="noFlow" 
          status={thresholdStatus.noFlow}
          timeWindow={config.alarmConfig.noFlow.timeWindow}
          enabled={config.alarmConfig.noFlow.enabled}
        />
        
        <ThresholdStatus 
          alarmType="leak" 
          status={thresholdStatus.leak}
          timeWindow={config.alarmConfig.leak.timeWindow}
          enabled={config.alarmConfig.leak.enabled}
          thresholdValue={config.alarmConfig.leak.thresholdValue}
        />
        
        <ThresholdStatus 
          alarmType="burst" 
          status={thresholdStatus.burst}
          timeWindow={config.alarmConfig.burst.timeWindow}
          enabled={config.alarmConfig.burst.enabled}
          thresholdValue={config.alarmConfig.burst.thresholdValue}
        />
        
        <ThresholdStatus 
          alarmType="backflow" 
          status={thresholdStatus.backflow}
          timeWindow={config.alarmConfig.backflow.timeWindow}
          enabled={config.alarmConfig.backflow.enabled}
          thresholdValue={config.alarmConfig.backflow.thresholdValue}
        />
      </div>
    </div>
  );
};

export default ThresholdStatusPanel; 