// src/components/LeftCalendarPanel.js

import React from 'react';
import { Calendar as SmallCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './styles/LeftCalendarPanel.css';

const LeftCalendarPanel = ({ selectedDate, onDateChange }) => {
  return (
    <div className="left-calendar-panel">
      <SmallCalendar
        onChange={onDateChange}
        value={selectedDate}
        selectRange={false}
      />
      {/* Второй календарь для следующего месяца */}
      <SmallCalendar
        onChange={onDateChange}
        value={new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)}
        selectRange={false}
      />
    </div>
  );
};

export default LeftCalendarPanel;