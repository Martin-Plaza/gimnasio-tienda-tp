import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.sample.js';

export default function authRequired(req, res, next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token) return res.status(401).json({message:'No token'});
  try{
    const payload = jwt.verify(token, JWT_SECRET); // { id, role, name, email }
    req.user = payload;
    next();
  }catch{
    return res.status(401).json({message:'Token inválido'});
  }
}