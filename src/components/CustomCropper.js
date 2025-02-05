import React, { useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

function CustomCropper({ imageSrc, onCancel, onSave }) {
  const cropperRef = useRef(null);

  const handleSaveClick = () => {
    const cropper = cropperRef.current.cropper;
    cropper.getCroppedCanvas().toBlob(
      (blob) => {
        onSave(blob);
      },
      'image/jpeg',
      1
    );
  };

  return (
    <div className="custom-cropper-container">
      <Cropper
        src={imageSrc}
        style={{ height: 400, width: '100%' }}
        // Настройки Cropper.js
        aspectRatio={1} // Соотношение сторон (1 = квадрат)
        guides={false}
        zoomable={true} // Разрешаем зум
        movable={true} // Разрешаем перемещение
        scalable={true} // Разрешаем масштабирование
        cropBoxResizable={true} // Разрешаем изменение размера области обрезки
        cropBoxMovable={true} // Разрешаем перемещение области обрезки
        viewMode={1}
        background={false}
        autoCropArea={1}
        responsive={true}
        checkOrientation={true}
        ref={cropperRef}
      />
      <div className="custom-cropper-buttons">
        <button onClick={onCancel}>Отмена</button>
        <button onClick={handleSaveClick}>Сохранить</button>
      </div>
    </div>
  );
}

export default CustomCropper;