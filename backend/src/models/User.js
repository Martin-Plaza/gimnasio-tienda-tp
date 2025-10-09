// DEMO en memoria
export const usersMem = [
  { id: 1, name:'Super', email:'super@admin.com', role:'super-admin', password:'123456' },
  { id: 2, name:'Admin', email:'admin@gym.com',   role:'admin',       password:'123456' },
  { id: 3, name:'User',  email:'user@gym.com',    role:'user',        password:'123456' },
];
let nextId = 4;

export const Users = {
  all: () => usersMem,
  byId: (id) => usersMem.find(u => u.id === Number(id)),
  byEmail: (email) => usersMem.find(u => u.email === email),
  create: ({name,email,password,role='user'}) => {
    if(Users.byEmail(email)) throw new Error('Email ya registrado');
    const u = { id: nextId++, name, email, password, role };
    usersMem.push(u); return u;
  },
  update: (id, data) => {
    const u = Users.byId(id);
    if(!u) return null;
    if(data.name!==undefined) u.name = data.name;
    if(data.email!==undefined) u.email = data.email;
    if(data.role!==undefined) u.role = data.role;
    if(data.password) u.password = data.password;
    return u;
  },
  remove: (id) => {
    const idx = usersMem.findIndex(u=>u.id===Number(id));
    if(idx>=0) usersMem.splice(idx,1);
    return idx>=0;
  }
};