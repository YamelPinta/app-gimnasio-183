
let graficoInstancia = null;
let graficoRadarInstancia = null;

function abrirModalRendimiento() {

    document.getElementById("modal-rendimiento").style.display = "flex";
    

    setTimeout(() => {
        const hoy = new Date();
        document.getElementById("select-rend-anio").value = hoy.getFullYear().toString();
        document.getElementById("select-rend-mes").value = (hoy.getMonth() + 1).toString();
        
        cargarRendimiento(); 
    }, 50);
}

async function cargarRendimiento() {
    const anio = document.getElementById("select-rend-anio").value;
    const mes = document.getElementById("select-rend-mes").value.padStart(2, '0');
    const contenedor = document.getElementById("lista-comentarios-rend");
    
    contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.85rem;'>Analizando datos del alumno...</p>";
    
    try {
        const fechaInicio = `${anio}-${mes}-01`;
        const ultimoDia = new Date(anio, mes, 0).getDate();
        const fechaFin = `${anio}-${mes}-${ultimoDia}`;

        const { data: evaluaciones, error: errEval } = await clienteSupabase
            .from('evaluaciones_rendimiento')
            .select('*')
            .eq('alumno_id', AppState.alumnoSeleccionadoId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true });

        if (errEval) throw errEval;

        const { data: rutina, error: errRut } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('zona_muscular, fuerza') 
            .eq('alumno_id', AppState.alumnoSeleccionadoId);

        if (errRut) throw errRut;

        const { data: historialPeso, error: errHistorial } = await clienteSupabase
            .from('registro_ejercicios')
            .select('*')
            .eq('alumno_id', AppState.alumnoSeleccionadoId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true });

        if (errHistorial) throw errHistorial;

        contenedor.innerHTML = "";
        if (evaluaciones.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.85rem;'>No hay evaluaciones en este período.</p>";
        } else {
            evaluaciones.forEach(ev => {
                const fechaFormateada = formatearFechaSegura(ev.fecha);

                const comentarioSeguro = escaparHTML(ev.comentario); 
                
                if (ev.tipo === 'alumno') {
                    contenedor.innerHTML += `
                        <div class="burbuja-alumno">
                            <strong style="color: #3498db; font-size:0.8rem;">Auto-reporte (${fechaFormateada}) - Esfuerzo: ${ev.calificacion}/10</strong>
                            <p style="font-size:0.85rem; color:#ddd; margin-top:4px;">"${comentarioSeguro}"</p>
                        </div>`;
                } else {
                    contenedor.innerHTML += `
                        <div class="burbuja-profe">
                            <strong style="color: #f39c12; font-size:0.8rem;">Profe (${fechaFormateada})</strong>
                            <p style="font-size:0.85rem; color:#ddd; margin-top:4px;">"${comentarioSeguro}"</p>
                        </div>`;
                }
            });
        }

        const evAlumno = evaluaciones.filter(e => e.tipo === 'alumno' && e.calificacion);
        
        if (evAlumno.length > 0) {
            const suma = evAlumno.reduce((acc, curr) => acc + parseInt(curr.calificacion), 0);
            const promedio = (suma / evAlumno.length).toFixed(1);
            document.getElementById("kpi-esfuerzo").innerHTML = `${promedio} <span style="font-size:0.9rem; color:#888;">/10</span>`;
            
            let porcentaje = Math.min(Math.round((evAlumno.length / 12) * 100), 100);
            document.getElementById("kpi-asistencia").innerText = `${porcentaje}%`;
            document.getElementById("kpi-barra-fill").style.width = `${porcentaje}%`;
        } else {
            document.getElementById("kpi-esfuerzo").innerHTML = `-- <span style="font-size:0.9rem; color:#888;">/10</span>`;
            document.getElementById("kpi-asistencia").innerText = `0%`;
            document.getElementById("kpi-barra-fill").style.width = `0%`;
        }

        dibujarGraficoEvolucion(historialPeso);
        dibujarGraficoMuscular(rutina);

    } catch (e) {
        contenedor.innerHTML = `<p style='color:#e74c3c; font-size:0.85rem;'>Error al cargar: ${e.message}</p>`;
    }
}

