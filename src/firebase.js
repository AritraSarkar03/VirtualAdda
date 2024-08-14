import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database';
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.API_KEY,//"AIzaSyDmF4rcZ8UP47EocBkDG32z0AJSA-RAqHo",
    authDomain: process.env.AUTH_DOMAIN,//"virtualadda-7a947.firebaseapp.com",
    projectId: process.env.PROJECT_ID,//"virtualadda-7a947",
    storageBucket: process.env.STORAGE_BUCKET,//"virtualadda-7a947.appspot.com",
    messagingSenderId: process.env.MESSAGING_SENDER_ID,//"181275868461",
    appId: process.env.APP_ID,//"1:181275868461:web:aef72c6b0264ef051427a4",
    measurementId: process.env.MEASUREMENT_ID,//"G-SEGV58HFV9",
    databaseURL: process.env.DATABASE_URL//"https://virtualadda-7a947-default-rtdb.asia-southeast1.firebasedatabase.app/",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const rdb = getDatabase(app);
  const messaging = getMessaging(app);
  
  export { auth, db, storage, rdb, messaging };