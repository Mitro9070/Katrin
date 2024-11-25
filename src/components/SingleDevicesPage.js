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
import { connectToWebDAV } from '../utils/webdavUtils';

const SingleDevicesPage = () => {
    const { id } = useParams();

    const [currentTab, setCurrentTab] = useState('All');
    const [device, setDevice] = useState({});
    const [allParameters, setAllParameters] = useState(true);
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
                parameters[field.key] && (
                    <div className="devices-info-table-row" key={index}>
                        <p>{field.label}</p>
                        <p>{parameters[field.key]}</p>
                    </div>
                )
            ));
        }
        return <p>Нет данных</p>;
    };

    const renderTableParameters = (parameters, fields) => {
        if (typeof parameters === 'object') {
            return fields.map((field, index) => (
                parameters[field.key] && (
                    <tr key={index}>
                        <td>{field.label}</td>
                        <td>{parameters[field.key]}</td>
                    </tr>
                )
            ));
        }
        return <tr><td colSpan="2">Нет данных</td></tr>;
    };

    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
    };

    const nextImage = () => {
        if (currentImage < (device.images?.length || 0) - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    const basicFields = [
        { label: 'Тип оборудования', key: 'type_div' },
        { label: 'Торговая марка', key: 'marc' },
        { label: 'Модель', key: 'model' },
        { label: 'Артикул', key: 'article_number' },
    ];

    const optionsFields = [
        { label: 'Опция беспроводного интерфейса', key: 'wireless_interface_option' },
        { label: 'Опция подачи бумаги', key: 'paper_feed_option' },
        { label: 'Опция установки 1', key: 'installation_option_1' },
        { label: 'Опция установки 2', key: 'installation_option_2' },
        { label: 'Опция факса', key: 'fax_option' },
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
        { label: 'Скорость печати', key: 'print_speed' },
        { label: 'Разрешение печати', key: 'print_resolution' },
        { label: 'Двусторонняя печать', key: 'duplex_printing' },
        { label: 'Поддерживаемые языки описания страниц', key: 'supported_page_description_languages' },
        { label: 'Емкость лотка ручной подачи', key: 'manual_feed_tray_capacity' },
        { label: 'Емкость основного лотка подачи на печать', key: 'main_input_tray_capacity' },
        { label: 'Максимальная емкость лотков подачи на печать', key: 'maximum_input_tray_capacity' },
        { label: 'Емкость выходного лотка', key: 'output_tray_capacity' },
        { label: 'Максимальный формат печати', key: 'maximum_print_size' },
        { label: 'Минимальная плотность материалов для печати', key: 'min_printing_material_density' },
        { label: 'Максимальная плотность материалов для печати', key: 'max_printing_material_density' },
        { label: 'Время выхода первого отпечатка', key: 'first_print_out_time' },
        { label: 'Тиражирование', key: 'copying' },
        { label: 'Время выхода первой копии', key: 'first_copy_out_time' },
        { label: 'Масштабирование', key: 'scaling' },
        { label: 'Скорость сканирования', key: 'scan_speed' },
        { label: 'Емкость автоподатчиков оригиналов на сканирование', key: 'adf_capacity' },
        { label: 'Максимальный формат сканирования', key: 'maximum_scan_size' },
        { label: 'Технология системы сканирования', key: 'scanning_technology' },
        { label: 'Оптическое разрешение сканирования', key: 'optical_scan_resolution' },
        { label: 'Интерполяционное разрешение сканирования', key: 'interpolated_scan_resolution' },
        { label: 'Направления сканирования', key: 'scan_destinations' },
        { label: 'Форматы файлов сканирования', key: 'scan_file_formats' },
        { label: 'Габариты (Ш х Г х В)', key: 'dimensions' },
    ];

    const handleConnectToWebDAV = async () => {
        try {
            const files = await connectToWebDAV();
            console.log('Полученные файлы:', files);
        } catch (error) {
            console.error('Ошибка при подключении к WebDAV:', error);
        }
    };

    return (
        <div className='page-content devices-single-page'>
            <Link to={'/devices'}>
                <div className="bid-page-head noselect">
                    <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                    <p className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''}`} data-tab="MFУ" onClick={onTabClickHandler}>МФУ</p>
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
                    <p className="device-description">{device.description || 'Нет данных'}</p>
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
                <div className="devices-info-btn">
                    <button onClick={handleConnectToWebDAV}>Подключиться к диску</button>
                </div>
            </div>
            <div className="devices-info-table">
                <div className="column-1">
                    <p className="devices-info-table-title">Основные параметры</p>
                    {renderParameters(device.options?.basic, basicFields)}
                </div>
                <div className="column-2">
                    <p className="devices-info-table-title">Опции</p>
                    {renderParameters(device.options?.opt, optionsFields)}
                </div>
                <div className="column-3">
                    <p className="devices-info-table-title">Расходные материалы</p>
                    {renderParameters(device.options?.consumables, consumablesFields)}
                </div>
            </div>
            <div className="device-btn-look-all" onClick={() => setAllParameters(!allParameters)}>
                <img src={imgOpenDownIcon} alt="" style={{transform: allParameters ? 'rotate(180deg)' : ''}}/>
                <p>{allParameters ? 'Скрыть параметры' : 'Посмотреть все параметры'}</p>
            </div>
            {allParameters && (
                <div className="device-all-param">
                    <table>
                        <tbody>
                            {renderTableParameters(device.options?.all, allFields)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SingleDevicesPage;