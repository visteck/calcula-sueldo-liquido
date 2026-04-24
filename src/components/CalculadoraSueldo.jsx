import React, { useState, useEffect } from 'react';

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
                  {resultado.result.haberes && [
                    { label: 'Sueldo base', value: resultado.result.haberes.sueldoBaseCalculado },
                    { label: 'Gratificación', value: resultado.result.haberes.gratificacion },
                    { label: 'Horas extra', value: resultado.result.haberes.horasExtra },
                    { label: 'Comisiones', value: resultado.result.haberes.comisiones },
                    { label: 'Bonos imponibles', value: resultado.result.haberes.bonosImponibles },
                    { label: 'Colación', value: resultado.result.haberes.colacion },
                    { label: 'Movilización', value: resultado.result.haberes.movilizacion },
                    { label: 'Asignación Familiar', value: resultado.result.haberes.asignacionFamiliar }
                  ]
                  .filter(item => item.value !== undefined && item.value !== 0)
                  .map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-200">
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

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-gray-500">
              por <a href="https://victorcabrera.cl" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">Victor Cabrera</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
