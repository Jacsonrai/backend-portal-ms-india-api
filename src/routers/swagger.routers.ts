import express, { Router, Express, Request, Response, RequestHandler } from 'express';
const router = Router();

export const sendJSONResponse: RequestHandler = (req, res, next) => {
  res.json = (data: any): Response => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };
  next();
};

router.get('/swaggers', sendJSONResponse, (req, res) => {
  const users = [{ name: 'John' }, { name: 'Jane' }];
  res.json(users);
});

export default router;