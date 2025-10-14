// Devuelve el id de usuario actual (o null si anónimo)
export const currentUserId = () => localStorage.getItem('currentUserId');

// Clave de storage según usuario
const cartKey = () => {
  const uid = currentUserId();
  return uid ? `cart:u:${uid}` : 'cart:anon';
};

// ✅ Blindado: lectura segura de carrito
export const readCart = () => {
  try { return JSON.parse(localStorage.getItem(cartKey()) || '[]'); }
  catch { return []; }
};

export const saveCart = (cart) => localStorage.setItem(cartKey(), JSON.stringify(cart));
export const clearCart = () => localStorage.removeItem(cartKey());

// ✅ Manejo de cambio de usuario y migración de carrito anónimo
export const onUserChange = (userId) => {
  if (userId) {
    localStorage.setItem('currentUserId', String(userId));
    const key = `cart:u:${userId}`;
    if (!localStorage.getItem(key)) {
      // 🟢 Migrar carrito anónimo si existe
      const anon = JSON.parse(localStorage.getItem('cart:anon') || '[]');
      localStorage.setItem(key, JSON.stringify(anon));
      localStorage.setItem('cart:anon', '[]');
    }
  } else {
    localStorage.removeItem('currentUserId');
    localStorage.setItem('cart:anon', '[]');
  }
};