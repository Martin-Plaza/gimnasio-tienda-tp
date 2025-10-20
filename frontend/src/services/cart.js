

// --------- REVISION EN PROCESO -------------//



// Devuelve el id de usuario actual (o null si anónimo)
export const currentUserId = () => localStorage.getItem('currentUserId');

// Clave de storage según usuario
const cartKey = () => {
  const uid = currentUserId();
  return uid ? `cart:u:${uid}` : 'cart:anon';
};

//  Blindado: lectura segura de carrito
export const readCart = () => {
  try { return JSON.parse(localStorage.getItem(cartKey()) || '[]'); }
  catch { return []; }
};

export const saveCart = (cart) => localStorage.setItem(cartKey(), JSON.stringify(cart));
export const clearCart = () => localStorage.removeItem(cartKey());


//onUserChange setea un currentuserid en local
//guarda la key con el usuario actual en una variable
//verifica si esa key esta en localstorage
export const onUserChange = (userId) => {
  if (userId) {
    //seteamos en local storage currentuserId
    localStorage.setItem('currentUserId', String(userId));
    //guardamos la key del usuario actual
    const key = `cart:u:${userId}`;
    if (!localStorage.getItem(key)) {
      //guardamos en la constante anon el json de cart:anon, si no hay, guardamos arreglo vacio
      const anon = JSON.parse(localStorage.getItem('cart:anon') || '[]');
      //seteamos en local la key del usuario actual y el json de anon(lo agrega al usuario actual)
      localStorage.setItem(key, JSON.stringify(anon));
      //actualizamos anon con arreglo vacio
      localStorage.setItem('cart:anon', '[]');
    }
  } else {
    //setea el carrito cuando cambia el usuario
    localStorage.removeItem('currentUserId');
    localStorage.setItem('cart:anon', '[]');
  }
};