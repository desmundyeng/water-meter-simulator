import React from 'react';
import { Alarm } from '../types';
import { format } from 'date-fns';

interface AlarmsDisplayProps {
  alarms: Alarm[];
}

const AlarmsDisplay: React.FC<AlarmsDisplayProps> = ({ alarms }) => {
  const activeAlarms = alarms.filter(alarm => alarm.active);
  
  // Get alarm type display name and color
  const getAlarmInfo = (type: string) => {
    switch(type) {
      case 'leak':
        return {
          name: 'Leak Detected',
          color: 'bg-yellow-100',
          border: 'border-yellow-400',
          text: 'text-black'
        };
      case 'noFlow':
        return {
          name: 'No Flow Detected',
          color: 'bg-blue-100',
          border: 'border-blue-400',
          text: 'text-black'
        };
      case 'burst':
        return {
          name: 'Burst Detected',
          color: 'bg-red-100',
          border: 'border-red-400',
          text: 'text-black'
        };
      case 'backflow':
        return {
          name: 'Backflow Detected',
          color: 'bg-purple-100',
          border: 'border-purple-400',
          text: 'text-black'
        };
      default:
        return {
          name: 'Unknown Alarm',
          color: 'bg-gray-100',
          border: 'border-gray-400',
          text: 'text-black'
        };
    }
  };

  if (activeAlarms.length === 0) {
    return (
      <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">Water Meter Alarms</h2>
        <div className="text-black text-center py-6 text-base font-bold border-3 border-black rounded-md p-3 bg-gray-100">
          NO ACTIVE ALARMS
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">
        Water Meter Alarms
        <span className="ml-2 px-2 py-0.5 bg-red-100 border-2 border-black rounded-md text-sm">
          {activeAlarms.length} ACTIVE
        </span>
      </h2>
      
      <div className="overflow-hidden border-3 border-black rounded-md">
        <table className="min-w-full">
          <thead className="bg-black text-white">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-black uppercase">
                Alarm Type
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-black uppercase">
                Start Time
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-black uppercase">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-3 divide-black">
            {activeAlarms.map(alarm => {
              const alarmInfo = getAlarmInfo(alarm.type);
              
              return (
                <tr key={alarm.id} className={`${alarmInfo.color}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border-2 border-black ${alarmInfo.text}`}>
                      {alarmInfo.name}
                    </span>
                  </td>
                  <td className="px-4 py-3  text-xs font-bold text-black">
                    {format(alarm.startTime, 'd MMM yyyy HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-sm font-black">
                    {alarm.value.toFixed(4)} m³
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

export default AlarmsDisplay; 