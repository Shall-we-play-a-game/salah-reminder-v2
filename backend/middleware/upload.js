import multer from 'multer';

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
