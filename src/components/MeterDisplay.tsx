import React, { useEffect, useRef, useState, memo } from 'react';
import { WaterReading } from '../types';
import { formatMeterReading } from '../utils/meterUtils';
import { format } from 'date-fns';

interface MeterDisplayProps {
  currentReading: number;
  lastReading?: WaterReading | null;
}

// Use memo to prevent unnecessary re-renders
const MeterDisplay: React.FC<MeterDisplayProps> = memo(({ currentReading, lastReading }) => {
  // Format current reading with 7 integer digits and 4 decimal places
  const formattedReading = formatMeterReading(currentReading);
  const [integerPart, decimalPart] = formattedReading.split('.');

  // Calculate consumption since last reading
  const consumption = lastReading ? (currentReading - lastReading.reading) : 0;
  const consumptionFormatted = consumption.toFixed(4);
  // const consumptionClass = consumption > 0 
  //   ? 'text-green-600' 
  //   : consumption < 0 
  //     ? 'text-red-600' 
  //     : 'text-gray-600';
  
  // Reference to the last animation frame for the active digit
  const lastDigitAnimRef = useRef<number | null>(null);
  const activeDigitRef = useRef<HTMLElement | null>(null);
  
  // Keep track of the last visible reading for animation purposes
  const [lastAnimatedReading, setLastAnimatedReading] = useState<string>(formattedReading);
  
  // Animation effect - only trigger when the displayed value changes significantly
  useEffect(() => {
    if (lastAnimatedReading !== formattedReading) {
      setLastAnimatedReading(formattedReading);
      
      // Clear any existing animation
      if (lastDigitAnimRef.current) {
        clearTimeout(lastDigitAnimRef.current);
      }
      
      // Find the last digit element
      const lastDigitElement = document.querySelector('[data-digit="last"]');
      if (lastDigitElement) {
        activeDigitRef.current = lastDigitElement as HTMLElement;
        
        // Add a pulse animation
        activeDigitRef.current.classList.add('bg-blue-800');
        
        // Remove the animation after a short delay
        lastDigitAnimRef.current = window.setTimeout(() => {
          if (activeDigitRef.current) {
            activeDigitRef.current.classList.remove('bg-blue-800');
          }
        }, 150);
      }
    }
    
    return () => {
      if (lastDigitAnimRef.current) {
        clearTimeout(lastDigitAnimRef.current);
      }
    };
  }, [formattedReading, lastAnimatedReading]);
  
  return (
    <div className="bg-white border-4 border-black rounded-md p-5 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col items-center justify-center mb-4">
        <h2 className="text-md font-black uppercase mb-4 border-b-4 border-black pb-2">Water Meter Reading</h2>
        
        {/* Digital meter display */}
        <div className="bg-white border-3 border-black rounded-md p-3 w-full max-w-md flex justify-center mb-4">
          <div className="flex">
            {/* Integer part */}
            {integerPart.split('').map((digit, idx) => (
              <div 
                key={`int-${idx}`}
                className="bg-black text-white font-mono text-xl md:text-2xl w-7 md:w-8 h-10 md:h-12 flex items-center justify-center mx-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {digit}
              </div>
            ))}
            
            {/* Decimal point */}
            <div className="font-mono text-2xl font-black flex items-center justify-center mx-0.5">
              .
            </div>
            
            {/* Decimal part */}
            {decimalPart.split('').map((digit, idx) => {
              const isLastDigit = idx === decimalPart.length - 1;
              return (
                <div 
                  key={`dec-${idx}`}
                  data-digit={isLastDigit ? "last" : ""}
                  className={`bg-black text-white font-mono text-xl md:text-2xl w-7 md:w-8 h-10 md:h-12 flex items-center justify-center mx-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isLastDigit ? 'relative' : ''}`}
                >
                  {digit}
                  {isLastDigit && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  )}
                </div>
              );
            })}
            
            {/* Unit */}
            {/* <div className="ml-2 flex items-center text-base font-black text-black">
              m³
            </div> */}
          </div>
        </div>
        
        {/* Last consumption */}
        <div className="w-full border-3 border-black p-3 rounded-md">
          <p className="text-sm font-bold text-black mb-1">
            Last recorded: {lastReading ? format(lastReading.timestamp, 'HH:mm:ss - dd/MM/yyyy') : 'N/A'}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-black text-sm">Consumption since last recording:</span>
            <span className={`font-black text-sm px-2 py-0.5 border-2 border-black rounded-md ${
              consumption > 0 
                ? 'bg-green-200' 
                : consumption < 0 
                  ? 'bg-red-200' 
                  : 'bg-gray-200'
            }`}>
              {consumption > 0 ? '+' : ''}{consumptionFormatted} m³
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MeterDisplay; 