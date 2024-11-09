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
import iconContentImg from '../images/task-send.svg';  // Импорт новой иконки для пункта "Контент"
import iconTechNewsImg from '../images/settings.svg';
import iconProfileImg from '../images/man.png';  // Импорт иконки для пункта "Профиль"
import iconAdminImg from '../images/lock.png';  // Импорт иконки для пункта "Администратор"

import logo from '../images/logo.png';

function Menu() {
    const currentPath = useLocation().pathname;
    const roleId = Cookies.get('roleId');
    const permissions = getPermissions(roleId);

    const onClickTabHandler = (e, path) => {
        Array.from(document.getElementsByClassName('menu-tab')).forEach((e) => e.classList.remove('menu-selected-tab'));
        !(e.currentTarget.id === 'logo') && e.currentTarget.classList.add('menu-selected-tab');
        Cookies.set('currentPage', path); // Сохраняем текущую страницу в куках
    };

    return (
        <div className="menu">
            <div className="menu-logo">
                <Link to='/'><img src={logo} alt="" className="logo-katusha" onClick={(e) => onClickTabHandler(e, '/')} id='logo' /></Link>
            </div>
            <div className="menu-tabs">
                <Link to='/'><div onClick={(e) => onClickTabHandler(e, '/')} className={`menu-tab ${currentPath === '/' ? 'menu-selected-tab' : ''}`}><img src={iconHomeImg} alt="" /><p>Главная</p></div></Link>
                <Link to='/news'><div onClick={(e) => onClickTabHandler(e, '/news')} className={`menu-tab ${currentPath === '/news' ? 'menu-selected-tab' : ''}`}><img src={iconBookImg} alt="" /><p>Новости</p></div></Link>
                <Link to="/devices"><span onClick={(e) => onClickTabHandler(e, '/devices')} className={`menu-tab ${currentPath === '/devices' ? 'menu-selected-tab' : ''}`}><img src={iconPrinterImg} alt="" />Устройства</span></Link>
                <Link to="/software"><span onClick={(e) => onClickTabHandler(e, '/software')} className={`menu-tab ${currentPath === '/software' ? 'menu-selected-tab' : ''}`}><img src={iconPOImg} alt="" />ПО</span></Link>
                <Link to="/events"><span onClick={(e) => onClickTabHandler(e, '/events')} className={`menu-tab ${currentPath === '/events' ? 'menu-selected-tab' : ''}`}><img src={iconCalendarImg} alt="" />События</span></Link>
                <Link to="/map"><span onClick={(e) => onClickTabHandler(e, '/map')} className={`menu-tab ${currentPath === '/map' ? 'menu-selected-tab' : ''}`}><img src={iconMapImg} alt="" />Карта</span></Link>
                {permissions.homepage && permissions.newspage && permissions.devicepage && permissions.calendarevents && permissions.map && permissions.software && (
                    <Link to="/bid"><span onClick={(e) => onClickTabHandler(e, '/bid')} className={`menu-tab ${currentPath === '/bid' ? 'menu-selected-tab' : ''}`}><img src={iconContentImg} alt="" />Заявки</span></Link>  // Используем новый значок для Заявки
                )}
                {(roleId === '4' || roleId === '1' || roleId === '5') && (
                    <>
                        <div className="menu-divider"></div> {/* Серая линия */}
                        <Link to="/content"><span onClick={(e) => onClickTabHandler(e, '/content')} className={`menu-tab ${currentPath === '/content' ? 'menu-selected-tab' : ''}`}><img src={iconDocImg} alt="" />Контент</span></Link>  
                    </>
                )}
                {(roleId === '6' || roleId === '1') && (
                    <>
                        <div className="menu-divider"></div> {/* Серая линия */}
                        <Link to="/tech-news"><span onClick={(e) => onClickTabHandler(e, '/tech-news')} className={`menu-tab ${currentPath === '/tech-news' ? 'menu-selected-tab' : ''}`}><img src={iconTechNewsImg} alt="" />Тех. новости</span></Link>
                    </>
                )}
                {roleId === '1' && (
                    <>
                        <div className="menu-divider"></div> {/* Серая линия */}
                        <Link to="/admin"><span onClick={(e) => onClickTabHandler(e, '/admin')} className={`menu-tab ${currentPath === '/admin' ? 'menu-selected-tab' : ''}`}><img src={iconAdminImg} alt="" />Администратор</span></Link>
                    </>
                )}
            </div>
            {(roleId === '1' || roleId === '3' || roleId === '4' || roleId === '5' || roleId === '6') && (
                <div className="menu-profile" style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
                    <Link to="/profile"><span className={`menu-tab ${currentPath === '/profile' ? 'menu-selected-tab' : ''}`}><img src={iconProfileImg} alt="" />Профиль</span></Link>
                </div>
            )}
        </div>
    );
}

export default Menu;