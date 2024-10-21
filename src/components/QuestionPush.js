import { useState } from "react";

import BackgroundClose from "./BackgroundClose";
import iconCrossImg from "../images/cross.svg"
import '../styles/QuestionPush.css'
import CustomInput from './CustomInput.js'
import CustomTextarea from './CustomTextarea.js'

function QuestionPush({setShowQuestionPush}) {

    const [Stage, setStage] = useState(1);

    return (  
        <>
            <div className="question-push auth-push">
                <img src={iconCrossImg} alt="" className="auth-push-close-img" onClick={() => setShowQuestionPush(false)}/>
                {Stage === 1 && (
                    <>
                        <p className="question-push-title">Задать вопрос</p>
                        <p className="question-push-question-number">Вопрос №1</p>
                        <p className="question-push-from">От Иванова И.И.     ivanov@katusha.ru   +7(999)999-99-99</p>
                        <CustomInput  width="420px" placeholder='Тема'/>
                        <CustomTextarea width="420px" placeholder='Ваш вопрос'/>
                        <div className="btn-question-push-send" onClick={() => setStage(2)}>
                            <p>Отправить</p>
                        </div>
                    </>
                )}
                {Stage === 2 && (
                    <>
                        <p className="question-push-title">Вопрос успешно отправлен!</p>
                        <p className="question-push-question-number">Ответ от менеджера прийдет вам на почту в ближайшее время</p>
                        <div className="btn-question-ok" onClick={() => setShowQuestionPush(false)}>
                            <p>Хорошо</p>
                        </div>
                    </>
                )}
            </div>
            <BackgroundClose closeWindow={ () => setShowQuestionPush(false)} />
        </>
    );
}

export default QuestionPush;

// import BackgroundClose from "./BackgroundClose";
// import iconCrossImg from "../images/cross.svg"

// function QuestionPush({setShowQuestionPush}) {
//     return (  
//         <>
//             <div className="question-push auth-push">
//                 <img src={iconCrossImg} alt="" className="auth-push-close-img" onClick={() => setShowQuestionPush(false)}/>

//             </div>
//             <BackgroundClose closeWindow={ () => setShowQuestionPush(false)} />
//         </>
//     );
// }

// export default QuestionPush;