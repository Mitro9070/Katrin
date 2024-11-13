import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { database } from '../firebaseConfig';
import Loader from './Loader';
import '../styles/EditUserModal.css'; // Добавляем стили для модального окна

const EditUserModal = ({ user, roles, closeModal, refreshUsers }) => {
    const [role, setRole] = useState(user.role);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const userRef = ref(database, `Users/${user.id}`);
            await update(userRef, { role });
            setMessage('Изменения сохранены.');
            setTimeout(() => {
                setMessage('');
                closeModal();
            }, 1500);
            refreshUsers();
        } catch (error) {
            console.error('Ошибка при сохранении изменений:', error);
            setMessage('Не удалось сохранить изменения.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const auth = getAuth();
            await sendPasswordResetEmail(auth, user.email);
            setMessage(`Ссылка на смену пароля отправлена на ${user.email}`);
        } catch (error) {
            console.error('Ошибка при отправке ссылки на смену пароля:', error);
            setMessage('Не удалось отправить ссылку на смену пароля.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-modal" onClick={closeModal}>&times;</button>
                <h2>Редактировать сотрудника</h2>
                <div style={{ marginBottom: '10px' }}>
                    <label>Роль:</label>
                    <select value={role} onChange={handleRoleChange} className="custom-select">
                        {Object.keys(roles).map(roleId => (
                            <option key={roleId} value={roleId}>{roles[roleId].rusname}</option>
                        ))}
                    </select>
                </div>
                <div className="buttons-container">
                    <button className="reset-password-button" onClick={handleResetPassword}>Сбросить пароль</button>
                    <button className="save-changes-button" onClick={handleSaveChanges}>Сохранить изменения</button>
                </div>
                <div style={{ marginBottom: '10px', color: 'green' }}>{message}</div>
                <div style={{ marginTop: '20px' }}>
                    {loading && <Loader />}
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;