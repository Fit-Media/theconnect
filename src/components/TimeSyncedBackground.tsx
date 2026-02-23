import React, { useEffect, useState } from 'react';

export const TimeSyncedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gradient, setGradient] = useState<string>('');

  useEffect(() => {
    const updateBackground = () => {
      const hour = new Date().getHours();
      let newGradient = '';

      if (hour >= 6 && hour < 11) {
        // MORNING (06:00-11:00)
        newGradient = 'bg-gradient-to-br from-[#F4EFEA] to-[#88a050] text-[#121212]';
      } else if (hour >= 11 && hour < 17) {
        // DAY (11:00-17:00)
        newGradient = 'bg-gradient-to-br from-[#3098b8] to-[#F4EFEA] text-[#121212]';
      } else if (hour >= 17 && hour < 19 || (hour === 19 && new Date().getMinutes() < 30)) {
        // SUNSET (17:00-19:30)
        newGradient = 'bg-gradient-to-br from-[#EE6C45] via-[#FFCE61] to-[#BF3475] text-white';
      } else {
        // NIGHT (19:30-06:00)
        newGradient = 'bg-gradient-to-br from-[#121212] to-[#1F214D] text-sand';
      }

      setGradient(newGradient);
    };

    updateBackground();
    // Re-evaluate occasionally in case they leave it open for hours
    const interval = setInterval(updateBackground, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-1000 ${gradient}`}>
      {children}
    </div>
  );
};
