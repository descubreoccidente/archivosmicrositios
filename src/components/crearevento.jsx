import React, { useState, useEffect } from 'react';
import { crearEvento, actualizarEvento, obtenerEventosActor, eliminarEvento } from '../services/firestore';
import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Calendar, MapPin, Trash2, Upload, Pencil } from 'lucide-react';

const CATEGORIAS_TIPOS = {
  'Cultural': ['Cine', 'Musical', 'Artes plásticas', 'Teatro', 'Artesanal', 'Danza', 'Literario'],
  'Normativo': ['Turismo', 'Agroalimentario', 'Municipal', 'Judicial', 'Salud'],
  'Formación': ['Taller', 'Curso', 'Capacitación', 'Seminario', 'Conferencia', 'Diplomado', 'Congreso', 'Simposio', 'Coloquio'],
  'Institucional': ['Empresarial', 'Caja de compensación', 'Acción comunal', 'JAL', 'Corporativo', 'Ente público nacional', 'Ente público municipal', 'Ente público regional', 'Cooperativo', 'Congreso', 'Feria', 'Show room', 'Comercial'],
  'Religioso': ['Católico romano', 'Cristiano/Evangélico', 'Judío', 'Islámico', 'Otro'],
  'Fiestas tradicionales': ['Municipal', 'Veredal', 'Regional'],
  'Otros': [],
};

const CATEGORIAS = Object.keys(CATEGORIAS_TIPOS);
const MUNICIPIOS = [
  'Abriaquí', 'Anzá', 'Armenia', 'Buriticá', 'Caicedo', 'Cañasgordas',
  'Dabeiba', 'Ebéjico', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina',
  'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo', 'Santa Fe de Antioquia',
  'Sopetrán', 'Uramita'
];

