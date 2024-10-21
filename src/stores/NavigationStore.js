import { makeAutoObservable } from "mobx";

class NavigationStore {
    currentBidTab = 'News'
    currentNewsTab = 'All'
    currentDevicesTab = 'All'

    currentEventDate = ''

    currentBidText = ''

    constructor(){
        makeAutoObservable(this)
    }

    setCurrentBidTab(tab){
        this.currentBidTab = tab
        console.log('change!')
        console.log(this.currentBidTab)
    }

    setCurrentNewsTab(tab){
        this.currentNewsTab = tab
        console.log('change!')
        console.log(this.currentBidTab)
    }

    setCurrentDevicesTab(tab){
        this.currentDevicesTab = tab
        console.log('change!')
        console.log(this.currentBidTab)
    }

    setCurrentEventsDate(date){
        this.currentEventDate = date
        console.log('change!')
        console.log(this.currentBidTab)
    }

    setCurrentBidText(text){
        this.currentBidText = text
        console.log('change!')
        console.log(this.currentBidTab)
    }

}

export const navigationStore = new NavigationStore()