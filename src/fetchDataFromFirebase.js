// src/fetchDataFromFirebase.js
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebaseConfig";

const fetchDataFromFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "nufi_dictionary"));
    const data = querySnapshot.docs.map(doc => doc.data());
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default fetchDataFromFirebase;
