import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import '../styles/SingleBidPage.css';
import '../styles/SingleDevicesPage.css';

import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import { navigationStore } from '../stores/NavigationStore';

import imgSaveIcon from '../images/save-2.svg';
import imgOpenDownIcon from '../images/select-open-down.svg';
import imgGoArrowIcon from '../images/go-arrow.svg';

const SingleDevicesPage = () => {
    const { id } = useParams();

    const [currentTab, setCurrentTab] = useState('All');
    const [device, setDevice] = useState({});
    const [allParameters, setAllParameters] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        setCurrentTab(() => navigationStore.currentDevicesTab);
        fetchDevice(id);
    }, [id]);

    const fetchDevice = async (deviceId) => {
        try {
            const deviceRef = ref(database, `Devices/${deviceId}`);
            const snapshot = await get(deviceRef);
            if (snapshot.exists()) {
                const deviceData = snapshot.val();
                // Перемещаем main_image в начало массива images
                if (deviceData.main_image && deviceData.images) {
                    deviceData.images = [deviceData.main_image, ...deviceData.images.filter(img => img !== deviceData.main_image)];
                }
                setDevice(deviceData);
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

    const renderParameters = (parameters, fields) => {
        if (typeof parameters === 'object') {
            return fields.map((field, index) => (
                <tr key={index}>
                    <td>{field.label}</td>
                    <td>{parameters[field.key] || 'Нет данных'}</td>
                </tr>
            ));
        }
        return <p>Нет данных</p>;
    };

    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
    };

    const nextImage = () => {
        if (currentImage < (device.images?.length || 0) - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    const optionsFields = [
        { label: 'Опция беспроводного интерфейса', key: 'wireless_interface' },
        { label: 'Опция подачи бумаги', key: 'paper_feed' },
        { label: 'Опция установки 1', key: 'installation_1' },
        { label: 'Опция установки 2', key: 'installation_2' },
        { label: 'Опция факса', key: 'fax' },
    ];

    const consumablesFields = [
        { label: 'Стартовый тонер-картридж', key: 'starter_toner_cartridge' },
        { label: 'Тонер-картридж', key: 'toner_cartridge' },
        { label: 'Базовый тонер-картридж', key: 'basic_toner_cartridge' },
        { label: 'Стандартный тонер-картридж', key: 'standard_toner_cartridge' },
        { label: 'Тонер-картридж повышенной ёмкости', key: 'high_capacity_toner_cartridge' },
        { label: 'Тонер-картридж экстра повышенной ёмкости', key: 'extra_high_capacity_toner_cartridge' },
        { label: 'Барабан-картридж', key: 'drum_cartridge' },
    ];

    const allFields = [
        { label: 'Тип автоподатчика', key: 'feeder_type' },
        { label: 'Процессор', key: 'processor' },
        { label: 'Оперативная память', key: 'ram' },
        { label: 'Панель управления', key: 'control_panel' },
        { label: 'Интерфейсы', key: 'interfaces' },
        { label: 'Технология печати', key: 'printing_technology' },
        { label: 'Скорость печати', key: 'printing_speed' },
        { label: 'Разрешение печати', key: 'printing_resolution' },
        { label: 'Двусторонняя печать', key: 'duplex_printing' },
        { label: 'Поддерживаемые языки описания страниц', key: 'page_description_languages' },
        { label: 'Емкость лотка ручной подачи', key: 'manual_feed_tray_capacity' },
        { label: 'Емкость основного лотка подачи на печать', key: 'main_feed_tray_capacity' },
        { label: 'Максимальная емкость лотков подачи на печать', key: 'max_feed_tray_capacity' },
        { label: 'Емкость выходного лотка', key: 'output_tray_capacity' },
        { label: 'Максимальный формат печати', key: 'max_printing_format' },
        { label: 'Минимальная плотность материалов для печати', key: 'min_printing_material_density' },
        { label: 'Максимальная плотность материалов для печати', key: 'max_printing_material_density' },
        { label: 'Время выхода первого отпечатка', key: 'first_print_time' },
        { label: 'Тиражирование', key: 'copying' },
        { label: 'Время выхода первой копии', key: 'first_copy_time' },
        { label: 'Масштабирование', key: 'scaling' },
        { label: 'Скорость сканирования', key: 'scanning_speed' },
        { label: 'Емкость автоподатчиков оригиналов на сканирование', key: 'feeder_capacity' },
        { label: 'Максимальный формат сканирования', key: 'max_scanning_format' },
        { label: 'Технология системы сканирования', key: 'scanning_system_technology' },
        { label: 'Оптическое разрешение сканирования', key: 'optical_scanning_resolution' },
        { label: 'Интерполяционное разрешение сканирования', key: 'interpolated_scanning_resolution' },
        { label: 'Направления сканирования', key: 'scanning_directions' },
        { label: 'Формат файлов сканирования', key: 'scanning_file_format' },
        { label: 'Габариты (Ш х Г х В)', key: 'dimensions' },
    ];

    return (
        <div className='page-content devices-single-page'>
            <Link to={'/devices'}>
                <div className="bid-page-head noselect">
                    <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                    <p className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''}`} data-tab="MFU" onClick={onTabClickHandler}>МФУ</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Printers" onClick={onTabClickHandler}>Принтеры</p>
                </div>
            </Link>
            <div className="single-device-content">
                <div className="single-device-image">
                    <div className="image-slider">
                        <div className="image-slider-wrapper">
                            {device.images?.map((image, index) => (
                                <div
                                    key={index}
                                    className="image-slide"
                                    style={{
                                        width: '420px',
                                        height: '420px',
                                        flexShrink: 0,
                                        borderRadius: '20px',
                                        background: `url(${image}) lightgray 50% / cover no-repeat`,
                                        display: currentImage === index ? 'block' : 'none'
                                    }}
                                ></div>
                            ))}
                        </div>
                        <div className="image-slider-controls">
                            <div className="icon-container icon-rotate" onClick={prevImage}>
                                <img src={imgGoArrowIcon} alt="" className='icon-rotate' />
                            </div>
                            <p className="current-image-index">{device.images?.length > 0 ? currentImage + 1 : '1'}</p>
                            <div className="icon-container" onClick={nextImage}>
                                <img src={imgGoArrowIcon} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="single-device-info">
                    <h1 className="device-title">{id}</h1>
                    <p className="device-description">{device.description}</p>
                </div>
            </div>
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
                        <p>{device.options?.basic?.type_device || 'Нет данных'}</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>Торговая марка</p>
                        <p>{device.options?.basic?.marc || 'Нет данных'}</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>Модель</p>
                        <p>{id}</p>
                    </div>
                    <div className="devices-info-table-row">
                        <p>Артикул</p>
                        <p>{device.options?.basic?.article || 'Нет данных'}</p>
                    </div>
                </div>
                <div className="column-2">
                    <p className="devices-info-table-title">Опции</p>
                    {renderParameters(device.options?.opt, optionsFields)}
                </div>
                <div className="column-3">
                    <p className="devices-info-table-title">Расходные материалы</p>
                    {renderParameters(device.options?.сonsumables, consumablesFields)}
                </div>
            </div>
            <div className="device-btn-look-all" onClick={() => setAllParameters(!allParameters)}>
                <img src={imgOpenDownIcon} alt="" style={{transform: allParameters ? 'rotate(180deg)' : ''}}/>
                <p>Посмотреть все параметры</p>
            </div>
            {allParameters && (
                <div className="device-all-param">
                    <table>
                        <tbody>
                            {renderParameters(device.options?.all, allFields)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SingleDevicesPage;