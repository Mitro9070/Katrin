import { Link, useLocation } from 'react-router-dom';

import '../styles/Menu.css'
import iconBookImg from '../images/book.svg'
import iconPrinterImg from '../images/printer.svg'
import iconPOImg from '../images/on-laptop.svg'
import iconCalendarImg from '../images/calendar.svg'
import iconMapImg from '../images/map-2.svg'
import iconDocImg from '../images/write-on-doc.svg'

import logo from '../images/logo.png'

function Menu({setShowAuthPush}) {

    const currentPath = useLocation().pathname;

    const onClickTabHandler = (e) => {
        Array.from(document.getElementsByClassName('menu-tab')).forEach((e) => e.classList.remove('menu-selected-tab'))
        !(e.currentTarget.id === 'logo') && e.currentTarget.classList.add('menu-selected-tab')
    }

    return ( 
        <div className="menu">
            <div className="menu-logo">
                {/* <p>Лого</p> */}
                <Link to='/'><img src={logo} alt="" className="logo-katusha" onClick={onClickTabHandler} id='logo'/></Link>
            </div>
            <div className="menu-tabs">
                <Link to='/news' ><div onClick={onClickTabHandler} className={`menu-tab ${currentPath === '/news' ? 'menu-selected-tab' : ''}`}><img src={iconBookImg} alt="" /><p>Новости</p></div></Link>
                <Link to="/devices" ><span onClick={onClickTabHandler} className={`menu-tab ${currentPath === '/devices' ? 'menu-selected-tab' : ''}`}><img src={iconPrinterImg} alt="" />Устройства</span></Link>
                <Link to="/software" ><span onClick={onClickTabHandler} className={`menu-tab ${currentPath === '/software' ? 'menu-selected-tab' : ''}`}><img src={iconPOImg} alt="" />ПО</span></Link>
                <Link to="/events" ><span onClick={onClickTabHandler} className={`menu-tab ${currentPath === '/events' ? 'menu-selected-tab' : ''}`}><img src={iconCalendarImg} alt="" />События</span></Link>
                <Link to="/map" ><span onClick={onClickTabHandler} className={`menu-tab ${currentPath === '/map' ? 'menu-selected-tab' : ''}`}><img src={iconMapImg} alt="" />Карта</span></Link>
                <Link to="/bid" ><span onClick={onClickTabHandler} className={`menu-tab ${currentPath === '/bid' ? 'menu-selected-tab' : ''}`}><img src={iconDocImg} alt="" />Заявки</span></Link>
            </div>
            <div className="menu-profile" onClick={() => setShowAuthPush(true)}>
                <p className="menu-auth-text">Войти</p>
            </div>
        </div>
     );
}

export default Menu;
