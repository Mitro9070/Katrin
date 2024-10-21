import '../styles/DevicesPage.css'
import StandartCard from './StandartCard';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { navigationStore } from '../stores/NavigationStore';
import { devicesStore } from '../stores/DevicesStore';

const DevicesPage = observer(() => {

    const [currentTab, setCurrentTab] = useState('All');

    useEffect(() => {
        setCurrentTab(() => navigationStore.currentDevicesTab)
        console.log(navigationStore.currentDevicesTab)
    }, []);

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentDevicesTab(selectedTab);
    }

    const renderDevices = (type) => {
        if (type) {
            return devicesStore.getDevicesByType(type).map(e => {
                return <Link to={`/devices/${e.id}`}><StandartCard title={e.title} text={e.text} status={e.elementType} publicDate={e.postData} /></Link>
        })} else {
            return devicesStore.Devices.map(e => {
                return <Link to={`/devices/${e.id}`}><StandartCard title={e.title} text={e.text} status={e.elementType} publicDate={e.postData} /></Link>
        })}
    }

    const devicesTypeList = {'MFU': 'МФУ','Printers': 'Принтер'}

    return (  
        <div className="page-content devices-page">
            <div className="bid-page-head noselect">
                <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                <p className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''}`} data-tab="MFU" onClick={onTabClickHandler}>МФУ</p>
                <p className={`bid-page-head-tab ${currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Printers" onClick={onTabClickHandler}>Принтеры</p>
            </div>
            <div className="news-page-content">
                {currentTab !== 'All' && renderDevices(devicesTypeList[currentTab])}
                {currentTab === 'All' && renderDevices()}
            </div>
        </div>
    );
})

export default DevicesPage;