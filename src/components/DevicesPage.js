import '../styles/DevicesPage.css'; // Импорт стилей для страницы устройств
import { useState, useEffect } from 'react'; // Импорт хуков useState и useEffect из React
import { Link, useNavigate } from 'react-router-dom'; // Импорт компонента Link из react-router-dom для навигации
import StandartCard from './StandartCard'; // Импорт компонента StandartCard для отображения карточек устройств
import { ref, get } from 'firebase/database'; // Импорт функций ref и get из firebase/database для работы с базой данных Firebase
import { database } from '../firebaseConfig'; // Импорт конфигурации Firebase
import Cookies from 'js-cookie'; // Импорт библиотеки js-cookie для работы с куки
import Loader from './Loader'; // Импорт компонента Loader для отображения индикатора загрузки
import DeviceForm from './DeviceForm'; // Импорт формы для добавления устройства
import { getPermissions } from '../utils/Permissions'; // Импорт функции getPermissions для получения разрешений

const DevicesPage = () => {
    const [currentTab, setCurrentTab] = useState('All'); // Состояние для текущей вкладки
    const [isAddDevice, setIsAddDevice] = useState(false); // Состояние для отображения формы добавления устройства
    const [devices, setDevices] = useState([]); // Состояние для устройств
    const [currentPage, setCurrentPage] = useState(1); // Состояние для текущей страницы
    const devicesPerPage = 6; // Количество устройств на странице
    const [permissions, setPermissions] = useState({ devicepage: false }); // Состояние для разрешений пользователя
    const [userName, setUserName] = useState('Гость'); // Состояние для имени пользователя
    const [showModal, setShowModal] = useState(false); // Состояние для отображения модального окна
    const [modalMessage, setModalMessage] = useState(''); // Состояние для сообщения в модальном окне
    const [loading, setLoading] = useState(true); // Состояние для индикатора загрузки
    const [error, setError] = useState(null); // Состояние для обработки ошибок
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = Cookies.get('userId');
                const roleId = Cookies.get('roleId') || '2'; // Default role ID for "Гость"
                const permissions = getPermissions(roleId);

                setPermissions(permissions);

                switch (roleId) {
                    case '1': // Администратор
                        if (!permissions.devicepage) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '3': // Авторизованный пользователь
                        if (!permissions.devicepage) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '2': // Гость
                        if (!permissions.devicepage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    case '4': // Контент-менеджер
                        if (!permissions.newspage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                await fetchDevices(); // Загрузка устройств при монтировании компонента
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные'); // Установка сообщения об ошибке
            } finally {
                setLoading(false); // Отключение индикатора загрузки
            }
        };

        fetchData(); // Вызов функции загрузки данных
        Cookies.set('currentPage', 'devices');
    }, [navigate]);

    const fetchDevices = async () => {
        try {
            const devicesRef = ref(database, 'Devices'); // Ссылка на данные устройств в базе данных Firebase
            const snapshot = await get(devicesRef); // Получение данных устройств из базы данных
            if (snapshot.exists()) {
                const devicesData = [];
                snapshot.forEach(childSnapshot => {
                    const device = childSnapshot.val(); // Получение данных устройства
                    devicesData.push({
                        id: childSnapshot.key,
                        ...device
                    });
                });
                setDevices(devicesData); // Установка состояния устройств
            }
        } catch (error) {
            console.error('Ошибка при загрузке устройств:', error); // Обработка ошибки загрузки устройств
        }
    };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab; // Получение выбранной вкладки
        setCurrentTab(selectedTab); // Установка текущей вкладки
        setCurrentPage(1); // Сброс текущей страницы при смене вкладки
    };

    const handleAddDeviceClick = () => {
        setIsAddDevice(true); // Отображение формы добавления устройства
    };

    const handleFormClose = () => {
        setIsAddDevice(false); // Скрытие формы добавления устройства
        fetchDevices(); // Перезагрузка устройств после закрытия формы
    };

    const renderDevices = (type) => {
        const filteredDevices = type ? devices.filter(device => device.type_device === type) : devices;
        const indexOfLastDevice = currentPage * devicesPerPage;
        const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
        const currentDevices = filteredDevices.slice(indexOfFirstDevice, indexOfLastDevice);

        return currentDevices.map(e => (
            <Link to={`/devices/${e.id}`} key={e.id}>
                <StandartCard title={e.id} text={e.description} status={e.type_device} publicDate={e.postData} images={e.images} />
            </Link>
        ));
    };

    const getFilteredDevices = () => {
        if (currentTab === 'All') {
            return devices;
        } else if (currentTab === 'MFU') {
            return devices.filter(device => device.type_device === 'МФУ');
        } else if (currentTab === 'Printers') {
            return devices.filter(device => device.type_device === 'Принтер');
        }
        return [];
    };

    const filteredDevices = getFilteredDevices();

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredDevices.length / devicesPerPage); i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => (
        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <a onClick={() => setCurrentPage(number)} className="page-link">
                {number}
            </a>
        </li>
    ));

    const devicesTypeList = { 'MFU': 'МФУ', 'Printers': 'Принтер' };

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="page-content devices-page">
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                        <button onClick={() => setShowModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}
            <div className="bid-page-head noselect">
                <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                <p className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''}`} data-tab="MFU" onClick={onTabClickHandler}>МФУ</p>
                <p className={`bid-page-head-tab ${currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Printers" onClick={onTabClickHandler}>Принтеры</p>
                {!isAddDevice && (
                    <div className="devices-page-btn-add" onClick={handleAddDeviceClick}>
                        <p>Добавить устройство</p>
                    </div>
                )}
            </div>
            {isAddDevice && (
                <DeviceForm setIsAddDevice={handleFormClose} />
            )}
            <div className="news-page-content">
                {currentTab !== 'All' && renderDevices(devicesTypeList[currentTab])}
                {currentTab === 'All' && renderDevices()}
            </div>
            {filteredDevices.length > devicesPerPage || currentPage > 1 ? (
                <ul className="pagination">
                    {renderPageNumbers}
                </ul>
            ) : null}
        </div>
    );
};

export default DevicesPage;