// src/components/SingleEventsPage.js

import '../styles/SingleEventsPage.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainContentSinglePage from './MainContentSinglePage';
import NotFoundPage from './NotFoundPage';
import Loader from './Loader';
import Cookies from 'js-cookie';
import { fetchEventById } from '../Controller/EventsController';
import { fetchUserById } from '../Controller/UsersController';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

const SingleEventsPage = ({ id: propId, eventData: propEventData, onClose }) => {
  const { id: routeId } = useParams();
  const id = propId || routeId; // Приоритет пропсу, если он есть

  const [eventData, setEventData] = useState(propEventData || null);
  const [organizerName, setOrganizerName] = useState('');
  const [loading, setLoading] = useState(!propEventData); // Если данные переданы, то загрузка не нужна
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      if (eventData) {
        // Если данные уже переданы через пропсы, используем их
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const token = Cookies.get('token');
        const fetchedEvent = await fetchEventById(id);

        if (fetchedEvent) {
          setEventData(fetchedEvent);
        } else {
          setError('Событие не найдено');
        }
      } catch (err) {
        console.error('Ошибка при загрузке события:', err);
        setError('Ошибка при загрузке события');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, eventData]);

  useEffect(() => {
    async function fetchOrganizer() {
      if (eventData) {
        // Получение данных организатора события
        const organizerId = eventData.owner;
        if (organizerId) {
          try {
            const userData = await fetchUserById(organizerId);
            if (userData) {
              const fullName = `${userData.name || ''} ${userData.surname || ''}`.trim();
              setOrganizerName(fullName || 'Неизвестный организатор');
            } else {
              setOrganizerName('Неизвестный организатор');
            }
          } catch (err) {
            console.error('Ошибка при загрузке организатора:', err);
            setOrganizerName('Неизвестный организатор');
          }
        } else {
          setOrganizerName(eventData.organizer || 'Неизвестный организатор');
        }
      }
    }

    if (eventData) {
      fetchOrganizer();
    }
  }, [eventData]);

  if (loading) {
    return (
      <div className="single-events-page block-slide-loader">
        <Loader />
      </div>
    );
  }
  if (error) {
    return <NotFoundPage />;
  }

  const getImageUrl = (imageUrl) => {
    return `${serverUrl}/api/webdav/image?url=${encodeURIComponent(imageUrl)}`;
  };

  return (
    <div className="single-events-page">
      {onClose && (
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      )}
      <MainContentSinglePage
        data={eventData}
        isEvent={true}
        getImageUrl={getImageUrl}
        organizerName={organizerName}
      />
    </div>
  );
};

export default SingleEventsPage;