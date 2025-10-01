import React, { useState } from 'react';
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StreakCounter = ({ streakDays }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleStreakClick = () => {
    setShowTooltip(true);
    // Hide the tooltip after 1 second
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);

    // Clear the timer if the component unmounts
    return () => clearTimeout(timer);
  };

  return (
    <div className="relative inline-block">
      {/* Streak display */}
      <div className="flex flex-row items-center my-4">
        <p className="text-2xl font-bold font-quicksand text-healthyOrange">{streakDays} days</p>
        <FontAwesomeIcon
          className="text-healthyOrange px-1 cursor-pointer"
          onClick={handleStreakClick}
          icon={faFire}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
        className="relative inline-block font-semibold top-30 left-1/2 transform -translate-x-1/2 bg-healthyOrange text-white font-quicksand text-sm rounded-lg p-3 w-full pb-2 pl-2  z-10 text-center"        >
          This is the number of consecutive days you've logged your food. Keep going!
        </div>
      )}
    </div>
  );
};

export default StreakCounter;



