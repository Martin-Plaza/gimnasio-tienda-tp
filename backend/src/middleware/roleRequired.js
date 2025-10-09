export default function roleRequired(...roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({message:'No auth'});
    if(!roles.includes(req.user.role)) return res.status(403).json({message:'Sin permisos'});
    next();
  };
}