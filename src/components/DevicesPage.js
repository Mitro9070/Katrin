// DevicesPage.js

import '../styles/DevicesPage.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StandartCard from './StandartCard';
import Cookies from 'js-cookie';
import Loader from './Loader';
import DeviceForm from './DeviceForm';
import { getPermissions } from '../utils/Permissions';
import trashIcon from '../images/trash-delete.png';
import noPhotoImg from '../images/nofoto2.jpg';

import { getDevices, deleteDevice } from '../Controller/DevicesController';
import { getImageUrl } from '../utils/getImageUrl';

const DevicesPage = () => {
    const [currentTab, setCurrentTab] = useState('All');
    const [isAddDevice, setIsAddDevice] = useState(false);
    const [devices, setDevices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [permissions, setPermissions] = useState({ devicepage: false });
    const [userName, setUserName] = useState('Гость');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const roleId = Cookies.get('roleId') || '2';

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setModalMessage('Вы не авторизованы. Пожалуйста, войдите в систему.');
                setShowModal(true);
                return;
            }

            try {
                const permissions = getPermissions(roleId);
                setPermissions(permissions);

                // Проверяем роль пользователя
                switch (roleId) {
                    case '1': // Администратор
                    case '3': // Авторизованный пользователь
                    case '4': // Контент-менеджер
                    case '5': // Менеджер событий
                    case '6': // Техник
                        if (!permissions.devicepage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы.');
                            setShowModal(true);
                            return;
                        }
                        break;
                    case '2': // Гость
                        if (!permissions.devicepage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true);
                            return;
                        }
                        break;
                    default:
                        setModalMessage('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        setShowModal(true);
                        return;
                }

                await fetchDevices(currentPage, currentTab);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        Cookies.set('currentPage', 'devices');
    }, [navigate, roleId, currentPage, currentTab]);

    const fetchDevices = async (page, type) => {
        setLoading(true);
        try {
            const response = await getDevices(page, type);
            setDevices(response.devices);
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
        } catch (error) {
            console.error('Ошибка при загрузке устройств:', error);
            if (error.response && error.response.status === 401) {
                setModalMessage('Сессия истекла. Пожалуйста, войдите в систему заново.');
                setShowModal(true);
            } else {
                setError('Не удалось загрузить данные');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        setIsDeleting(true);
        try {
            await deleteDevice(deviceId);
            fetchDevices(currentPage, currentTab);
        } catch (error) {
            console.error('Ошибка при удалении устройства:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        setCurrentPage(1);
        fetchDevices(1, selectedTab);
    };

    const handleAddDeviceClick = () => {
        setIsAddDevice(true);
    };

    const handleFormClose = () => {
        setIsAddDevice(false);
        fetchDevices(currentPage, currentTab);
    };

    const renderDevices = () => {
        return devices.map(device => (
            <div key={device.id} className="device-card-wrapper">
                <Link to={`/devices/${device.id}`}>
                    <StandartCard
                        title={device.name}
                        text={device.description}
                        status={device.type}
                        images={[getImageUrl(device.main_image) || noPhotoImg]}
                    />
                </Link>
                {roleId === '1' && (
                    <img
                        src={trashIcon}
                        alt="Удалить устройство"
                        className="delete-icon"
                        onClick={() => handleDeleteDevice(device.id)}
                    />
                )}
            </div>
        ));
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => (
        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button onClick={() => { setCurrentPage(number); fetchDevices(number, currentTab); }} className="page-link">
                {number}
            </button>
        </li>
    ));

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
                <p
                    className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`}
                    data-tab="All"
                    onClick={onTabClickHandler}
                >
                    Все
                </p>
                <p
                    className={`bid-page-head-tab ${currentTab === 'МФУ' ? 'bid-page-head-tab-selected' : ''}`}
                    data-tab="МФУ"
                    onClick={onTabClickHandler}
                >
                    МФУ
                </p>
                <p
                    className={`bid-page-head-tab ${currentTab === 'Принтер' ? 'bid-page-head-tab-selected' : ''}`}
                    data-tab="Принтер"
                    onClick={onTabClickHandler}
                >
                    Принтеры
                </p>
                {!isAddDevice && roleId === '1' && (
                    <div className="devices-page-btn-add" onClick={handleAddDeviceClick}>
                        <p>Редактировать устройство</p>
                    </div>
                )}
            </div>
            {isAddDevice && (
                <DeviceForm setIsAddDevice={handleFormClose} />
            )}
            <div className="news-page-content">
                {renderDevices()}
            </div>
            {totalPages > 1 && (
                <ul className="pagination">
                    {renderPageNumbers}
                </ul>
            )}
        </div>
    );
};

export default DevicesPage;