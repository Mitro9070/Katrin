import React from 'react';
import '../styles/PageHeadTab.css';

const PageHeadTab = ({ currentTab, onTabClickHandler, roleId }) => {
    return (
        <div className="news-page-head">
            <p 
                className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`}
                data-tab="All"
                onClick={onTabClickHandler}
            >
                Все
            </p>
            {(roleId === '1' || roleId === '6') && (
                <p
                    className={`bid-page-head-tab ${currentTab === 'TechNews' ? 'bid-page-head-tab-selected' : ''}`}
                    data-tab="TechNews"
                    onClick={onTabClickHandler}
                >
                    Тех. новости
                </p>
            )}
            <p 
                className={`bid-page-head-tab ${currentTab === 'Ads' ? 'bid-page-head-tab-selected' : ''}`}
                data-tab="Ads"
                onClick={onTabClickHandler}
            >
                Объявления
            </p>
            <p 
                className={`bid-page-head-tab ${currentTab === 'Devices' ? 'bid-page-head-tab-selected' : ''}`}
                data-tab="Devices"
                onClick={onTabClickHandler}
            >
                Устройства и ПО
            </p>
            <p 
                className={`bid-page-head-tab ${currentTab === 'Activity' ? 'bid-page-head-tab-selected' : ''}`}
                data-tab="Activity"
                onClick={onTabClickHandler}
            >
                Мероприятия
            </p>
        </div>
    );
};

export default PageHeadTab;