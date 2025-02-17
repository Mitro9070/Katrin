// src/components/TableComponentTech.js

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import imgChatGroupIcon from '../images/chat-group.png';
import imgMoreHorIcon from '../images/more-hor.png';
import imgCheckIcon from '../images/checkmark.png';
import imgCloseCancelIcon from '../images/close cancel x.png';
import imgLocationIcon from '../images/location.png';
import imgRefreshRepeatIcon from '../images/refresh repeat.png';
import EditBidForm from './EditBidPage';

const TableComponentTech = ({
  items,
  onStatusChange,
  currentTab,
  subTab,
  setShowMenuId,
  showMenuId,
  onEdit,
  onDelete,
  onRestore,
  onView,
}) => {
  const location = useLocation();
  const [isEditPage, setIsEditPage] = useState(false);
  const [editBidId, setEditBidId] = useState(null);

  // Реф для меню
  const menuRefs = useRef({});

  // Обработчик клика вне меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenuId !== null &&
        menuRefs.current[showMenuId] &&
        !menuRefs.current[showMenuId].contains(event.target)
      ) {
        setShowMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenuId, setShowMenuId]);

  const renderItemsAsTable = (items) => {
    return (
      <table>
        <tbody>
          {items
            .filter((item) => {
              if (subTab === 'Archive') {
                return item.status === 'Архив';
              } else if (subTab === 'Trash') {
                // В корзине не фильтруем по статусу
                return true;
              } else {
                return item.status !== 'Архив';
              }
            })
            .map((item) => (
              <React.Fragment key={item.id}>
                <tr>
                  <td colSpan="6" style={{ padding: '0' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="2"
                      viewBox="0 0 1095 2"
                      fill="none"
                    >
                      <path
                        d="M0 1H1095"
                        stroke="#989898"
                        strokeWidth="1"
                        strokeLinecap="square"
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </td>
                </tr>
                <tr className="table-row">
                  <td style={{ width: '40px', height: '40px', padding: '10px' }}>
                    <input type="checkbox" />
                  </td>
                  <td
                    style={{
                      width: '150px',
                      height: '40px',
                      color: '#525252',
                      fontFeatureSettings: "'liga' off, 'clig' off",
                      fontFamily: 'Montserrat',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '125%',
                      padding: '10px',
                    }}
                  >
                    {item.postdata ? new Date(item.postdata).toLocaleString() : 'Неизвестно'}
                  </td>
                  <td
                    style={{
                      width: '570px',
                      color: '#525252',
                      fontFeatureSettings: "'liga' off, 'clig' off",
                      fontFamily: 'Montserrat',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '125%',
                      padding: '10px',
                    }}
                  >
                    {item.title}
                  </td>
                  <td
                    style={{
                      width: '120px',
                      color: '#525252',
                      fontFeatureSettings: "'liga' off, 'clig' off",
                      fontFamily: 'Montserrat',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '125%',
                      padding: '10px',
                    }}
                  >
                    {item.organizerName !== 'Неизвестно' ? item.organizerName : ''}
                  </td>
                  {/* Скрываем кнопки статусов во вкладке "Корзина" */}
                  {subTab !== 'Archive' && subTab !== 'Trash' && (
                    <td style={{ padding: '10px' }}>
                      {item.status === 'На модерации' && (
                        <div className="custom-approve-reject-buttons">
                          <button
                            title="Одобрить"
                            className="custom-approve-btn"
                            onClick={() => onStatusChange(item.id, 'Одобрено')}
                          >
                            <img src={imgCheckIcon} alt="Одобрить" />
                          </button>
                          <button
                            title="Отклонить"
                            className="custom-reject-btn"
                            onClick={() => onStatusChange(item.id, 'Отклонено')}
                          >
                            <img src={imgCloseCancelIcon} alt="Отклонить" />
                          </button>
                        </div>
                      )}
                      {item.status === 'Одобрено' && (
                        <button
                          title="Опубликовать"
                          className="custom-publish-btn"
                          onClick={() => onStatusChange(item.id, 'Опубликовано')}
                        >
                          <img src={imgLocationIcon} alt="Опубликовать" />
                        </button>
                      )}
                      {item.status === 'Опубликовано' && (
                        <button
                          title="Снять с публикации"
                          className="custom-unpublish-btn"
                          onClick={() => onStatusChange(item.id, 'Одобрено')}
                        >
                          <img src={imgRefreshRepeatIcon} alt="Снять с публикации" />
                        </button>
                      )}
                    </td>
                  )}
                  {/* Если мы в "Архиве" или "Корзине", оставляем пустую ячейку */}
                  {(subTab === 'Archive' || subTab === 'Trash') && <td></td>}
                  <td style={{ padding: '10px', position: 'relative' }}>
                    <div className="comments-menu-buttons">
                      <button className="comments-btn">
                        <img src={imgChatGroupIcon} alt="Комментарии" />
                      </button>
                      <button
                        className="menu-btn"
                        onClick={() => setShowMenuId(showMenuId === item.id ? null : item.id)}
                      >
                        <img src={imgMoreHorIcon} alt="Меню" />
                      </button>
                    </div>
                    {showMenuId === item.id && (
                      <div
                        className="comments-menu"
                        ref={(el) => (menuRefs.current[item.id] = el)}
                      >
                        {/* Пункт "Посмотреть" */}
                        <div
                          className="comments-menu-item"
                          onClick={() => {
                            onView(currentTab, item.id);
                            setShowMenuId(null);
                          }}
                        >
                          Посмотреть
                        </div>
                        {/* Если мы не в архиве и не в корзине, показываем "Редактировать" и "Удалить" */}
                        {subTab !== 'Archive' &&
                          subTab !== 'Trash' && (
                            <>
                              <div
                                className="comments-menu-item"
                                onClick={() => {
                                  onEdit(item.id);
                                  setShowMenuId(null);
                                }}
                              >
                                Редактировать
                              </div>
                              <div
                                className="comments-menu-item"
                                onClick={() => {
                                  onDelete(item.id);
                                  setShowMenuId(null);
                                }}
                              >
                                Удалить
                              </div>
                            </>
                          )}
                        {/* Если мы в "Архиве" */}
                        {subTab === 'Archive' && (
                          <div
                            className="comments-menu-item"
                            onClick={() => {
                              onStatusChange(item.id, 'Одобрено');
                              setShowMenuId(null);
                            }}
                          >
                            Из архива
                          </div>
                        )}
                        {/* Если мы в "Корзине" */}
                        {subTab === 'Trash' && (
                          <>
                            <div
                              className="comments-menu-item"
                              onClick={() => {
                                onRestore(item.id);
                                setShowMenuId(null);
                              }}
                            >
                              Восстановить
                            </div>
                            <div
                              className="comments-menu-item"
                              onClick={() => {
                                onDelete(item.id);
                                setShowMenuId(null);
                              }}
                            >
                              Удалить навсегда
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      {isEditPage ? (
        <EditBidForm setIsEditPage={setIsEditPage} typeForm={currentTab} id={editBidId} />
      ) : (
        renderItemsAsTable(items)
      )}
    </>
  );
};

export default TableComponentTech;