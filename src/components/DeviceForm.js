import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../firebaseConfig';
import { set, ref as dbRef } from 'firebase/database';
import '../styles/DeviceForm.css';
import Loader from './Loader';

const DeviceForm = ({ setIsAddDevice }) => {
    const [deviceName, setDeviceName] = useState('');
    const [deviceDescription, setDeviceDescription] = useState('');
    const [deviceType, setDeviceType] = useState('МФУ');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const deviceRef = dbRef(database, `Devices/${deviceName}`);
            const imagesUrls = [];
            let mainImageUrl = '';

            for (const image of images) {
                const imageRef = ref(storage, `Devices/${deviceName}/${image.name}`);
                await uploadBytes(imageRef, image);
                const imageUrl = await getDownloadURL(imageRef);
                imagesUrls.push(imageUrl);

                if (image.name.startsWith('Main')) {
                    mainImageUrl = imageUrl;
                }
            }

            // Если нет изображения с именем, начинающимся на "Main", используем первое изображение
            if (!mainImageUrl && imagesUrls.length > 0) {
                mainImageUrl = imagesUrls[0];
            }

            await set(deviceRef, {
                type_device: deviceType,
                description: deviceDescription,
                images: imagesUrls,
                main_image: mainImageUrl
            });

            setIsAddDevice(false);
        } catch (error) {
            console.error('Ошибка при добавлении устройства:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="device-form" onSubmit={handleSubmit}>
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
            <input
                type="file"
                multiple
                onChange={handleImageChange}
                required
            />
            <button type="submit">Добавить устройство</button>
            {loading && <Loader />}
        </form>
    );
};

export default DeviceForm;