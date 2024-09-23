import { Router } from 'express';
import path from 'path';

const router = Router();

// Serve the index.html file from the client/dist directory
router.get('/', (_, res) => {
  res.sendFile(path.resolve('../client/dist/index.html'));
});

export default router;