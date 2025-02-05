export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener('load', () => {
            console.log('Изображение загружено успешно');
            resolve(image);
        });
        image.addEventListener('error', (error) => {
            console.error('Ошибка при загрузке изображения:', error);
            reject(error);
        });

        // Не устанавливаем crossOrigin для локальных файлов
        if (!url.startsWith('data:')) {
            image.setAttribute('crossOrigin', 'anonymous');
        }

        image.src = url;
    });

export const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

export const getCroppedImg = async (imageSrc, pixelCrop) => {
    console.log('imageSrc:', imageSrc);
    console.log('pixelCrop:', pixelCrop);

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    console.log('canvas width:', canvas.width);
    console.log('canvas height:', canvas.height);

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Проверяем содержимое canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('ImageData:', imageData);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    blob.name = 'profile.jpg';
                    resolve(blob);
                } else {
                    console.error('canvas.toBlob вернул null или undefined');
                    reject(new Error('Ошибка при создании Blob'));
                }
            },
            'image/jpeg',
            1
        );
    });
};