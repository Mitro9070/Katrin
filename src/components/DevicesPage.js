import '../styles/DevicesPage.css';
import StandartCard from './StandartCard';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import DeviceForm from './DeviceForm'; // Предполагается, что у вас есть форма для добавления устройства
import { navigationStore } from '../stores/NavigationStore'; // Добавляем импорт navigationStore

const DevicesPage = () => {
    const [currentTab, setCurrentTab] = useState('All');
    const [isAddDevice, setIsAddDevice] = useState(false);
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        setCurrentTab(() => navigationStore.currentDevicesTab);
        fetchDevices(); // Загружаем устройства при монтировании компонента
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
    };

    const handleAddDeviceClick = () => {
        setIsAddDevice(true);
    };

    const handleFormClose = () => {
        setIsAddDevice(false);
        fetchDevices(); // Перезагружаем устройства после закрытия формы
    };

    const renderDevices = (type) => {
        if (type) {
            return devices.filter(device => device.type_device === type).map(e => {
                return <Link to={`/devices/${e.id}`} key={e.id}><StandartCard title={e.id} text={e.description} status={e.type_device} publicDate={e.postData} images={e.images} /></Link>
            });
        } else {
            return devices.map(e => {
                return <Link to={`/devices/${e.id}`} key={e.id}><StandartCard title={e.id} text={e.description} status={e.type_device} publicDate={e.postData} images={e.images} /></Link>
            });
        }
    };

    const devicesTypeList = { 'MFU': 'МФУ', 'Printers': 'Принтер' };

    return (
        <div className="page-content devices-page">
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
        </div>
    );
};

export default DevicesPage;