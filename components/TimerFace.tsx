import React, { useMemo } from 'react';
import { describeArc } from '../utils/timeUtils';
import { TimerMode } from '../types';

interface TimerFaceProps {
  elapsedSeconds: number;
  targetMinutes: number; // The user's goal
  mode: TimerMode;
  color: string;
}

const TimerFace: React.FC<TimerFaceProps> = ({ 
  elapsedSeconds, 
  targetMinutes, 
  mode,
  color
}) => {
  const radius = 120;
  const strokeWidth = 8;
  const center = 150;
  
  // Fixed scale of 60 minutes (Standard Analog Clock)
  const displayScaleMinutes = 60;
  const totalSecondsInScale = displayScaleMinutes * 60;
  
  // Calculate Wedge Geometry
  let startAngle = 0;
  let endAngle = 0;

  if (mode === TimerMode.GROWTH) {
    // Growth: Starts at 0, grows to current elapsed
    // We cap it so it doesn't loop around visually if they go overtime
    const cappedElapsed = Math.min(elapsedSeconds, totalSecondsInScale);
    endAngle = (cappedElapsed / totalSecondsInScale) * 360;
  } else {
    // Countdown: Visualizes REMAINING time.
    // However, usually visual timers represent the *target* duration as a wedge that shrinks.
    // So if Target is 15m, we draw a 15m wedge, and subtract elapsed from it.
    
    const targetSeconds = targetMinutes * 60;
    const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
    
    // The wedge size is based on remaining time relative to the full circle scale
    endAngle = (remainingSeconds / totalSecondsInScale) * 360;
  }

  // Generate Ticks
  const ticks = useMemo(() => {
    const tickElements = [];
    const numberOfTicks = displayScaleMinutes; 
    
    for (let i = 0; i < numberOfTicks; i++) {
      const angle = (i / numberOfTicks) * 360;
      // Major tick every 5 minutes
      const isMajor = i % 5 === 0;
      const length = isMajor ? 10 : 5;
      const tickRadius = radius + 15;
      
      const transform = `rotate(${angle}, ${center}, ${center})`;
      
      tickElements.push(
        <line
          key={i}
          x1={center}
          y1={center - tickRadius}
          x2={center}
          y2={center - tickRadius + length}
          stroke={isMajor ? "#94a3b8" : "#cbd5e1"}
          strokeWidth={isMajor ? 3 : 1}
          transform={transform}
        />
      );

      // Add numbers for 5-minute intervals
      if (isMajor) {
        if (i === 0) {
           // Top marker "0"
           tickElements.push(
             <text key={`text-${i}`} x={center} y={center - tickRadius - 5} textAnchor="middle" className="text-xs fill-slate-400 font-bold">0</text>
           )
        } else if (i === 15 || i === 30 || i === 45) {
             // Optional: Add 15, 30, 45 numbers for better legibility if desired
             // Keeping it minimal for now as per original design, but 0 is helpful anchor.
        }
      }
    }
    return tickElements;
  }, [displayScaleMinutes]);

  // Target Marker logic (Gold Star)
  let targetAngle = 0;
  let showTarget = false;

  if (mode === TimerMode.GROWTH) {
     targetAngle = (targetMinutes * 60 / totalSecondsInScale) * 360;
     showTarget = targetMinutes > 0 && targetMinutes <= displayScaleMinutes;
  } else {
     // In countdown, start position is fixed at 0 for "Target" (Start)
     targetAngle = 0; 
     showTarget = true;
  }

  return (
    <div className="relative flex justify-center items-center drop-shadow-xl">
      <svg width="300" height="300" viewBox="0 0 300 300" className="transition-all duration-300">
        {/* Background Circle (White face) */}
        <circle cx={center} cy={center} r={radius} fill="white" stroke="#e2e8f0" strokeWidth={strokeWidth} />

        {/* The Colored Wedge */}
        <path
          d={describeArc(center, center, radius - strokeWidth/2, 0, endAngle)}
          fill={color}
          className="transition-all duration-100 ease-linear opacity-90"
        />

        {/* Ticks */}
        {ticks}

        {/* Target Marker Star */}
        {showTarget && (
           <g transform={`rotate(${targetAngle}, ${center}, ${center})`}>
             <polygon
                points={`${center},${center - radius + 10} ${center - 5},${center - radius - 5} ${center + 5},${center - radius - 5}`}
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth="2"
             />
           </g>
        )}
        
        {/* Center hub */}
        <circle cx={center} cy={center} r="8" fill="#334155" />
      </svg>
    </div>
  );
};

export default TimerFace;