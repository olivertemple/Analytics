import { initializeApp } from "firebase/app";
const firebaseConfig = {
    apiKey: "AIzaSyDSTL-Ds9d1mzWGwDmzo-GQ2baAss3T72c",
    authDomain: "analytics-5460d.firebaseapp.com",
    projectId: "analytics-5460d",
    storageBucket: "analytics-5460d.appspot.com",
    messagingSenderId: "22446294573",
    appId: "1:22446294573:web:ae380025ebf504227b1aa4",
    databaseURL:"https://analytics-5460d-default-rtdb.europe-west1.firebasedatabase.app/"
  };
const app = initializeApp(firebaseConfig);
export default app;