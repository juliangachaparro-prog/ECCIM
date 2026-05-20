export async function obtenerPortada(titulo) {
export async function obtenerImagenDeJuego(juego, index) {
  const API_KEY = '4cc8f4ed1b03464107187225786a9a5a'; 
  const tituloLimpio = juego.titulo.trim();
  const query = encodeURIComponent(tituloLimpio);

  // PROXY INTERMEDIARIO PARA EVITAR EL BLOQUEO CORS
  const PROXY = "https://cors-anywhere.herokuapp.com/";

  try {
    // 1. Buscamos el ID del juego usando el Proxy
    const buscarId = await fetch(`${PROXY}https://www.steamgriddb.com/api/v2/search/autocomplete/${query}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'X-Requested-With': 'XMLHttpRequest' // Requerido por algunos proxies
      }
    });

    if (!buscarId.ok) throw new Error(`Status Autocomplete: ${buscarId.status}`);

    const datosId = await buscarId.json();

    if (datosId.success && datosId.data.length > 0) {
      const gameId = datosId.data[0].id; 

      // 2. Buscamos las portadas usando el Proxy
      const buscarGrids = await fetch(`${PROXY}https://www.steamgriddb.com/api/v2/grids/game/${gameId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${API_KEY}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!buscarGrids.ok) throw new Error(`Status Grids: ${buscarGrids.status}`);

      const datosGrids = await buscarGrids.json();

      if (datosGrids.success && datosGrids.data.length > 0) {
        const posicion = index % datosGrids.data.length;
        return datosGrids.data[posicion].url; 
      }
    }
    
    return `https://placehold.co/600x900?text=${encodeURIComponent(juego.titulo)}`;

  } catch (error) {
    console.error(`Fallo por CORS o Red para "${juego.titulo}":`, error);
    return `https://placehold.co/600x900?text=${encodeURIComponent(juego.titulo)}`;
  }

}
}