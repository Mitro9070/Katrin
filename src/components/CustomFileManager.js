import React from 'react';
import { Table, Breadcrumb } from 'antd';
import imgFolderIcon from '../images/folder.png';
import imgFileIcon from '../images/file.png';
import imgSaveIcon from '../images/save-2.svg'; // Импортируем иконку сохранения
import '../styles/CustomFileManager.css';

// Функция преобразования байт в удобочитаемый размер
const formatSize = (size) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const dataToColumns = (data) => data.map((item, index) => ({
    key: index,
    name: item.basename.replace('/Exchange/', ''), // Убираем имя корневой папки
    size: item.type === 'directory' ? 'Папка' : formatSize(item.size), // Преобразуем размер в удобочитаемый формат или показываем "Папка"
    lastmod: new Date(item.lastmod).toLocaleString(), // Преобразуем дату в локальный формат без GMT
    type: item.type
}));

const CustomFileManager = ({ files, onFolderClick, onFileClick, breadcrumbs, onBreadcrumbClick }) => {
    const columns = [
        {
            title: 'Имя',
            dataIndex: 'name',
            key: 'name',
            width: '400px',
            render: (text, record) => (
                <span onClick={() => record.type === 'directory' ? onFolderClick(record) : onFileClick(record)} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <img src={record.type === 'directory' ? imgFolderIcon : imgFileIcon} alt={record.type} style={{ width: '20px', marginRight: '8px' }} />
                    {text}
                </span>
            ),
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
                    <img src={imgSaveIcon} alt="save" style={{ width: '20px', cursor: 'pointer' }} onClick={() => onFileClick(record)} />
                ) : null
            ),
        },
    ];

    return (
        <div className="custom-file-manager" style={{ width: '1095px', marginTop: '-40px' }}>
            <Breadcrumb style={{ marginBottom: '20px' }}>
                {breadcrumbs.map((breadcrumb, index) => (
                    <Breadcrumb.Item key={index}>
                        <span onClick={() => onBreadcrumbClick(index)}>{breadcrumb}</span>
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
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