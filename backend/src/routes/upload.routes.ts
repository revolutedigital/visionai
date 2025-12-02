import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const uploadController = new UploadController();

// Configurar Multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use .xlsx, .xls ou .csv'));
    }
  },
});

// Rotas
router.post('/suggest-mapping', upload.single('file'), (req, res) => uploadController.suggestMapping(req, res));
router.post('/', upload.single('file'), (req, res) => uploadController.upload(req, res));
router.get('/', (req, res) => uploadController.listar(req, res));
router.get('/:id', (req, res) => uploadController.detalhes(req, res));

export default router;
