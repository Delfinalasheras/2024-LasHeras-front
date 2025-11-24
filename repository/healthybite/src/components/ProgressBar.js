import React from 'react';

const ProgressBar = ({ total, goal }) => {
    const percentage = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;
    const barWidth = percentage > 100 ? 100 : percentage;
    const barColor = percentage > 100 ? 'bg-red-500' : 'bg-healthyOrange';
    
    return (
        <div className="mb-4 p-3 bg-white/60 rounded-xl shadow-inner">
            <div className="flex justify-between items-end mb-1">
                <p className="text-xs font-quicksand font-bold text-healthyDarkGray1">
                    Daily Calories
                </p>
                <p className="text-lg font-quicksand font-extrabold text-healthyDarkGray1">
                    {Math.round(total)} / {Math.round(goal)}
                </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3.5">
                <div 
                    className={`h-3.5 rounded-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${barWidth}%` }}
                ></div>
            </div>
            {percentage > 100 && (
                <p className="text-xs font-quicksand font-semibold text-red-500 mt-1">
                    ¡Objective exceeded!
                </p>
            )}
        </div>
    );
};
export default ProgressBar;