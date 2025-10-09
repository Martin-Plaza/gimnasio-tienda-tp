// Devuelve el id de usuario actual (o null si anónimo)
export const currentUserId = () => localStorage.getItem('currentUserId');

// Clave de storage según usuario
const cartKey = () => {
  const uid = currentUserId();
  return uid ? `cart:u:${uid}` : 'cart:anon';
};

// API simple
export const readCart = () => JSON.parse(localStorage.getItem(cartKey()) || '[]');
export const saveCart = (cart) => localStorage.setItem(cartKey(), JSON.stringify(cart));
export const clearCart = () => localStorage.removeItem(cartKey());

// Cuando cambia el usuario: setear currentUserId y preparar su carrito
export const onUserChange = (userId) => {
  if (userId) {
    localStorage.setItem('currentUserId', String(userId));
    // si no tiene carrito guardado, que arranque vacío
    const key = `cart:u:${userId}`;
    if (!localStorage.getItem(key)) localStorage.setItem(key, '[]');
  } else {
    // logout → volver a anónimo
    localStorage.removeItem('currentUserId');
    // opcional: limpiar carrito anónimo
    localStorage.setItem('cart:anon', '[]');
  }
};