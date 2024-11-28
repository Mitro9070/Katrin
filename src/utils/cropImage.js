export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

export const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

export const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    canvas.width = maxSize;
    canvas.height = maxSize;

    ctx.translate(maxSize / 2, maxSize / 2);
    ctx.translate(-maxSize / 2, -maxSize / 2);

    ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        maxSize / 2 - image.width / 2,
        maxSize / 2 - image.height / 2,
        image.width,
        image.height
    );

    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (file) => {
                const url = URL.createObjectURL(file);
                resolve(url);
            },
            'image/jpeg',
            1
        );
    });
};