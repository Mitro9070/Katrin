import { makeAutoObservable, runInAction } from "mobx";
import { database } from "../firebaseConfig";
import { ref, get, set } from "firebase/database";

class BidContentStore {
    Bids = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
        this.fetchData(); // Вызов метода получения данных при инициализации
    }

    async fetchData() {
        this.loading = true;
        try {
            const bidsRef = ref(database, 'Bids');
            const snapshot = await get(bidsRef);

            runInAction(() => {
                this.Bids = [];
                console.log("Полученные данные из Firebase:", snapshot.val());

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        console.log("Элемент:", item);
                        this.Bids.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    });
                } else {
                    console.log("Данные отсутствуют.");
                }

                console.log("Сформированный массив заявок:", this.Bids);
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                console.error("Ошибка при получении данных:", error);
                this.loading = false;
            });
        }
    }

    appendBid(Bid){
        this.Bids.push(Bid)
    }

    getBidById(id){
        return this.Bids.filter(e => e.id === id)[0]
    }

    async addBid(data) {
        const newBidRef = ref(database, 'Bids');
        await set(newBidRef, data);
    }
}

export const bidContentStore = new BidContentStore();