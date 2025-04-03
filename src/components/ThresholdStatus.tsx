import React from 'react';
import { ThresholdStatus as ThresholdStatusType } from '../types';

interface ThresholdStatusProps {
  alarmType: string;
  status: ThresholdStatusType;
  timeWindow: number; // in seconds
  enabled: boolean;
  thresholdValue?: number; // The configured threshold to compare against
}

const ThresholdStatus: React.FC<ThresholdStatusProps> = ({
  alarmType,
  status,
  timeWindow,
  enabled,
  thresholdValue
}) => {
  if (!enabled) {
    return null;
  }

  // Calculate progress percentage
  const progressPercent = status.isThresholdMet
    ? Math.min(100, (status.duration / timeWindow) * 100)
    : 0;

  // Format value to a readable format (with appropriate units)
  const formatValue = (value?: number): string => {
    if (value === undefined) return 'N/A';

    // For backflow, show absolute value
    if (alarmType === 'backflow' && value < 0) {
      value = Math.abs(value);
    }

    // Always use m³/s with appropriate precision based on magnitude
    if (Math.abs(value) < 0.001) {
      return `${value.toFixed(8)} m³/s`;
    } else if (Math.abs(value) < 0.01) {
      return `${value.toFixed(6)} m³/s`;
    } else if (Math.abs(value) < 0.1) {
      return `${value.toFixed(5)} m³/s`;
    } else {
      return `${value.toFixed(4)} m³/s`;
    }
  };

  // Format the type name for display
  const getDisplayType = (type: string): string => {
    switch (type) {
      case 'leak': return 'Leak';
      case 'noFlow': return 'No Flow';
      case 'burst': return 'Burst';
      case 'backflow': return 'Backflow';
      default: return type;
    }
  };

  // Get appropriate threshold description based on alarm type
  const getThresholdDescription = (): React.ReactNode => {
    switch (alarmType) {
      case 'leak':
        return <>Flow below: {formatValue(thresholdValue)}</>;
      case 'noFlow':
        return <>Continuous no flow for {timeWindow}s</>;
      case 'burst':
        return <>Flow above: {formatValue(thresholdValue)}</>;
      case 'backflow':
        return <>Reverse flow above: {formatValue(thresholdValue)}</>;
      default:
        return <>Threshold: {formatValue(thresholdValue)}</>;
    }
  };

  const getSamplingDescription = (): React.ReactNode => {
    switch (alarmType) {
      case 'noFlow':
        return <></>;
        case 'leak':
      case 'burst':
      case 'backflow':
      default:
        return <>Sampling window: {timeWindow}s</>
    }
  };

  // Get appropriate current value description based on alarm type
  const getCurrentValueDescription = (): React.ReactNode => {
    if (alarmType === 'noFlow') {
      if (status.isThresholdMet) {
        return <span className="text-red-600 font-bold text-xs">No flow for {status.duration}s</span>;
      }
      return <span className="text-green-600 font-bold text-xs">Flow detected</span>;
    }

    return (
      <span className={`font-bold text-xs ${status.currentAverage !== undefined ? 'text-blue-600' : 'text-gray-500'}`}>
        Current: {formatValue(status.currentAverage)}
      </span>
    );
  };

  // Get background color based on alarm type
  const getAlarmColor = (): string => {
    switch (alarmType) {
      case 'leak': return 'bg-yellow-100';
      case 'noFlow': return 'bg-blue-100';
      case 'burst': return 'bg-red-100';
      case 'backflow': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className={`my-2 p-3 ${getAlarmColor()} border-3 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-black uppercase">
          {getDisplayType(alarmType)}
        </span>
        <span className={`px-1.5 py-0.5 rounded-md text-xs ${status.isThresholdMet ? 'bg-black text-white font-bold' : 'bg-gray-200 text-gray-700'}`}>
          {status.isThresholdMet ?
            `${status.duration}s / ${timeWindow}s` :
            'NOT ACTIVE'}
        </span>
      </div>

      {/* Show threshold values */}
      <div className="text-xs mb-2 flex justify-between font-mono">
        <span className="font-bold text-black text-xs">
          {getThresholdDescription()}
        </span>
      </div>

      <div className="text-xs mb-2 flex justify-between font-mono">
        <span className="font-bold text-black text-xs">
          {getSamplingDescription()}
        </span>
        {getCurrentValueDescription()}
      </div>


      <div className="w-full bg-white border-2 border-black rounded-md h-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 flex items-center justify-end pr-1 ${progressPercent >= 100
              ? 'bg-red-500 text-white font-bold'
              : status.isThresholdMet
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-gray-200 w-0'
            }`}
          style={{ width: status.isThresholdMet ? `${progressPercent}%` : '0%' }}
        >
          {progressPercent > 30 && status.isThresholdMet &&
            <span className="text-xs">{Math.round(progressPercent)}%</span>
          }
        </div>
      </div>
    </div>
  );
};

export default ThresholdStatus; 