import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_ ,res)=>res.json({ ok: true }));
export default app;
