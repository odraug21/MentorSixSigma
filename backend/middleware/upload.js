// backend/middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage(); // guardamos en memoria para subir a Supabase
export const upload = multer({ storage });
