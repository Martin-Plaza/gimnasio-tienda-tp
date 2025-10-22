

//----------MODULO REVISADO----------//

//esta constante es la api de local
export const API_URL = 'http://127.0.0.1:4000';

export async function api(path, options = {}) {

  //aca lee el token si hay
  const token = localStorage.getItem('token');

  //baseHeaders guarda un objeto 
  /*content-type: aplication/json
    authorization: bearer token
  */
 //content type le dice al backend que tipo de dato tiene el contenido, en este caso es json
 //envia el token para saber que esta logeado el usuario
  const baseHeaders = {
    'Content-Type': 'application/json',
    //si hay token usa spread operator y agrega la authorization
    ...(token ? { Authorization: `Bearer ${token}` } : {}) //si no hay token envia un arreglo vacio en token
  };

  //mergedHeaders crea un nuevo objeto con lo que hay en baseHeaders y lo que viene de options.headers (que son parametros)
  const mergedHeaders = { ...baseHeaders, ...(options.headers || {}) };

  //fetch hacemos llamada a la api y le pasamos path que es el parametro que le pasamos desde donde lo llamamos
  //lo guardamos en res, como un objeto
  const res = await fetch(`${API_URL}${path}`, {
    
    
    method: options.method ?? 'GET',
    headers: mergedHeaders,
    body: options.body
  });

  if (!res.ok) {
    //txt lee el cuerpo res como texto
    const txt = await res.text();
    //guardamos el status de la respuesta en texto
    let msg = res.statusText;
    //tratamos de pisar msg con el json que podria enviar, sino lee statustext
    try { msg = JSON.parse(txt).message || msg; }
    //si nada funciona lanza un objeto error
    catch {throw new Error(msg);}
    
  }
  return res.json();
}