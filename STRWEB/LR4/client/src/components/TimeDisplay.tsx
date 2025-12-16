import React, { useState, useEffect } from 'react';
import './TimeDisplay.css';

interface TimeDisplayProps {
  showTimezone?: boolean;
  showLocalTime?: boolean;
  showUTCTime?: boolean;
  updateInterval?: number;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  showTimezone = true, 
  showLocalTime = true, 
  showUTCTime = true,
  updateInterval = 1000 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  const formatDate = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="time-display">
      {showTimezone && (
        <div className="time-item">
          <span className="time-label">Ваша таймзона:</span>
          <span className="time-value">{userTimezone}</span>
        </div>
      )}
      {showLocalTime && (
        <div className="time-item">
          <span className="time-label">Локальное время:</span>
          <span className="time-value">{formatDate(currentTime, userTimezone)}</span>
        </div>
      )}
      {showUTCTime && (
        <div className="time-item">
          <span className="time-label">UTC время:</span>
          <span className="time-value">{formatDate(currentTime, 'UTC')}</span>
        </div>
      )}
    </div>
  );
};

TimeDisplay.defaultProps = {
  showTimezone: true,
  showLocalTime: true,
  showUTCTime: true,
  updateInterval: 1000
};

export default TimeDisplay;

