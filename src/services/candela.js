const SCRIPT_URL_CANDELA = 'https://script.google.com/macros/s/AKfycbxfrMrdDAhW45wCBaGqv7FJz9YDDox12lz1YZvOSOMYTZOKnA8mlX_RAK6U_am8LCyr/exec';

export function slugParticipante(nombre, municipio) {
  return `${nombre}-${municipio}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function obtenerParticipantesCandelaSheet() {
  try {
    const res = await fetch(`${SCRIPT_URL_CANDELA}?sheet=Concursantes`);
    const data = await res.json();
    if (data.error) return [];
    return data.map((p) => ({
      ...p,
      id: slugParticipante(p.nombre, p.municipio),
    }));
  } catch (error) {
    console.error('Error obteniendo concursantes Candela:', error);
    return [];
  }
}