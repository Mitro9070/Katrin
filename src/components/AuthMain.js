function AuthMain({setStage}) {

    const setStageHandler = (value) => {
        setStage(() => value)
    }   

    return (
        <>
            <p className="auth-push-title">Вход</p>
            <div className="auth-push-input auth-push-input-login">
                <p className="auth-push-input-login-placeholder">Логин</p>
            </div>
            <div className="auth-push-input auth-push-input-password">
                <p className="auth-push-input-password-placeholder">Пароль</p>
            </div>
            <div className="auth-push-btn-auth">
                <p className="auth-push-btn-auth-text">Войти</p>
            </div>
            <p className="auth-push-register-btn" onClick={() => setStageHandler('Register')}>Зарегистрироваться</p>
            <p className="auth-push-remember-btn">Восстановить пароль</p>
        </>
    );
}

export default AuthMain;