import React, { useRef, useState, useEffect } from 'react';
import '../styles/CustomCropper.css';

const CustomCropper = ({ imageSrc, onCancel, onSave }) => {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const image = imageRef.current;
        const container = containerRef.current;

        if (image && container) {
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            const imageWidth = image.naturalWidth;
            const imageHeight = image.naturalHeight;

            const initialScale = Math.min(
                containerWidth / imageWidth,
                containerHeight / imageHeight
            );

            setScale(initialScale);

            const initialX = (containerWidth - imageWidth * initialScale) / 2;
            const initialY = (containerHeight - imageHeight * initialScale) / 2;

            setPosition({
                x: initialX,
                y: initialY,
            });
        }

        // Prevent page scrolling when cropper is open
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore original overflow when component unmounts
            document.body.style.overflow = originalOverflow;
        };
    }, [imageSrc]);

    const handleWheel = (e) => {
        // Remove e.preventDefault();

        const zoomStep = 0.05; // 5% per scroll
        const delta = e.deltaY;

        if (delta > 0) {
            // Scroll down, zoom out
            setScale((prevScale) => Math.max(prevScale - zoomStep, 0.5));
        } else {
            // Scroll up, zoom in
            setScale((prevScale) => Math.min(prevScale + zoomStep, 5));
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startPosition = { x: position.x, y: position.y };

        const handleMouseMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            setPosition({ x: startPosition.x + dx, y: startPosition.y + dy });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'grabbing';
    };

    const handleSave = async () => {
        const cropArea = containerRef.current.querySelector('.crop-area');
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = 195;
        croppedCanvas.height = 195;
        const ctx = croppedCanvas.getContext('2d');

        const cropRect = cropArea.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();

        // Coefficients to translate DOM sizes to image sizes
        const scaleX = imageRef.current.naturalWidth / imageRect.width;
        const scaleY = imageRef.current.naturalHeight / imageRect.height;

        // Calculate the cropping coordinates on the original image
        const sx = (cropRect.left - imageRect.left) * scaleX;
        const sy = (cropRect.top - imageRect.top) * scaleY;
        const sWidth = cropRect.width * scaleX;
        const sHeight = cropRect.height * scaleY;

        ctx.drawImage(
            imageRef.current,
            sx,
            sy,
            sWidth,
            sHeight,
            0,
            0,
            croppedCanvas.width,
            croppedCanvas.height
        );

        croppedCanvas.toBlob((blob) => {
            onSave(blob); // Pass the blob for saving
        }, 'image/jpeg');
    };

    return (
        <div className="custom-cropper-overlay">
            <div className="custom-cropper">
                <div
                    className="image-container"
                    ref={containerRef}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                >
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'top left',
                        }}
                        alt="To crop"
                    />
                    <div className="crop-area" />
                </div>
                <div className="cropper-controls">
                    <button onClick={onCancel}>Отменить</button>
                    <button onClick={handleSave}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};

export default CustomCropper;