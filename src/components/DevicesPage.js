import '../styles/DevicesPage.css';
import StandartCard from './StandartCard';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import Loader from './Loader'; // Добавляем импорт компонента Loader
import DeviceForm from './DeviceForm'; // Предполагается, что у вас есть форма для добавления устройства
import { navigationStore } from '../stores/NavigationStore'; // Добавляем импорт navigationStore

const DevicesPage = () => {
    const [currentTab, setCurrentTab] = useState('All');
    const [isAddDevice, setIsAddDevice] = useState(false);
    const [devices, setDevices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const devicesPerPage = 6;
    const [permissions, setPermissions] = useState({ devicepage: false });
    const [userName, setUserName] = useState('Гость');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser ? auth.currentUser.uid : Cookies.get('userId');
                console.log('Current User:', currentUser);
                let roleId = 2; // Default role ID for "Гость"

                if (currentUser) {
                    const userRef = ref(database, `Users/${currentUser}`);
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        setUserName(userData.Name);
                        roleId = userData.role;
                        console.log('User Data:', userData);
                    } else {
                        console.error('User not found');
                    }
                }

                const roleRef = ref(database, `Roles/${roleId}`);
                const roleSnapshot = await get(roleRef);
                let roleData;
                if (roleSnapshot.exists()) {
                    roleData = roleSnapshot.val();
                    setPermissions(roleData.permissions);
                    console.log('Role Data:', roleData);
                } else {
                    throw new Error('Роль не найдена');
                }

                if (!roleData.permissions.devicepage) {
                    if (roleId === 2) {
                        setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                    } else {
                        setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, обратитесь к администратору.');
                    }
                    setShowModal(true);
                    return;
                }

                setCurrentTab(() => navigationStore.currentDevicesTab);
                fetchDevices(); // Загружаем устройства при монтировании компонента
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchDevices = async () => {
        try {
            const devicesRef = ref(database, 'Devices');
            const snapshot = await get(devicesRef);
            if (snapshot.exists()) {
                const devicesData = [];
                snapshot.forEach(childSnapshot => {
                    const device = childSnapshot.val();
                    devicesData.push({
                        id: childSnapshot.key,
                        ...device
                    });
                });
                setDevices(devicesData);
            }
        } catch (error) {
            console.error('Ошибка при загрузке устройств:', error);
        }
    };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentDevicesTab(selectedTab);
        setCurrentPage(1); // Сбрасываем текущую страницу при смене вкладки
    };

    const handleAddDeviceClick = () => {
        setIsAddDevice(true);
    };

    const handleFormClose = () => {
        setIsAddDevice(false);
        fetchDevices(); // Перезагружаем устройства после закрытия формы
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