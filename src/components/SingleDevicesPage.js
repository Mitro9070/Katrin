import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { database } from '../firebaseConfig';
import { navigationStore } from '../stores/NavigationStore';
import imgSaveIcon from '../images/save-2.svg';
import imgOpenDownIcon from '../images/select-open-down.svg';
import imgGoArrowIcon from '../images/go-arrow.svg';
import homeIcon from '../images/home.png';
import { getFolderContents, downloadFile } from '../utils/webdavUtils';
import CustomFileManager from './CustomFileManager';
import '../styles/SingleDevicesPage.css';

const SingleDevicesPage = () => {
    const { id } = useParams();
    const [currentTab, setCurrentTab] = useState('All');
    const [device, setDevice] = useState({});
    const [allParameters, setAllParameters] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [webdavFiles, setWebdavFiles] = useState([]);
    const [webdavError, setWebdavError] = useState(null);
    const [currentPath, setCurrentPath] = useState(''); // Строка для хранения текущего пути

    useEffect(() => {
        setCurrentTab(() => navigationStore.currentDevicesTab);
        fetchDevice(id);
        fetchWebDAVFiles(''); // Загружаем корневую директорию
    }, [id]);

    // Функция для загрузки данных устройства из Firebase
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

    // Функция для получения содержимого папки по пути
    const fetchWebDAVFiles = async (path) => {
        console.log('Начало процесса подключения к WebDAV для пути:', path);
        try {
            const files = await getFolderContents(path);
            console.log('Подключение успешно. Получены файлы:', files);
            const filteredFiles = files.filter((file) => {
                // Фильтруем скрытые системные файлы
                return file.filename !== '._.DS_Store' && file.filename !== '.DS_Store';
            });

            setWebdavFiles(filteredFiles); // Устанавливаем файлы для текущей папки
            setCurrentPath(path); // Обновляем текущий путь
            setWebdavError(null);
        } catch (error) {
            console.error('Ошибка при подключении к WebDAV:', error);
            setWebdavError(error.message);
        }
    };

    // Обрабатываем клик по папке в файловом менеджере
    const handleFolderClick = async (folder) => {
        console.log('Клик по папке:', folder);
        if (folder.basename) {
            // Получаем относительный путь к выбранной папке
            const newPath = folder.basename.replace('/Exchange/', '').replace(/^\//, '');
            fetchWebDAVFiles(newPath); // Загружаем содержимое выбранной папки
        }
    };

    // Обрабатываем клик по хлебным крошкам
    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            fetchWebDAVFiles(''); // Переходим в корневую директорию
        } else {
            const pathParts = currentPath.split('/').filter(part => part);
            const newPath = pathParts.slice(0, index + 1).join('/');
            fetchWebDAVFiles(newPath);
        }
    };

    // Обрабатываем клик по файлу для его скачивания
    const handleFileDownload = async (file) => {
        console.log('Клик по файлу:', file);
        try {
            await downloadFile(file.basename);
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
        }
    };

    // Обработка переключения вкладок
    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentDevicesTab(selectedTab);
    };

    // Рендеринг параметров устройства
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

    // Рендеринг параметров в таблице
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

    // Переход к предыдущему изображению
    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
    };

    // Переход к следующему изображению
    const nextImage = () => {
        if (currentImage < (device.images?.length || 0) - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    // Описание полей для отображения параметров устройства
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

    return (
        <div className="page-content devices-single-page">
            {/* Ссылка для возврата на страницу устройств */}
            <Link to={'/devices'}>
                <div className="bid-page-head noselect">
                    <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                    <p className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''}`} data-tab="MFU" onClick={onTabClickHandler}>МФУ</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Printers" onClick={onTabClickHandler}>Принтеры</p>
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                {/* Блок с изображением устройства */}
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative', width: '420px', height: '420px' }}>
                        <div style={{ display: 'flex', overflow: 'hidden', width: '420px', height: '420px' }}>
                            {device.images?.map((image, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: '420px',
                                        height: '420px',
                                        flexShrink: 0,
                                        borderRadius: '20px',
                                        background: `url(${image}) lightgray 50% / cover no-repeat`,
                                        display: currentImage === index ? 'block' : 'none',
                                    }}
                                ></div>
                            ))}
                        </div>
                        {/* Навигация по изображениям */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', bottom: '-30px', width: '100%' }}>
                            <div style={{ cursor: 'pointer', transform: 'rotate(180deg)' }} onClick={prevImage}>
                                <img src={imgGoArrowIcon} alt="" style={{ width: '24px', height: '24px' }} />
                            </div>
                            <p style={{ fontSize: '16px', color: '#2C2C2C' }}>
                                {device.images?.length > 0 ? currentImage + 1 : '1'}
                            </p>
                            <div style={{ cursor: 'pointer' }} onClick={nextImage}>
                                <img src={imgGoArrowIcon} alt="" style={{ width: '24px', height: '24px' }} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Информация об устройстве */}
                <div className="single-device-info" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '645px' }}>
                    <h1 className="device-title" style={{ fontFamily: '"PF DinText Pro", sans-serif', fontSize: '24px', fontWeight: 400, color: '#2C2C2C' }}>{id}</h1>
                    <p className="device-description" style={{ fontFamily: '"PF DinText Pro", sans-serif', fontSize: '16px', fontWeight: 400, color: '#2C2C2C' }}>{device.description || 'Нет данных'}</p>
                </div>
            </div>
            {/* Кнопки действий */}
            <div className="devices-info-btns" style={{ display: 'flex', gap: '30px', marginTop: '40px', flexWrap: 'wrap' }}>
                <div className="devices-info-btn" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', width: '195px', height: '40px', border: '1px solid #0C8CE9', borderRadius: '20px', color: '#0C8CE9', cursor: 'pointer' }}>
                    <img src={imgSaveIcon} alt="" style={{ width: '24px', height: '24px' }} />
                    <p>Информация</p>
                </div>
            </div>
            {/* Блок с файловым менеджером */}
            <Accordion style={{ width: '1095px', marginTop: '20px' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <h2 style={{ fontSize: '24px', color: '#2C2C2C', fontFamily: '"PF DinText Pro", sans-serif', fontWeight: 400, lineHeight: 'normal', marginBottom: '10px' }}>Внешний диск</h2>
                </AccordionSummary>
                <AccordionDetails>
                    {webdavError && <p style={{ color: 'red' }}>Ошибка: {webdavError}</p>}
                    <CustomFileManager 
                        files={webdavFiles} 
                        onFolderClick={handleFolderClick}
                        onFileClick={handleFileDownload}
                        breadcrumbs={currentPath ? currentPath.split('/').filter(part => part) : []}
                        onBreadcrumbClick={handleBreadcrumbClick}
                    />
                </AccordionDetails>
            </Accordion>
            <div className="devices-info-table" style={{ marginTop: '30px', display: 'flex', gap: '30px' }}>
                <div className="column-1" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '308px' }}>
                    <p className="devices-info-table-title" style={{ fontWeight: 500, marginBottom: '10px' }}>Основные параметры</p>
                    {renderParameters(device.options?.basic, basicFields)}
                </div>
                <div className="column-2" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '420px' }}>
                    <p className="devices-info-table-title" style={{ fontWeight: 500, marginBottom: '10px' }}>Опции</p>
                    {renderParameters(device.options?.opt, optionsFields)}
                </div>
                <div className="column-3" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '308px' }}>
                    <p className="devices-info-table-title" style={{ fontWeight: 500, marginBottom: '10px' }}>Расходные материалы</p>
                    {renderParameters(device.options?.consumables, consumablesFields)}
                </div>
            </div>
            <div className="device-btn-look-all" onClick={() => setAllParameters(!allParameters)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '40px', border: '1px solid #A9A9A9', borderRadius: '20px', cursor: 'pointer', marginTop: '30px' }}>
                <img src={imgOpenDownIcon} alt="" style={{ marginRight: '10px', transform: allParameters ? 'rotate(180deg)' : 'none' }} />
                <p>{allParameters ? 'Скрыть параметры' : 'Посмотреть все параметры'}</p>
            </div>
            {allParameters && (
                <div className="device-all-param" style={{ marginTop: '20px', padding: '20px', border: '1px solid #A9A9A9', borderRadius: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
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