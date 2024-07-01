import { Router, Request, Response } from 'express';

// create test case for this

const router = Router();

router.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from the API!',
  });
});

export default router;
