import React from 'react';
import { Table } from 'antd';
import imgFolderIcon from '../images/folder.png';
import imgFileIcon from '../images/file.png';
import imgSaveIcon from '../images/save-2.svg'; // Импортируем иконку сохранения
import homeIcon from '../images/home.png'; // Импортируем иконку домика

import '../styles/CustomFileManager.css';

// Функция преобразования байт в удобочитаемый размер
const formatSize = (size) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

// Преобразуем данные из WebDAV в формат, подходящий для таблицы
const dataToColumns = (data) =>
    data.map((item, index) => ({
        key: index,
        name: decodeURIComponent(item.basename.replace('/Exchange/', '').replace(/\/$/, '')),
        size: item.type === 'directory' ? 'Папка' : formatSize(item.size),
        lastmod: new Date(item.lastmod).toLocaleString(),
        type: item.type,
        basename: decodeURIComponent(item.basename),
    }));

const CustomFileManager = ({ files, onFolderClick, onFileClick, breadcrumbs, onBreadcrumbClick }) => {
    // Обработчик клика по хлебным крошкам
    const handleBreadcrumbClick = (index) => {
        console.log('Клик по папке:', index);
        onBreadcrumbClick(index);
    };

    // Обработчик клика по домику
    const handleHomeClick = () => {
        onBreadcrumbClick(-1);
    };

    // Колонки для таблицы
    const columns = [
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
            width: '400px',
            render: (text, record) => (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <img src={record.type === 'directory' ? imgFolderIcon : imgFileIcon} alt={record.type} style={{ width: '20px', marginRight: '8px' }} />
                    {text}
                </span>
            ),
            onCell: (record) => ({
                onClick: (event) => {
                    event.stopPropagation();
                    if (record.type === 'directory') {
                        onFolderClick(record);
                    } else {
                        onFileClick(record);
                    }
                },
                style: { cursor: 'pointer' },
            }),
        },
        {
            title: 'Размер',
            dataIndex: 'size',
            key: 'size',
            width: '250px',
        },
        {
            title: 'Дата изменения',
            dataIndex: 'lastmod',
            key: 'lastmod',
            width: '350px',
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '100px',
            render: (text, record) => (
                record.type === 'file' ? (
                    <img src={imgSaveIcon} alt="save" style={{ width: '20px', cursor: 'pointer' }} onClick={(event) => {
                        event.stopPropagation();
                        onFileClick(record);
                    }} />
                ) : null
            ),
        },
    ];

    return (
        <div className="custom-file-manager" style={{ width: '1095px', marginTop: '-40px', position: 'relative' }}>
            {/* Хлебные крошки */}
            <div className="breadcrumbs" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', zIndex: 1000, position: 'relative', backgroundColor: '#fff' }}>
                {/* Иконка домика */}
                <span onClick={(event) => {
                    event.stopPropagation();
                    handleHomeClick();
                }} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    <img src={homeIcon} alt="home" style={{ width: '24px' }} />
                    <span style={{ marginLeft: '8px', marginRight: '8px' }}>/</span>
                </span>
                {/* Хлебные крошки */}
                {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={index}>
                        <span onClick={(event) => {
                            event.stopPropagation();
                            handleBreadcrumbClick(index);
                        }} style={{ cursor: 'pointer', marginRight: '8px' }}>
                            {decodeURIComponent(breadcrumb)}
                        </span>
                        {index < breadcrumbs.length - 1 && <span style={{ marginRight: '8px' }}>/</span>}
                    </React.Fragment>
                ))}
            </div>
            <Table
                style={{ marginTop: '0px' }}
                columns={columns}
                dataSource={dataToColumns(files)}
                pagination={false}
                scroll={{ y: 250 }}
            />
        </div>
    );
};

export default CustomFileManager;