const FORM_VACIO = {
  nombre: '', descripcion: '', categoria: '', tipo: '', tipoOtro: '',
  modalidad: 'Presencial', requiereInscripcion: false, linkInscripcion: '',
  fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '', municipio: '', lugar: '',
  ubicacion: { lat: 6.4, lng: -75.5 }, imagen: '',
  publico: true, cobro: false, precio: 0, boleteria: '',
  parqueo: false, alimentacion: [], capacidad: 0
};
function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function fechaAInput(fecha) {
  if (!fecha) return '';
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function CrearEvento({ actorId, onEventCreated }) {
  const [formData, setFormData] = useState(FORM_VACIO);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [eventoEditandoId, setEventoEditandoId] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const alimentacionOpciones = [
    'Refrigerio', 'Estación de café', 'Almuerzo', 'Cena', 'Cóctel'
  ];

  useEffect(() => {
    cargarEventos();
  }, [actorId]);

  const cargarEventos = async () => {
    try {
      const data = await obtenerEventosActor(actorId);
      setEventos(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'categoria') {
      setFormData(prev => ({ ...prev, categoria: value, tipo: '', tipoOtro: '' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleAlimentacion = (opcion) => {
    setFormData(prev => ({
      ...prev,
      alimentacion: prev.alimentacion.includes(opcion)
        ? prev.alimentacion.filter(a => a !== opcion)
        : [...prev.alimentacion, opcion]
    }));
  };

  const handleImagenUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const storageRef = ref(storage, `events/${actorId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imagen: url }));
    } catch (error) {
      console.error('Error subiendo imagen:', error);
    }
    setSubiendoImagen(false);
  };

  const iniciarEdicion = (evento) => {
    setFormData({
      nombre: evento.nombre || '',
      descripcion: evento.descripcion || '',
      categoria: evento.categoria || '',
      tipo: evento.categoria === 'Otros' ? '' : (evento.tipo || ''),
      tipoOtro: evento.categoria === 'Otros' ? (evento.tipo || '') : '',
      modalidad: evento.modalidad || 'Presencial',
      requiereInscripcion: evento.requiereInscripcion || false,
      linkInscripcion: evento.linkInscripcion || '',
      fechaInicio: fechaAInput(evento.fechaInicio || evento.fecha),
      fechaFin: evento.fechaFin ? fechaAInput(evento.fechaFin) : '',
      horaInicio: evento.horaInicio || '',
      horaFin: evento.horaFin || '',
      municipio: evento.municipio || '',
      lugar: evento.lugar || '',
      ubicacion: evento.ubicacion || { lat: 6.4, lng: -75.5 },
      imagen: evento.imagen || '',
      publico: evento.publico !== undefined ? evento.publico : true,
      cobro: evento.cobro || false,
      precio: evento.precio || 0,
      boleteria: evento.boleteria || '',
      parqueo: evento.parqueo || false,
      alimentacion: evento.alimentacion || [],
      capacidad: evento.capacidad || 0
    });
    setEventoEditandoId(evento.id);
    setMostrarForm(true);
  };

  const cancelarFormulario = () => {
    setMostrarForm(false);
    setEventoEditandoId(null);
    setFormData(FORM_VACIO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tipoFinal = formData.categoria === 'Otros' ? formData.tipoOtro : formData.tipo;
      const datosEvento = {
        ...formData,
        tipo: tipoFinal,
        fechaInicio: parseLocalDate(formData.fechaInicio),
        fechaFin: formData.fechaFin ? parseLocalDate(formData.fechaFin) : parseLocalDate(formData.fechaInicio),
        fecha: parseLocalDate(formData.fechaInicio)
      };

      if (eventoEditandoId) {
        await actualizarEvento(eventoEditandoId, datosEvento);
      } else {
        await crearEvento(actorId, datosEvento);
      }

      setSuccess(true);
      cancelarFormulario();
      cargarEventos();
      if (onEventCreated) onEventCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando evento:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (eventId) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await eliminarEvento(eventId);
      cargarEventos();
      if (onEventCreated) onEventCreated();
    } catch (error) {
      console.error('Error eliminando evento:', error);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatRangoFechas = (evento) => {
    const inicio = formatFecha(evento.fechaInicio || evento.fecha);
    const fin = evento.fechaFin ? formatFecha(evento.fechaFin) : null;
    if (fin && fin !== inicio) return `${inicio} — ${fin}`;
    return inicio;
  };

  const tiposDisponibles = formData.categoria ? CATEGORIAS_TIPOS[formData.categoria] : [];

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-4 text-green-700">
          ✓ Evento guardado correctamente
        </div>
      )}

      {/* Lista de eventos existentes */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-terracota">
            Tus Eventos ({eventos.length})
          </h3>
          <button
            onClick={() => mostrarForm ? cancelarFormulario() : setMostrarForm(true)}
            className="bg-terracota text-white font-semibold px-4 py-2 rounded-lg hover:bg-terracota-dark transition"
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo Evento'}
          </button>
        </div>

        {eventos.length === 0 && !mostrarForm && (
          <p className="text-gris text-sm">Aún no has creado ningún evento.</p>
        )}

        <div className="space-y-3">
          {eventos.map((evento) => (
            <div key={evento.id} className="flex justify-between items-center border border-gris/20 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {evento.imagen && (
                  <img src={evento.imagen} alt={evento.nombre} className="w-16 h-16 object-cover rounded-lg" />
                )}
                <div>
                  <p className="font-semibold text-marron">{evento.nombre}</p>
                  <div className="flex items-center gap-4 text-sm text-gris mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatRangoFechas(evento)}
                    </span>
                    {(evento.municipio || evento.lugar) && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {[evento.lugar, evento.municipio].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {evento.categoria && (
                      <span className="bg-crema text-terracota px-2 py-0.5 rounded text-xs font-semibold">
                        {evento.categoria}{evento.tipo ? ` · ${evento.tipo}` : ''}
                      </span>
                    )}
                    {evento.modalidad && (
                      <span className="text-xs text-gris">{evento.modalidad}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => iniciarEdicion(evento)}
                  className="text-gris hover:text-terracota p-2 rounded-lg hover:bg-crema transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(evento.id)}
                  className="text-gris hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario para crear/editar evento */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-terracota mb-6">
            {eventoEditandoId ? 'Editar Evento' : 'Crear Evento'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Nombre del Evento
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                placeholder="Ej: Festival de Gastronomía 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                >
                  <option value="">Selecciona...</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Tipo
                </label>
                {formData.categoria === 'Otros' ? (
                  <input
                    type="text"
                    name="tipoOtro"
                    value={formData.tipoOtro}
                    onChange={handleChange}
                    required
                    placeholder="Especifica el tipo"
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  />
                ) : (
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    disabled={!formData.categoria}
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota disabled:opacity-50 disabled:bg-gray-50"
                  >
                    <option value="">
                      {formData.categoria ? 'Selecciona...' : 'Elige una categoría primero'}
                    </option>
                    {tiposDisponibles.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Descripción (máx 200 caracteres)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={200}
                rows={3}
                className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota resize-none"
                placeholder="Detalles del evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-marron mb-2">
                Cartel / eCard del evento
              </label>
              {formData.imagen ? (
                <div>
                  <div className="relative inline-block">
                    <img src={formData.imagen} alt="Cartel del evento" className="h-40 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imagen: '' }))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {formData.fechaInicio && (
                    <p className="text-sm text-gris mt-2 flex items-center gap-1">
                      <Calendar size={14} className="text-terracota" />
                      {formatFecha(parseLocalDate(formData.fechaInicio))}
                      {formData.fechaFin && formData.fechaFin !== formData.fechaInicio &&
                        ` — ${formatFecha(parseLocalDate(formData.fechaFin))}`}
                    </p>
                  )}
                </div>
              ) : (
                <label htmlFor="imagen-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-terracota rounded-lg p-6 cursor-pointer hover:bg-crema transition">
                  <Upload className="text-terracota mb-1" size={24} />
                  <span className="text-terracota text-sm font-semibold">
                    {subiendoImagen ? 'Subiendo...' : 'Subir cartel (JPG/PNG)'}
                  </span>
                  <input
                    id="imagen-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImagenUpload}
                    disabled={subiendoImagen}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  required
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Fecha fin <span className="text-gris font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleChange}
                  min={formData.fechaInicio}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Hora inicio
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Hora fin
                </label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Modalidad
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-marron mb-2">
                  Capacidad
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  placeholder="Cantidad de personas"
                />
              </div>
            </div>

            {formData.modalidad !== 'Virtual' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-marron mb-2">
                    Municipio del evento
                  </label>
                  <select
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    required
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                  >
                    <option value="">Selecciona...</option>
                    {MUNICIPIOS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-marron mb-2">
                    Lugar
                  </label>
                  <input
                    type="text"
                    name="lugar"
                    value={formData.lugar}
                    onChange={handleChange}
                    className="w-full border border-gris/30 rounded px-4 py-2 focus:outline-none focus:border-terracota"
                    placeholder="Ej: Parque Central"
                  />
                </div>
              </div>
            )}

            {/* Inscripción */}
            <div className="bg-crema p-4 rounded-lg space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiereInscripcion"
                  checked={formData.requiereInscripcion}
                  onChange={handleChange}
                />
                <span className="text-sm font-semibold text-marron">¿Requiere inscripción?</span>
              </label>
              {formData.requiereInscripcion && (
                <input
                  type="url"
                  name="linkInscripcion"
                  value={formData.linkInscripcion}
                  onChange={handleChange}
                  placeholder="Enlace de inscripción"
                  required
                  className="w-full border border-gris/30 rounded px-4 py-2 text-sm"
                />
              )}
            </div>

            {/* Detalles */}
            <div className="bg-crema p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="publico"
                    checked={formData.publico}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-semibold text-marron">Evento público</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="parqueo"
                    checked={formData.parqueo}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-semibold text-marron">Parqueo habilitado</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    name="cobro"
                    checked={formData.cobro}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-semibold text-marron">¿Tiene cobro?</span>
                </label>
                {formData.cobro && (
                  <div className="ml-6 space-y-2">
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      placeholder="Precio en COP"
                      className="w-full border border-gris/30 rounded px-4 py-2 text-sm"
                    />
                    <input
                      type="url"
                      name="boleteria"
                      value={formData.boleteria}
                      onChange={handleChange}
                      placeholder="URL de boletería"
                      className="w-full border border-gris/30 rounded px-4 py-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-marron mb-2">Alimentación incluida:</p>
                <div className="flex flex-wrap gap-2">
                  {alimentacionOpciones.map(opcion => (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => toggleAlimentacion(opcion)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        formData.alimentacion.includes(opcion)
                          ? 'bg-terracota text-white'
                          : 'bg-white text-gris hover:bg-gray-100 border border-gris/30'
                      }`}
                    >
                      {opcion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-terracota text-white font-semibold py-3 rounded-lg hover:bg-terracota-dark transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (eventoEditandoId ? 'Guardar Cambios' : 'Crear Evento')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}