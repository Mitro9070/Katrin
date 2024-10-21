import { mainPageStore } from '../stores/MainPageStore';

import '../styles/EditMainMenuPush.css'
import CustomCheckbox from './CustomCheckbox';

import iconPencilImg from '../images/pencil.svg'
import BackgroundClose from './BackgroundClose';

function EditMainMenuPush({setShowEditMainMenuPush}) {

    const changeMainPageBlocks = () => {
        let currentBlocks = []
        document.getElementsByName('blocksMainPage').forEach((e) => {
            e.checked && currentBlocks.push(e.value)
        })
        mainPageStore.changeBlocks(currentBlocks)
    }

    return ( 
        <>
            <div className="edit-main-menu-push">
                <p className="edit-main-menu-push-title">Главный экран</p>
                <div className="edit-main-checkboxes">
                    <CustomCheckbox placeholder={"Новости"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('News')} value={'News'}/>
                    <CustomCheckbox placeholder={"Мероприятия"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('Events')} value={'Events'}/>
                    <CustomCheckbox placeholder={"Дни рождения"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('Births')} value={'Births'}/>
                    <CustomCheckbox placeholder={"Новые сотрудники"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('Personal')} value={'Personal'}/>
                    <div className="edit-main-menu-push-ask">
                        <CustomCheckbox placeholder={"Вопрос"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('Link1')} value={'Link1'}/> 
                        <img className='edit-main-menu-push-pencil' src={iconPencilImg} alt="" />
                    </div>
                    <div className="edit-main-menu-push-ask">
                        <CustomCheckbox placeholder={"Инициатива"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('Link2')} value={'Link2'}/> 
                        <img className='edit-main-menu-push-pencil' src={iconPencilImg} alt="" />
                    </div>
                    <div className="edit-main-menu-push-ask">
                        <CustomCheckbox placeholder={"Опрос"} name='blocksMainPage' initialChecked={mainPageStore.NewsBlock.includes('Link3')} value={'Link3'}/> 
                        <img className='edit-main-menu-push-pencil' src={iconPencilImg} alt="" />
                    </div>
                </div>
                <div className="edit-main-btn-save" onClick={changeMainPageBlocks}>
                    <p>Сохранить</p>
                </div>
            </div>
            <BackgroundClose closeWindow={setShowEditMainMenuPush}/>
        </>
     );
}

export default EditMainMenuPush;