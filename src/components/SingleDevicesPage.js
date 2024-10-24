import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import '../styles/SingleBidPage.css';
import '../styles/SingleDevicesPage.css';

import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import { navigationStore } from '../stores/NavigationStore';
import MainContentSinglePage from './MainContentSinglePage';

import imgSaveIcon from '../images/save-2.svg';
import imgOpenDownIcon from '../images/select-open-down.svg';

const SingleDevicesPage = () => {
    const { id } = useParams();

    const [currentTab, setCurrentTab] = useState('All');
    const [device, setDevice] = useState({});
    const [allParameters, setAllParameters] = useState(false);

    useEffect(() => {
        setCurrentTab(() => navigationStore.currentDevicesTab);
        fetchDevice(id);
    }, [id]);

    const fetchDevice = async (deviceId) => {
        try {
            const deviceRef = ref(database, `Devices/${deviceId}`);
            const snapshot = await get(deviceRef);
            if (snapshot.exists()) {
                setDevice(snapshot.val());
            }
        } catch (error) {
            console.error('Ошибка при загрузке устройства:', error);
        }
    };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentDevicesTab(selectedTab);
    };

    return (
        <div className='page-content devices-single-page'>
            <Link to={'/devices'}>
                <div className="bid-page-head noselect">
                    <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                    <p className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''}`} data-tab="MFU" onClick={onTabClickHandler}>МФУ</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Printers" onClick={onTabClickHandler}>Принтеры</p>
                </div>
            </Link>
            <MainContentSinglePage linkTo={'/devices'} onClick={() => navigationStore.setCurrentDevicesTab(currentTab)} data={device} isDevice={true} />
            <div className="devices-info-btns">
                <div className="devices-info-btn">
                    <img src={imgSaveIcon} alt="" />
                    <p>Информация</p>
                </div>
                <div className="devices-info-btn">
                    <img src={imgSaveIcon} alt="" />
                    <p>Информация</p>
                </div>
                <div className="devices-info-btn">
                    <img src={imgSaveIcon} alt="" />
                    <p>Информация</p>
                </div>
                <div className="devices-info-btn">
                    <img src={imgSaveIcon} alt="" />
                    <p>Информация</p>
                </div>
                <div className="devices-info-btn">
                    <img src={imgSaveIcon} alt="" />
                    <p>Информация</p>
                </div>
            </div>
            <div className="devices-info-table">
                <div className="column-1">
                    <p className="devices-info-table-title">Основные параметры</p>
                    <div className="devices-info-table-row">
                        <p>Тип оборудования</p>
                        <p>{device.type_device}</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>Торговая марка</p>
                        <p>Катюша</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>Модель</p>
                        <p>М240</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>Артикул</p>
                        <p>M240T</p>
                    </div>
                </div>
                <div className="column-2">
                    <p className="devices-info-table-title">Расходные материалы</p>
                    <div className="devices-info-table-row">
                        <p>TK240C</p>
                        <p>Стартовый картридж на 3000 отпечатков (поставляется только в комплекте с аппаратом)</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>TK240</p>
                        <p>Тонер-картридж базовой емкости на 3000 отпечатков</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>TK240A</p>
                        <p>Тонер-картридж стандартной емкости на 6000 отпечатков</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>TK240X</p>
                        <p>Тонер-картридж повышенной емкости на 9000 отпечатков</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>TK240XL</p>
                        <p>Tонер-картридж экстра повышенной емкости на 12000 отпечатков</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>DR240</p>
                        <p>Барабан-картридж ресурсом 30000 отпечатков</p>
                    </div>
                </div>
                <div className="column-3">
                    <p className="devices-info-table-title">Опции</p>
                    <div className="devices-info-table-row">
                        <p>BMM240</p>
                        <p>Wi-Fi модуль</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>HXM240</p>
                        <p>Модуль факса</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>PTM140T</p>
                        <p>Дополнительный лоток для моделей P140T/M140T/M240T</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>CBM140T</p>
                        <p>Тумба для напольной установки моделей P140T/M140T/M240T</p>
                    </div>
                </div>
            </div>
            <div className="device-btn-look-all" onClick={() => setAllParameters(!allParameters)}>
                <img src={imgOpenDownIcon} alt="" style={{transform: allParameters ? 'rotate(180deg)' : ''}}/>
                <p>Посмотреть все параметры</p>
            </div>
            {allParameters && (
                <div className="device-all-param">
                    <div className="column-1">
                        <p>Тип автоподатчика</p>
                        <p>Процессор</p>
                        <p>Оперативная память</p>
                        <p>Панель управления</p>
                        <p>Интерфейсы</p>
                        <p>Технология печати</p>
                        <p>Скорость печати</p>
                        <p>Разрешение печати</p>
                        <p>Двусторонняя печать</p>
                        <p>Поддерживаемые языки описания страниц</p>
                        <p>Емкость лотков подачи на печать</p>
                        <p>Емкость выходных лотков</p>
                        <p>Максимальный формат печати</p>
                        <p>Минимальная плотность материалов для печати</p>
                        <p>Максимальная плотность материалов для печати</p>
                        <p>Время выхода первого отпечатка</p>
                        <p>Количество копий при однократном сканировании</p>
                        <p>Время выхода первой копии</p>
                        <p>Масштабирование</p>
                        <p>Скорость сканирования</p>
                        <p>Емкость автоподатчиков оригиналов на сканирование</p>
                        <p>Максимальный формат сканирования</p>
                        <p>Технология линейки сканирования</p>
                        <p>Оптическое разрешение сканирования</p>
                        <p>Интерполяционное разрешение сканирования</p>
                        <p>Направления сканирования</p>
                        <p>Формат файлов</p>
                        <p>Размер (В х Ш х Г)</p>
                        <p>Масса</p>
                    </div>
                    <div className="column-2">
                        <p>Однопроходный</p>
                        <p>1200 МГц</p>
                        <p>4 ГБ</p>
                        <p>4,3" цветной сенсорный дисплей</p>
                        <p>1 Gb Ethernet, USB, USB Host, Wi-Fi (дополнительно), Факс (дополнительно)</p>
                        <p>Электрографическая (LED)</p>
                        <p>40 стр/мин</p>
                        <p>1200 x 1200 dpi</p>
                        <p>Встроенный модуль двусторонней печати</p>
                        <p>GDI, PCL, PS</p>
                        <p>570 листов</p>
                        <p>150 листов</p>
                        <p>А4</p>
                        <p>60 г/м2</p>
                        <p>200 г/м2</p>
                        <p>5,9 сек или менее</p>
                        <p>999</p>
                        <p>6,5 сек или менее</p>
                        <p>25-400%</p>
                        <p>37 изображений/мин в симплексе; 74 изображений/мин в дуплексе</p>
                        <p>90 листов</p>
                        <p>А4</p>
                        <p>CIS</p>
                        <p>600 х 600 dpi</p>
                        <p>1200х1200 dpi (через Katusha Scan Tool)</p>
                        <p>e-mail, SMB, FTP, USB-накопитель, TWAIN, сетевой TWAIN</p>
                        <p>M-PDF, PDF, JPEG, TIFF, BMP</p>
                        <p>380 мм x 401 мм x 379 мм</p>
                        <p>10,65 кг</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleDevicesPage;