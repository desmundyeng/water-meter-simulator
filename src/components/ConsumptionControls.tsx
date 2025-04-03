import React, { useState, useEffect } from 'react';

interface ConsumptionControlsProps {
  onApply: (rate: number) => void;
  flowDirection: 'forward' | 'reverse';
}

const ConsumptionControls: React.FC<ConsumptionControlsProps> = ({
  onApply
}) => {
  const [flowDirection, setFlowDirection] = useState<string>('forward');
  const [rate, setRate] = useState<number>(0);
  const [unit, setUnit] = useState<string>('hour');
  const [appliedFlowDirection, setAppliedFlowDirection] = useState<string>('forward');
  const [appliedRate, setAppliedRate] = useState<number>(0);
  // const [appliedUnitLabel, setAppliedUnitLabel] = useState<string>('m³/s');

  const unitOptions = [
    { value: 'second', label: 'per Second', multiplier: 1 },
    { value: 'minute', label: 'per Minute', multiplier: 60 },
    { value: 'hour', label: 'per Hour', multiplier: 3600 },
    { value: 'day', label: 'per Day', multiplier: 86400 }
  ];

  // Update when flow direction changes
  useEffect(() => {
    // Only update if we have a non-zero rate and the flow direction changes
    if (appliedRate !== 0) {
      const absRate = Math.abs(appliedRate);
      // Only make a change if the direction doesn't match the expected sign
      const currentDirection = appliedRate >= 0 ? 'forward' : 'reverse';
      if (currentDirection !== appliedFlowDirection) {
        const directedRate = appliedFlowDirection === 'forward' ? absRate : -absRate;
        setAppliedRate(directedRate);
        // We don't need to call onApply here - this creates an infinite loop
        // because it changes the parent state, which re-renders the component
      }
    }
  }, [appliedFlowDirection, appliedRate]); // Removed onApply from dependencies

  const handleApply = () => {
    // Convert rate to m³ per second based on selected unit
    const selectedUnit = unitOptions.find(option => option.value === unit);
    if (!selectedUnit) return;

    // Calculate rate in m³ per second
    const ratePerSecond = rate / selectedUnit.multiplier;

    // Apply the direction based on flowDirection
    const directedRate = flowDirection === 'forward' ? ratePerSecond : -ratePerSecond;

    // Update applied rate
    setAppliedRate(directedRate);
    // setAppliedUnitLabel(`m³/${selectedUnit.value.charAt(0)}`);
    setAppliedFlowDirection(flowDirection);

    // Call the callback
    onApply(directedRate);
  };

  // Format the applied rate for display with proper unit
  const getFormattedRate = () => {
    const absRate = Math.abs(appliedRate);

    // Choose the most appropriate unit for display
    let displayRate, displayUnit;
    if (absRate === 0) {
      return '0 m³/s';
    } else if (absRate < 0.001) {
      displayRate = (absRate * 1000000).toFixed(2);
      displayUnit = 'ml/s';
    } else if (absRate < 0.01) {
      displayRate = (absRate * 1000).toFixed(3);
      displayUnit = 'L/s';
    } else if (absRate < 1) {
      displayRate = absRate.toFixed(4);
      displayUnit = 'm³/s';
    } else {
      displayRate = absRate.toFixed(2);
      displayUnit = 'm³/s';
    }

    return `${appliedRate < 0 ? '-' : ''}${displayRate} ${displayUnit}`;
  };

  return (
    <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">Consumption Rate</h2>

      <div className="flex flex-col sm:flex-row items-end gap-4 sm:gap-6 mb-4">
        <div className="w-full sm:w-1/3 space-y-1">
          <label className="block text-xs font-bold text-black uppercase">
            Rate (m³)
          </label>
          <input
            type="number"
            min="0"
            step="0.001"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="w-full border-2 border-black rounded-md px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
          />
        </div>

        <div className="w-full sm:w-1/3 space-y-1">
          <label className="block text-xs font-bold text-black uppercase">
            Time Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border-2 border-black rounded-md px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {unitOptions.map((option) => (
              <option key={option.value} value={option.value} className="font-bold">
                {option.label.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/3 space-y-1">
          <label className="block text-xs font-bold text-black uppercase">
            Flow Direction
          </label>
          <select
            value={flowDirection}
            onChange={(e) => setFlowDirection(e.target.value as 'forward' | 'reverse')}
            className="w-full border-2 border-black rounded-md px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <option value="forward" className="font-bold">FORWARD</option>
            <option value="reverse" className="font-bold">REVERSE</option>
          </select>
        </div>
      </div>


      <div className="w-full flex justify-end">
        <button
          onClick={handleApply}
          className="w-full bg-blue-500 hover:bg-blue-600 text-black font-black py-2 px-3 border-2 border-black rounded-md focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all text-sm uppercase"
        >
          Apply Rate
        </button>
      </div>

      <div className="bg-yellow-50 border-3 border-black p-0 rounded-md mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border-2 border-black rounded-md p-2 bg-white">
            <span className="block text-xs font-bold text-black uppercase mb-1">Flow Direction</span>
            <span className={`inline-block font-black text-xs px-2 py-0.5 rounded-md border-2 border-black ${appliedFlowDirection === 'forward'
              ? 'bg-green-200'
              : 'bg-red-200'
              }`}>
              {appliedFlowDirection === 'forward' ? 'FORWARD ➡️' : 'REVERSE ⬅️'}
            </span>
          </div>

          <div className="border-2 border-black rounded-md p-2 bg-white">
            <span className="block text-xs font-bold text-black uppercase mb-1">Applied Rate</span>
            <span className={`inline-block font-black text-xs px-2 py-0.5 rounded-md border-2 border-black ${appliedRate > 0
              ? 'bg-green-200'
              : appliedRate < 0
                ? 'bg-red-200'
                : 'bg-gray-200'
              }`}>
              {getFormattedRate()}
            </span>
          </div>

          <div className="border-2 border-black rounded-md p-2 bg-white">
            <span className="block text-xs font-bold text-black uppercase mb-1">Annual Equivalent</span>
            <span className="inline-block font-black text-xs px-2 py-0.5 bg-blue-100 rounded-md border-2 border-black">
              {Math.abs(appliedRate * 31536000).toFixed(2)} m³/year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionControls; 