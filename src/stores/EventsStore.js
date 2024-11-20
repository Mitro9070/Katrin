import { makeAutoObservable, runInAction } from "mobx";
import { database } from "../firebaseConfig";
import { ref, get, update } from "firebase/database"; // Добавим метод update для Firebase Database

class EventsStore {
    Events = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
        this.fetchData(); // Вызов метода получения данных при инициализации
    }

    async fetchData() {
        this.loading = true;
        try {
            const eventsRef = ref(database, 'Events');
            const snapshot = await get(eventsRef);

            runInAction(() => {
                this.Events = [];
                console.log("Полученные данные из Firebase:", snapshot.val());

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        console.log("Элемент:", item);
                        this.Events.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    });
                } else {
                    console.log("Данные отсутствуют.");
                }

                console.log("Сформированный массив событий:", this.Events);
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                console.error("Ошибка при получении данных:", error);
                this.loading = false;
            });
        }
    }

    async updateEvent(id, updatedEventData) {
        try {
            const eventRef = ref(database, `Events/${id}`);
            await update(eventRef, updatedEventData);

            runInAction(() => {
                const eventIndex = this.Events.findIndex(event => event.id === id);
                if (eventIndex !== -1) {
                    this.Events[eventIndex] = { ...this.Events[eventIndex], ...updatedEventData };
                }
            });

            console.log("Событие обновлено успешно:", updatedEventData);
        } catch (error) {
            console.error("Ошибка при обновлении события:", error);
            throw error;
        }
    }

    appendEvent(Event) {
        this.Events.push(Event);
    }

    getEventById(id) {
        return this.Events.filter(e => e.id === id)[0];
    }

    getEventsDates() {
        const internal = [];
        const external = [];

        this.Events.forEach(event => {
            if (event.status === 'Опубликовано') {
                const date = event.start_date.split('T')[0].split('-').reverse().join('.');
                if (event.elementType === 'Внутреннее событие') {
                    internal.push(date);
                } else if (event.elementType === 'Внешнее событие') {
                    external.push(date);
                }
            }
        });

        console.log("Внутренние события:", internal);
        console.log("Внешние события:", external);

        return { internal, external };
    }
}

export const eventsStore = new EventsStore();