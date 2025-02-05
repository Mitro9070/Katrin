// src/components/SingleDevicesPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { navigationStore } from '../stores/NavigationStore';
import imgOpenDownIcon from '../images/select-open-down.svg';
import imgGoArrowIcon from '../images/go-arrow.svg';
import noFotoImage from '../images/nofoto2.jpg';
import { getFolderContents, downloadFile } from '../utils/webdavUtils';
import CustomFileManager from './CustomFileManager';
import '../styles/SingleDevicesPage.css';

// Импорты для генерации PDF
import { pdf } from '@react-pdf/renderer';
import { DevicePDFDocument } from '../utils/pdfUtils';
import pdfIcon from '../images/pdf.png';
import {
  basicFields,
  optionsFields,
  consumablesFields,
  allFields,
} from '../utils/deviceFields';

// Импортируем функции контроллера устройств
import { getDeviceById } from '../Controller/DevicesController';
import { getImageUrl } from '../utils/getImageUrl';

const SingleDevicesPage = () => {
  const { id } = useParams(); // Получаем deviceId из URL
  const [currentTab, setCurrentTab] = useState('All');
  const [device, setDevice] = useState({});
  const [allParameters, setAllParameters] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [webdavFiles, setWebdavFiles] = useState([]);
  const [webdavError, setWebdavError] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [basePath, setBasePath] = useState('');
  const [displayBasePath, setDisplayBasePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setCurrentTab(() => navigationStore.currentDevicesTab);
    fetchDevice(id);
  }, [id]);

  useEffect(() => {
    // После загрузки устройства определяем базовый путь и загружаем файлы
    if (device && device.name) {
      const paths = determineDevicePath(device.name);
      setBasePath(paths.fullPath);
      setDisplayBasePath(paths.displayPath);
      if (paths.fullPath) {
        fetchWebDAVFiles(paths.fullPath);
      } else {
        setWebdavError('Нет данных для запрашиваемого устройства');
      }
    }
  }, [device]);

  // Функция для загрузки данных устройства из бэкенда
  const fetchDevice = async (deviceId) => {
    try {
      const deviceData = await getDeviceById(deviceId);
      // Обработка изображений
      if (deviceData.main_image) {
        deviceData.images = [
          deviceData.main_image,
          ...(deviceData.images || []).filter((img) => img !== deviceData.main_image),
        ];
      }
      setDevice(deviceData);
    } catch (error) {
      console.error('Ошибка при загрузке устройства:', error);
      navigate('/not-found'); // Перенаправляем на страницу 404 при ошибке
    }
  };

  // Функция для определения путей к папке на основе имени устройства
  const determineDevicePath = (deviceName) => {
    let fullPath = '';
    let displayPath = '';

    if (deviceName) {
      const firstLetter = deviceName.charAt(0).toUpperCase();
      let mainFolder = '';
      if (firstLetter === 'M') {
        mainFolder = 'MFP';
      } else if (firstLetter === 'P') {
        mainFolder = 'Printers';
      }

      if (mainFolder) {
        const seriesMatch = deviceName.substring(1).match(/^\d+/);
        const series = seriesMatch ? seriesMatch[0] : '';
        const seriesFolder = `Katusha ${deviceName.charAt(0)}${series} series`;
        fullPath = `${mainFolder}/${seriesFolder}`;
        displayPath = seriesFolder;
      } else {
        fullPath = '';
        displayPath = '';
      }
    }
    return { fullPath, displayPath };
  };

  // Функция для загрузки файлов из WebDAV по заданному пути
  const fetchWebDAVFiles = async (path) => {
    try {
      const files = await getFolderContents(path);
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
  const handleFolderClick = (folder) => {
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
    const breadcrumbParts = [
      displayBasePath,
      ...currentPath.replace(basePath, '').split('/').filter((part) => part),
    ];
    if (index >= 0) {
      const newRelativePath = breadcrumbParts.slice(1, index + 1).join('/');
      const newPath = index === 0 ? basePath : `${basePath}/${newRelativePath}`;
      fetchWebDAVFiles(newPath);
    }
  };

  // Формируем массив хлебных крошек для отображения
  const breadcrumbs = [
    displayBasePath,
    ...currentPath.replace(basePath, '').split('/').filter((part) => part),
  ];

  // Обработчик скачивания файла
  const handleFileDownload = async (file) => {
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

  // Функция для загрузки изображения и преобразования его в Data URL
  const loadImageAsDataURL = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Ошибка при загрузке изображения в loadImageAsDataURL:', error);
      return null;
    }
  };

  // Функция для генерации и скачивания PDF
  const handleDownloadPDF = async () => {
    setLoading(true);
    setPdfUrl(null);
    const serverUrl = process.env.REACT_APP_SERVER_URL || '';

    try {
      const imageUrl = getImageUrl(device.main_image);
      let imageData = null;
      try {
        imageData = await loadImageAsDataURL(imageUrl);
      } catch (imageError) {
        console.error('Ошибка при загрузке изображения:', imageError);
        imageData = null;
      }

      const blob = await pdf(
        <DevicePDFDocument
          device={device}
          id={device.id}
          allParameters={allParameters}
          imageData={imageData}
          fields={{ basicFields, optionsFields, consumablesFields, allFields }}
        />
      ).toBlob();

      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);

    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      alert('Произошла ошибка при генерации PDF. Пожалуйста, попробуйте еще раз.');
    }

    setLoading(false);
  };

  // Отзыв URL при размонтировании компонента или изменении pdfUrl
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="page-content devices-single-page">
      {/* Ссылка для возврата на страницу устройств */}
      <Link to={'/devices'}>
        <div className="bid-page-head noselect">
          <p
            className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''
              }`}
            data-tab="All"
            onClick={onTabClickHandler}
          >
            Все
          </p>
          <p
            className={`bid-page-head-tab ${currentTab === 'MFU' ? 'bid-page-head-tab-selected' : ''
              }`}
            data-tab="MFU"
            onClick={onTabClickHandler}
          >
            МФУ
          </p>
          <p
            className={`bid-page-head-tab ${currentTab === 'Printers' ? 'bid-page-head-tab-selected' : ''
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
                  backgroundImage: `url(${getImageUrl(image)})`,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="device-title">{device.name || 'Название устройства'}</h1>
            {/* Кнопка для генерации PDF */}
            <img
              src={pdfIcon}
              alt="Download PDF"
              style={{ cursor: 'pointer', width: '24px', height: '24px' }}
              onClick={handleDownloadPDF}
            />
          </div>
          {loading && <p>Идёт генерация PDF...</p>}
          {pdfUrl && (
            <p>
              PDF готов.{' '}
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Нажмите здесь, чтобы открыть PDF
              </a>
            </p>
          )}
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