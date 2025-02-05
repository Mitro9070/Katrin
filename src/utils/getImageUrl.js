// getImageUrl.js

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    return `${serverUrl}/api/webdav/image?url=${encodeURIComponent(imageUrl)}`;
};
