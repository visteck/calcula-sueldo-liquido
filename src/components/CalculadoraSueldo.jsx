import React, { useState, useEffect, useMemo } from 'react';

const AFP_OPTIONS = [
  'Capital', 'Cuprum', 'Habitat', 'Modelo', 'Planvital', 'Provida', 'Uno'
];
const SALUD_OPTIONS = [
  { value: 'fonasa', label: 'Fonasa' },
  { value: 'isapre', label: 'Isapre' }
];
const CONTRATO_OPTIONS = [
  { value: 'indefinido', label: 'Indefinido' },
  { value: 'plazo_fijo', label: 'Plazo fijo' }
];

export default function CalculadoraSueldo() {
  const [form, setForm] = useState({
    diasTrabajados: 30,
    sueldoBase: '',
    tipoContrato: 'indefinido',
    considerarGratificacion: true,
    horasExtra: '',
    comisiones: '',
    bonosImponibles: '',
    colacion: '',
    movilizacion: '',
    cargasFamiliares: '',
    afp: 'Habitat',
    apvUf: '',
    sistemaSalud: 'fonasa',
    isapreNombre: '',
    isaprePlanUf: '',
    otrosDescuentos: ''
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);
    const textoODash = v => (typeof v === 'string' && v.trim() === '') ? '-' : v;
    const body = {
      sueldoBase: Number(form.sueldoBase),
      afp: textoODash(form.afp),
      sistemaSalud: textoODash(form.sistemaSalud),
      isapreNombre: form.sistemaSalud === 'isapre' ? textoODash(form.isapreNombre) : '-',
      isaprePlanUf: form.sistemaSalud === 'isapre' ? Number(form.isaprePlanUf) : 0,
      tipoContrato: textoODash(form.tipoContrato),
      cargasFamiliares: Number(form.cargasFamiliares),
      considerarGratificacion: form.considerarGratificacion,
      horasExtra: Number(form.horasExtra),
      comisiones: Number(form.comisiones),
      bonosImponibles: Number(form.bonosImponibles),
      colacion: Number(form.colacion),
      movilizacion: Number(form.movilizacion),
      otrosDescuentos: Number(form.otrosDescuentos),
      diasTrabajados: Number(form.diasTrabajados),
      apvUf: Number(form.apvUf)
    };
    try {
      const res = await fetch('https://victorcabrera.cl/apis/liquida-sueldo/calcular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al calcular.');
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      setError('No se pudo calcular el sueldo.');
    } finally {
      setLoading(false);
    }
  };

  const [indicadores, setIndicadores] = useState({ RentaMinima: '-', uf: '-', utm: '-', periodo: '-' });
  const [loadingIndicadores, setLoadingIndicadores] = useState(true);
  useEffect(() => {
    setLoadingIndicadores(true);
    fetch('https://victorcabrera.cl/apis/indicadores-previsionales/indicadores/')
      .then(res => res.json())
      .then(json => {
        const data = json.data || {};
        setIndicadores({
          RentaMinima: data.RentaMinima || '-',
          uf: data.UF || '-',
          utm: data.UTM || '-',
          periodo: data.periodo || '-'
        });
      })
      .catch(() => setIndicadores({ RentaMinima: '-', uf: '-', utm: '-', periodo: '-' }))
      .finally(() => setLoadingIndicadores(false));
  }, []);

  const formatPeriodo = (periodo) => {
    if (!periodo || typeof periodo !== 'string') return periodo;
    const match = periodo.match(/^(\d{2})(\d{4})$/);
    if (match) return `${match[1]}-${match[2]}`;
    const match2 = periodo.match(/(\d{4})[-/](\d{1,2})/);
    if (match2) {
      let month = match2[2];
      if (month.length === 1) month = '0' + month;
      return `${month}-${match2[1]}`;
    }
    const alt = periodo.match(/(\d{1,2})[-/](\d{4})/);
    if (alt) {
      let month = alt[1];
      if (month.length === 1) month = '0' + month;
      return `${month}-${alt[2]}`;
    }
    return periodo;
  };

  // Memoizar los items de haberes para evitar recreación en cada render
  const haberesItems = useMemo(() => {
    if (!resultado?.result?.haberes) return [];
    return [
      { id: 'sueldo-base', label: 'Sueldo base', value: resultado.result.haberes.sueldoBaseCalculado },
      { id: 'gratificacion', label: 'Gratificación', value: resultado.result.haberes.gratificacion },
      { id: 'horas-extra', label: 'Horas extra', value: resultado.result.haberes.horasExtra },
      { id: 'comisiones', label: 'Comisiones', value: resultado.result.haberes.comisiones },
      { id: 'bonos', label: 'Bonos imponibles', value: resultado.result.haberes.bonosImponibles },
      { id: 'colacion', label: 'Colación', value: resultado.result.haberes.colacion },
      { id: 'movilizacion', label: 'Movilización', value: resultado.result.haberes.movilizacion },
      { id: 'asig-familiar', label: 'Asignación Familiar', value: resultado.result.haberes.asignacionFamiliar }
    ].filter(item => item.value !== undefined && item.value !== 0);
  }, [resultado]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <h1 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">
          Calcula Sueldo Líquido
        </h1>

        {/* Indicadores */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
            {loadingIndicadores ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
                <span className="text-white font-semibold">Cargando indicadores...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                <div className="text-center">
                  <p className="text-sm opacity-80">Sueldo mínimo</p>
                  <p className="text-xl font-bold">{Number(indicadores.RentaMinima).toLocaleString('es-CL')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-80">UF</p>
                  <p className="text-xl font-bold">{Number(indicadores.uf).toLocaleString('es-CL')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-80">UTM</p>
                  <p className="text-xl font-bold">{Number(indicadores.utm).toLocaleString('es-CL')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-80">Periodo</p>
                  <p className="text-xl font-bold">{formatPeriodo(indicadores.periodo)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
          {/* Haberes */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Haberes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días trabajados</label>
              <input
                type="number"
                name="diasTrabajados"
                min="1"
                max="31"
                value={form.diasTrabajados}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sueldo base</label>
              <input
                type="number"
                name="sueldoBase"
                value={form.sueldoBase}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo contrato</label>
              <select
                name="tipoContrato"
                value={form.tipoContrato}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                {CONTRATO_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="considerarGratificacion"
                  checked={form.considerarGratificacion}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Gratificación</span>
                <span
                  className="ml-2 cursor-help text-lg"
                  title="Para efectos de este cálculo, se tomará solo el Sueldo Base"
                >
                  ℹ️
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto Horas extra</label>
              <input
                type="number"
                name="horasExtra"
                value={form.horasExtra}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comisiones</label>
              <input
                type="number"
                name="comisiones"
                value={form.comisiones}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonos imponibles</label>
              <input
                type="number"
                name="bonosImponibles"
                value={form.bonosImponibles}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colación</label>
              <input
                type="number"
                name="colacion"
                value={form.colacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Movilización</label>
              <input
                type="number"
                name="movilizacion"
                value={form.movilizacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">N° cargas familiares</label>
              <input
                type="number"
                name="cargasFamiliares"
                value={form.cargasFamiliares}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Descuentos */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-8">Descuentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AFP</label>
              <select
                name="afp"
                value={form.afp}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                {AFP_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">APV en UF</label>
              <input
                type="number"
                name="apvUf"
                value={form.apvUf}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sistema de Salud</label>
              <select
                name="sistemaSalud"
                value={form.sistemaSalud}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                {SALUD_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {form.sistemaSalud === 'isapre' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Isapre</label>
                  <input
                    type="text"
                    name="isapreNombre"
                    value={form.isapreNombre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan de salud Isapre (UF)</label>
                  <input
                    type="number"
                    name="isaprePlanUf"
                    value={form.isaprePlanUf}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Otros descuentos</label>
              <input
                type="number"
                name="otrosDescuentos"
                value={form.otrosDescuentos}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Botón */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              {loading ? 'Calculando...' : 'Calcular Sueldo Líquido'}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </form>

        {/* Resultados */}
        {resultado && resultado.result && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Liquidación de Sueldo</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Haberes */}
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-4">Haberes</h3>
                <div className="space-y-2">
                  {haberesItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-700">{item.label}:</span>
                      <span className="font-semibold text-gray-900">${item.value.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 bg-green-50 px-3 rounded-lg mt-2">
                    <span className="font-bold text-gray-800">Total haberes:</span>
                    <span className="font-bold text-green-600">${resultado.result.haberes?.TotalHaberes?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Descuentos */}
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-4">Descuentos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">AFP obligatorio:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.afpObligatorio?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Comisión AFP:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.comisionAfp?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Salud:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.salud?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Seguro cesantía:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.seguroCesantia?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Impuesto único:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.impuestoUnico?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">APV:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.apv?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Otros descuentos:</span>
                    <span className="font-semibold text-gray-900">${resultado.result.descuentos?.otrosDescuentos?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-red-50 px-3 rounded-lg mt-2">
                    <span className="font-bold text-gray-800">Total descuentos:</span>
                    <span className="font-bold text-red-600">${resultado.result.descuentos?.totalDescuentos?.toLocaleString('es-CL') || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Otros datos */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Otros datos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">AFP</p>
                  <p className="font-semibold">{resultado.result.otros?.afp || '-'}</p>
                </div>
                {resultado.result.otros?.isapreNombre && resultado.result.otros.isapreNombre !== '-' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Nombre Isapre</p>
                    <p className="font-semibold">{resultado.result.otros.isapreNombre}</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Sistema Salud</p>
                  <p className="font-semibold">{resultado.result.otros?.sistemaSalud || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Días trabajados</p>
                  <p className="font-semibold">{resultado.result.otros?.diasTrabajados ?? '-'}</p>
                </div>
              </div>
            </div>

            {/* Sueldo Líquido */}
            <div className="text-center py-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
              <p className="text-2xl text-gray-700 mb-2">Sueldo Líquido</p>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                ${resultado.result.sueldoLiquido?.toLocaleString('es-CL') || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-10 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Desarrollado por</p>
              <a 
                href="https://victorcabrera.cl/" 
                className="inline-block text-4xl font-extrabold text-white hover:scale-105 transition-transform duration-300"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Víctor Cabrera
              </a>
              <p className="text-white/90 text-lg mt-3 font-medium">Ingeniero Fullstack • Especialista en ERPs</p>
              <p className="text-white/70 text-sm mt-1">+15 años de experiencia en soluciones empresariales</p>
            </div>
            
            <div className="border-t border-white/20 pt-6 mt-6">
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm mb-6">
                <a 
                  href="mailto:vicabrera@gmail.com" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>vicabrera@gmail.com</span>
                </a>
                <a 
                  href="https://github.com/visteck" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>github.com/visteck</span>
                </a>
                <a 
                  href="https://victorcabrera.cl/apis" 
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>APIs & Proyectos</span>
                </a>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-4 text-white/60 text-xs">
                <span className="px-3 py-1 bg-white/10 rounded-full">ERPs</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Remuneraciones</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Contabilidad</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">APIs REST</span>
              </div>
            </div>
            
            <div className="mt-6 text-white/60 text-xs">
              © {new Date().getFullYear()} victorcabrera.cl - Todos los derechos reservados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
