import { useState } from "react";

import BackgroundClose from "./BackgroundClose";
import iconCrossImg from "../images/cross.svg"
import '../styles/QuestionPush.css'
import CustomInput from './CustomInput.js'
import CustomTextarea from './CustomTextarea.js'

function InitiativePush({setShowInitiativePush}) {

    const [Stage, setStage] = useState(1);

    return (  
        <>
            <div className="question-push auth-push">
                <img src={iconCrossImg} alt="" className="auth-push-close-img" onClick={() => setShowInitiativePush(false)}/>
                {Stage === 1 && (
                    <>
                        <p className="question-push-title">Предложить инициативу</p>
                        <p className="question-push-question-number">Инициатива №1</p>
                        <p className="question-push-from">От Иванова И.И.     ivanov@katusha.ru   +7(999)999-99-99</p>
                        <CustomTextarea width="420px" placeholder='Ваша инициатива'/>
                        <div className="btn-question-push-send" onClick={() => setStage(2)}>
                            <p>Отправить</p>
                        </div>
                    </>
                )}
                {Stage === 2 && (
                    <>
                        <p className="question-push-title">Инициатива успешно отправлена!</p>
                        <p className="question-push-question-number">Ответ от менеджера прийдет вам на почту в ближайшее время</p>
                        <div className="btn-question-ok" onClick={() => setShowInitiativePush(false)}>
                            <p>Хорошо</p>
                        </div>
                    </>
                )}
            </div>
            <BackgroundClose closeWindow={ () => setShowInitiativePush(false)} />
        </>
    );
}

export default InitiativePush;