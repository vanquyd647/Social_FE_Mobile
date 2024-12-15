// utils/uploadImage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../configs/firebaseConfig'; // Adjust the path as needed

export const uploadImageAsync = async (uri) => {
    try {
        if (!uri) throw new Error("URI is null or undefined.");
        const filename = `Social_app/${Date.now()}`;
        const response = await fetch(uri);
        if (!response.ok) throw new Error("Failed to fetch image data.");

        const blob = await response.blob();
        const photoRef = ref(storage, filename);
        await uploadBytes(photoRef, blob);
        return await getDownloadURL(photoRef);
    } catch (error) {
        console.error("Image upload error: ", error);
        throw error;
    }
};
