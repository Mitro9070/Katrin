import { useState } from 'react';

function AuthRegister() {

    const [RegisterStage, setRegisterStage] = useState(1);

    const changeRegisterStageHandler = (value) => {
        setRegisterStage(() => value)
    }

    return ( 
        <>
            <p className="auth-push-title">{RegisterStage == 3 ? 'Заявка на регистрацию отправлена!' : 'Регистрация'}</p>
            { RegisterStage != 3 && (
                <p className="auth-push-description">Создайте аккаунт, чтобы войти в личный кабинет</p>
            )}
            <div className="auth-push-register-stages">
                <p className="register-stage-1"
                    style={{color: RegisterStage==1?"#0C8CE9":"#222222"}}
                >1</p>
                <div className="register-stage-line-1-2"
                    style={{backgroundColor: RegisterStage!=3?"#0C8CE9":"#222222"}}
                ></div>
                <p className="register-stage-2"
                    style={{color: RegisterStage==2?"#0C8CE9":"#222222"}}
                >2</p>
                <div className="register-stage-line-2-3"
                    style={{backgroundColor: RegisterStage!=1?"#0C8CE9":"#222222"}}
                ></div>
                <p className="register-stage-3"
                    style={{color: RegisterStage==3?"#0C8CE9":"#222222"}}
                >3</p>
            </div>
            { RegisterStage == 1 && (
                <>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Имя</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Фамилия</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Отчество</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Город</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Должность</p>
                    </div>
                    <div className="auth-push-btn-auth" onClick={() => changeRegisterStageHandler(2)}>
                        <p className="auth-push-btn-auth-text">Продолжить</p>
                    </div>
                </>
            )}
            {RegisterStage == 2 && (
                <>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Логин</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Email</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Придумайте пароль</p>
                    </div>
                    <div className="auth-push-input auth-push-input-password">
                        <p className="auth-push-input-password-placeholder">Повторите пароль</p>
                    </div>
                    <div className="auth-push-btn-auth" onClick={() => changeRegisterStageHandler(3)}>
                        <p className="auth-push-btn-auth-text">Зарегистрироваться</p>
                    </div>
                </>
            )}
            {RegisterStage == 3 && (
                <p className="auth-push-register-done-text">В ближайшее время ваша заявка будет рассмотрена администратором и на указанную вами электронную почту будет отправлено письмо о подтверждение аккаунта </p>
            )}
        </>
     );
}

export default AuthRegister;