import { useState } from 'react';

import '../styles/AuthPush.css'

import iconCrossImg from '../images/cross.svg'
import AuthMain from './AuthMain';
import AuthRegister from './AuthRegiser';
import BackgroundClose from './BackgroundClose';

function AuthPush({setShowAuthPush}) {
    
const [Stage, setStage] = useState('AuthMain');

    return ( 
        <>
            <div className="auth-push">
                <img src={iconCrossImg} alt="" className="auth-push-close-img" onClick={() => setShowAuthPush(false)}/>
                {Stage == 'AuthMain' && (
                    <AuthMain setStage={setStage}/>
                )}
                {Stage == 'Register' && (
                    <AuthRegister />
                )}
                {Stage == 'Remember' && (
                    <AuthMain setStage={setStage}/>
                )}
            </div>
            <BackgroundClose closeWindow={ () => setShowAuthPush(false)} />
        </>
     );
}

export default AuthPush;