function dibujarGraficoEvolucion(historial) {
    const ctx = document.getElementById('grafico-rendimiento').getContext('2d');
    if (graficoInstancia) { graficoInstancia.destroy(); } 

    const fechasSet = new Set();
    const zonasMap = {}; 

    historial.forEach(reg => {
        const fechaArg = reg.fecha ? reg.fecha.split('-').reverse().slice(0,2).join('/') : '--/--';
        fechasSet.add(fechaArg);
        
        let zonaGrafico = reg.zona_muscular || "General";
        
        if(!zonasMap[zonaGrafico]) zonasMap[zonaGrafico] = {};
        
        zonasMap[zonaGrafico][fechaArg] = reg.peso_total; 
    });

    const labels = Array.from(fechasSet); 

    const colores = {
        "Pecho": "#e74c3c", "Espalda": "#3498db", "Piernas": "#2ecc71", 
        "Brazos": "#f1c40f", "Hombros": "#9b59b6", "Glúteos": "#e67e22", "Core": "#1abc9c"
    };

    const datasets = Object.keys(zonasMap).map(zona => {
        const dataPuntos = labels.map(fecha => zonasMap[zona][fecha] || null); 
        return {
            label: zona + ' (%)', 
            data: dataPuntos,
            borderColor: colores[zona] || '#f39c12',
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            tension: 0.3,
            pointBackgroundColor: '#ffffff',
            pointRadius: 4,
            spanGaps: true
        };
    });

    graficoInstancia = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true, 
                    suggestedMax: 100, 
                    title: { display: true, text: 'Intensidad (%)', color: '#666' }, 
                    ticks: { color: '#888' }, 
                    grid: { color: 'rgba(255,255,255,0.05)' } 
                },
                x: { ticks: { color: '#888' }, grid: { display: false } }
            },
            plugins: { 
                legend: { display: true, labels: { color: '#aaa', boxWidth: 12, font: {size: 10} } },
                tooltip: { callbacks: { label: function(context) { return context.dataset.label + ': ' + context.parsed.y + '%'; } } }
            }
        }
    });
}

function dibujarGraficoMuscular(rutina) {
    const ctx = document.getElementById('grafico-radar-musculos').getContext('2d');
    if (graficoRadarInstancia) { graficoRadarInstancia.destroy(); }
    
    const statsZonas = {};
    
    if(rutina) {
        rutina.forEach(ej => {
            if (ej.series_reps) {
                let zonaAsignada = ej.zona_muscular || "General";

                try {
                    let series = JSON.parse(ej.series_reps);
                    if (Array.isArray(series)) {
                        series.forEach(s => {
                            let rm = parseFloat(s.fuerza);
                            let rir = parseFloat(s.rir);
                            
                            if (!isNaN(rm) && rm > 0) {
                                if (!statsZonas[zonaAsignada]) {
                                    statsZonas[zonaAsignada] = {rm: 0, rir: 0, cant: 0};
                                }
                                statsZonas[zonaAsignada].rm += rm;
                                statsZonas[zonaAsignada].rir += (isNaN(rir) ? 0 : rir);
                                statsZonas[zonaAsignada].cant += 1;
                            }
                        });
                    }
                } catch(e) { console.warn("Error JSON al dibujar gráfico radar:", e); }
            }
        });
    }

    const labels = Object.keys(statsZonas);
    const dataRM = labels.map(zona => statsZonas[zona].cant > 0 ? Math.round(statsZonas[zona].rm / statsZonas[zona].cant) : 0);
    const dataRIR = labels.map(zona => statsZonas[zona].cant > 0 ? (statsZonas[zona].rir / statsZonas[zona].cant).toFixed(1) : 0);

    graficoRadarInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Intensidad (% RM)',
                    data: dataRM,
                    backgroundColor: 'rgba(52, 152, 219, 0.8)', 
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'RIR Promedio',
                    data: dataRIR,
                    backgroundColor: 'rgba(243, 156, 18, 0.8)', 
                    borderRadius: 4,
                    yAxisID: 'y1' 
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { color: '#888' }, grid: { display: false } },
                y: { 
                    type: 'linear', display: true, position: 'left',
                    title: { display: true, text: '% RM', color: '#3498db' },
                    ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' },
                    suggestedMax: 100, beginAtZero: true
                },
                y1: { 
                    type: 'linear', display: true, position: 'right',
                    title: { display: true, text: 'RIR', color: '#f39c12' },
                    ticks: { color: '#888' }, grid: { drawOnChartArea: false },
                    suggestedMax: 5, beginAtZero: true
                }
            },
            plugins: { legend: { display: true, labels: { color: '#aaa', font: {size: 11} } } }
        }
    });
}

async function guardarEvaluacionProfe() {
    const comentario = document.getElementById("input-comentario-profe").value.trim();
    if (!comentario) {
        mostrarAlerta("Atención", "No escribiste nada en la evaluación.");
        return;
    }
    
    const tmpHoy = new Date();
    const fechaHoyStr = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;

    try {
        const { error } = await clienteSupabase.from('evaluaciones_rendimiento').insert([{
            alumno_id: AppState.alumnoSeleccionadoId,
            profesor_id: AppState.profeActivoId,
            tipo: 'profe',
            comentario: comentario,
            fecha: fechaHoyStr,
            calificacion: null 
        }]);
        
        if (error) throw error;
        
        document.getElementById("input-comentario-profe").value = "";
        
        mostrarAlerta("¡Éxito!", "La evaluación se guardó correctamente."); 
        
        cargarRendimiento(); 
        
    } catch (e) {
        mostrarAlerta("Error", "No se pudo guardar la anotación: " + e.message);
    }
}




window.abrirModalRendimiento = abrirModalRendimiento;
window.cargarRendimiento = cargarRendimiento;
window.dibujarGraficoEvolucion = dibujarGraficoEvolucion;
window.dibujarGraficoMuscular = dibujarGraficoMuscular;
window.guardarEvaluacionProfe = guardarEvaluacionProfe;