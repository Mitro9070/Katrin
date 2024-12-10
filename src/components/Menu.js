// Импортируем необходимые библиотеки и стили
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import '../styles/Menu.css';
import iconHomeImg from '../images/home.png';
import iconBookImg from '../images/book.svg';
import iconPrinterImg from '../images/printer.svg';
import iconPOImg from '../images/on-laptop.svg';
import iconCalendarImg from '../images/calendar.svg';
import iconMapImg from '../images/map-2.svg';
import iconDocImg from '../images/write-on-doc.svg';  
import iconContentImg from '../images/task-send.svg';  
import iconTechNewsImg from '../images/settings.svg';
import iconProfileImg from '../images/man.png';  
import iconAdminImg from '../images/lock.png';  
import logo from '../images/logo.png';

function Menu() {
    const currentPath = useLocation().pathname;
    const roleId = Cookies.get('roleId');
    const userId = Cookies.get('userId');
    const permissions = getPermissions(roleId);

    const onClickTabHandler = (e, path) => {
        Array.from(document.getElementsByClassName('menu-tab')).forEach((e) => e.classList.remove('menu-selected-tab'));
        !(e.currentTarget.id === 'logo') && e.currentTarget.classList.add('menu-selected-tab');
        Cookies.set('currentPage', path);
    };

    return (
        <div className="menu">
            <div className="menu-logo">
                <Link to='/'><img src={logo} alt="" className="logo-katusha" onClick={(e) => onClickTabHandler(e, '/')} id='logo' /></Link>
            </div>
            <div className="menu-tabs">
                <Link to='/'><div onClick={(e) => onClickTabHandler(e, '/')} className={`menu-tab ${currentPath === '/' ? 'menu-selected-tab' : ''}`}><img src={iconHomeImg} alt="" /><p>Главная</p></div></Link>
                <Link to='/news'><div onClick={(e) => onClickTabHandler(e, '/news')} className={`menu-tab ${currentPath === '/news' ? 'menu-selected-tab' : ''}`}><img src={iconBookImg} alt="" /><p>Новости</p></div></Link>
                <Link to="/devices"><div onClick={(e) => onClickTabHandler(e, '/devices')} className={`menu-tab ${currentPath === '/devices' ? 'menu-selected-tab' : ''}`}><img src={iconPrinterImg} alt="" /><p>Устройства</p></div></Link>
                <Link to="/software"><div onClick={(e) => onClickTabHandler(e, '/software')} className={`menu-tab ${currentPath === '/software' ? 'menu-selected-tab' : ''}`}><img src={iconPOImg} alt="" /><p>ПО</p></div></Link>
                <Link to="/events"><div onClick={(e) => onClickTabHandler(e, '/events')} className={`menu-tab ${currentPath === '/events' ? 'menu-selected-tab' : ''}`}><img src={iconCalendarImg} alt="" /><p>События</p></div></Link>
                <Link to="/map"><div onClick={(e) => onClickTabHandler(e, '/map')} className={`menu-tab ${currentPath === '/map' ? 'menu-selected-tab' : ''}`}><img src={iconMapImg} alt="" /><p>Карта</p></div></Link>
                
                {/* Обновленное условие для отображения вкладки "Заявки" */}
                {permissions.homepage && permissions.newspage && permissions.devicepage && permissions.calendarevents && permissions.map && permissions.software && 
                !(roleId === '4' || roleId === '5' || roleId === '6') && ( // Проверяем, что роль не 4, 5 или 6
                    <Link to="/bid"><div onClick={(e) => onClickTabHandler(e, '/bid')} className={`menu-tab ${currentPath === '/bid' ? 'menu-selected-tab' : ''}`}><img src={iconContentImg} alt="" /><p>Заявки</p></div> </Link>
                )}

                {(roleId === '4' || roleId === '1' || roleId === '5') && (
                    <>
                        <div className="menu-divider"></div> 
                        <Link to="/content"><div onClick={(e) => onClickTabHandler(e, '/content')} className={`menu-tab ${currentPath === '/content' ? 'menu-selected-tab' : ''}`}><img src={iconDocImg} alt="" /><p>Контент</p></div></Link> 
                    </>
                )}
                {(roleId === '6' || roleId === '1') && (
                    <>
                        <div className="menu-divider"></div> 
                        <Link to="/tech-news"><div onClick={(e) => onClickTabHandler(e, '/tech-news')} className={`menu-tab ${currentPath === '/tech-news' ? 'menu-selected-tab' : ''}`}><img src={iconTechNewsImg} alt="" /><p>Тех. новости</p></div></Link>
                    </>
                )}
                {roleId === '1' && (
                    <>
                        <div className="menu-divider"></div> 
                        <Link to="/admin"><div onClick={(e) => onClickTabHandler(e, '/admin')} className={`menu-tab ${currentPath === '/admin' ? 'menu-selected-tab' : ''}`}><img src={iconAdminImg} alt="" /><p>Администратор</p></div></Link>
                    </>
                )}
            </div>
            {(roleId === '1' || roleId === '3' || roleId === '4' || roleId === '5' || roleId === '6') && (
                <div className="menu-profile" style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
                    <Link to={`/profile/${userId}`}><div className={`menu-tab ${currentPath === `/profile/${userId}` ? 'menu-selected-tab' : ''}`}><img src={iconProfileImg} alt="" /><p>Профиль</p></div></Link>
                </div>
            )}
        </div>
    );
}

export default Menu;