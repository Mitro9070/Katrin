import CustomCheckbox from "./CustomCheckbox";

import '../styles/NotificationPush.css'
import BackgroundClose from "./BackgroundClose";

function NotificationPush({setShowAuthPush, setShowNotiPush}) {
    return ( 
        <>
            <div className="notification-push">
                <p className="notification-push-title">Поставить уведомления на</p>
                <div className="notification-push-checkboxes">
                    <CustomCheckbox placeholder={'Объявления'}/>
                    <CustomCheckbox placeholder={'Устройства и ПО'}/>
                    <CustomCheckbox placeholder={'Инфоповоды'}/>
                    <CustomCheckbox placeholder={'Мероприятия'}/>
                </div>
                <p className="notification-push-description">Изменить предпочтения вы сможете в “Настройках”</p>
                <div className="header-follow" onClick={() => {setShowNotiPush(); setShowAuthPush(true)}}>
                    <p>Подписаться</p>
                </div>
            </div>
            <BackgroundClose closeWindow={setShowNotiPush}/>
        </>
     );
}

export default NotificationPush;