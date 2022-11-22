import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDbWp4aXC2kuRJBOhMKbDoZbSDsYYCEzao",
    authDomain: "todo-list-d957e.firebaseapp.com",
    projectId: "todo-list-d957e",
    storageBucket: "todo-list-d957e.appspot.com",
    messagingSenderId: "315608718592",
    appId: "1:315608718592:web:d56b4560d8615e266fa7e5",
    measurementId: "G-YLL39F7S3C"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
export { db }