// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCgla7kI3x9yEKqS-QKdLzDvNf1kUyCbf4",
  authDomain: "portfolio-7c82e.firebaseapp.com",
  projectId: "portfolio-7c82e",
  storageBucket: "portfolio-7c82e.firebasestorage.app",
  messagingSenderId: "435778054772",
  appId: "1:435778054772:web:53e7a6ad26b41225773f21",
  measurementId: "G-22K5MJXHG8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// وظيفة لحفظ التقييم في Firebase
export async function saveRating(data) {
    try {
        await addDoc(collection(db, "ratings"), data);
        console.log("Saved to base ");
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getAverageRating() {
    try {
        const querySnapshot = await getDocs(collection(db, "ratings"));

        let total = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const rating = Number(data.rating);

            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                total += rating;
                count++;
            }
        });


        if (count === 0) {
            return "0.0"; //  لازم return هون
        }

        const avg = total / count;

        return avg.toFixed(1); //  وهذا أهم return

    } catch (error) {
        console.error("Error getting average ❌", error);
        return "0.0"; // 🔥 fallback
    }
}
