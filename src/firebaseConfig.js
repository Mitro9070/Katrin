// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCHC_KWPvNN0jUdnC8CA2R55CXiidGRCRA",
  authDomain: "katrin-3eba5.firebaseapp.com",
  databaseURL: "https://katrin-3eba5-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "katrin-3eba5",
  storageBucket: "katrin-3eba5.appspot.com",
  messagingSenderId: "589735234316",
  appId: "1:589735234316:web:58e535ae2c8715b60dd729",
  measurementId: "G-V06MZ5D5MK"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт служб Firebase для использования в других частях приложения
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);