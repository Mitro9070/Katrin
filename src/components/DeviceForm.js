import React, { useState, useEffect } from 'react';
import { ref as databaseRef, get, set, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebaseConfig';
import * as XLSX from 'xlsx';
import '../styles/DeviceForm.css';
import Loader from './Loader';
import imgUploadIcon from '../images/upload.png'; // Значок для кнопки загрузки

const DeviceForm = ({ setIsAddDevice }) => {
    const [deviceName, setDeviceName] = useState('');
    const [deviceDescription, setDeviceDescription] = useState('');
    const [deviceType, setDeviceType] = useState('МФУ');
    const [images, setImages] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [devicesList, setDevicesList] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');

    useEffect(() => {
        fetchDevicesList();
    }, []);

    const fetchDevicesList = async () => {
        try {
            const devicesRef = databaseRef(database, 'Devices');
            const snapshot = await get(devicesRef);
            if (snapshot.exists()) {
                const devicesData = [];
                snapshot.forEach(childSnapshot => {
                    devicesData.push(childSnapshot.key);
                });
                setDevicesList(devicesData);
            }
        } catch (error) {
            console.error('Ошибка при загрузке списка устройств:', error);
        }
    };

    const handleDeviceSelect = async (e) => {
        const selectedDeviceName = e.target.value;
        setSelectedDevice(selectedDeviceName);

        if (selectedDeviceName) {
            try {
                const deviceRef = databaseRef(database, `Devices/${selectedDeviceName}`);
                const snapshot = await get(deviceRef);
                if (snapshot.exists()) {
                    const deviceData = snapshot.val();
                    setDeviceName(selectedDeviceName);
                    setDeviceDescription(deviceData.description || '');
                    setDeviceType(deviceData.options_all_type_of_automatic_document_feeder || 'МФУ');
                    setImages(deviceData.images || []);
                    setMainImage(deviceData.main_image || '');
                }
            } catch (error) {
                console.error(`Ошибка при загрузке устройства ${selectedDeviceName}:`, error);
            }
        }
    };

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const deviceRef = databaseRef(database, `Devices/${deviceName}`);
            const snapshot = await get(deviceRef);
            const existingData = snapshot.exists() ? snapshot.val() : {};

            const imagesUrls = [];
            let mainImageUrl = '';

            if (images && images.length > 0) {
                for (const image of images) {
                    if (image && image.name) {
                        const imageRef = storageRef(storage, `Devices/${deviceName}/${image.name}`);
                        await uploadBytes(imageRef, image);
                        const imageUrl = await getDownloadURL(imageRef);
                        imagesUrls.push(imageUrl);

                        if (image.name.startsWith('Main')) {
                            mainImageUrl = imageUrl;
                        }
                    }
                }
            }

            if (!mainImageUrl && imagesUrls.length > 0) {
                mainImageUrl = imagesUrls[0];
            } else if (!mainImageUrl && mainImage) {
                mainImageUrl = mainImage;
            }

            const updatedData = {
                ...(existingData || {}),
                options_all_type_of_automatic_document_feeder: deviceType,
                description: deviceDescription,
                images: imagesUrls.length > 0 ? imagesUrls : existingData.images || [],
                main_image: mainImageUrl || existingData.main_image
            };

            await update(deviceRef, updatedData);

            setIsAddDevice(false);
        } catch (error) {
            console.error('Ошибка при добавлении устройства:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setUploadProgress(0);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetNames = workbook.SheetNames;
                const devices = {};

                const saveToParsedData = (parsedData, path, value) => {
                    if (value === undefined) return;

                    const keys = path.split('.');
                    let current = parsedData;

                    while (keys.length > 1) {
                        let key = keys.shift();
                        if (!current[key]) {
                            current[key] = {};
                        }
                        current = current[key];
                    }
                    current[keys[0]] = value;
                };

                const parseSheet = (sheetName) => {
                    const sheet = workbook.Sheets[sheetName];
                    const parsedData = {
                        description: "",
                        options: {
                            all: {},
                            basic: {},
                            opt: {},
                            consumables: {}
                        }
                    };

                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    const map = {
                        'Описание': 'description',
                        'Тип оборудования': 'options.basic.type_div',
                        'Торговая марка': 'options.basic.marc',
                        'Модель': 'options.basic.model',
                        'Артикул': 'options.basic.article_number',
                        'Стартовый тонер-картридж': 'options.consumables.starter_toner_cartridge',
                        'Тонер-картридж': 'options.consumables.toner_cartridge',
                        'Базовый тонер-картридж': 'options.consumables.basic_toner_cartridge',
                        'Стандартный тонер-картридж': 'options.consumables.standard_toner_cartridge',
                        'Тонер-картридж повышенной ёмкости': 'options.consumables.extra_high_capacity_toner_cartridge',
                        'Тонер-картридж экстра повышенной ёмкости': 'options.consumables.extra_high_capacity_toner_cartridge',
                        'Барабан-картридж': 'options.consumables.drum_cartridge',
                        'Опция беспроводного интерфейса': 'options.opt.wireless_interface_option',
                        'Опция подачи бумаги': 'options.opt.paper_feed_option',
                        'Опция установки 1': 'options.opt.installation_option_1',
                        'Опция установки 2': 'options.opt.installation_option_2',
                        'Опция факса': 'options.opt.fax_option',
                        'Тип автоподатчика': 'options.all.feeder_type',
                        'Процессор': 'options.all.processor',
                        'Оперативная память': 'options.all.ram',
                        'Панель управления': 'options.all.control_panel',
                        'Интерфейсы': 'options.all.interfaces',
                        'Технология печати': 'options.all.printing_technology',
                        'Скорость печати': 'options.all.print_speed',
                        'Разрешение печати': 'options.all.print_resolution',
                        'Двусторонняя печать': 'options.all.duplex_printing',
                        'Поддерживаемые языки описания страниц': 'options.all.supported_page_description_languages',
                        'Емкость лотка ручной подачи': 'options.all.manual_feed_tray_capacity',
                        'Емкость основного лотка подачи на печать': 'options.all.main_input_tray_capacity',
                        'Максимальная емкость лотков подачи на печать': 'options.all.maximum_input_tray_capacity',
                        'Емкость выходного лотка': 'options.all.output_tray_capacity',
                        'Максимальный формат печати': 'options.all.maximum_print_size',
                        'Минимальная плотность материалов для печати': 'options.all.min_printing_material_density',
                        'Максимальная плотность материалов для печати': 'options.all.max_printing_material_density',
                        'Время выхода первой страницы': 'options.all.first_print_out_time',
                        'Копирование': 'options.all.copying',
                        'Время выхода первой копии': 'options.all.first_copy_out_time',
                        'Масштабирование': 'options.all.scaling',
                        'Скорость сканирования': 'options.all.scan_speed',
                        'Емкость автоподатчиков оригиналов на сканирование': 'options.all.adf_capacity',
                        'Максимальный формат сканирования': 'options.all.maximum_scan_size',
                        'Технология системы сканирования': 'options.all.scanning_technology',
                        'Оптическое разрешение сканирования': 'options.all.optical_scan_resolution',
                        'Интерполяционное разрешение сканирования': 'options.all.interpolated_scan_resolution',
                        'Направления сканирования': 'options.all.scan_destinations',
                        'Формат файлов сканирования': 'options.all.scan_file_formats',
                        'Габариты (Ш х Г х В)': 'options.all.dimensions'
                    };

                    rows.forEach((row) => {
                        const [label, value] = row;
                        if (map[label]) {
                            saveToParsedData(parsedData, map[label], value);
                        } else {
                            console.warn(`Неизвестный тег: ${label}`);
                        }
                    });

                    devices[sheetName] = parsedData;
                };

                sheetNames.forEach(parseSheet);

                console.log('Parsed devices:', devices); // Вывод данных в консоль перед загрузкой в БД

                const totalItems = Object.keys(devices).length;
                let completedItems = 0;

                for (const [key, value] of Object.entries(devices)) {
                    if (value !== undefined && value !== "") {
                        await update(databaseRef(database, `Devices/${key}`), value);
                    }
                    completedItems++;
                    setUploadProgress((completedItems / totalItems) * 100);
                }

                console.log('Data saved successfully.');
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Ошибка при загрузке данных из Excel:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="device-form" onSubmit={handleSubmit}>
            <select value={selectedDevice} onChange={handleDeviceSelect}>
                <option value="" disabled>Выберите устройство для редактирования</option>
                {devicesList.map((device, index) => (
                    <option key={index} value={device}>{device}</option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Название устройства"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
            />
            <textarea
                placeholder="Описание устройства"
                value={deviceDescription}
                onChange={(e) => setDeviceDescription(e.target.value)}
                required
            />
            <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                <option value="МФУ">МФУ</option>
                <option value="Принтер">Принтер</option>
            </select>
            <div>
                <span>Загружено {images.length} фото</span>
            </div>
            <input
                type="file"
                multiple
                onChange={handleImageChange}
            />
            <div className="form-buttons">
                <button type="button" className="close-btn" onClick={() => setIsAddDevice(false)}>Закрыть</button>
                <button type="submit" className="submit-btn">Сохранить устройство</button>
                <label htmlFor="file-upload" className="upload-btn">
                    <img src={imgUploadIcon} alt="Upload" />
                    <span>Загрузить данные устройств</span>
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
            </div>
            {loading && (
                <Loader />
            )}
        </form>
    );
};

export default DeviceForm;