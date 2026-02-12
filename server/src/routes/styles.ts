import { Router } from 'express';
import { styleTemplates } from '../config';

const router = Router();

router.get('/', (req, res) => {
  res.json(styleTemplates);
});

export default router;
