

// --------- REVISION EN PROCESO -------------//


//funcion CHECKEADA
// esta funcion devuelve la key currentUserId del localstorage
export const currentUserId = () => localStorage.getItem('currentUserId');



//funcion CHECKEADA
// cartKey guarda el currentuserID en la constante
//si el uid es true,es decir, hay algo, devuelve cart:u:{id del usuario}, sino devuelve anonimo, es decir no hay usuario
const cartKey = () => {
  const uid = currentUserId();
  return uid ? `cart:u:${uid}` : 'cart:anon';
};


//funcion CHECKEADA
//readCart lee el json y lo parsea a la key correspondiente, es decir, va a devolver el json asociada a esa Key
//si hay error devuelve arreglo vacio
export const readCart = () => {
  try { return JSON.parse(localStorage.getItem(cartKey())); }
  catch { return []; }
};




//funcion CHECKEADA
//SaveCart va a guardar en la key de localstorage cart:u:{usuario actual} el arreglo parseado a JSON
//es decir, va a guardar el carrito con la sesion actual
export const saveCart = (cart) => localStorage.setItem(cartKey(), JSON.stringify(cart));




//funcion CHECKEADA
//clearCart va a remover el carrito de ese usuario actual, en base a la key que le pasemos
export const clearCart = () => localStorage.removeItem(cartKey());





//funcion CHECKEADA
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