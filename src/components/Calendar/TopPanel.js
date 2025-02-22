// src/components/TopPanel.js

import React from 'react';
import './styles/TopPanel.css';

const TopPanel = ({ view, setView, onCreateEvent }) => {
  return (
    <div className="top-panel">
      <button onClick={onCreateEvent}>Создать событие</button>
      <button onClick={() => alert('Функциональность создания встречи будет добавлена позже')}>Создать встречу</button>
      <div className="view-switcher">
        <button onClick={() => setView('day')} className={view === 'day' ? 'active' : ''}>День</button>
        <button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>Неделя</button>
        <button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>Месяц</button>
      </div>
      <input
        type="text"
        placeholder="Поиск событий..."
        onChange={(e) => {
          // TODO: Реализовать поиск событий
        }}
      />
    </div>
  );
};

export default TopPanel;