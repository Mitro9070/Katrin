import { makeAutoObservable } from "mobx";

class MainPageStore {
    // AllNewsBlock = ["News", "Events", "Births", "Personal", "Link1", "Link2", "Link3"];
    NewsBlock = ["News", "Events", "Births", "Personal", "Link1", "Link2", "Link3"];

    Links = ["#", "#", "#"]

    constructor(){
        makeAutoObservable(this)
    }

    changeBlocks(value) {
        this.NewsBlock = value
    }

    changeLinks(index, link) {
        this.Links[index] = link
    }
}

export const mainPageStore = new MainPageStore()