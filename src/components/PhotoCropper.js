import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import '../styles/PhotoCropper.css';

const PhotoCropper = ({ imageSrc, onCancel, onSave }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 195, 195); // Установим размер 195x195
            onSave(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="photo-cropper">
            <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropSize={{ width: 195, height: 195 }} // Задаем фиксированный размер области обрезки
            />
            <div className="photo-cropper-controls">
                <button onClick={onCancel}>Отменить</button>
                <button onClick={handleSave}>Сохранить</button>
            </div>
        </div>
    );
};

export default PhotoCropper;