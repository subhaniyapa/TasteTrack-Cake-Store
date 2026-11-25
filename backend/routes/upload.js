import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, adminOnly, httpError } from '../middleware/auth.js';

export const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp)$/.test(file.mimetype) ? cb(null, true) : cb(httpError(400, 'Only JPG, PNG or WEBP images are allowed')),
});

const router = Router();


router.post('/', protect, adminOnly, upload.single('image'), (req, res, next) => {
  if (!req.file) return next(httpError(400, 'Choose an image to upload'));
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
