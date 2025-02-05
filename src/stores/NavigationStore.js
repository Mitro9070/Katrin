import { makeAutoObservable } from "mobx";

class NavigationStore {
    currentBidTab = 'News'
    currentNewsTab = 'All'
    currentDevicesTab = 'All'
    currentSoftwareTab = 'All'  // Добавим вкладку для ПО
    currentEventDate = ''
    currentBidText = ''

    constructor(){
        makeAutoObservable(this)
    }

    resetEventsFilters() {
        this.currentEventDate = '';
        console.log('Events filters reset');
    }

    setCurrentBidTab(tab){
        this.currentBidTab = tab
        console.log('Bid tab changed:', this.currentBidTab)
    }

    setCurrentNewsTab(tab){
        this.currentNewsTab = tab
        console.log('News tab changed:', this.currentNewsTab)
    }

    setCurrentDevicesTab(tab){
        this.currentDevicesTab = tab
        console.log('Devices tab changed:', this.currentDevicesTab)
    }

    setCurrentSoftwareTab(tab){
        this.currentSoftwareTab = tab
        console.log('Software tab changed:', this.currentSoftwareTab)
    }

    setCurrentEventsDate(date){
        this.currentEventDate = date
        console.log('Event date changed:', this.currentEventDate)
    }

    setCurrentBidText(text){
        this.currentBidText = text
        console.log('Bid text changed:', this.currentBidText)
    }
}

export const navigationStore = new NavigationStore()