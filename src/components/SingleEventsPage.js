import '../styles/SingleEventsPage.css';
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MainContentSinglePage from './MainContentSinglePage';
import NotFoundPage from './NotFoundPage';
import Loader from "./Loader";
import Cookies from 'js-cookie';
import { fetchEventById } from '../Controller/EventsController';
import { fetchUserById } from '../Controller/UsersController';
//import { navigationStore } from '../stores/NavigationStore';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

const SingleEventsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
 // const { resetEventsFilters } = navigationStore; // Импорт стора
  const [eventData, setEventData] = useState({});
  const [organizerName, setOrganizerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const referrer = new URLSearchParams(location.search).get('referrer') || '/';

  useEffect(() => {
    async function fetchEvent() {
      try {
        const token = Cookies.get('token');
        const fetchedEvent = await fetchEventById(id);

        if (fetchedEvent) {
          const transformedEvent = {
            ...fetchedEvent,
            startDate: fetchedEvent.start_date,
            endDate: fetchedEvent.end_date,
            postData: fetchedEvent.postdata || '',
            elementType: fetchedEvent.elementtype || '',
            images: fetchedEvent.images || [],
          };
          setEventData(transformedEvent);

          // Получение данных организатора события
          const organizerId = fetchedEvent.owner;
          if (organizerId) {
            const userData = await fetchUserById(organizerId);
            if (userData) {
              const fullName = `${userData.name || ''} ${userData.surname || ''}`.trim();
              setOrganizerName(fullName || 'Неизвестный организатор');
            } else {
              setOrganizerName('Неизвестный организатор');
            }
          } else {
            setOrganizerName(fetchedEvent.organizer || 'Неизвестный организатор');
          }
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
  }, [id]);

  const handleBack = () => {
    navigate(-1);
};

  if (loading) {
    return (
      <div className="page-content single-events-page block-slide-loader">
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
    <div className="page-content single-events-page">
      {/* <button onClick={handleBack} className="back-button">Назад</button> */}
      <MainContentSinglePage
        data={eventData}
        isEvent={true}
        getImageUrl={getImageUrl}
        organizerName={organizerName}
        onBack={handleBack} // Передаем обработчик назад
      />
    </div>
  );
};

export default SingleEventsPage;