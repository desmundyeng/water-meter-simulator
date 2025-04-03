import React from 'react';
import { WaterMeterConfig } from '../types';

interface MeterConfigProps {
  config: WaterMeterConfig;
  onChange: (config: WaterMeterConfig) => void;
}

const MeterConfig: React.FC<MeterConfigProps> = ({ config, onChange }) => {
  // const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   onChange({
  //     ...config,
  //     updateInterval: parseInt(e.target.value) || 10
  //   });
  // };

  // const handleFlowDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   onChange({
  //     ...config,
  //     flowDirection: e.target.value as 'forward' | 'reverse'
  //   });
  // };

  // const handleConsumptionModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   onChange({
  //     ...config,
  //     useConstantRate: e.target.checked
  //   });
  // };

  const handleAlarmConfigChange = (
    alarmType: 'leak' | 'noFlow' | 'burst' | 'backflow',
    field: string,
    value: number | boolean
  ) => {
    onChange({
      ...config,
      alarmConfig: {
        ...config.alarmConfig,
        [alarmType]: {
          ...config.alarmConfig[alarmType],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      
      <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">Alarm Configuration</h2>
      
      {/* No Flow Alarm Config */}
      <div className="bg-blue-100 border-3 border-black p-3 rounded-md mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-black uppercase">No Flow Alarm</h4>
          <label className="inline-flex items-center bg-white px-2 py-0.5 border-2 border-black rounded-md">
            <input
              type="checkbox"
              checked={config.alarmConfig.noFlow.enabled}
              onChange={(e) => handleAlarmConfigChange('noFlow', 'enabled', e.target.checked)}
              className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-4 focus:ring-blue-300"
            />
            <span className="ml-1.5 font-bold text-black text-xs">ENABLED</span>
          </label>
        </div>
        
        <div className="bg-white border-2 border-black p-2 rounded-md">
          <label className="block text-xs font-bold text-black uppercase">
            Time Window (seconds)
            <input
              type="number"
              min="1"
              value={config.alarmConfig.noFlow.timeWindow}
              onChange={(e) => handleAlarmConfigChange('noFlow', 'timeWindow', parseInt(e.target.value) || 1)}
              className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
              disabled={!config.alarmConfig.noFlow.enabled}
            />
          </label>
          <p className="mt-1 text-xs font-bold text-black">
            Duration with no flow before triggering alarm
          </p>
        </div>
      </div>
       
      {/* Leak Alarm Config */}
      <div className="bg-yellow-100 border-3 border-black p-3 rounded-md mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-black uppercase">Leak Alarm</h4>
          <label className="inline-flex items-center bg-white px-2 py-0.5 border-2 border-black rounded-md">
            <input
              type="checkbox"
              checked={config.alarmConfig.leak.enabled}
              onChange={(e) => handleAlarmConfigChange('leak', 'enabled', e.target.checked)}
              className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-4 focus:ring-blue-300"
            />
            <span className="ml-1.5 font-bold text-black text-xs">ENABLED</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border-2 border-black p-2 rounded-md">
            <label className="block text-xs font-bold text-black uppercase">
              Threshold Value (m³)
              <input
                type="number"
                min="0"
                step="0.001"
                value={config.alarmConfig.leak.thresholdValue}
                onChange={(e) => handleAlarmConfigChange('leak', 'thresholdValue', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
                disabled={!config.alarmConfig.leak.enabled}
              />
            </label>
          </div>
          
          <div className="bg-white border-2 border-black p-2 rounded-md">
            <label className="block text-xs font-bold text-black uppercase">
              Sampling Window (seconds)
              <input
                type="number"
                min="1"
                value={config.alarmConfig.leak.timeWindow}
                onChange={(e) => handleAlarmConfigChange('leak', 'timeWindow', parseInt(e.target.value) || 1)}
                className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
                disabled={!config.alarmConfig.leak.enabled}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Burst Alarm Config */}
      <div className="bg-red-100 border-3 border-black p-3 rounded-md mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-black uppercase">Burst Alarm</h4>
          <label className="inline-flex items-center bg-white px-2 py-0.5 border-2 border-black rounded-md">
            <input
              type="checkbox"
              checked={config.alarmConfig.burst.enabled}
              onChange={(e) => handleAlarmConfigChange('burst', 'enabled', e.target.checked)}
              className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-4 focus:ring-blue-300"
            />
            <span className="ml-1.5 font-bold text-black text-xs">ENABLED</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border-2 border-black p-2 rounded-md">
            <label className="block text-xs font-bold text-black uppercase">
              Threshold Value (m³)
              <input
                type="number"
                min="0"
                step="0.001"
                value={config.alarmConfig.burst.thresholdValue}
                onChange={(e) => handleAlarmConfigChange('burst', 'thresholdValue', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
                disabled={!config.alarmConfig.burst.enabled}
              />
            </label>
          </div>
          
          <div className="bg-white border-2 border-black p-2 rounded-md">
            <label className="block text-xs font-bold text-black uppercase">
              Sampling Window (seconds)
              <input
                type="number"
                min="1"
                value={config.alarmConfig.burst.timeWindow}
                onChange={(e) => handleAlarmConfigChange('burst', 'timeWindow', parseInt(e.target.value) || 1)}
                className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
                disabled={!config.alarmConfig.burst.enabled}
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* Backflow Alarm Config */}
      <div className="bg-purple-100 border-3 border-black p-3 rounded-md mb-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-black uppercase">Backflow Alarm</h4>
          <label className="inline-flex items-center bg-white px-2 py-0.5 border-2 border-black rounded-md">
            <input
              type="checkbox"
              checked={config.alarmConfig.backflow.enabled}
              onChange={(e) => handleAlarmConfigChange('backflow', 'enabled', e.target.checked)}
              className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-4 focus:ring-blue-300"
            />
            <span className="ml-1.5 font-bold text-black text-xs">ENABLED</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border-2 border-black p-2 rounded-md">
            <label className="block text-xs font-bold text-black uppercase">
              Threshold Value (m³)
              <input
                type="number"
                min="0"
                step="0.001"
                value={config.alarmConfig.backflow.thresholdValue}
                onChange={(e) => handleAlarmConfigChange('backflow', 'thresholdValue', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
                disabled={!config.alarmConfig.backflow.enabled}
              />
            </label>
          </div>
          
          <div className="bg-white border-2 border-black p-2 rounded-md">
            <label className="block text-xs font-bold text-black uppercase">
              Sampling Window (seconds)
              <input
                type="number"
                min="1"
                value={config.alarmConfig.backflow.timeWindow}
                onChange={(e) => handleAlarmConfigChange('backflow', 'timeWindow', parseInt(e.target.value) || 1)}
                className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
                disabled={!config.alarmConfig.backflow.enabled}
              />
            </label>
          </div>
        </div>
      </div>

      {/* <h3 className="text-lg font-black uppercase mb-3 mt-5 border-b-4 border-black pb-2">Water Meter Configuration</h3> */}
      
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3"> */}
        {/* <div className="bg-blue-50 border-2 border-black p-2 rounded-md">
          <label className="block text-xs font-bold text-black uppercase">
            Log Interval (seconds)
            <input
              type="number"
              min="1"
              value={config.updateInterval}
              onChange={handleIntervalChange}
              className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
          </label>
          <p className="mt-1 text-xs font-bold text-black">
            How often readings are recorded
          </p>
        </div> */}
{/*         
        <div className="bg-green-50 border-2 border-black p-2 rounded-md">
          <label className="block text-xs font-bold text-black uppercase">
            Flow Direction
            <select
              value={config.flowDirection}
              onChange={handleFlowDirectionChange}
              className="mt-1 block w-full border-2 border-black rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <option value="forward">FORWARD</option>
              <option value="reverse">REVERSE</option>
            </select>
          </label>
        </div> */}

        {/* <div className="bg-orange-50 border-2 border-black p-2 rounded-md flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.useConstantRate}
              onChange={handleConsumptionModeChange}
              className="w-4 h-4 border-2 border-black text-blue-600 focus:ring-4 focus:ring-blue-300"
            />
            <span className="ml-1.5 font-bold text-black text-xs uppercase">Use Constant Consumption Rate</span>
          </label>
        </div> */}
      {/* </div> */}
      
    </div>
  );
};

export default MeterConfig; 