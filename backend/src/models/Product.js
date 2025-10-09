export const productsMem = [
  { id:1, name:'Mancuernas 5kg', price:25.5, stock:12, image_url:'' },
  { id:2, name:'Colchoneta Yoga', price:15.0, stock:30, image_url:'' },
  { id:3, name:'Soga de Saltar',  price:9.9,  stock:20, image_url:'' },
];
let nextProdId = 4;

export const Products = {
  all: () => productsMem,
  byId: id => productsMem.find(p=>p.id===Number(id)),
  create: (p) => {
    const n = { id: nextProdId++, name:p.name, price:Number(p.price), stock:Number(p.stock), image_url:p.image_url||'' };
    productsMem.push(n); return n;
  },
  update: (id, p) => {
    const x = productsMem.find(i=>i.id===Number(id));
    if(!x) return null;
    if(p.name!==undefined) x.name=p.name;
    if(p.price!==undefined) x.price=Number(p.price);
    if(p.stock!==undefined) x.stock=Number(p.stock);
    if(p.image_url!==undefined) x.image_url=p.image_url;
    return x;
  },
  remove: (id) => {
    const i = productsMem.findIndex(p=>p.id===Number(id));
    if(i>=0) productsMem.splice(i,1);
    return i>=0;
  }
};