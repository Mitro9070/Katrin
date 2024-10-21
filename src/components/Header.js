import '../styles/Header.css'

import { useState } from 'react';

import notificationImg from '../images/notification.svg'
import NotificationPush from './NotificationPush';

function Header({setShowAuthPush}) {

    const [ShowNotificationsSettings, setShowNotificationsSettings] = useState(false);

    const setShowNotificationsSettingsHandler = () => {
        setShowNotificationsSettings(() => !ShowNotificationsSettings)
    }

    return ( 
        <div className="header">
            <div className="header-search">
                <p>Поиск</p>
                {/* <img src={searchImg} alt="Search" /> */}
            </div>
            <div className="header-follow" onClick={() => setShowAuthPush(true)}>
                <p>Подписаться</p>
            </div>
            <div className="header-notifications" onClick={() => setShowNotificationsSettingsHandler()}>
                <img src={notificationImg} alt="Notifications" />
            </div>
            {ShowNotificationsSettings && (
               <NotificationPush setShowAuthPush={setShowAuthPush} setShowNotiPush={setShowNotificationsSettingsHandler}/> 
            )}
        </div>    
    );
}

export default Header;