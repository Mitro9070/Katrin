import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import imgChatGroupIcon from '../images/chat-group.png';
import imgMoreHorIcon from '../images/more-hor.png';
import imgCheckIcon from '../images/checkmark.png';
import imgCloseCancelIcon from '../images/close cancel x.png';
import imgLocationIcon from '../images/location.png';
import imgRefreshRepeatIcon from '../images/refresh repeat.png';
import EditBidForm from './EditBidPage';

const TableComponent = ({
  items,
  onStatusChange,
  currentTab,
  subTab,
  setShowMenuId,
  showMenuId,
  handleEdit,
  onDelete,
  onRestore,
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

  const parseDate = (dateString) => {
    const [date, time] = dateString.split(', ');
    const [day, month, year] = date.split('.');

    const formattedDateString = `${year}-${month}-${day}T${time}`;
    const parsedDate = new Date(formattedDateString);
    return parsedDate;
  };

  const renderItemsAsTable = (items) => {
    return (
      <table>
        <tbody>
          {items
            .filter((item) =>
              subTab === 'Archive' ? item.status === 'Архив' : item.status !== 'Архив'
            )
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
                    {parseDate(item.postData).toLocaleString()}
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
                    {item.organizerName !== 'Неизвестно' && item.organizerName}
                  </td>
                  {/* Скрываем кнопки статусов во вкладке "Корзина" */}
                  {subTab !== 'Archive' && subTab !== 'Trash' && (
                    <td style={{ padding: '10px' }}>
                      {item.status === 'На модерации' && (
                        <div
                          className="custom-approve-reject-buttons"
                          style={{
                            visibility:
                              item.elementType === 'Технические новости' ||
                              item.elementType === 'Тех. новости'
                                ? 'hidden'
                                : 'visible',
                          }}
                        >
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
                          style={{
                            visibility:
                              item.elementType === 'Технические новости' ||
                              item.elementType === 'Тех. новости'
                                ? 'hidden'
                                : 'visible',
                          }}
                        >
                          <img src={imgLocationIcon} alt="Опубликовать" />
                        </button>
                      )}
                      {item.status === 'Опубликовано' && (
                        <button
                          title="Снять с публикации"
                          className="custom-unpublish-btn"
                          onClick={() => onStatusChange(item.id, 'Одобрено')}
                          style={{
                            visibility:
                              item.elementType === 'Технические новости' ||
                              item.elementType === 'Тех. новости'
                                ? 'hidden'
                                : 'visible',
                          }}
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
                        {currentTab === 'News' ||
                        item.elementType === 'Технические новости' ||
                        item.elementType === 'Тех. новости' ? (
                          <div
                            className="comments-menu-item"
                            onClick={() => {
                              setShowMenuId(null);
                            }}
                          >
                            <Link
                              to={`/news/${item.id}?referrer=${encodeURIComponent(
                                window.location.pathname + window.location.search
                              )}`}
                            >
                              Посмотреть
                            </Link>
                          </div>
                        ) : (
                          <div
                            className="comments-menu-item"
                            onClick={() => {
                              setShowMenuId(null);
                            }}
                          >
                            <Link
                              to={`/events/${item.id}?referrer=${encodeURIComponent(
                                window.location.pathname + window.location.search
                              )}`}
                            >
                              Посмотреть
                            </Link>
                          </div>
                        )}
                        {/* Если мы не в архиве и не в корзине, показываем "Редактировать" и "Удалить" */}
                        {subTab !== 'Archive' &&
                          subTab !== 'Trash' &&
                          !(
                            item.elementType === 'Технические новости' ||
                            item.elementType === 'Тех. новости'
                          ) && (
                            <>
                              <div
                                className="comments-menu-item"
                                onClick={() => {
                                  setIsEditPage(true);
                                  setEditBidId(item.id);
                                  handleEdit(
                                    currentTab,
                                    item.id,
                                    location.pathname + location.search
                                  );
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
                        {/* Если мы в архиве */}
                        {subTab === 'Archive' ? (
                          <div
                            className="comments-menu-item"
                            onClick={() => {
                              onStatusChange(item.id, 'Одобрено');
                              setShowMenuId(null);
                            }}
                          >
                            Из архива
                          </div>
                        ) : (
                          /* Если мы не в корзине, можем добавить в архив */
                          subTab !== 'Trash' &&
                          !(
                            item.elementType === 'Технические новости' ||
                            item.elementType === 'Тех. новости'
                          ) && (
                            <div
                              className="comments-menu-item"
                              onClick={() => {
                                onStatusChange(item.id, 'Архив');
                                setShowMenuId(null);
                              }}
                            >
                              В архив
                            </div>
                          )
                        )}
                        {/* Если мы в корзине, показываем "Восстановить" */}
                        {subTab === 'Trash' && (
                          <div
                            className="comments-menu-item"
                            onClick={() => {
                              onRestore(item.id);
                              setShowMenuId(null);
                            }}
                          >
                            Восстановить
                          </div>
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

export default TableComponent;