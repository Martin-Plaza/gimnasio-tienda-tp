import jwt from 'jsonwebtoken'; //importamos token
import { JWT_SECRET } from '../config/env.js';

export default function authRequired(req, res, next){
  //lee el header authorization
  const auth = req.headers.authorization || '';

  //en token guardamos el token que tiene el usuario
  //startwith devuelve un booleano, entonces pregunta si empieza con bearer
  //en caso de que si, hace slice 7, es decir solo guarda el token y no bearer (que son 6 letras y el espacio)
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  //si no hay token retorna error 401
  if(!token) return res.status(401).json({message:'No token'});
  try{
    //si hay token, entonces verifica el token y la firma jwt, para devolver el payload (los claim del usuario)
    req.user = jwt.verify(token, JWT_SECRET);
    //next ejecuta siguiente midleware, role required
    next();
  }catch{
    res.status(401).json({message:'Token inválido'});
  }
}