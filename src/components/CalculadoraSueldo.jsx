import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    considerarGratificacion: false,
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
    // Prepara el body para la API
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

  // Estado para indicadores
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


  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Calcula Sueldo Líquido</h2>
      <div className="row justify-content-center mb-4">
        <div className="col-md-8">
          <div className="alert alert-info d-flex flex-column flex-md-row align-items-md-center justify-content-between shadow-sm position-relative" style={{minHeight:'56px'}}>
            {loadingIndicadores ? (
              <div className="w-100 d-flex justify-content-center align-items-center" style={{minHeight:'40px'}}>
                <div className="spinner-border text-primary me-2" role="status" style={{width:'2rem',height:'2rem'}}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <span className="fw-bold">Cargando indicadores...</span>
              </div>
            ) : (
              <>
                <div><strong>Sueldo mínimo:</strong> {Number(indicadores.RentaMinima).toLocaleString('es-CL')}</div>
                <div><strong>UF:</strong> {Number(indicadores.uf).toLocaleString('es-CL')}</div>
                <div><strong>UTM:</strong> {Number(indicadores.utm).toLocaleString('es-CL')}</div>
                <div><strong>Periodo:</strong> {(() => {
                  if (!indicadores.periodo || typeof indicadores.periodo !== 'string') return indicadores.periodo;
                  // Si viene como MMYYYY
                  const match = indicadores.periodo.match(/^(\d{2})(\d{4})$/);
                  if (match) {
                    return `${match[1]}-${match[2]}`;
                  }
                  // Buscar año (4 dígitos) y mes (2 dígitos) en la cadena
                  const match2 = indicadores.periodo.match(/(\d{4})[-/](\d{1,2})/);
                  if (match2) {
                    const year = match2[1];
                    let month = match2[2];
                    if (month.length === 1) month = '0' + month;
                    return `${month}-${year}`;
                  }
                  // Si no coincide, intentar invertir si es MM-YYYY o YYYY-MM
                  const alt = indicadores.periodo.match(/(\d{1,2})[-/](\d{4})/);
                  if (alt) {
                    let month = alt[1];
                    if (month.length === 1) month = '0' + month;
                    return `${month}-${alt[2]}`;
                  }
                  return indicadores.periodo;
                })()}</div>
              </>
            )}
          </div>
        </div>
      </div>
      <form className="row g-3 bg-light p-4 rounded shadow" onSubmit={handleSubmit}>
        <h4>Haberes</h4>
        <div className="col-md-3">
          <label className="form-label">Días trabajados</label>
          <input type="number" className="form-control" name="diasTrabajados" min="1" max="31" value={form.diasTrabajados} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Sueldo base</label>
          <input type="number" className="form-control" name="sueldoBase" value={form.sueldoBase} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <label className="form-label">Tipo contrato</label>
          <select className="form-select" name="tipoContrato" value={form.tipoContrato} onChange={handleChange} required>
            {CONTRATO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-center">
          <div className="form-check d-flex align-items-center">
            <input className="form-check-input" type="checkbox" name="considerarGratificacion" checked={form.considerarGratificacion} onChange={handleChange} id="gratificacionCheck" />
            <label className="form-check-label mb-0 ms-2" htmlFor="gratificacionCheck">Gratificación</label>
            <span
              className="ms-2"
              tabIndex="0"
              title="Para efectos de este cálculo, se tomará solo el Sueldo Base"
              style={{cursor: 'pointer', fontSize: '1.2em'}}
            >
              ℹ️
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Monto Horas extra</label>
          <input type="number" className="form-control" name="horasExtra" value={form.horasExtra} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Comisiones</label>
          <input type="number" className="form-control" name="comisiones" value={form.comisiones} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Bonos imponibles</label>
          <input type="number" className="form-control" name="bonosImponibles" value={form.bonosImponibles} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Colación</label>
          <input type="number" className="form-control" name="colacion" value={form.colacion} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Movilización</label>
          <input type="number" className="form-control" name="movilizacion" value={form.movilizacion} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">N° cargas familiares</label>
          <input type="number" className="form-control" name="cargasFamiliares" value={form.cargasFamiliares} onChange={handleChange} />
        </div>
        <h4 className="mt-4">Descuentos</h4>
        <div className="col-md-3">
          <label className="form-label">AFP</label>
          <select className="form-select" name="afp" value={form.afp} onChange={handleChange} required>
            {AFP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">APV en UF</label>
          <input type="number" className="form-control" name="apvUf" value={form.apvUf} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Sistema de Salud</label>
          <select className="form-select" name="sistemaSalud" value={form.sistemaSalud} onChange={handleChange} required>
            {SALUD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        {form.sistemaSalud === 'isapre' && (
          <>
            <div className="col-md-3">
              <label className="form-label">Nombre Isapre</label>
              <input type="text" className="form-control" name="isapreNombre" value={form.isapreNombre} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Plan de salud Isapre (UF)</label>
              <input type="number" className="form-control" name="isaprePlanUf" value={form.isaprePlanUf} onChange={handleChange} />
            </div>
          </>
        )}
        <div className="col-md-3">
          <label className="form-label">Otros descuentos</label>
          <input type="number" className="form-control" name="otrosDescuentos" value={form.otrosDescuentos} onChange={handleChange} />
        </div>
        <div className="col-12 d-flex justify-content-center mt-4">
          <button type="submit" className="btn btn-primary btn-lg d-flex align-items-center justify-content-center" disabled={loading}>
            {loading && (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            )}
            {loading ? 'Calculando...' : 'Calcular Sueldo Líquido'}
          </button>
        </div>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
      {resultado && resultado.result && (
        <div className="mt-5">
          <h3 className="text-center mb-4">Liquidación de Sueldo</h3>
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              <div className="card shadow-lg border-primary mb-4">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Detalle de Haberes y Descuentos</span>
                  <span style={{fontSize:'0.9em'}}>por <a href="https://victorcabrera.cl" className="text-white text-decoration-underline" target="_blank" rel="noopener noreferrer">Victor Cabrera</a></span>
                </div>
                <div className="card-body bg-light">
                  <div className="row">
                    <div className="col-md-6 border-end">
                      <h5 className="text-primary">Haberes</h5>
                      <ul className="list-group list-group-flush mb-3">
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
                        .map((item, idx) => (
                          <li key={item.label} className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">{item.label}:</span>
                            <span className="float-end">{item.value.toLocaleString('es-CL')}</span>
                          </li>
                        ))}
                        <li className="list-group-item fw-bold d-flex justify-content-between align-items-center">
                          <span className="text-start">Total haberes:</span>
                          <span className="float-end">{resultado.result.haberes?.TotalHaberes !== undefined ? resultado.result.haberes.TotalHaberes.toLocaleString('es-CL') : '-'}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h5 className="text-danger">Descuentos</h5>
                      <ul className="list-group list-group-flush mb-3">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">AFP obligatorio:</span>
                          <span className="float-end">{resultado.result.descuentos?.afpObligatorio !== undefined ? resultado.result.descuentos.afpObligatorio.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Comisión AFP:</span>
                          <span className="float-end">{resultado.result.descuentos?.comisionAfp !== undefined ? resultado.result.descuentos.comisionAfp.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Salud:</span>
                          <span className="float-end">{resultado.result.descuentos?.salud !== undefined ? resultado.result.descuentos.salud.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Seguro cesantía:</span>
                          <span className="float-end">{resultado.result.descuentos?.seguroCesantia !== undefined ? resultado.result.descuentos.seguroCesantia.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Impuesto único:</span>
                          <span className="float-end">{resultado.result.descuentos?.impuestoUnico !== undefined ? resultado.result.descuentos.impuestoUnico.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">APV:</span>
                          <span className="float-end">{resultado.result.descuentos?.apv !== undefined ? resultado.result.descuentos.apv.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Otros descuentos:</span>
                          <span className="float-end">{resultado.result.descuentos?.otrosDescuentos !== undefined ? resultado.result.descuentos.otrosDescuentos.toLocaleString('es-CL') : '-'}</span>
                        </li>
                        <li className="list-group-item fw-bold d-flex justify-content-between align-items-center">
                          <span className="text-start">Total descuentos:</span>
                          <span className="float-end">{resultado.result.descuentos?.totalDescuentos !== undefined ? resultado.result.descuentos.totalDescuentos.toLocaleString('es-CL') : '-'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12">
                      <h5 className="text-secondary">Otros datos</h5>
                      <ul className="list-group list-group-flush mb-3">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">AFP:</span>
                          <span className="float-end">{resultado.result.otros?.afp || '-'}</span>
                        </li>
                        {resultado.result.otros?.isapreNombre && resultado.result.otros.isapreNombre !== '-' && (
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">Nombre Isapre:</span>
                            <span className="float-end">{resultado.result.otros.isapreNombre}</span>
                          </li>
                        )}
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Sistema Salud:</span>
                          <span className="float-end">{resultado.result.otros?.sistemaSalud || '-'}</span>
                        </li>
                        {resultado.result.otros?.jornadaTrabajo && (
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">Jornada de trabajo:</span>
                            <span className="float-end">{resultado.result.otros.jornadaTrabajo} horas</span>
                          </li>
                        )}
                        {resultado.result.otros?.afectoLeyesSociales && (
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">Afecto leyes sociales:</span>
                            <span className="float-end">{resultado.result.otros.afectoLeyesSociales.toLocaleString('es-CL')}</span>
                          </li>
                        )}
                        {resultado.result.otros?.afectoSeguroCesantia && (
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">Afecto seguro cesantía:</span>
                            <span className="float-end">{resultado.result.otros.afectoSeguroCesantia.toLocaleString('es-CL')}</span>
                          </li>
                        )}
                        {resultado.result.otros?.afectoImpuestoUnico && (
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">Afecto impuesto único:</span>
                            <span className="float-end">{resultado.result.otros.afectoImpuestoUnico.toLocaleString('es-CL')}</span>
                          </li>
                        )}
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-start">Días trabajados:</span>
                          <span className="float-end">{resultado.result.otros?.diasTrabajados !== undefined ? resultado.result.otros.diasTrabajados : '-'}</span>
                        </li>
                        {resultado.result.haberes?.asignacionFamiliar > 0 && (
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="text-start">Tramo asignación familiar:</span>
                            <span className="float-end">{resultado.result.otros?.tramoAsignacionFamiliar || '-'}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12 text-center">
                      <h3 className="display-6">Sueldo Líquido: <span className="text-success fw-bold">{resultado.result.sueldoLiquido !== undefined ? resultado.result.sueldoLiquido.toLocaleString('es-CL') : '-'}</span></h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
