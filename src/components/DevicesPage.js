import '../styles/DevicesPage.css'; // Импорт стилей для страницы устройств
import { useState, useEffect } from 'react'; // Импорт хуков useState и useEffect из React
import { Link, useNavigate } from 'react-router-dom'; // Импорт компонента Link из react-router-dom для навигации
import StandartCard from './StandartCard'; // Импорт компонента StandartCard для отображения карточек устройств
import { ref, get, remove } from 'firebase/database'; // Импорт функций ref, get и remove из firebase/database
import { ref as storageRef, deleteObject } from 'firebase/storage'; // Импорт функций ref и deleteObject из firebase/storage
import { database, storage } from '../firebaseConfig'; // Импорт конфигурации Firebase
import Cookies from 'js-cookie'; // Импорт библиотеки js-cookie для работы с куки
import Loader from './Loader'; // Импорт компонента Loader для отображения индикатора загрузки
import DeviceForm from './DeviceForm'; // Импорт формы для добавления устройства
import { getPermissions } from '../utils/Permissions'; // Импорт функции getPermissions для получения разрешений
import trashIcon from '../images/trash-delete.png'; // Импорт иконки удаления

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
    const [isDeleting, setIsDeleting] = useState(false); // Состояние для индикатора удаления
    const [error, setError] = useState(null); // Состояние для обработки ошибок
    const navigate = useNavigate();
    const roleId = Cookies.get('roleId') || '2'; // Default role ID for "Гость"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = Cookies.get('userId');
                const permissions = getPermissions(roleId);

                setPermissions(permissions);

                switch (roleId) {
                    case '1': // Администратор
                    case '3': // Авторизованный пользователь
                    case '4': // Контент-менеджер
                    case '5': // Менеджер событий
                    case '6': // Техник
                        if (!permissions.devicepage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    case '2': // Гость
                        if (!permissions.devicepage) {
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

    const deleteDevice = async (deviceId, images) => {
        setIsDeleting(true);
        try {
            const deviceRef = ref(database, `Devices/${deviceId}`);
            await remove(deviceRef);

            // Удаление изображений из Storage
            if (Array.isArray(images)) {
                for (const image of images) {
                    // Извлечение пути файла из URL
                    const path = image.split('/o/')[1].split('?')[0].replace(/%2F/g, '/');
                    const imageRef = storageRef(storage, path);
                    await deleteObject(imageRef);
                }
            }

            // Обновление списка устройств
            fetchDevices();
        } catch (error) {
            console.error('Ошибка при удалении устройства:', error);
        } finally {
            setIsDeleting(false);
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
        const filteredDevices = type ? devices.filter(device => device.options_all_type_of_automatic_document_feeder === type) : devices;
        const indexOfLastDevice = currentPage * devicesPerPage;
        const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
        const currentDevices = filteredDevices.slice(indexOfFirstDevice, indexOfLastDevice);

        return currentDevices.map(e => (
            <div key={e.id} className="device-card-wrapper">
                <Link to={`/devices/${e.id}`} key={e.id}>
                    <StandartCard title={e.id} text={e.description} status={e.options_all_type_of_automatic_document_feeder} publicDate={e.postData} images={e.images} />
                </Link>
                {roleId === '1' && (
                    <img
                        src={trashIcon}
                        alt="Удалить устройство"
                        className="delete-icon"
                        onClick={() => deleteDevice(e.id, e.images)}
                    />
                )}
            </div>
        ));
    };

    const getFilteredDevices = () => {
        if (currentTab === 'All') {
            return devices;
        } else if (currentTab === 'MFU') {
            return devices.filter(device => device.options_all_type_of_automatic_document_feeder === 'МФУ');
        } else if (currentTab === 'Printers') {
            return devices.filter(device => device.options_all_type_of_automatic_document_feeder === 'Принтер');
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

    if (loading || isDeleting) return <Loader />;
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
                {!isAddDevice && roleId === '1' && (
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