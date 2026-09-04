const SCRIPT_URL_CANDELA = 'https://script.google.com/macros/s/AKfycbx22ivlaAPmnCX6q2LxtwYSDIV9eyeStJSC48DX2sb6x7xvu__qODQQX7d58JcjjcdI/exec';

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
export async function obtenerProgramacionCandelaSheet() {
  try {
    const res = await fetch(`${SCRIPT_URL_CANDELA}?sheet=Programacion`);
    const data = await res.json();
    if (data.error) return [];
    return data;
  } catch (error) {
    console.error('Error obteniendo programación Candela:', error);
    return [];
  }
}