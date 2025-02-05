// src/utils/NotificationsListener.js

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const NotificationsListener = ({ setNotifications }) => {
  useEffect(() => {
    const token = Cookies.get('token');
    console.log('Используемый токен:', token);
    if (!token) return;

    const socket = io(process.env.REACT_APP_NOTIFICATION_SERVER_URL, {
      auth: {
        token: token,
      },
    });

    socket.on('connect', () => {
      console.log('Соединение с сервером уведомлений установлено');
    });

    socket.on('notification', (notification) => {
      console.log('Получено уведомление:', notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on('disconnect', () => {
      console.log('Соединение с сервером уведомлений разорвано');
    });

    socket.on('connect_error', (err) => {
      console.error('Ошибка подключения к серверу уведомлений:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [setNotifications]);

  return null;
};

export default NotificationsListener;