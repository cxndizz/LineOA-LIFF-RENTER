// File: src/utils/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // โฟลเดอร์ปลายทาง
    filename: (req, file, callback) => {
      // ตั้งชื่อไฟล์ใหม่: product-<timestamp>-<random>.jpg
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `product-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
};