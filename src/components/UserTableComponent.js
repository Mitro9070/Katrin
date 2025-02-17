// src/components/UserTableComponent.js

import React, { useState } from 'react';
import imgEditIcon from '../images/edit.png';  // Импорт иконки редактирования
import imgTrashIcon from '../images/trash-delete.png';  // Импорт иконки удаления
import imgDefaultUserIcon from '../images/photo_person.png'; // Импорт иконки по умолчанию
import EditUserModal from './EditUserModal'; // Импорт компонента EditUserModal
import { getImageUrl } from '../utils/getImageUrl'; // Импорт функции getImageUrl

const UserTableComponent = ({ users, roles, onEditUser, onDeleteUser, refreshUsers }) => {
    const [selectedUser, setSelectedUser] = useState(null);

    const renderUsersAsTable = (users) => {
        return (
            <table>
                <tbody>
                    {users.map((user) => (
                        <React.Fragment key={user.id}>
                            <tr>
                                <td colSpan="7" style={{ padding: '0' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="2" viewBox="0 0 1095 2" fill="none">
                                        <path d="M0 1H1095" stroke="#989898" strokeWidth="1" strokeLinecap="square" strokeDasharray="4 4" />
                                    </svg>
                                </td>
                            </tr>
                            <tr className="table-row">
                                <td style={{
                                    width: '83px',
                                    height: '83px',
                                    flexShrink: '0',
                                    borderRadius: '20px',
                                    background: '#F2F3F4',
                                    padding: '10px'
                                }}>
                                    <img 
                                        src={user.image ? getImageUrl(user.image) : imgDefaultUserIcon} 
                                        alt="Фото" 
                                        className="img-photo" 
                                    />
                                </td>
                                <td style={{
                                    color: '#2C2C2C',
                                    width: '100px',
                                    height: '83px',
                                    fontFamily: '"PF DinText Pro"',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    padding: '0 30px'
                                }}>
                                    {`${user.surname} ${user.name} ${user.lastname}`}
                                </td>
                                <td style={{
                                    color: '#2C2C2C',
                                    width: '200px',
                                    height: '83px',
                                    fontFamily: '"PF DinText Pro"',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    padding: '0 30px'
                                }}>
                                    <p style={{ fontWeight: 'bold', margin: 0 }}>Роль</p>
                                    <p>{roles.find(role => role.id === user.role)?.rusname || 'Не назначена'}</p>
                                </td>
                                <td style={{
                                    color: '#2C2C2C',
                                    width: '200px',
                                    height: '83px',
                                    fontFamily: '"PF DinText Pro"',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    padding: '0 30px'
                                }}>
                                    <p style={{ fontWeight: 'bold', margin: 0 }}>Должность</p>
                                    <p>{user.position}</p>
                                </td>
                                <td style={{
                                    color: '#2C2C2C',
                                    width: '200px',
                                    height: '83px',
                                    fontFamily: '"PF DinText Pro"',
                                    fontSize: '16px',
                                    fontWeight: '400',
                                    padding: '0 30px'
                                }}>
                                    <p style={{ fontWeight: 'bold', margin: 0 }}>Почта</p>
                                    <p>{user.email}</p>
                                </td>
                                <td style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    padding: '10px',
                                    position: 'relative'
                                }}>
                                    <button 
                                        style={{ width: '40px', height: '40px', margin: '10px 5px' }}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <img src={imgEditIcon} alt="Редактировать" />
                                    </button>
                                    <button 
                                        style={{ width: '40px', height: '40px', margin: '10px 5px' }}
                                        onClick={() => onDeleteUser(user.email)}
                                    >
                                        <img src={imgTrashIcon} alt="Удалить" />
                                    </button>
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
            {renderUsersAsTable(users)}
            {selectedUser && (
                <EditUserModal 
                    user={selectedUser} 
                    roles={roles} 
                    closeModal={() => setSelectedUser(null)} 
                    refreshUsers={refreshUsers}
                />
            )}
        </>
    );
};

export default UserTableComponent;