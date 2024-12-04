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
import noFotoImage from '../images/nofoto2.jpg'; // Импортируем изображение по умолчанию
import { getFolderContents, downloadFile } from '../utils/webdavUtils';
import CustomFileManager from './CustomFileManager';
import '../styles/SingleDevicesPage.css';

const SingleDevicesPage = () => {
    const { id } = useParams(); // Получаем ID устройства из параметров URL
    const [currentTab, setCurrentTab] = useState('All'); // Текущая вкладка
    const [device, setDevice] = useState({}); // Данные устройства
    const [allParameters, setAllParameters] = useState(true); // Флаг отображения всех параметров
    const [currentImage, setCurrentImage] = useState(0); // Индекс текущего изображения
    const [webdavFiles, setWebdavFiles] = useState([]); // Список файлов из WebDAV
    const [webdavError, setWebdavError] = useState(null); // Ошибка при загрузке файлов
    const [currentPath, setCurrentPath] = useState(''); // Текущий путь в файловой системе
    const [basePath, setBasePath] = useState(''); // Базовый путь для устройства
    const [displayBasePath, setDisplayBasePath] = useState(''); // Отображаемое имя корневой папки

    useEffect(() => {
        // Устанавливаем текущую вкладку и загружаем данные устройства
        setCurrentTab(() => navigationStore.currentDevicesTab);
        fetchDevice(id);
    }, [id]);

    useEffect(() => {
        // После загрузки устройства определяем базовый путь и загружаем файлы
        if (device && device.id) {
            const paths = determineDevicePath(device.id); // Получаем полный и отображаемый пути
            setBasePath(paths.fullPath); // Устанавливаем базовый путь (для запросов к WebDAV)
            setDisplayBasePath(paths.displayPath); // Устанавливаем отображаемое имя корневой папки
            if (paths.fullPath) {
                fetchWebDAVFiles(paths.fullPath);
            } else {
                setWebdavError('Нет данных для запрашиваемого устройства');
            }
        }
    }, [device]);

    // Функция для загрузки данных устройства из Firebase
    const fetchDevice = async (deviceId) => {
        try {
            const deviceRef = ref(database, `Devices/${deviceId}`);
            const snapshot = await get(deviceRef);
            if (snapshot.exists()) {
                const deviceData = snapshot.val();
                // Перемещаем основное изображение в начало массива изображений
                if (deviceData.main_image && deviceData.images) {
                    deviceData.images = [deviceData.main_image, ...deviceData.images.filter(img => img !== deviceData.main_image)];
                }
                deviceData.id = deviceId; // Добавляем ID устройства в данные
                setDevice(deviceData);
            }
        } catch (error) {
            console.error('Ошибка при загрузке устройства:', error);
        }
    };

    // Функция для определения путей к папке на основе ID устройства
    const determineDevicePath = (deviceId) => {
        let fullPath = ''; // Полный путь, включая 'Printers' или 'MFP'
        let displayPath = ''; // Отображаемый путь для хлебных крошек
        if (deviceId) {
            const firstLetter = deviceId.charAt(0).toUpperCase(); // Первая буква ID устройства
            let mainFolder = '';
            // Определяем основную папку (MFP или Printers)
            if (firstLetter === 'M') {
                mainFolder = 'MFP';
            } else if (firstLetter === 'P') {
                mainFolder = 'Printers';
            }

            if (mainFolder) {
                // Извлекаем серию устройства (цифры после первой буквы)
                const seriesMatch = deviceId.substring(1).match(/^\d+/);
                const series = seriesMatch ? seriesMatch[0] : '';
                // Формируем название папки серии устройства
                const seriesFolder = `Katusha ${deviceId.charAt(0)}${series} series`;
                fullPath = `${mainFolder}/${seriesFolder}`; // Полный путь для запросов к WebDAV
                displayPath = seriesFolder; // Отображаемый путь для хлебных крошек
            } else {
                fullPath = '';
                displayPath = '';
            }
        }
        return { fullPath, displayPath };
    };

    // Функция для загрузки файлов из WebDAV по заданному пути
    const fetchWebDAVFiles = async (path) => {
        console.log('Начало процесса подключения к WebDAV для пути:', path);
        try {
            const files = await getFolderContents(path);
            console.log('Подключение успешно. Получены файлы:', files);

            // Фильтруем системные файлы
            const filteredFiles = files.filter((file, index) => {
                if (index === 0 && file.type === 'directory' && file.basename.endsWith('/')) {
                    return false;
                }
                return file.filename !== '._.DS_Store' && file.filename !== '.DS_Store';
            });

            setWebdavFiles(filteredFiles.length ? filteredFiles : []);
            setCurrentPath(path);
            setWebdavError(null);
        } catch (error) {
            console.error('Ошибка при подключении к WebDAV:', error);
            setWebdavError('Нет данных для запрашиваемого устройства');
            setWebdavFiles([]);
        }
    };

    // Обработчик клика по папке в файловом менеджере
    const handleFolderClick = async (folder) => {
        console.log('Клик по папке:', folder);
        if (folder.basename) {
            const newPath = folder.basename.replace('/Exchange/', '').replace(/^\//, '');
            // Проверяем, не выходит ли новый путь за пределы базового пути
            if (newPath.startsWith(basePath)) {
                fetchWebDAVFiles(newPath);
            } else {
                console.warn('Попытка доступа выше базовой директории запрещена.');
            }
        }
    };

    // Обработчик клика по хлебным крошкам
    const handleBreadcrumbClick = (index) => {
        const breadcrumbParts = [displayBasePath, ...currentPath.replace(basePath, '').split('/').filter(part => part)];
        if (index >= 0) {
            const newRelativePath = breadcrumbParts.slice(1, index + 1).join('/');
            const newPath = index === 0 ? basePath : `${basePath}/${newRelativePath}`;
            fetchWebDAVFiles(newPath);
        }
    };

    // Формируем массив хлебных крошек для отображения
    const breadcrumbs = [displayBasePath, ...currentPath.replace(basePath, '').split('/').filter(part => part)];

    // Обработчик скачивания файла
    const handleFileDownload = async (file) => {
        console.log('Клик по файлу:', file);
        try {
            await downloadFile(file.basename);
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
        }
    };

    // Обработчик клика по вкладкам навигации
    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentDevicesTab(selectedTab);
    };

    // Функция для отображения параметров устройства
    const renderParameters = (parameters, fields) => {
        if (typeof parameters === 'object') {
            return fields.map((field, index) =>
                parameters[field.key] ? (
                    <div className="devices-info-table-row" key={index}>
                        <p>{field.label}</p>
                        <p>{parameters[field.key]}</p>
                    </div>
                ) : null
            );
        }
        return <p>Нет данных</p>;
    };

    // Функция для отображения всех параметров в таблице
    const renderTableParameters = (parameters, fields) => {
        if (typeof parameters === 'object') {
            return fields.map((field, index) =>
                parameters[field.key] ? (
                    <tr key={index}>
                        <td>{field.label}</td>
                        <td>{parameters[field.key]}</td>
                    </tr>
                ) : null
            );
        }
        return (
            <tr>
                <td colSpan="2">Нет данных</td>
            </tr>
        );
    };

    // Обработчики переключения изображений устройства
    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
    };

    const nextImage = () => {
        if (currentImage < (device.images?.length || 0) - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    // Определение полей для отображения параметров устройства
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
        // Здесь перечислены остальные параметры устройства
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
        { label: 'Емкость автоподатчика оригиналов на сканирование', key: 'adf_capacity' },
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
                    <p
                        className={`bid-page-head-tab ${
                            currentTab === 'All' ? 'bid-page-head-tab-selected' : ''
                        }`}
                        data-tab="All"
                        onClick={onTabClickHandler}
                    >
                        Все
                    </p>
                    <p
                        className={`bid-page-head-tab ${
                            currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''
                        }`}
                        data-tab="MFU"
                        onClick={onTabClickHandler}
                    >
                        МФУ
                    </p>
                    <p
                        className={`bid-page-head-tab ${
                            currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''
                        }`}
                        data-tab="Printers"
                        onClick={onTabClickHandler}
                    >
                        Принтеры
                    </p>
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                {/* Блок с изображением устройства */}
                <div style={{ position: 'relative' }}>
                    <div className="image-slider-wrapper">
                        {device.images?.map((image, index) => (
                            <div
                                key={index}
                                className="image-slide"
                                style={{
                                    backgroundImage: `url(${image})`,
                                    display: currentImage === index ? 'block' : 'none',
                                }}
                            ></div>
                        ))}
                        {/* Если нет изображений - показываем дефолтное изображение */}
                        {(!device.images || device.images.length === 0) && (
                            <div
                                className="image-slide"
                                style={{
                                    backgroundImage: `url(${noFotoImage})`,
                                    display: 'block',
                                }}
                            ></div>
                        )}
                        {/* Навигация по изображениям */}
                        <div className="image-slider-controls">
                            <div className="icon-container icon-rotate" onClick={prevImage}>
                                <img src={imgGoArrowIcon} alt="prev" />
                            </div>
                            <p className="current-image-index">
                                {device.images?.length > 0 ? currentImage + 1 : '1'}
                            </p>
                            <div className="icon-container" onClick={nextImage}>
                                <img src={imgGoArrowIcon} alt="next" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Блок с описанием устройства */}
                <div className="single-device-info">
                    <h1 className="device-title">{id}</h1>
                    <p className="device-description">{device.description || 'Нет данных'}</p>
                </div>
            </div>
            {/* Раздел с внешним диском */}
            <Accordion style={{ width: '1095px', marginTop: '50px', borderRadius: '10px' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <h2 className="external-disk-header">Внешний диск</h2>
                </AccordionSummary>
                <AccordionDetails>
                    {webdavError && <p style={{ color: 'red' }}>{webdavError}</p>}
                    {/* Компонент файлового менеджера */}
                    <CustomFileManager
                        files={webdavFiles}
                        onFolderClick={handleFolderClick}
                        onFileClick={handleFileDownload}
                        breadcrumbs={breadcrumbs}
                        onBreadcrumbClick={handleBreadcrumbClick}
                    />
                </AccordionDetails>
            </Accordion>
            {/* Таблица с параметрами устройства */}
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
            {/* Кнопка для отображения всех параметров */}
            <div className="device-btn-look-all" onClick={() => setAllParameters(!allParameters)}>
                <img
                    src={imgOpenDownIcon}
                    alt="toggle"
                    className={allParameters ? 'icon-rotate' : ''}
                />
                <p>{allParameters ? 'Скрыть параметры' : 'Посмотреть все параметры'}</p>
            </div>
            {/* Отображение всех параметров устройства */}
            {allParameters && (
                <div className="device-all-param">
                    <table>
                        <tbody>{renderTableParameters(device.options?.all, allFields)}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SingleDevicesPage;