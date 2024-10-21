// src/stores/NewsContentStore.js
import { makeAutoObservable, runInAction } from "mobx";
import { database } from "../firebaseConfig";
import { ref, get, update } from "firebase/database";

class NewsContentStore {
    News = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
        this.fetchData(); // Вызов метода получения данных при инициализации
    }

    async fetchData() {
        this.loading = true;
        try {
            const newsRef = ref(database, 'News');
            const snapshot = await get(newsRef);

            runInAction(() => {
                // Здесь происходит распределение данных
                this.News = [];
                console.log("Полученные данные из Firebase:", snapshot.val());

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        console.log("Элемент:", item);
                        const displayUpTo = item.display_up_to ? new Date(item.display_up_to) : null;
                        this.News.push({
                            title: item.title,
                            text: item.text,
                            images: item.images || [],
                            status: item.status,
                            postData: item.postData,
                            comment: '',
                            elementType: item.elementType,
                            id: childSnapshot.key,
                            tags: Array.isArray(item.tags) ? item.tags : item.tags.split(', '),
                            files: item.files,
                            links: item.links,
                            fixed: item.fixed,
                            displayUpTo: displayUpTo,
                            manager: item.manager || '',
                            phoneManager: item.phoneManager || '',
                            mailManager: item.mailManager || '',
                            comments: item.comments || []
                        });
                    });
                } else {
                    console.log("Данные отсутствуют.");
                }

                console.log("Сформированный массив новостей:", this.News);
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                console.error("Ошибка при получении данных:", error);
                this.loading = false;
            });
        }
    }

    appendNews(News){
        this.News.push(News)
    }

    getNewsByType(type){
        return this.News.filter(e => e.elementType === type)
    }

    getNewsById(id){
        return this.News.filter(e => e.id === id)[0]
    }

    async updateNews(id, data) {
        const newsRef = ref(database, `News/${id}`);
        // Проверка на наличие значений для всех полей перед их сохранением
        const updatedData = {
            ...data,
            manager: data.manager || '',
            phoneManager: data.phoneManager || '',
            mailManager: data.mailManager || '',
            comments: data.comments || []
        };
        await update(newsRef, updatedData);
    }
}

export const newsContentStore = new NewsContentStore();