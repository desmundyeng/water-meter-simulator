import React from 'react';
import { WaterReading, WaterMeterConfig } from '../types';
import { format } from 'date-fns';

interface ReadingsHistoryProps {
  readings: WaterReading[];
  maxItems?: number;
  config: WaterMeterConfig;
  onChange: (config: WaterMeterConfig) => void;
}

const ReadingsHistory: React.FC<ReadingsHistoryProps> = ({ readings, maxItems = 10, config, onChange }) => {
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...config,
      updateInterval: parseInt(e.target.value) || 10
    });
  };

  // Show only the latest readings based on maxItems
  const displayReadings = [...readings]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  if (displayReadings.length === 0) {
    return (
      <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">Reading History</h2>
        <div className="text-black text-center py-6 text-base font-bold border-3 border-black rounded-md p-3 bg-gray-100">
          NO READINGS RECORDED YET
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">
        Reading History
        <span className="ml-2 px-2 py-0.5 bg-blue-100 border-2 border-black rounded-md text-sm">
          LAST {displayReadings.length} ENTRIES
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="">
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
          {/* <p className="mt-1 text-xs font-bold text-black">
            How often readings are recorded
          </p> */}
        </div>
      </div>
        <div className="max-h-80 overflow-y-auto border-2 border-black rounded-lg">
          <table className="min-w-full">
            <thead className="bg-black text-white sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-black uppercase">
                  Time
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-black uppercase">
                  Reading (m³)
                </th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-black uppercase">
                  Consumption (m³)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-3 divide-black">
              {displayReadings.map((reading, index) => {
                const consumptionClass = reading.consumption > 0
                  ? 'bg-green-100'
                  : reading.consumption < 0
                    ? 'bg-red-100'
                    : 'bg-gray-100';

                return (
                  <tr
                    key={reading.id || `reading-${reading.timestamp.getTime()}`}
                    className={`${consumptionClass} ${index % 2 === 0 ? 'bg-opacity-70' : 'bg-opacity-100'}`}
                  >
                    <td className="px-4 py-2 text-xs font-bold text-black">
                      {format(reading.timestamp, 'd MMM yyyy HH:mm:ss')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs font-bold font-mono">
                      {reading.reading.toFixed(4)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`font-mono font-black text-xs px-1.5 py-0.5 border-2 border-black rounded-md ${reading.consumption > 0
                          ? 'bg-green-200 text-black'
                          : reading.consumption < 0
                            ? 'bg-red-200 text-black'
                            : 'bg-gray-200 text-black'
                        }`}>
                        {reading.consumption > 0 ? '+' : ''}{reading.consumption.toFixed(4)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default ReadingsHistory; 