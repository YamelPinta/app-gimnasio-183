let ejercicioBSActivo = null;
let isDraggingBS = false;
let startYBS = 0;
let currentYBS = 0;
let contextoModalEjercicio = 'rutina';

let inputDestinoEjercicio = "";
let ejerciciosModalTemporales = [];
let modalFiltroCategoria = "ENTRENAMIENTO";
let modalFiltroZona = "Todas";
let modalIdSelectZona = "";
let esContextoPackModal = false;



function abrirModalEjercicio(contexto = 'rutina') {
    contextoModalEjercicio = contexto;

    AppState.ejercicioEditandoId = null;
    AppState.ejercicioPackEditandoIndex = null;

    const modal = document.getElementById("modal-ejercicio");
    modal.style.display = "flex";

    const titulo = modal.querySelector("h3");
    if (titulo) titulo.innerText = contexto === 'pack' ? "Añadir al Pack" : "Añadir Ejercicio";

    const btnPack = modal.querySelector("button[onclick='abrirModalSeleccionarPack()']");
    if (btnPack) btnPack.style.display = contexto === 'pack' ? "none" : "flex";

    const textoOpciones = modal.querySelector(".toggle-avanzado-container")?.previousElementSibling;
    if (textoOpciones && textoOpciones.tagName === "DIV") {
        textoOpciones.style.display = contexto === 'pack' ? "none" : "block";
    }

    const btnEmom = document.getElementById('btn-guardar-emom');
    if (btnEmom) btnEmom.innerText = "Guardar";
    const btnNormal = document.querySelector('#botones-modal-normales .btn-guardar');
    if (btnNormal) btnNormal.innerText = "Guardar";

    const selectZona = document.getElementById("select-ej-zona");
    selectZona.innerHTML = '<option value="">Seleccioná una zona / tipo...</option>';

    if (contexto === 'pack') {
        let todasLasZonas = [];
        Object.keys(catalogoGlobal).forEach(cat => {
            Object.keys(catalogoGlobal[cat]).forEach(z => {
                if (!todasLasZonas.includes(z)) todasLasZonas.push(z);
            });
        });
        todasLasZonas.sort().forEach(zona => {
            selectZona.innerHTML += `<option value="${zona}">${zona}</option>`;
        });
    } else {
        let catActual = "ENTRENAMIENTO";
        if (AppState.categoriaSeleccionada) {
            const cat = AppState.categoriaSeleccionada.toUpperCase();
            if (cat === "MOVILIDAD" || cat === "ENTRADA EN CALOR") catActual = cat;
        }
        Object.keys(catalogoGlobal[catActual]).forEach(zona => {
            selectZona.innerHTML += `<option value="${zona}">${zona}</option>`;
        });
    }
    selectZona.innerHTML += `<option value="General">General</option>`;

    resetearFormulariosEjercicio();

    inicializarModalSeries(contexto, []);

    setTimeout(() => {
        AppState.estadoInicialFormulario = obtenerEstadoFormularioEjercicio();
    }, 100);
}

function resetearFormulariosEjercicio() {
    const limpiarValor = (id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    };

    limpiarValor("input-ej-nombre");
    limpiarValor("input-ej-descanso");
    limpiarValor("input-ej-subbloque");
    limpiarValor("input-ej-notas");

    limpiarValor("input-emom-nombre");
    limpiarValor("input-emom-prep");
    limpiarValor("input-emom-minutos");
    limpiarValor("input-emom-descanso");
    limpiarValor("input-emom-subbloque");
    limpiarValor("input-emom-notas");
    const contenedorEmom = document.getElementById("contenedor-minutos-emom");
    if (contenedorEmom) contenedorEmom.innerHTML = "";

    limpiarValor("input-amrap-nombre");
    limpiarValor("input-amrap-prep");
    limpiarValor("input-amrap-minutos");
    limpiarValor("input-amrap-descanso");
    limpiarValor("input-amrap-subbloque");
    limpiarValor("input-amrap-notas");
    const contenedorAmrap = document.getElementById("contenedor-ejercicios-amrap");
    if (contenedorAmrap) {
        contenedorAmrap.innerHTML = "";
        agregarFilaAvanzada('amrap'); 
    }

    limpiarValor("input-tabata-nombre"); limpiarValor("input-tabata-prep"); limpiarValor("input-tabata-trabajo"); limpiarValor("input-tabata-pausa"); limpiarValor("input-tabata-rondas"); limpiarValor("input-tabata-descanso"); limpiarValor("input-tabata-subbloque"); limpiarValor("input-tabata-notas");
    limpiarValor("input-timecap-nombre"); limpiarValor("input-timecap-prep"); limpiarValor("input-timecap-minutos"); limpiarValor("input-timecap-descanso"); limpiarValor("input-timecap-subbloque"); limpiarValor("input-timecap-notas");
    
    if (document.getElementById("contenedor-ejercicios-tabata")) document.getElementById("contenedor-ejercicios-tabata").innerHTML = "";
    if (document.getElementById("contenedor-ejercicios-timecap")) document.getElementById("contenedor-ejercicios-timecap").innerHTML = "";

    const mostrarElemento = (id, display) => {
        const el = document.getElementById(id);
        if (el) el.style.display = display;
    };

    mostrarElemento("seleccion-modalidad", "block");
    ['emom', 'amrap', 'tabata', 'timecap'].forEach(tipo => {
        mostrarElemento(`configuracion-${tipo}`, "none");
        mostrarElemento(`botones-modal-${tipo}`, "none");
    });

    const checkAvanzado = document.getElementById("checkFuncionesAvanzadas");
    if (checkAvanzado) {
        checkAvanzado.checked = false;
        toggleAvanzadas();
    }
}

function abrirModalEditar(id, zona, nombre, seriesRepsJson, fuerza, descanso, subBloque, notas, contexto = 'rutina') {
    contextoModalEjercicio = contexto;
    AppState.ejercicioEditandoId = id;

    resetearFormulariosEjercicio();

    const modal = document.getElementById("modal-ejercicio");
    modal.style.display = "flex";

    const titulo = modal.querySelector("h3");
    if (titulo) titulo.innerText = "Editar Ejercicio";

    const btnPack = modal.querySelector("button[onclick='abrirModalSeleccionarPack()']");
    if (btnPack) btnPack.style.display = "none";

    const textoOpciones = modal.querySelector(".toggle-avanzado-container")?.previousElementSibling;
    if (textoOpciones && textoOpciones.tagName === "DIV") textoOpciones.style.display = "none";

    const btnEmom = document.getElementById('btn-guardar-emom');
    if (btnEmom) btnEmom.innerText = "Guardar";
    const btnNormal = document.querySelector('#botones-modal-normales .btn-guardar');
    if (btnNormal) btnNormal.innerText = "Guardar";

    const selectZona = document.getElementById("select-ej-zona");
    selectZona.innerHTML = '<option value="">Seleccioná una zona / tipo...</option>';

    if (contexto === 'pack') {
        let todasLasZonas = [];
        Object.keys(catalogoGlobal).forEach(cat => {
            Object.keys(catalogoGlobal[cat]).forEach(z => {
                if (!todasLasZonas.includes(z)) todasLasZonas.push(z);
            });
        });
        todasLasZonas.sort().forEach(z => {
            selectZona.innerHTML += `<option value="${z}">${z}</option>`;
        });
    } else {
        let catActual = "ENTRENAMIENTO";
        if (AppState.categoriaSeleccionada) {
            const cat = AppState.categoriaSeleccionada.toUpperCase();
            if (cat === "MOVILIDAD" || cat === "ENTRADA EN CALOR") catActual = cat;
        }
        Object.keys(catalogoGlobal[catActual]).forEach(z => {
            selectZona.innerHTML += `<option value="${z}">${z}</option>`;
        });
    }
    selectZona.innerHTML += `<option value="General">General</option>`;

    if (zona && !Array.from(selectZona.options).some(opt => opt.value === zona)) {
        selectZona.innerHTML += `<option value="${zona}">${zona}</option>`;
    }

    const esAmrap = (descanso && descanso.includes('AMRAP_SEG:')) || (nombre && nombre.toUpperCase().startsWith("AMRAP"));
    const esEmom = (descanso && descanso.includes('EMOM_SEG:')) || (nombre && nombre.toUpperCase().startsWith("EMOM -"));
    const esTabata = (descanso && descanso.includes('TABATA_SEG:')) || (nombre && nombre.toUpperCase().startsWith("TABATA"));
    const esTimecap = (descanso && descanso.includes('TIMECAP_SEG:')) || (nombre && nombre.toUpperCase().startsWith("TIMECAP"));

    if (esAmrap || esEmom || esTabata || esTimecap) {
        document.getElementById("checkFuncionesAvanzadas").checked = true;
        toggleAvanzadas();

        let prepSegs = 0, entrenoSegs = 0, descSegs = 0;
        let intSegs = 60, pausaSegs = 10, rondasTotales = 8; 

        if (descanso && (descanso.includes('_SEG:'))) {
            const partes = descanso.split('|');
            partes.forEach(p => {
                if (p.startsWith('PREP_SEG:')) prepSegs = parseInt(p.split(':')[1]) || 0;
                if (p.startsWith('EMOM_SEG:') || p.startsWith('AMRAP_SEG:') || p.startsWith('TIMECAP_SEG:') || p.startsWith('TABATA_SEG:')) entrenoSegs = parseInt(p.split(':')[1]) || 0;
                if (p.startsWith('INT_SEG:')) intSegs = parseInt(p.split(':')[1]) || 60;
                if (p.startsWith('WORK_SEG:')) intSegs = parseInt(p.split(':')[1]) || 20; 
                if (p.startsWith('REST_SEG:')) pausaSegs = parseInt(p.split(':')[1]) || 10;
                if (p.startsWith('RNDS:')) rondasTotales = parseInt(p.split(':')[1]) || 8;
                if (p.startsWith('DESC_SEG:')) descSegs = parseInt(p.split(':')[1]) || 0;
            });
        }

        let tipoModal = 'emom';
        if (esAmrap) tipoModal = 'amrap';
        if (esTabata) tipoModal = 'tabata';
        if (esTimecap) tipoModal = 'timecap';

        abrirConfiguracionAvanzada(tipoModal);

        const inputNombre = document.getElementById(`input-${tipoModal}-nombre`);
        if (inputNombre) inputNombre.value = nombre;

        document.getElementById(`input-${tipoModal}-prep`).value = formatearTiempo(prepSegs);
        document.getElementById(`input-${tipoModal}-descanso`).value = formatearTiempo(descSegs);

        if (tipoModal === 'tabata') {
            document.getElementById('input-tabata-trabajo').value = formatearTiempo(intSegs); 
            document.getElementById('input-tabata-pausa').value = formatearTiempo(pausaSegs);
            document.getElementById('input-tabata-rondas').value = rondasTotales;
        } else {
            document.getElementById(`input-${tipoModal}-minutos`).value = formatearTiempo(entrenoSegs);
        }

        if (tipoModal === 'emom') {
            const inputIntervalo = document.getElementById('input-emom-intervalo');
            if (inputIntervalo) inputIntervalo.value = formatearTiempo(intSegs);
            generarMinutosEmom();
        }

        document.getElementById(`input-${tipoModal}-subbloque`).value = (subBloque && subBloque !== 'EMOM' && subBloque !== 'null') ? subBloque : "";
        document.getElementById(`input-${tipoModal}-notas`).value = (notas && notas !== 'null' && notas !== 'undefined') ? notas : "";

        setTimeout(() => {
            let arraySeries = [];
            try { if (seriesRepsJson) arraySeries = typeof seriesRepsJson === 'string' ? JSON.parse(seriesRepsJson) : seriesRepsJson; } catch (e) {}

            if (tipoModal === 'emom') {
                const cajas = document.querySelectorAll('.caja-minuto-emom:not(.fila-amrap):not(.fila-tabata):not(.fila-timecap)');
                arraySeries.forEach((serie, index) => {
                    if (cajas[index]) {
                        const inputEj = cajas[index].querySelector('.input-ejercicio-emom');
                        if (inputEj && serie.ejercicio && serie.ejercicio !== "Libre / Descanso") inputEj.value = serie.ejercicio;
                        cajas[index].querySelector('.input-reps-emom').value = serie.reps !== undefined ? serie.reps : "";
                        cajas[index].querySelector('.input-rm-emom').value = serie.fuerza !== undefined ? serie.fuerza : "";
                        cajas[index].querySelector('.input-rir-emom').value = serie.rir !== undefined ? serie.rir : "";
                    }
                });
            } else {
                const contenedorList = document.getElementById(`contenedor-ejercicios-${tipoModal}`);
                contenedorList.innerHTML = ""; 

                if (arraySeries.length > 0) {
                    arraySeries.forEach((serie) => {
                        agregarFilaAvanzada(tipoModal, {
                            ejercicio: serie.ejercicio !== "Libre / Descanso" ? serie.ejercicio : "",
                            reps: serie.reps !== undefined ? serie.reps : "",
                            rm: serie.fuerza !== undefined ? serie.fuerza : "",
                            rir: serie.rir !== undefined ? serie.rir : ""
                        });
                    });
                } else {
                    agregarFilaAvanzada(tipoModal); 
                }
            }

            AppState.estadoInicialFormulario = obtenerEstadoFormularioEjercicio();
        }, 150);

    } else {
        const checkAvanzado = document.getElementById("checkFuncionesAvanzadas");
        if (checkAvanzado) {
            checkAvanzado.checked = false;
            toggleAvanzadas();
        }

        document.getElementById("select-ej-zona").value = zona || "";

        document.getElementById("input-ej-nombre").value = nombre || "";
        document.getElementById("input-ej-descanso").value = descanso !== 'undefined' && descanso !== 'null' ? descanso : "";
        document.getElementById("input-ej-subbloque").value = (subBloque && subBloque !== 'null' && subBloque !== 'undefined') ? subBloque : "";
        document.getElementById("input-ej-notas").value = (notas && notas !== 'null' && notas !== 'undefined') ? notas : "";

        let arraySeries = [];
        try {
            if (seriesRepsJson && typeof seriesRepsJson === 'string') {
                arraySeries = JSON.parse(seriesRepsJson);
            } else if (Array.isArray(seriesRepsJson)) {
                arraySeries = seriesRepsJson;
            }
        } catch (e) { console.warn("Error al leer el JSON de las series en abrirModalEditar:", e); }

        inicializarModalSeries('rutina', arraySeries);

        setTimeout(() => {
            AppState.estadoInicialFormulario = obtenerEstadoFormularioEjercicio();
        }, 100);
    }
}

async function abrirModalEditarPorId(idEjercicio) {
    try {
        const { data: ej, error } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('*')
            .eq('id', idEjercicio)
            .single();

        if (error) throw error;
        if (!ej) return;

        abrirModalEditar(ej.id, ej.zona_muscular, ej.ejercicio_nombre, ej.series_reps, ej.fuerza, ej.descanso, ej.sub_bloque, ej.notas);

    } catch (e) {
        console.error("Error al abrir para editar:", e);
        mostrarAlerta("Error", "No se pudo cargar el ejercicio para editar.");
    }
}

function borrarEjercicio(id) {
    pedirConfirmacion(
        "Borrar Ejercicio",
        "¿Seguro que querés quitar este ejercicio de la rutina?",
        "Borrar",
        async () => {
            try {
                const { error } = await clienteSupabase.from('rutinas_planificadas').delete().eq('id', id);
                if (error) throw error;
                cargarEjerciciosCategoriaBD();
            } catch (error) { mostrarAlerta("Error al borrar: " + error.message); }
        }
    );
}

async function guardarEjercicioEnBD() {
    const zona = document.getElementById("select-ej-zona").value;
    const nombre = document.getElementById("input-ej-nombre").value.trim();
    const subBloque = document.getElementById("input-ej-subbloque").value.trim();
    const notasTexto = document.getElementById("input-ej-notas").value.trim();

    if (!nombre) { mostrarAlerta("Faltan datos", "Por favor, ponele un nombre al ejercicio."); return; }

    const seriesRepsTexto = extraerSeriesDelModal('rutina');
    const descansoTexto = document.getElementById("input-ej-descanso").value;

    const btnGuardar = document.querySelector('#botones-modal-normales .btn-guardar');
    if (btnGuardar) btnGuardar.innerText = "Guardando...";

    if (contextoModalEjercicio === 'pack') {
        if (AppState.ejercicioPackEditandoIndex !== null) {
            AppState.packActivoEjercicios[AppState.ejercicioPackEditandoIndex] = { zona, nombre, series: seriesRepsTexto, descanso: descansoTexto, sub_bloque: subBloque || null, notas: notasTexto || null };
        } else {
            AppState.packActivoEjercicios.push({ zona, nombre, series: seriesRepsTexto, descanso: descansoTexto, sub_bloque: subBloque || null, notas: notasTexto || null });
        }
        try {
            await clienteSupabase.from('packs_rutinas').update({ ejercicios: AppState.packActivoEjercicios }).eq('id', AppState.packActivoId);
            AppState.ejercicioPackEditandoIndex = null;
            toggleModal('modal-ejercicio', false);
            cargarEjerciciosDePack();
        } catch (e) { console.error(e); }

        if (btnGuardar) btnGuardar.innerText = "Guardar";
        return;
    }

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias) { dias = AppState.alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[AppState.diaActivo - 1];

    try {
        if (AppState.ejercicioEditandoId) {
            await clienteSupabase.from('rutinas_planificadas').update({
                ejercicio_nombre: nombre, series_reps: seriesRepsTexto, descanso: descansoTexto, zona_muscular: zona || null, sub_bloque: subBloque || null, notas: notasTexto || null
            }).eq('id', AppState.ejercicioEditandoId);
        } else {
            await clienteSupabase.from('rutinas_planificadas').insert([{
                alumno_id: AppState.alumnoSeleccionadoId, dia_semana: diaSeleccionado, semana: AppState.semanaActiva,
                categoria: AppState.categoriaSeleccionada, zona_muscular: zona || null, ejercicio_nombre: nombre,
                series_reps: seriesRepsTexto, fuerza: null, descanso: descansoTexto, orden: 999, sub_bloque: subBloque || null, notas: notasTexto || null
            }]);
        }
        AppState.ejercicioEditandoId = null;
        toggleModal('modal-ejercicio', false);
        cargarEjerciciosCategoriaBD();
    } catch (e) { mostrarAlerta("Error", e.message); }

    if (btnGuardar) btnGuardar.innerText = "Guardar";
}

async function cargarEjerciciosCategoriaBD() {
    const contenedorEjercicios = document.getElementById("lista-ejercicios-detalle");
    contenedorEjercicios.innerHTML = "<p style='text-align:center; color:#888; margin-top: 20px;'>Cargando rutina...</p>";

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias) { dias = AppState.alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[AppState.diaActivo - 1];

    try {
        let query = clienteSupabase.from('rutinas_planificadas').select('*')
            .eq('alumno_id', AppState.alumnoSeleccionadoId).eq('dia_semana', diaSeleccionado).eq('semana', AppState.semanaActiva)
            .order('orden', { ascending: true, nullsFirst: false }).order('id', { ascending: true });

        if (AppState.categoriaSeleccionada.toUpperCase() === 'ENTRENAMIENTO') {
            query = query.or(`categoria.eq.${AppState.categoriaSeleccionada},categoria.is.null`);
        } else {
            query = query.eq('categoria', AppState.categoriaSeleccionada);
        }

        const { data: ejercicios, error } = await query;
        if (error) throw error;

        AppState.ejerciciosActualesCache = ejercicios;

        let avanzados = ejercicios.filter(ej =>
            (ej.descanso && ej.descanso.includes('EMOM_SEG:')) ||
            (ej.ejercicio_nombre && (
                ej.ejercicio_nombre.toUpperCase().startsWith("EMOM") ||
                ej.ejercicio_nombre.toUpperCase().startsWith("AMRAP") ||
                ej.ejercicio_nombre.toUpperCase().startsWith("TIMECAP") ||
                ej.ejercicio_nombre.toUpperCase().startsWith("TABATA")
            ))
        );

        let emomEncontrado = null;
        if (avanzados.length > 0) {
            if (AppState.relojActivoId) {
                emomEncontrado = avanzados.find(ej => String(ej.id) === String(AppState.relojActivoId));
            }
            if (!emomEncontrado) {
                emomEncontrado = avanzados[avanzados.length - 1];
            }
        }

        const relojContainer = document.getElementById('contenedor-reloj-emom');

        if (emomEncontrado && relojContainer) {

            if (AppState.relojActivoId === emomEncontrado.id && Array.isArray(AppState.relojFases) && AppState.relojFases.length > 0) {
                
            } else if (AppState.relojEstado !== 'corriendo') {
                AppState.relojActivoId = emomEncontrado.id;
                AppState.relojEstado = 'detenido';

                let prepSegs = 0; let descSegs = 0; let trabajoSegs = 0; let intSegs = 60;
                let pausaSegs = 10; let rondasTotales = 8;
                let tipoEjercicio = 'emom'; 

                if (emomEncontrado.descanso) {
                    if (emomEncontrado.descanso.includes('AMRAP_SEG:')) {
                        tipoEjercicio = 'amrap';
                        const partes = emomEncontrado.descanso.split('|');
                        partes.forEach(p => {
                            if (p.startsWith('PREP_SEG:')) prepSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('AMRAP_SEG:')) trabajoSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('DESC_SEG:')) descSegs = parseInt(p.split(':')[1]) || 0;
                        });
                    } else if (emomEncontrado.descanso.includes('TIMECAP_SEG:')) {
                        tipoEjercicio = 'timecap';
                        const partes = emomEncontrado.descanso.split('|');
                        partes.forEach(p => {
                            if (p.startsWith('PREP_SEG:')) prepSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('TIMECAP_SEG:')) trabajoSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('DESC_SEG:')) descSegs = parseInt(p.split(':')[1]) || 0;
                        });
                    } else if (emomEncontrado.descanso.includes('TABATA_SEG:')) {
                        tipoEjercicio = 'tabata';
                        const partes = emomEncontrado.descanso.split('|');
                        partes.forEach(p => {
                            if (p.startsWith('PREP_SEG:')) prepSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('WORK_SEG:')) trabajoSegs = parseInt(p.split(':')[1]) || 20;
                            if (p.startsWith('REST_SEG:')) pausaSegs = parseInt(p.split(':')[1]) || 10;
                            if (p.startsWith('RNDS:')) rondasTotales = parseInt(p.split(':')[1]) || 8;
                            if (p.startsWith('DESC_SEG:')) descSegs = parseInt(p.split(':')[1]) || 0;
                        });
                    } else if (emomEncontrado.descanso.includes('EMOM_SEG:')) {
                        tipoEjercicio = 'emom';
                        const partes = emomEncontrado.descanso.split('|');
                        partes.forEach(p => {
                            if (p.startsWith('PREP_SEG:')) prepSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('EMOM_SEG:')) trabajoSegs = parseInt(p.split(':')[1]) || 0;
                            if (p.startsWith('INT_SEG:')) intSegs = parseInt(p.split(':')[1]) || 60;
                            if (p.startsWith('DESC_SEG:')) descSegs = parseInt(p.split(':')[1]) || 0;
                        });
                    } else {
                        let emomMins = 0;
                        const match = emomEncontrado.ejercicio_nombre.match(/\d+/);
                        if (match) emomMins = parseInt(match[0]);
                        if (emomEncontrado.descanso.includes('PREP:')) {
                            const partes = emomEncontrado.descanso.split('|');
                            partes.forEach(p => {
                                if (p.startsWith('PREP:')) prepSegs = parseInt(p.split(':')[1]) * 60;
                                if (p.startsWith('DESC:')) descSegs = parseInt(p.split(':')[1]) * 60;
                            });
                        }
                        trabajoSegs = emomMins * 60;
                    }
                }

                AppState.relojFases = [];
                if (prepSegs > 0) AppState.relojFases.push({ nombre: 'PREPARACIÓN', segundos: prepSegs, tipo: 'prep' });

                if (tipoEjercicio === 'tabata') {
                    for (let i = 1; i <= rondasTotales; i++) {
                        AppState.relojFases.push({ nombre: 'ENTRENAMIENTO', segundos: trabajoSegs, tipo: 'tabata', intervalo: trabajoSegs, rondaActual: i, rondasTotales: rondasTotales });
                        if (i < rondasTotales && pausaSegs > 0) {
                            AppState.relojFases.push({ nombre: 'DESCANSO', segundos: pausaSegs, tipo: 'tabata_rest' });
                        }
                    }
                } else {
                    AppState.relojFases.push({ nombre: 'ENTRENAMIENTO', segundos: trabajoSegs, tipo: tipoEjercicio, intervalo: intSegs });
                }

                if (descSegs > 0) AppState.relojFases.push({ nombre: 'DESCANSO', segundos: descSegs, tipo: 'descanso' });

                AppState.relojIndiceFase = 0;
                AppState.tiempoTotalSegundos = AppState.relojFases[0]?.segundos || 0;
                AppState.tiempoRestanteSegundos = AppState.tiempoTotalSegundos;

                guardarEstadoReloj();
            }

            document.getElementById('titulo-reloj-avanzado').innerText = emomEncontrado.ejercicio_nombre.toUpperCase();
            document.getElementById('fase-reloj-texto').innerText = AppState.relojFases[AppState.relojIndiceFase]?.nombre || 'ENTRENAMIENTO';

            aplicarColorFase();
            actualizarDisplayReloj();
            relojContainer.style.display = 'block';

            const svgIcono = document.getElementById('svg-icono-play');
            if (svgIcono) {
                if (AppState.relojEstado === 'corriendo') {
                    svgIcono.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
                } else {
                    svgIcono.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
                }
            }

        } else if (relojContainer) {
            relojContainer.style.display = 'none';
        }

        contenedorEjercicios.innerHTML = "";

        if (ejercicios.length === 0) {
            let htmlBotonCopiar = "";
            if (AppState.semanaActiva !== 1) {
                htmlBotonCopiar = `<button class="btn-guardar" onclick="clonarSemanaCompleta(1, ${AppState.semanaActiva})" style="width: 100%; margin-top: 15px; background-color: #3498db; color: white;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" style="vertical-align: middle; margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copiar toda la rutina de la Semana 1 acá</button>`;
            }
            contenedorEjercicios.innerHTML = `<p style="text-align:center; color:#888; font-size: 0.9rem; margin-top: 30px;">No hay ejercicios en esta semana.</p>${htmlBotonCopiar}`;
            return;
        }

        const grupos = {};
        ejercicios.forEach(ej => {
            const nombreGrupo = ej.sub_bloque || "Sin agrupar";
            if (!grupos[nombreGrupo]) grupos[nombreGrupo] = [];
            grupos[grupos[nombreGrupo] ? nombreGrupo : "Sin agrupar"].push(ej);
        });

        let htmlFinal = "";

        const generarTarjeta = (ej) => {
            window.ejercicioRenderizando = ej; 
            return UI_TarjetaEjercicio(ej);
        };

        if (grupos["Sin agrupar"]) {
            htmlFinal += `<div class="subbloque-contenedor" data-sub="Sin agrupar">`;
            grupos["Sin agrupar"].forEach(ej => htmlFinal += generarTarjeta(ej));
            htmlFinal += `</div>`;
            delete grupos["Sin agrupar"];
        }

        for (const [nombreSub, ejsDelSub] of Object.entries(grupos)) {
            const idAcordeon = 'acordeon-' + nombreSub.replace(/[^a-zA-Z0-9]/g, '-');
            let htmlEjerciciosDelSubbloque = "";
            ejsDelSub.forEach(ej => htmlEjerciciosDelSubbloque += generarTarjeta(ej));

            htmlFinal += UI_Subbloque(idAcordeon, nombreSub, ejsDelSub.length, htmlEjerciciosDelSubbloque);
        }

        contenedorEjercicios.innerHTML = htmlFinal;

        document.querySelectorAll('.subbloque-contenedor').forEach(cont => {
            new Sortable(cont, {
                group: 'rutina-compartida',
                animation: 200, delay: 200, delayOnTouchOnly: true, filter: ".acciones-ejercicio svg", preventOnFilter: false,
                chosenClass: "tarjeta-arrastrando", ghostClass: "tarjeta-indicador-caida",
                onEnd: function () { guardarOrdenYSubbloque(); }
            });
        });
    } catch (e) { console.error(e); }
}

function abrirPantallaRutinas() {
    if (document.getElementById("pantalla-rutinas").style.display === "block") return;

    window.scrollTo(0, 0);
    
    const pantallas = [
        "pantalla-dashboard", "pantalla-detalle-alumno", "pantalla-perfiles",
        "pantalla-admin", "pantalla-detalle-pack", "pantalla-reloj" 
    ];
    pantallas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    document.getElementById("pantalla-rutinas").style.display = "block";
    actualizarMenuInferior('rutinas');

    setTimeout(() => {
        cargarPacks();
    }, 50);
}

async function abrirDetallePack(id, nombre) {
    AppState.packActivoId = id;
    
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "block";
    document.getElementById("detalle-nombre-pack").innerText = nombre;
    actualizarMenuInferior('rutinas');

    setTimeout(() => {
        cargarEjerciciosDePack();
    }, 50);
}

async function cargarPacks() {
    const contenedor = document.getElementById("lista-packs");
    contenedor.innerHTML = "<p style='text-align:center;'>Cargando tus rutinas...</p>";
    try {
        const { data: packs, error } = await clienteSupabase.from('packs_rutinas').select('*').eq('profesor_id', AppState.profeActivoId);
        if (error) throw error;
        contenedor.innerHTML = "";
        if (packs.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888;'>No tenés rutinas guardadas.</p>"; return;
        }
        packs.forEach(pack => {
            const ejCount = pack.ejercicios ? pack.ejercicios.length : 0;
         
            const nombrePackSeguro = escaparHTML(pack.nombre);

            contenedor.innerHTML += `
                <div class="card-alumno" onclick="abrirDetallePack('${pack.id}', '${nombrePackSeguro}')" style="cursor:pointer;">
                    ${obtenerAnimacionHTML((ejCount > 0) ? pack.ejercicios[0].nombre : null)}
                    <div class="info-central" style="margin-left: 15px; min-width: 0;">
                        <h3 style="font-size: 1.1rem; white-space: normal; overflow-wrap: anywhere; word-break: break-word; line-height: 1.2; margin-bottom: 2px;">${nombrePackSeguro}</h3>
                        <div class="info-detalle">${ejCount} ejercicios configurados</div>
                    </div>
                    <div class="acciones-ejercicio" style="margin-left: auto; padding-left: 10px; display: flex; gap: 4px;">
                        <svg onclick="event.stopPropagation(); abrirModalEditarPack('${pack.id}', '${nombrePackSeguro}')" viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" width="22"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        <svg onclick="event.stopPropagation(); borrarPack('${pack.id}')" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" width="22"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>`;
        });
    } catch (e) { contenedor.innerHTML = "<p>Error al cargar packs.</p>"; }
}

async function importarPackAAlumno(packId) {
    try {
        const { data: pack } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', packId).single();
        let dias = ["D1", "D2", "D3", "D4", "D5"];
        if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias) { dias = AppState.alumnoDataActual.nombres_dias; }
        const diaSelec = dias[AppState.diaActivo - 1];

        const insertData = pack.ejercicios.map((ej, index) => ({
            alumno_id: AppState.alumnoSeleccionadoId,
            dia_semana: diaSelec,
            semana: AppState.semanaActiva,
            categoria: AppState.categoriaSeleccionada,
            zona_muscular: ej.zona,
            ejercicio_nombre: ej.nombre,
            series_reps: ej.series,
            descanso: ej.descanso,
            notas: ej.notas || null,
            sub_bloque: ej.sub_bloque || null,
            orden: 999 + index
        }));
        await clienteSupabase.from('rutinas_planificadas').insert(insertData);
        document.getElementById("modal-seleccionar-pack").style.display = "none";
        document.getElementById("modal-ejercicio").style.display = "none";
        cargarEjerciciosCategoriaBD();
    } catch (e) { console.error(e); }
}

function agregarFilaSerie(idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    const totalFilas = contenedor.querySelectorAll('.fila-serie').length + 1;

    const nuevaFila = document.createElement('div');
    nuevaFila.className = 'fila-serie';
    nuevaFila.innerHTML = `
        <input class="input-serie-numero input-modal text-center py-8 px-2" type="number" value="${totalFilas}">
        <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
        <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
        <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
        <button type="button" class="btn-eliminar-serie" aria-label="Eliminar serie" onclick="eliminarFilaSerie(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
    `;
    contenedor.appendChild(nuevaFila);
}

function eliminarFilaSerie(botonEliminar) {
    const contenedor = botonEliminar.closest('div[id^="contenedor-filas-series"]');

    if (contenedor.querySelectorAll('.fila-serie').length > 1) {
        const fila = botonEliminar.closest('.fila-serie');
        fila.remove();
    } else {
        alert("El ejercicio debe tener al menos 1 serie.");
    }
}

function toggleSeries(tipo) {
    const contenedor = document.getElementById('contenedor-filas-series');
    const boton = document.getElementById('btn-toggle-series-rutina');
    const filas = contenedor.querySelectorAll('.fila-serie');

    const modoActual = boton.getAttribute('data-modo') || 'unificado';

    if (modoActual === 'unificado') {
        if (filas.length === 1) {
            const primerFila = filas[0];
            const cantidad = parseInt(primerFila.querySelector('.input-serie-numero').value) || 1;

            if (cantidad > 1) {
                const fuerza = primerFila.querySelector('.input-serie-fuerza').value;
                const reps = primerFila.querySelector('.input-serie-reps').value;
                const rir = primerFila.querySelector('.input-serie-rir').value;

                contenedor.innerHTML = "";
                for (let i = 1; i <= cantidad; i++) {
                    contenedor.innerHTML += `
                        <div class="fila-serie">
                            <input class="input-serie-numero input-modal text-center py-8 px-2" type="number" value="${i}">
                            <input type="number" class="input-serie-fuerza input-modal" value="${fuerza}" placeholder="% RM">
                            <input type="number" class="input-serie-reps input-modal" value="${reps}" placeholder="Reps">
                            <input type="number" class="input-serie-rir input-modal" value="${rir}" placeholder="RIR">
                            <button type="button" class="btn-eliminar-serie" aria-label="Eliminar serie" onclick="eliminarFilaSerie(this)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    `;
                }

                boton.setAttribute('data-modo', 'desglosado');
                boton.style.background = '#2c2c2c';
                boton.style.color = '#aaaaaa';
                boton.style.borderColor = '#444444';
                boton.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="align-middle mr-4"><path d="M4 14h6v6H4z"></path><path d="M14 14h6v6h-6z"></path><path d="M14 4h6v6h-6z"></path><path d="M4 4h6v6H4z"></path></svg>
                    Volver a forma unificada
                `;
            } else {
                mostrarAlerta("Atención", "Para desglosar, tenés que poner más de 1 serie en la cajita izquierda.");
            }
        }
    } else {
        if (filas.length > 0) {
            const primerFila = filas[0];
            const cantidadTotal = filas.length;
            const fuerza = primerFila.querySelector('.input-serie-fuerza').value;
            const reps = primerFila.querySelector('.input-serie-reps').value;
            const rir = primerFila.querySelector('.input-serie-rir').value;

            contenedor.innerHTML = `
                <div class="fila-serie">
                    <input class="input-serie-numero input-modal text-center py-8 px-2" type="number" value="${cantidadTotal}">
                    <input type="number" class="input-serie-fuerza input-modal" value="${fuerza}" placeholder="% RM">
                    <input type="number" class="input-serie-reps input-modal" value="${reps}" placeholder="Reps">
                    <input type="number" class="input-serie-rir input-modal" value="${rir}" placeholder="RIR">
                    <button type="button" class="btn-eliminar-serie" aria-label="Eliminar serie" onclick="eliminarFilaSerie(this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
        }

        boton.setAttribute('data-modo', 'unificado');
        boton.style.background = 'rgba(243, 156, 18, 0.1)';
        boton.style.color = '#f39c12';
        boton.style.borderColor = 'rgba(243, 156, 18, 0.3)';
        boton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="align-middle mr-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Modificar individualmente cada serie
        `;
    }
}

function generarHtmlSeries(seriesRepsJson, idUnico) {
    let seriesObj = [];
    try { if (seriesRepsJson && typeof seriesRepsJson === 'string') seriesObj = JSON.parse(seriesRepsJson); } catch (e) { console.warn("Error JSON en generarHtmlSeries:", e); }

    if (seriesObj.length === 0) return `<span style="word-break: break-word;">-</span>`;

    let esAmrap = false;
    let esEmom = false;
    let intervaloSegundos = 60; 
    let tiempoTotalSegundos = 0;

    const ej = window.ejercicioRenderizando;
    if (ej) {
        const nombreSeguro = (ej.ejercicio_nombre || ej.nombre || "").toUpperCase();
        const descSeguro = (ej.descanso || "").toUpperCase();

        if (nombreSeguro.includes('AMRAP') || descSeguro.includes('AMRAP') || nombreSeguro.includes('TIMECAP') || descSeguro.includes('TIMECAP_SEG:') || nombreSeguro.includes('TABATA') || descSeguro.includes('TABATA_SEG:')) {
            esAmrap = true;
        } else if (nombreSeguro.includes('EMOM') || descSeguro.includes('EMOM')) {
            esEmom = true;
            if (descSeguro.includes('EMOM_SEG:')) {
                const partes = descSeguro.split('|');
                partes.forEach(p => {
                    if (p.startsWith('INT_SEG:')) intervaloSegundos = parseInt(p.split(':')[1]) || 60;
                    if (p.startsWith('EMOM_SEG:')) tiempoTotalSegundos = parseInt(p.split(':')[1]) || 0;
                });
            } else {
                const match = nombreSeguro.match(/\d+/);
                if (match) tiempoTotalSegundos = parseInt(match[0]) * 60;
            }
        }
    }

    if (seriesObj.some(s => s.ejercicio)) {
        let tituloDesplegable = "";
        let etiquetaFila = "";
        let minutosPorBloque = Math.floor(intervaloSegundos / 60);

        if (esAmrap) {
            tituloDesplegable = `Ver circuito del AMRAP`;
            etiquetaFila = `Ej`;
        } else {
            if (intervaloSegundos > 60) {
                const textoBloques = seriesObj.length === 1 ? 'bloque' : 'bloques';
                tituloDesplegable = `Ver ${seriesObj.length} ${textoBloques} de ${minutosPorBloque} minutos del EMOM`;
                etiquetaFila = `Bloque`;
            } else {
                const textoMinutos = seriesObj.length === 1 ? 'minuto' : 'minutos';
                tituloDesplegable = `Ver ${seriesObj.length} ${textoMinutos} del EMOM`;
                etiquetaFila = `Min`;
            }
        }

        const restoSegundos = tiempoTotalSegundos > 0 ? (tiempoTotalSegundos % intervaloSegundos) : 0;

        return `
            <div style="width: 100%;">
                <div onclick="event.stopPropagation(); toggleNotasEjercicio('detalle-series-${idUnico}', this)" style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #f39c12; font-weight: 600; font-size: 0.75rem;">
                    <span>${tituloDesplegable}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" style="transition: 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div id="detalle-series-${idUnico}" style="display: none; padding-top: 4px; padding-left: 10px; border-left: 2px solid rgba(243, 156, 18, 0.3); margin-top: 4px;">
                    ${seriesObj.map((s, index) => {
            let txtReps = (s.reps && s.reps !== "-") ? `${s.reps}r` : "-";
            
            let etiquetaFinal = `${etiquetaFila} ${s.numero}`;
            if (!esAmrap && index === seriesObj.length - 1 && restoSegundos !== 0) {
                etiquetaFinal = `${etiquetaFila} ${s.numero} <span style="font-size: 0.75em; font-weight: normal; opacity: 0.85;">(Resto)</span>`;
            }

            return `<div style="font-size: 0.75rem; color: #888; margin-bottom: 2px;"><span style="color:#f39c12;">${etiquetaFinal}:</span> <span class="texto-ejercicio-desplegable" style="font-weight:600;">${s.ejercicio}</span> | ${txtReps}</div>`;
        }).join('')}
                </div>
            </div>
        `;
    }

    let sonIguales = true;
    const s1 = seriesObj[0];
    for (let i = 1; i < seriesObj.length; i++) {
        if (seriesObj[i].fuerza !== s1.fuerza || seriesObj[i].reps !== s1.reps || seriesObj[i].rir !== s1.rir) {
            sonIguales = false; break;
        }
    }

    if (sonIguales) {
        let rirTexto = (s1.rir && s1.rir !== "0" && s1.rir !== "-") ? ` (RIR ${s1.rir})` : "";
        return `<span style="font-weight:600; color:#f39c12;">${seriesObj.length} series:</span> <span>${s1.fuerza || "-"}% x ${s1.reps || "-"}r${rirTexto}</span>`;
    } else {
        return `
            <div style="width: 100%;">
                <div onclick="event.stopPropagation(); toggleNotasEjercicio('detalle-series-${idUnico}', this)" style="cursor: pointer; display: flex; align-items: center; gap: 4px; color: #f39c12; font-weight: 600; font-size: 0.75rem;">
                    <span>${seriesObj.length} series personalizadas</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" style="transition: 0.3s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <div id="detalle-series-${idUnico}" style="display: none; padding-top: 4px; padding-left: 10px; border-left: 2px solid rgba(243, 156, 18, 0.3); margin-top: 4px;">
                    ${seriesObj.map(s => {
            let rirTexto = (s.rir && s.rir !== "0" && s.rir !== "-") ? `(RIR ${s.rir})` : "";
            return `<div style="font-size: 0.75rem; color: #888; margin-bottom: 2px;">Serie ${s.numero}: <span style="color:#555; font-weight:600;">${s.fuerza || "-"}%</span> x ${s.reps || "-"}r ${rirTexto}</div>`;
        }).join('')}
                </div>
            </div>
        `;
    }
}

function toggleSubbloque(idCuerpo, elementoHeader) {
    const cuerpo = document.getElementById(idCuerpo);
    const flecha = elementoHeader.querySelector('.flecha-subbloque');

    if (cuerpo.style.display === "none") {
        cuerpo.style.display = "flex";
        flecha.style.transform = "rotate(180deg)";
    } else {
        cuerpo.style.display = "none";
        flecha.style.transform = "rotate(0deg)";
    }
}

async function abrirListaSubbloques(idInputDestino) {
    inputDestinoEjercicio = idInputDestino;

    const contenedor = document.getElementById("contenedor-botones-ejercicios");
    contenedor.innerHTML = "<p class='text-center text-muted mt-20'>Buscando tus bloques...</p>";

    document.getElementById("contenedor-chips-modal-cat").style.display = "none";
    document.getElementById("contenedor-chips-modal-zona").style.display = "none";

    const contenedorBuscador = document.getElementById("buscador-modal-ejercicios").parentElement;
    contenedorBuscador.style.display = "flex";

    const buscador = document.getElementById("buscador-modal-ejercicios");
    buscador.value = "";
    buscador.placeholder = "Buscar sub-bloque...";

    buscador.onkeyup = function () {
        const textoBusqueda = normalizarTexto(this.value);
        const botones = contenedor.querySelectorAll("button");
        botones.forEach(btn => {
            const nombre = normalizarTexto(btn.innerText);
            btn.style.display = nombre.includes(textoBusqueda) ? "block" : "none";
        });
    };

    document.querySelector("#modal-lista-ejercicios h3").innerText = "Elegí un Sub-bloque";
    document.getElementById("modal-lista-ejercicios").style.display = "flex";

    try {
        let unicos = [];

        if (contextoModalEjercicio === 'pack') {
            if (AppState.packActivoEjercicios && AppState.packActivoEjercicios.length > 0) {
                unicos = [...new Set(AppState.packActivoEjercicios.map(item => item.sub_bloque))]
                    .filter(sb => sb && sb.trim() !== "");
            }
        } else {
            if (!AppState.alumnoSeleccionadoId) throw new Error("No hay alumno seleccionado");

            const { data, error } = await clienteSupabase.from('rutinas_planificadas')
                .select('sub_bloque').eq('alumno_id', AppState.alumnoSeleccionadoId).not('sub_bloque', 'is', null);

            if (error) throw error;

            unicos = [...new Set(data.map(item => item.sub_bloque))]
                .filter(sb => sb && sb.trim() !== "");
        }

        contenedor.innerHTML = "";

        if (unicos.length === 0) {
            contenedor.innerHTML = "<p class='text-center text-muted mt-20'>Aún no creaste sub-bloques acá.</p>";
        } else {
            unicos.forEach(sb => {
                const btn = document.createElement("button");
                btn.style.cssText = "display: block; width: 100%; text-align: left; padding: 14px 15px; margin-bottom: 8px; border-radius: 12px; font-size: 1.05rem; background: #141414; color: #fff; border: 1px solid #262626; cursor: pointer; transition: 0.2s; word-break: break-word; line-height: 1.2;";
                btn.innerText = sb;
                btn.onclick = () => seleccionarEjercicioDesdeLista(sb);
                contenedor.appendChild(btn);
            });
        }
    } catch (e) {
        contenedor.innerHTML = "<p style='text-align:center; color:#e74c3c;'>Error al buscar.</p>";
        console.error(e);
    }
}
function abrirModalListaEjercicios(idInputDestino, idSelectZona) {
    inputDestinoEjercicio = idInputDestino;
    modalIdSelectZona = idSelectZona;

    esContextoPackModal = (contextoModalEjercicio === 'pack');

    const contenedorCat = document.getElementById("contenedor-chips-modal-cat");
    const contenedorZona = document.getElementById("contenedor-chips-modal-zona");

    if (esContextoPackModal) {
        if (contenedorCat) contenedorCat.style.display = "flex";
        modalFiltroCategoria = "Entrenamiento";
    } else {
        if (contenedorCat) contenedorCat.style.display = "none";
        let catActual = "ENTRENAMIENTO";
        if (AppState.categoriaSeleccionada) {
            const cat = AppState.categoriaSeleccionada.toUpperCase();
            if (cat === "MOVILIDAD" || cat === "ENTRADA EN CALOR") catActual = cat;
        }
        modalFiltroCategoria = catActual;
    }

    if (contenedorZona) contenedorZona.style.display = "flex";

    const contenedorBuscador = document.getElementById("buscador-modal-ejercicios").parentElement;
    if (contenedorBuscador) contenedorBuscador.style.display = "flex";

    const buscador = document.getElementById("buscador-modal-ejercicios");
    if (buscador) {
        buscador.placeholder = "Buscar nombre o alias...";
        buscador.onkeyup = filtrarListaEjerciciosModal;
        buscador.value = "";
    }

    const tituloModal = document.querySelector("#modal-lista-ejercicios h3");
    if (tituloModal) tituloModal.innerText = "Elegí un ejercicio";

    const zonaSeleccionada = document.getElementById(idSelectZona)?.value;
    modalFiltroZona = zonaSeleccionada ? zonaSeleccionada : "Todas";

    document.getElementById("modal-lista-ejercicios").style.display = "flex";

    setTimeout(() => {
        renderizarChipsModal();
        aplicarFiltrosListaModal();
    }, 50);
}

function abrirModalListaEjerciciosPack(idInputDestino, idSelectZona) {
    contextoModalEjercicio = 'pack';
    abrirModalListaEjercicios(idInputDestino, idSelectZona);
}

function filtrarListaEjerciciosModal() {
    const textoBusqueda = normalizarTexto(document.getElementById("buscador-modal-ejercicios").value);

    const filtrados = ejerciciosModalTemporales.filter(ej => {
        const nombreNorm = normalizarTexto(ej);
        const aliasStrNorm = normalizarTexto(obtenerAliasPipe(ej));
        return nombreNorm.includes(textoBusqueda) || aliasStrNorm.includes(textoBusqueda);
    });

    renderizarListaEjerciciosModal(filtrados);
}
function renderizarChipsModal() {
    const contenedorCat = document.getElementById("contenedor-chips-modal-cat");
    const contenedorZona = document.getElementById("contenedor-chips-modal-zona");

    if (contenedorCat) {
        contenedorCat.style.scrollbarWidth = "none";
        contenedorCat.style.msOverflowStyle = "none";
    }
    if (contenedorZona) {
        contenedorZona.style.scrollbarWidth = "none";
        contenedorZona.style.msOverflowStyle = "none";
    }

    if (esContextoPackModal) {
        contenedorCat.style.display = "flex";
        const cats = ["Entrenamiento", "Entrada en calor", "Movilidad"];

        let htmlCat = ""; 
        cats.forEach(c => {
            const esActivo = (modalFiltroCategoria.toUpperCase() === c.toUpperCase());
            const claseActivo = esActivo ? "activo" : "";
            htmlCat += `<button class="chip ${claseActivo}" onclick="cambiarCatModal('${c}')" style="white-space: nowrap;">${c}</button>`;
        });
        contenedorCat.innerHTML = htmlCat;
    } else {
        if (contenedorCat) contenedorCat.style.display = "none";
    }

    let zonasDisponibles = [];
    let catRef = modalFiltroCategoria.toUpperCase();
    if (catalogoGlobal[catRef]) {
        zonasDisponibles = Object.keys(catalogoGlobal[catRef]);
    }
    zonasDisponibles.sort();

    const activoTodas = (modalFiltroZona === "Todas" || modalFiltroZona === "") ? "activo" : "";
    let htmlZona = `<button class="chip ${activoTodas}" onclick="cambiarZonaModal('Todas')" style="white-space: nowrap;">Todas</button>`;

    zonasDisponibles.forEach(z => {
        const activo = (modalFiltroZona === z) ? "activo" : "";
        htmlZona += `<button class="chip ${activo}" onclick="cambiarZonaModal('${z}')" style="white-space: nowrap;">${z}</button>`;
    });

    const activoG = (modalFiltroZona === "General") ? "activo" : "";
    htmlZona += `<button class="chip ${activoG}" onclick="cambiarZonaModal('General')" style="white-space: nowrap;">General</button>`;

    if (contenedorZona) contenedorZona.innerHTML = htmlZona;
}

function abrirBottomSheetEjercicio(idEjercicio) {
    ejercicioBSActivo = AppState.ejerciciosActualesCache.find(ej => String(ej.id) === String(idEjercicio));
    if (!ejercicioBSActivo) return;

    const bsContent = document.getElementById("bottom-sheet-content");

    bsContent.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    bsContent.style.transform = '';

    document.getElementById("bs-botones-edicion").style.display = "none";
    document.getElementById("bs-btn-editar").style.display = "flex";

    document.getElementById("bs-titulo").innerText = ejercicioBSActivo.ejercicio_nombre;

    const nombreEj = (ejercicioBSActivo.ejercicio_nombre || "").toUpperCase();
    const descEj = (ejercicioBSActivo.descanso || "").toUpperCase();
    const esAvanzado = nombreEj.includes("EMOM") || nombreEj.includes("AMRAP") || nombreEj.includes("TABATA") || nombreEj.includes("TIMECAP") || nombreEj.includes("TIME CAP") || descEj.includes("_SEG:");

    const bsAlias = document.getElementById("bs-alias");
    if (esAvanzado) {
        bsAlias.style.display = "none"; 
    } else {
        bsAlias.style.display = "block";
        bsAlias.innerText = obtenerListaAliasString(ejercicioBSActivo.ejercicio_nombre);
    }

    const clave = normalizarTexto(ejercicioBSActivo.ejercicio_nombre.trim());
    const nombreOficial = aliasEjercicios[clave] || clave;
    const frames = mapaAnimaciones[nombreOficial];
    const imgWrapper = document.getElementById("bs-imagen-wrapper");

    if (frames) {
        imgWrapper.innerHTML = `<div class="anim-dinamica" style="width: 100%; height: 100%; border-radius: 0; background-size: contain; background-repeat: no-repeat; --img-1: url('${frames[0]}'); --img-2: url('${frames[1]}');"></div>`;
    } else {
        imgWrapper.innerHTML = `<div style="width: 100%; height: 100%; background: #e0e0e0; display:flex; justify-content:center; align-items:center; color:#888;">Sin imagen</div>`;
    }

    const inputDescanso = document.getElementById("bs-input-descanso");
    const inputNotas = document.getElementById("bs-input-notas");

    inputDescanso.value = formatearDescansoVisual(ejercicioBSActivo.descanso) || "Sin descanso";
    inputNotas.value = ejercicioBSActivo.notas || "Sin notas";

    [inputDescanso, inputNotas].forEach(input => {
        input.readOnly = true;
        input.classList.remove("bs-input-modo-edicion");
    });

    const contenedorSeries = document.getElementById("bs-contenedor-series");
    contenedorSeries.innerHTML = "";

    let arraySeries = [];
    try { if (ejercicioBSActivo.series_reps) arraySeries = JSON.parse(ejercicioBSActivo.series_reps); } catch (e) { console.warn("Error JSON en el Bottom Sheet:", e); }

    if (arraySeries.length === 0) {
        contenedorSeries.innerHTML = "<p style='color:#888; font-size:0.8rem;'>No hay series registradas.</p>";
    } else {
        arraySeries.forEach(s => {
            let f = (s.fuerza === "-") ? "" : (s.fuerza || "");
            let r = (s.reps === "-") ? "" : (s.reps || "");
            let ri = (s.rir === "-") ? "" : (s.rir || "");

            contenedorSeries.innerHTML += `
                <div class="fila-serie" style="background: rgba(255,255,255,0.05); border: none;">
                    <span style="color:#f39c12; font-weight:bold; text-align:center;">#${s.numero}</span>
                    <input type="number" class="input-modal bs-input-edit bs-input-serie-fuerza" value="${f}" placeholder="%RM" readonly>
                    <input type="number" class="input-modal bs-input-edit bs-input-serie-reps" value="${r}" placeholder="Reps" readonly>
                    <input type="number" class="input-modal bs-input-edit bs-input-serie-rir" value="${ri}" placeholder="RIR" readonly>
                </div>
            `;
        });
    }

    const overlay = document.getElementById("bottom-sheet-overlay");
    overlay.style.display = "flex";
    setTimeout(() => overlay.classList.add("activo"), 10);
}

function cerrarBottomSheet() {
    const overlay = document.getElementById("bottom-sheet-overlay");
    const bsContent = document.getElementById("bottom-sheet-content");

    overlay.classList.remove("activo");

    setTimeout(() => {
        overlay.style.display = "none";
        bsContent.style.transform = '';
    }, 300);
}

async function guardarEdicionBS() {
    const nombreEj = (ejercicioBSActivo.ejercicio_nombre || "").toUpperCase();
    const descEj = (ejercicioBSActivo.descanso || "").toUpperCase();
    const esAvanzado = nombreEj.includes("EMOM") || nombreEj.includes("AMRAP") || nombreEj.includes("TABATA") || nombreEj.includes("TIMECAP") || nombreEj.includes("TIME CAP") || descEj.includes("_SEG:");


    const nuevoDescanso = esAvanzado ? ejercicioBSActivo.descanso : document.getElementById("bs-input-descanso").value;

    const nuevasNotas = document.getElementById("bs-input-notas").value;

    let nuevasSeries = [];
    const filasSeries = document.querySelectorAll("#bs-contenedor-series .fila-serie");
    filasSeries.forEach((fila, index) => {
        let f = fila.querySelector('.bs-input-serie-fuerza').value;
        let rep = fila.querySelector('.bs-input-serie-reps').value;
        let r = fila.querySelector('.bs-input-serie-rir').value;
        nuevasSeries.push({ numero: index + 1, fuerza: f, reps: rep, rir: r });
    });

    try {
        const { error } = await clienteSupabase
            .from('rutinas_planificadas')
            .update({
                descanso: nuevoDescanso,
                notas: nuevasNotas,
                series_reps: JSON.stringify(nuevasSeries)
            })
            .eq('id', ejercicioBSActivo.id);

        if (error) throw error;

        cerrarBottomSheet();
        cargarEjerciciosCategoriaBD();
        mostrarAlerta("Éxito", "Los cambios se guardaron correctamente.");

    } catch (e) {
        mostrarAlerta("Error", "No se pudo guardar la edición.");
    }
}

const bsDragArea = document.getElementById('bs-drag-area');
const bsContent = document.getElementById('bottom-sheet-content');

bsDragArea.addEventListener('touchstart', (e) => {
    startYBS = e.touches[0].clientY;
    isDraggingBS = true;
    bsContent.style.transition = 'none';
}, { passive: true });

bsDragArea.addEventListener('touchmove', (e) => {
    if (!isDraggingBS) return;
    currentYBS = e.touches[0].clientY;
    const dif = currentYBS - startYBS;
    if (dif > 0) {
        bsContent.style.transform = `translateY(${dif}px)`;
    }
}, { passive: true });

bsDragArea.addEventListener('touchend', () => {
    if (!isDraggingBS) return;
    isDraggingBS = false;

    const dif = currentYBS - startYBS;
    bsContent.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';

    if (dif > 100) {
        bsContent.style.transform = `translateY(100%)`;
        cerrarBottomSheet();
    } else {
        bsContent.style.transform = '';
    }
});

function abrirImagenFullscreen() {
    const visor = document.getElementById("visor-fullscreen");
    const contenedorImg = document.getElementById("fullscreen-img-container");

    contenedorImg.innerHTML = document.getElementById("bs-imagen-wrapper").innerHTML;

    contenedorImg.style.aspectRatio = "1 / 1";
    contenedorImg.style.width = "100%";

    visor.style.display = "flex";
}

function cerrarImagenFullscreen() {
    document.getElementById("visor-fullscreen").style.display = "none";
}

function abrirImagenFullscreenDirecto(elementoImg, event) {
    if (event) event.stopPropagation();

    const visor = document.getElementById("visor-fullscreen");
    const contenedorImg = document.getElementById("fullscreen-img-container");

    contenedorImg.innerHTML = "";

    const clon = elementoImg.cloneNode(true);

    clon.removeAttribute("onclick");
    clon.style.width = "100%";
    clon.style.height = "100%";
    clon.style.borderRadius = "16px";

    contenedorImg.appendChild(clon);
    contenedorImg.style.aspectRatio = "1 / 1";
    contenedorImg.style.width = "100%";

    visor.style.display = "flex";
}

function generarMinutosEmom() {
    const valorTotal = document.getElementById('input-emom-minutos')?.value || "00:00";
    const valorIntervalo = document.getElementById('input-emom-intervalo')?.value || "01:00";
    
    let segundosTotales = parsearTiempoAsegundos(valorTotal);
    let segundosIntervalo = parsearTiempoAsegundos(valorIntervalo);

    if (segundosTotales > 600) {
        mostrarAlerta("Límite superado", "El tiempo máximo de entrenamiento es de 10 minutos.");
        segundosTotales = 600;
        document.getElementById('input-emom-minutos').value = "10:00";
    }
    
    if (segundosIntervalo <= 0) segundosIntervalo = 60;

    const cantidad = Math.ceil(segundosTotales / segundosIntervalo);
    const contenedor = document.getElementById('contenedor-minutos-emom');

    if (cantidad <= 0) {
        contenedor.innerHTML = '';
        document.getElementById('botones-modal-emom').style.display = 'none';
        return;
    }

    let ejerciciosGuardadosTemp = [];
    const cajasExistentes = contenedor.querySelectorAll('.caja-minuto-emom');
    cajasExistentes.forEach((caja) => {
        ejerciciosGuardadosTemp.push({
            ejercicio: caja.querySelector('.input-ejercicio-emom')?.value || "",
            reps: caja.querySelector('.input-reps-emom')?.value || "",
            rm: caja.querySelector('.input-rm-emom')?.value || "",
            rir: caja.querySelector('.input-rir-emom')?.value || ""
        });
    });

    let htmlFinal = '';
    
    const restoSegundos = segundosTotales % segundosIntervalo; 
    

    const usaBloques = segundosIntervalo > 60;
    const etiquetaBase = usaBloques ? 'Bloque' : 'Minuto';

    for (let i = 1; i <= cantidad; i++) {
        const inputId = `input-emom-ej-${i}`;
        const datosPrevios = ejerciciosGuardadosTemp[i - 1] || { ejercicio: "", reps: "", rm: "", rir: "" };

        let tiempoBloque = segundosIntervalo;
        let textoTitulo = `${etiquetaBase} ${i}`;

        if (i === cantidad && restoSegundos !== 0) {
            tiempoBloque = restoSegundos;
            textoTitulo = `${etiquetaBase} ${i} (Resto)`;
        }

        htmlFinal += `
            <div class="caja-minuto-emom">
                <h5>${textoTitulo} <span style="font-weight:normal; font-size:0.8em; color:#888;">(${formatearTiempo(tiempoBloque)} min)</span></h5>
                <div style="display: flex; gap: 8px; margin-bottom: 5px;">
                    <input class="input-modal input-ejercicio-emom flex-1 m-0" type="text" id="${inputId}" value="${datosPrevios.ejercicio}" placeholder="Ejercicio...">
                    <button class="btn-guardar p-0-15 m-0 bg-ff9900" type="button" onclick="abrirModalListaEjercicios('${inputId}', 'select-ej-zona')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                </div>
                <div class="fila-datos-emom">
                    <input type="number" class="input-modal input-reps-emom" value="${datosPrevios.reps}" placeholder="Reps">
                        <input type="number" class="input-modal input-rm-emom" value="${datosPrevios.rm}" placeholder="% RM">
                    <input type="number" class="input-modal input-rir-emom" value="${datosPrevios.rir}" placeholder="RIR">
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = htmlFinal;
    document.getElementById('botones-modal-emom').style.display = 'flex';
}

async function guardarCircuitoAvanzado(tipo) {
    const prefijo = tipo;

    let tiempoSeg = 0;
    let prepSeg = parsearTiempoAsegundos(document.getElementById(`input-${prefijo}-prep`)?.value || "00:00");
    let descansoSeg = parsearTiempoAsegundos(document.getElementById(`input-${prefijo}-descanso`)?.value || "00:00");

    let codigoFases = "";
    let txtTiempo = "";


    if (tipo === 'tabata') {
        const trabajo = parsearTiempoAsegundos(document.getElementById('input-tabata-trabajo').value);
        const pausa = parsearTiempoAsegundos(document.getElementById('input-tabata-pausa').value);
        const rondas = parseInt(document.getElementById('input-tabata-rondas').value) || 8;
        
        if (trabajo <= 0) { mostrarAlerta("Faltan datos", "El tiempo de trabajo no puede ser 0."); return; }
        
        tiempoSeg = (trabajo + pausa) * rondas;
        txtTiempo = `${rondas} RNDS`;
        codigoFases = `PREP_SEG:${prepSeg}|TABATA_SEG:${tiempoSeg}|WORK_SEG:${trabajo}|REST_SEG:${pausa}|RNDS:${rondas}|DESC_SEG:${descansoSeg}`;
    } else {
        tiempoSeg = parsearTiempoAsegundos(document.getElementById(`input-${prefijo}-minutos`).value);
        if (tiempoSeg <= 0) { mostrarAlerta("Faltan datos", "El tiempo total no puede ser cero."); return; }
        txtTiempo = formatearTiempo(tiempoSeg);

        const tagTiempo = tipo === 'emom' ? 'EMOM_SEG' : (tipo === 'timecap' ? 'TIMECAP_SEG' : 'AMRAP_SEG');
        
        if (tipo === 'emom') {
            const inputInt = document.getElementById('input-emom-intervalo');
            const intervaloSeg = inputInt ? parsearTiempoAsegundos(inputInt.value) : 60;
            codigoFases = `PREP_SEG:${prepSeg}|${tagTiempo}:${tiempoSeg}|INT_SEG:${intervaloSeg}|DESC_SEG:${descansoSeg}`;
        } else {
            codigoFases = `PREP_SEG:${prepSeg}|${tagTiempo}:${tiempoSeg}|DESC_SEG:${descansoSeg}`;
        }
    }


    let arraySeries = [];
    const selectorCajas = tipo === 'emom' ? '#contenedor-minutos-emom .caja-minuto-emom' : `#contenedor-ejercicios-${prefijo} .fila-${prefijo}`;
    const cajas = document.querySelectorAll(selectorCajas);
    let tieneAlmenosUnEjercicio = false;

    cajas.forEach((caja, index) => {
        const nombreEj = caja.querySelector(`.input-ejercicio-${prefijo}`).value.trim();
        const reps = caja.querySelector(`.input-reps-${prefijo}`)?.value || "";
        const rm = caja.querySelector(`.input-rm-${prefijo}`)?.value || "";
        const rir = caja.querySelector(`.input-rir-${prefijo}`)?.value || "";

        if ((tipo === 'amrap' || tipo === 'timecap' || tipo === 'tabata') && nombreEj === "") return;

        if (nombreEj !== "") tieneAlmenosUnEjercicio = true;
        const nombreFinal = nombreEj || "Libre / Descanso";
        arraySeries.push({ numero: index + 1, ejercicio: nombreFinal, fuerza: rm, reps: reps, rir: rir });
    });

    if (!tieneAlmenosUnEjercicio) {
        mostrarAlerta("Faltan datos", `Escribí al menos un ejercicio para guardar el ${tipo.toUpperCase()}.`);
        return;
    }

    const btnGuardar = document.getElementById(`btn-guardar-${prefijo}`);
    if (btnGuardar) btnGuardar.innerText = "Guardando...";

    let subbloqueIngresado = document.getElementById(`input-${prefijo}-subbloque`).value.trim();
    let notasProfe = document.getElementById(`input-${prefijo}-notas`).value.trim();
    const seriesRepsTexto = JSON.stringify(arraySeries);

    let nombrePersonalizado = document.getElementById(`input-${prefijo}-nombre`)?.value.trim() || "";
    const nombreEjercicio = nombrePersonalizado !== "" ? nombrePersonalizado : `${tipo.toUpperCase()} - ${txtTiempo}`;


    if (contextoModalEjercicio === 'pack') {
        let nuevoEj = { zona: 'General', nombre: nombreEjercicio, series: seriesRepsTexto, descanso: codigoFases, sub_bloque: subbloqueIngresado || null, notas: notasProfe || null };

        if (AppState.ejercicioPackEditandoIndex !== null) { AppState.packActivoEjercicios[AppState.ejercicioPackEditandoIndex] = nuevoEj; } 
        else { AppState.packActivoEjercicios.push(nuevoEj); }

        try {
            await clienteSupabase.from('packs_rutinas').update({ ejercicios: AppState.packActivoEjercicios }).eq('id', AppState.packActivoId);
            if (btnGuardar) btnGuardar.innerText = `Guardar ${tipo.toUpperCase()}`;
            toggleModal('modal-ejercicio', false);
            AppState.ejercicioPackEditandoIndex = null;
            cargarEjerciciosDePack();
            mostrarAlerta("¡Éxito!", `Entrenamiento guardado en el pack.`);
        } catch (e) {
            if (btnGuardar) btnGuardar.innerText = `Guardar ${tipo.toUpperCase()}`;
            mostrarAlerta("Error", e.message);
        }
        return;
    }


    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias) { dias = AppState.alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[AppState.diaActivo - 1];

    try {
        if (AppState.ejercicioEditandoId) {
            await clienteSupabase.from('rutinas_planificadas').update({
                ejercicio_nombre: nombreEjercicio, series_reps: seriesRepsTexto, descanso: codigoFases, sub_bloque: subbloqueIngresado || null, notas: notasProfe || null
            }).eq('id', AppState.ejercicioEditandoId);

            if (AppState.relojEstado !== 'corriendo') AppState.relojActivoId = AppState.ejercicioEditandoId;
        } else {
            const { data: insertado, error } = await clienteSupabase.from('rutinas_planificadas').insert([{
                alumno_id: AppState.alumnoSeleccionadoId, dia_semana: diaSeleccionado, semana: AppState.semanaActiva,
                categoria: AppState.categoriaSeleccionada, zona_muscular: 'General', ejercicio_nombre: nombreEjercicio,
                series_reps: seriesRepsTexto, fuerza: null, descanso: codigoFases, orden: 999, sub_bloque: subbloqueIngresado || null, notas: notasProfe || null
            }]).select();

            if (error) throw error;
            if (insertado && insertado.length > 0 && AppState.relojEstado !== 'corriendo') AppState.relojActivoId = insertado[0].id;
        }

        if (AppState.relojEstado !== 'corriendo') {
            if (AppState.intervaloReloj) clearInterval(AppState.intervaloReloj);
            AppState.intervaloReloj = null; AppState.relojEstado = 'detenido'; AppState.relojFases = [];
        }

        AppState.ejercicioEditandoId = null;
        toggleModal('modal-ejercicio', false);
        cargarEjerciciosCategoriaBD();

        if (btnGuardar) btnGuardar.innerText = `Guardar ${tipo.toUpperCase()}`;
        mostrarAlerta("¡Éxito!", `Entrenamiento guardado.`);
    } catch (e) {
        if (btnGuardar) btnGuardar.innerText = `Guardar ${tipo.toUpperCase()}`;
        mostrarAlerta("Error", e.message);
    }
}

function abrirConfiguracionAvanzada(modalidad) {
    document.getElementById('seleccion-modalidad').style.display = 'none';


    ['emom', 'amrap', 'tabata', 'timecap'].forEach(tipo => {
        document.getElementById(`configuracion-${tipo}`).style.display = 'none';
        document.getElementById(`botones-modal-${tipo}`).style.display = 'none';
    });


    document.getElementById(`configuracion-${modalidad}`).style.display = 'block';
    document.getElementById(`botones-modal-${modalidad}`).style.display = 'flex';


    if (modalidad !== 'emom') {
        const contenedor = document.getElementById(`contenedor-ejercicios-${modalidad}`);
        if (contenedor && contenedor.children.length === 0) {
            agregarFilaAvanzada(modalidad);
        }
    }
}

function abrirModalEjercicioPack() {
    AppState.ejercicioPackEditandoIndex = null;
    abrirModalEjercicio('pack');
}

function abrirModalEditarEjercicioPack(index) {
    AppState.ejercicioPackEditandoIndex = index;
    const ej = AppState.packActivoEjercicios[index];
    abrirModalEditar(index, ej.zona, ej.nombre, ej.series, null, ej.descanso, ej.sub_bloque, ej.notas, 'pack');
}

async function dibujarCategoriasAlumno() {
    const contenedor = document.getElementById("lista-categorias-rutina");
    contenedor.innerHTML = "<p class='text-center text-muted fs-90 mt-20'>Cargando barras...</p>";

    let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.categorias_rutina) {
        categorias = AppState.alumnoDataActual.categorias_rutina;
    }

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias) { dias = AppState.alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[AppState.diaActivo - 1];

    try {
        const { data: ejercicios } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('categoria')
            .eq('alumno_id', AppState.alumnoSeleccionadoId)
            .eq('dia_semana', diaSeleccionado)
            .eq('semana', AppState.semanaActiva);

        let htmlFinal = "";

        categorias.forEach(cat => {
            let cantidad = 0;
            if (ejercicios) {
                cantidad = ejercicios.filter(e => {
                    if (cat.toUpperCase() === 'ENTRENAMIENTO') return !e.categoria || e.categoria === cat;
                    return e.categoria === cat;
                }).length;
            }

            let iconoHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

            if (cat.toUpperCase() === "MOVILIDAD") {
                iconoHTML = `<img src="./imagenes/MOVILIDAD.webp" class="img-cat-rutina" alt="Movilidad">`;
            }
            if (cat.toUpperCase() === "ENTRADA EN CALOR") {
                iconoHTML = `<img src="./imagenes/ENTRADAENCALOR.webp" class="img-cat-rutina" alt="Entrada en calor">`;
            }
            if (cat.toUpperCase() === "ENTRENAMIENTO") {
                iconoHTML = `<img src="./imagenes/ENTRENAMIENTO.webp" class="img-cat-rutina" alt="Entrenamiento">`;
            }

            htmlFinal += UI_TarjetaCategoria(cat, cantidad, iconoHTML);
        });

        contenedor.innerHTML = htmlFinal;

    } catch (e) { console.error(e); }
}

function abrirCategoria(nombreCategoria) {
    AppState.categoriaSeleccionada = nombreCategoria;
    document.getElementById('titulo-categoria-activa').innerText = nombreCategoria.toUpperCase();


    const vistaEjercicios = document.getElementById('vista-ejercicios');
    vistaEjercicios.style.height = 'auto';
    vistaEjercicios.style.overflow = 'visible';

    document.getElementById('track-slider-rutinas').style.transform = 'translateX(-50%)';
    AppState.vistaSliderActual = 'ejercicios';
    cargarEjerciciosCategoriaBD();


    setTimeout(() => {
        document.getElementById('vista-categorias').style.height = '0px';
        document.getElementById('vista-categorias').style.overflow = 'hidden';
    }, 350);
}

function cerrarCategoria() {
    AppState.categoriaSeleccionada = null;


    const vistaCategorias = document.getElementById('vista-categorias');
    vistaCategorias.style.height = 'auto';
    vistaCategorias.style.overflow = 'visible';

    document.getElementById('track-slider-rutinas').style.transform = 'translateX(0%)';
    AppState.vistaSliderActual = 'categorias';
    dibujarCategoriasAlumno();


    setTimeout(() => {
        document.getElementById('vista-ejercicios').style.height = '0px';
        document.getElementById('vista-ejercicios').style.overflow = 'hidden';
    }, 350);
}

function accionBotonFabInteligente() {
    if (AppState.vistaSliderActual === 'categorias') {
        document.getElementById('input-nueva-categoria').value = '';
        document.getElementById('modal-categoria').style.display = 'flex';
    } else {
        abrirModalEjercicio();
    }
}

async function guardarNuevaCategoriaBD() {
    const nuevaCat = document.getElementById('input-nueva-categoria').value.trim();
    if (!nuevaCat) return;

    let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.categorias_rutina) { categorias = AppState.alumnoDataActual.categorias_rutina; }

    categorias.push(nuevaCat);
    AppState.alumnoDataActual.categorias_rutina = categorias;

    document.getElementById('modal-categoria').style.display = 'none';
    dibujarCategoriasAlumno();

    try { await clienteSupabase.from('alumnos').update({ categorias_rutina: categorias }).eq('id', AppState.alumnoSeleccionadoId); }
    catch (e) { console.error(e); }
}

async function borrarCategoriaActiva() {
    document.getElementById('modal-opciones-categoria').style.display = 'none';
    pedirConfirmacion("Borrar Categoría", `¿Seguro que querés borrar '${AppState.categoriaOpcionesActiva}' y TODOS sus ejercicios adentro?`, "Borrar", async () => {
        let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
        if (AppState.alumnoDataActual && AppState.alumnoDataActual.categorias_rutina) { categorias = AppState.alumnoDataActual.categorias_rutina; }

        categorias = categorias.filter(c => c !== AppState.categoriaOpcionesActiva);
        AppState.alumnoDataActual.categorias_rutina = categorias;
        dibujarCategoriasAlumno();

        try {
            await clienteSupabase.from('alumnos').update({ categorias_rutina: categorias }).eq('id', AppState.alumnoSeleccionadoId);
            await clienteSupabase.from('rutinas_planificadas').delete().eq('alumno_id', AppState.alumnoSeleccionadoId).eq('categoria', AppState.categoriaOpcionesActiva);
        } catch (e) { console.error(e); }
    });
}

function editarNombreCategoria() {
    document.getElementById('modal-opciones-categoria').style.display = 'none';
    document.getElementById('input-renombrar-categoria').value = AppState.categoriaOpcionesActiva;
    document.getElementById('modal-renombrar-categoria').style.display = 'flex';
}

async function guardarRenombrarCategoriaBD() {
    const nuevoNombre = document.getElementById('input-renombrar-categoria').value.trim();


    if (!nuevoNombre || nuevoNombre === "" || nuevoNombre.toUpperCase() === AppState.categoriaOpcionesActiva.toUpperCase()) {
        document.getElementById('modal-renombrar-categoria').style.display = 'none';
        return;
    }

    document.getElementById('modal-renombrar-categoria').style.display = 'none';

    let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];

    if (AppState.alumnoDataActual && AppState.alumnoDataActual.categorias_rutina) {
        categorias = AppState.alumnoDataActual.categorias_rutina;
    }

    const index = categorias.indexOf(AppState.categoriaOpcionesActiva);
    if (index !== -1) categorias[index] = nuevoNombre;

    AppState.alumnoDataActual.categorias_rutina = categorias;

    try {

        await clienteSupabase.from('alumnos').update({ categorias_rutina: categorias }).eq('id', AppState.alumnoSeleccionadoId);
        await clienteSupabase.from('rutinas_planificadas').update({ categoria: nuevoNombre }).eq('alumno_id', AppState.alumnoSeleccionadoId).eq('categoria', AppState.categoriaOpcionesActiva);


        dibujarCategoriasAlumno();

    } catch (e) {
        console.error(e);
    }
}

function abrirModalEditarPack(id, nombreActual) {
    AppState.packAEditarId = id;
    document.getElementById("input-edit-pack-nombre").value = nombreActual;
    document.getElementById("modal-editar-pack").style.display = "flex";
}

async function guardarEdicionPack() {
    const nuevoNombre = document.getElementById("input-edit-pack-nombre").value.trim();

    if (!nuevoNombre) {
        mostrarAlerta("Faltan datos", "El nombre de la rutina no puede estar vacío.");
        return;
    }

    try {
        const { error } = await clienteSupabase
            .from('packs_rutinas')
            .update({ nombre: nuevoNombre })
            .eq('id', AppState.packAEditarId);

        if (error) throw error;

        toggleModal('modal-editar-pack', false);
        cargarPacks();

        if (AppState.packActivoId === AppState.packAEditarId) {
            const tituloDetalle = document.getElementById("detalle-nombre-pack");
            if (tituloDetalle) tituloDetalle.innerText = nuevoNombre;
        }

    } catch (e) {
        mostrarAlerta("Error", "No se pudo actualizar el nombre.");
        console.error(e);
    }
}

function borrarPack(idPack) {
    pedirConfirmacion("Eliminar", "¿Seguro que querés eliminar esta rutina?", "Eliminar", async () => {
        try { await clienteSupabase.from('packs_rutinas').delete().eq('id', idPack); cargarPacks(); }
        catch (e) { mostrarAlerta("Error", e.message); }
    });
}

function abrirModalCrearPack() {
    document.getElementById("input-pack-nombre").value = "";
    document.getElementById("modal-crear-pack").style.display = "flex";
}

async function guardarPackNuevo() {
    const nombre = document.getElementById("input-pack-nombre").value.trim();
    if (!nombre) return;
    try {
        await clienteSupabase.from('packs_rutinas').insert([{ profesor_id: AppState.profeActivoId, nombre: nombre, ejercicios: [] }]);
        toggleModal('modal-crear-pack', false);
        cargarPacks();
    } catch (e) {
        console.error(e);
    }
}

async function cargarEjerciciosDePack() {
    const contenedor = document.getElementById("lista-ejercicios-pack");
    try {
        const { data, error } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', AppState.packActivoId).single();
        if (error) throw error;

        AppState.packActivoEjercicios = data.ejercicios || [];
        contenedor.innerHTML = "";

        if (AppState.packActivoEjercicios.length === 0) {
            contenedor.innerHTML = "<p class='text-center text-muted fs-90 mt-30'>No hay ejercicios en esta rutina.</p>";
            return;
        }

        const grupos = {};
        AppState.packActivoEjercicios.forEach((ej, index) => {
            ej.originalIndex = index;
            const nombreGrupo = ej.sub_bloque || "Sin agrupar";
            if (!grupos[nombreGrupo]) grupos[nombreGrupo] = [];
            grupos[nombreGrupo].push(ej);
        });

        let htmlFinal = "";

        const generarTarjetaPack = (ej) => {
            window.ejercicioRenderizando = ej;
            return UI_TarjetaEjercicioPack(ej);
        };

        if (grupos["Sin agrupar"]) {
            htmlFinal += `<div class="subbloque-contenedor" data-sub="Sin agrupar">`;
            grupos["Sin agrupar"].forEach(ej => htmlFinal += generarTarjetaPack(ej));
            htmlFinal += `</div>`;
            delete grupos["Sin agrupar"];
        }

        for (const [nombreSub, ejsDelSub] of Object.entries(grupos)) {
            const idAcordeon = 'acordeon-pack-' + nombreSub.replace(/[^a-zA-Z0-9]/g, '-');
            let htmlEjerciciosDelSubbloque = "";


            ejsDelSub.forEach(ej => htmlEjerciciosDelSubbloque += generarTarjetaPack(ej));


            htmlFinal += UI_Subbloque(idAcordeon, nombreSub, ejsDelSub.length, htmlEjerciciosDelSubbloque);
        }

        contenedor.innerHTML = htmlFinal;

        document.querySelectorAll('#lista-ejercicios-pack .subbloque-contenedor').forEach(cont => {
            new Sortable(cont, {
                group: 'pack-compartido',
                animation: 200, delay: 200, delayOnTouchOnly: true, filter: ".acciones-ejercicio svg", preventOnFilter: false,
                chosenClass: "tarjeta-arrastrando", ghostClass: "tarjeta-indicador-caida",
                onEnd: function () { guardarOrdenYSubbloquePack(); }
            });
        });

    } catch (e) { console.error(e); }
}

async function guardarOrdenYSubbloquePack() {
    const contenedores = document.querySelectorAll('#lista-ejercicios-pack .subbloque-contenedor');
    const nuevoArregloEjercicios = [];

    contenedores.forEach(contenedor => {
        let nombreSub = contenedor.getAttribute('data-sub');
        if (nombreSub === "Sin agrupar") nombreSub = null;

        const tarjetas = contenedor.querySelectorAll('.card-ejercicio');
        tarjetas.forEach(tarjeta => {
            const indiceOriginal = tarjeta.getAttribute('data-index');

            if (indiceOriginal !== null && AppState.packActivoEjercicios[indiceOriginal]) {
                const ej = { ...AppState.packActivoEjercicios[indiceOriginal] };
                ej.sub_bloque = nombreSub;
                nuevoArregloEjercicios.push(ej);
            }
        });
    });

    AppState.packActivoEjercicios = nuevoArregloEjercicios;

    try {
        await clienteSupabase.from('packs_rutinas')
            .update({ ejercicios: AppState.packActivoEjercicios })
            .eq('id', AppState.packActivoId);

        cargarEjerciciosDePack();
    } catch (error) {
        console.error("Error al guardar el nuevo orden del pack:", error.message);
    }
}

function renderizarListaEjerciciosModal(lista) {
    const contenedor = document.getElementById("contenedor-botones-ejercicios");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p class='text-center text-muted mt-20'>No se encontraron ejercicios.</p>";
        return;
    }

    lista.forEach(ej => {
        const aliasStr = obtenerAliasPipe(ej);
        const animacionHTML = obtenerAnimacionHTML(ej);

        const btn = document.createElement("div");
        btn.className = "item-lista-ejercicio";
        btn.onclick = () => seleccionarEjercicioDesdeLista(ej);

        btn.innerHTML = `
            ${animacionHTML}
            <div class="info-item-ejercicio">
                <h4>${ej}</h4>
                ${aliasStr ? `<p>${aliasStr}</p>` : ''}
            </div>
        `;
        contenedor.appendChild(btn);
    });
}

function cambiarCatModal(cat) {
    modalFiltroCategoria = cat;
    modalFiltroZona = "Todas";

    renderizarChipsModal();
    aplicarFiltrosListaModal();
}

function cambiarZonaModal(zona) {
    modalFiltroZona = zona;
    renderizarChipsModal();
    aplicarFiltrosListaModal();

    if (modalIdSelectZona) {
        const selectEl = document.getElementById(modalIdSelectZona);
        if (selectEl) {
            if (zona === "Todas") {
                selectEl.value = "";
            } else {
                let optionExists = Array.from(selectEl.options).some(opt => opt.value === zona);
                if (!optionExists) {
                    selectEl.innerHTML += `<option value="${zona}">${zona}</option>`;
                }
                selectEl.value = zona;
            }
        }
    }
}

function aplicarFiltrosListaModal() {
    let ejercicios = [];
    let cat = modalFiltroCategoria.toUpperCase();

    if (catalogoGlobal[cat]) {
        let zonasAConsiderar = [];

        if (modalFiltroZona === "Todas" || modalFiltroZona === "General" || modalFiltroZona === "") {
            zonasAConsiderar = Object.keys(catalogoGlobal[cat]);
        } else {
            if (catalogoGlobal[cat][modalFiltroZona]) {
                zonasAConsiderar = [modalFiltroZona];
            }
        }

        zonasAConsiderar.forEach(z => {
            catalogoGlobal[cat][z].forEach(ej => {
                if (!ejercicios.includes(ej)) ejercicios.push(ej);
            });
        });
    }

    ejercicios.sort();
    ejerciciosModalTemporales = ejercicios;

    filtrarListaEjerciciosModal();
}

function seleccionarEjercicioDesdeLista(nombreEjercicio) {
    document.getElementById(inputDestinoEjercicio).value = nombreEjercicio;
    document.getElementById("modal-lista-ejercicios").style.display = "none";


    if (inputDestinoEjercicio.includes('profe') && typeof guardarConfigRelojProfe === 'function') {
        guardarConfigRelojProfe();
    }
}

function borrarEjercicioDePack(index) {
    pedirConfirmacion(
        "Borrar Ejercicio",
        "¿Seguro que querés quitar este ejercicio del pack?",
        "Borrar",
        async () => {
            try {

                AppState.packActivoEjercicios.splice(index, 1);


                const { error } = await clienteSupabase
                    .from('packs_rutinas')
                    .update({ ejercicios: AppState.packActivoEjercicios })
                    .eq('id', AppState.packActivoId);

                if (error) throw error;


                cargarEjerciciosDePack();

            } catch (error) {
                mostrarAlerta("Error", "No se pudo borrar el ejercicio: " + error.message);
            }
        }
    );
}

function activarEdicionBS() {
    document.getElementById("bs-btn-editar").style.display = "none";
    document.getElementById("bs-botones-edicion").style.display = "flex";


    const nombreEj = (ejercicioBSActivo.ejercicio_nombre || "").toUpperCase();
    const descEj = (ejercicioBSActivo.descanso || "").toUpperCase();
    const esAvanzado = nombreEj.includes("EMOM") || nombreEj.includes("AMRAP") || nombreEj.includes("TABATA") || nombreEj.includes("TIMECAP") || nombreEj.includes("TIME CAP") || descEj.includes("_SEG:");

    document.querySelectorAll('.bs-input-edit').forEach(input => {


        if (input.id === "bs-input-descanso" && esAvanzado) {
            return;
        }


        input.readOnly = false;
        input.classList.add("bs-input-modo-edicion");
    });
}

function cancelarEdicionBS() {
    abrirBottomSheetEjercicio(ejercicioBSActivo.id);
}

function toggleAvanzadas() {
    const checkbox = document.getElementById("checkFuncionesAvanzadas");
    const contenedorAvanzado = document.getElementById("contenedorAvanzado");
    const contenedorNormal = document.getElementById("contenedor-ejercicio-normal");
    const botonesNormales = document.getElementById("botones-modal-normales");

    if (checkbox.checked) {
        contenedorAvanzado.style.display = "block";
        contenedorNormal.style.display = "none";
        botonesNormales.style.display = "none";
    } else {
        contenedorAvanzado.style.display = "none";
        contenedorNormal.style.display = "block";
        botonesNormales.style.display = "flex";
    }
}


function volverSeleccionModalidad() {
    ['emom', 'amrap', 'tabata', 'timecap'].forEach(tipo => {
        document.getElementById(`configuracion-${tipo}`).style.display = 'none';
    });
    document.getElementById('seleccion-modalidad').style.display = 'block';
    if (typeof detenerRelojGlobal === 'function') detenerRelojGlobal();
}


function agregarFilaAvanzada(tipo, datosPrevios = { ejercicio: "", reps: "", rm: "", rir: "" }) {
    const contenedor = document.getElementById(`contenedor-ejercicios-${tipo}`);
    const idUnico = Date.now() + Math.floor(Math.random() * 1000);
    const inputId = `input-${tipo}-ej-${idUnico}`;

    const html = `
        <div class="caja-minuto-emom fila-${tipo} mb-5 position-relative">
            <div class="d-flex gap-8 mb-5 align-center">
                <button type="button" onclick="eliminarFilaAvanzada(this, '${tipo}')" class="bg-none border-none text-danger cursor-pointer px-5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <input class="input-modal input-ejercicio-${tipo} flex-1 m-0" type="text" id="${inputId}" value="${datosPrevios.ejercicio}" placeholder="Ejercicio...">
                <button class="btn-guardar p-0-15 m-0 bg-ff9900" type="button" onclick="abrirModalListaEjercicios('${inputId}', 'select-ej-zona')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
            </div>
            <div class="fila-datos-emom pl-36">
                <input type="number" class="input-modal input-reps-${tipo}" value="${datosPrevios.reps}" placeholder="Reps">
                <input type="number" class="input-modal input-rm-${tipo}" value="${datosPrevios.rm}" placeholder="% RM">
                <input type="number" class="input-modal input-rir-${tipo}" value="${datosPrevios.rir}" placeholder="RIR">
            </div>
        </div>
    `;
    contenedor.insertAdjacentHTML('beforeend', html);
}

function eliminarFilaAvanzada(btn, tipo) {
    pedirConfirmacion("Eliminar", "¿Seguro que querés quitar este ejercicio?", "Eliminar", () => {
        const fila = btn.closest(`.fila-${tipo}`);
        if (fila) fila.remove();
    });
}

function extraerSeriesDelModal(tipo) {
    const contenedor = document.getElementById('contenedor-filas-series');
    const filas = contenedor.querySelectorAll('.fila-serie');
    let arraySeries = [];

    if (filas.length === 1) {
        const fila = filas[0];
        let cant = parseInt(fila.querySelector('.input-serie-numero').value) || 1;
        let fuerzaVal = fila.querySelector('.input-serie-fuerza').value || "0";
        let repsVal = fila.querySelector('.input-serie-reps').value || "0";
        let rirVal = fila.querySelector('.input-serie-rir').value || "0";

        for (let i = 1; i <= cant; i++) {
            arraySeries.push({ numero: i, fuerza: fuerzaVal, reps: repsVal, rir: rirVal });
        }
    } else {
        filas.forEach((fila, index) => {
            let numSerie = fila.querySelector('.input-serie-numero').value || (index + 1);
            let fuerzaVal = fila.querySelector('.input-serie-fuerza').value || "0";
            let repsVal = fila.querySelector('.input-serie-reps').value || "0";
            let rirVal = fila.querySelector('.input-serie-rir').value || "0";
            arraySeries.push({ numero: parseInt(numSerie), fuerza: fuerzaVal, reps: repsVal, rir: rirVal });
        });
    }
    return JSON.stringify(arraySeries);
}



function sumarSerieSimple(tipo) {
    const prefijoInput = tipo === 'pack' ? 'input-pack-simple' : 'input-simple';
    const inputCant = document.getElementById(prefijoInput + '-cant');
    inputCant.value = (parseInt(inputCant.value) || 0) + 1;
}

function inicializarModalSeries(tipo, arraySeries) {
    const idContenedor = 'contenedor-filas-series';
    const contenedor = document.getElementById(idContenedor);
    contenedor.innerHTML = "";

    const boton = document.getElementById('btn-toggle-series-rutina');

    if (!arraySeries || arraySeries.length === 0) {
        contenedor.innerHTML = `
            <div class="fila-serie">
                <input class="input-serie-numero input-modal text-center py-8 px-2" type="number" value="1">
                <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
                <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
                <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
                <button type="button" class="btn-eliminar-serie" aria-label="Eliminar serie" onclick="eliminarFilaSerie(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        if (boton) {
            boton.setAttribute('data-modo', 'unificado');
            boton.style.background = 'rgba(243, 156, 18, 0.1)';
            boton.style.color = '#f39c12';
            boton.style.borderColor = 'rgba(243, 156, 18, 0.3)';
            boton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="align-middle mr-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Modificar individualmente cada serie
            `;
        }
        return;
    }

    let sonIguales = true;
    const s1 = arraySeries[0];
    for (let i = 1; i < arraySeries.length; i++) {
        if (arraySeries[i].fuerza !== s1.fuerza || arraySeries[i].reps !== s1.reps || arraySeries[i].rir !== s1.rir) {
            sonIguales = false; break;
        }
    }

    if (sonIguales && arraySeries.length > 1) {
        contenedor.innerHTML = `
            <div class="fila-serie">
                <input class="input-serie-numero input-modal text-center py-8 px-2" type="number" value="${arraySeries.length}">
                <input type="number" class="input-serie-fuerza input-modal" value="${s1.fuerza || ''}" placeholder="% RM">
                <input type="number" class="input-serie-reps input-modal" value="${s1.reps || ''}" placeholder="Reps">
                <input type="number" class="input-serie-rir input-modal" value="${s1.rir || ''}" placeholder="RIR">
                <button type="button" class="btn-eliminar-serie" aria-label="Eliminar serie" onclick="eliminarFilaSerie(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    } else {
        arraySeries.forEach(s => {
            contenedor.innerHTML += `
                <div class="fila-serie">
                    <input class="input-serie-numero input-modal text-center py-8 px-2" type="number" value="${s.numero}">
                    <input type="number" class="input-serie-fuerza input-modal" value="${s.fuerza || ''}" placeholder="% RM">
                    <input type="number" class="input-serie-reps input-modal" value="${s.reps || ''}" placeholder="Reps">
                    <input type="number" class="input-serie-rir input-modal" value="${s.rir || ''}" placeholder="RIR">
                    <button type="button" class="btn-eliminar-serie" aria-label="Eliminar serie" onclick="eliminarFilaSerie(this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
        });
    }

    if (boton) {
        if (sonIguales) {
            boton.setAttribute('data-modo', 'unificado');
            boton.style.background = 'rgba(243, 156, 18, 0.1)';
            boton.style.color = '#f39c12';
            boton.style.borderColor = 'rgba(243, 156, 18, 0.3)';
            boton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="align-middle mr-4"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Modificar individualmente cada serie
            `;
        } else {
            boton.setAttribute('data-modo', 'desglosado');
            boton.style.background = '#2c2c2c';
            boton.style.color = '#aaaaaa';
            boton.style.borderColor = '#444444';
            boton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="align-middle mr-4"><path d="M4 14h6v6H4z"></path><path d="M14 14h6v6h-6z"></path><path d="M14 4h6v6h-6z"></path><path d="M4 4h6v6H4z"></path></svg>
                Volver a forma unificada
            `;
        }
    }
}

function toggleNotasEjercicio(idCuerpo, elementoHeader) {
    const cuerpo = document.getElementById(idCuerpo);
    const flecha = elementoHeader.querySelector('svg:last-child');

    if (cuerpo.style.display === "none") {
        cuerpo.style.display = "block";
        flecha.style.transform = "rotate(180deg)";
    } else {
        cuerpo.style.display = "none";
        flecha.style.transform = "rotate(0deg)";
    }
}

function obtenerEstadoFormularioEjercicio() {
    const estado = {
        n: document.getElementById("input-ej-nombre")?.value.trim() || "",
        d: document.getElementById("input-ej-descanso")?.value.trim() || "",
        sb: document.getElementById("input-ej-subbloque")?.value.trim() || "",
        not: document.getElementById("input-ej-notas")?.value.trim() || "",

        enm: document.getElementById("input-emom-nombre")?.value.trim() || "",
        ep: document.getElementById("input-emom-prep")?.value.trim() || "",
        em: document.getElementById("input-emom-minutos")?.value.trim() || "",
        ed: document.getElementById("input-emom-descanso")?.value.trim() || "",
        esb: document.getElementById("input-emom-subbloque")?.value.trim() || "",
        enot: document.getElementById("input-emom-notas")?.value.trim() || "",

        anm: document.getElementById("input-amrap-nombre")?.value.trim() || "",
        ap: document.getElementById("input-amrap-prep")?.value.trim() || "",
        am: document.getElementById("input-amrap-minutos")?.value.trim() || "",
        ad: document.getElementById("input-amrap-descanso")?.value.trim() || "",
        asb: document.getElementById("input-amrap-subbloque")?.value.trim() || "",
        anot: document.getElementById("input-amrap-notas")?.value.trim() || "",


        tab_n: document.getElementById("input-tabata-nombre")?.value.trim() || "",
        tab_p: document.getElementById("input-tabata-prep")?.value.trim() || "",
        tab_w: document.getElementById("input-tabata-trabajo")?.value.trim() || "",
        tab_pa: document.getElementById("input-tabata-pausa")?.value.trim() || "",
        tab_r: document.getElementById("input-tabata-rondas")?.value.trim() || "",
        tab_d: document.getElementById("input-tabata-descanso")?.value.trim() || "",
        tab_sb: document.getElementById("input-tabata-subbloque")?.value.trim() || "",
        tab_not: document.getElementById("input-tabata-notas")?.value.trim() || "",


        tc_n: document.getElementById("input-timecap-nombre")?.value.trim() || "",
        tc_p: document.getElementById("input-timecap-prep")?.value.trim() || "",
        tc_m: document.getElementById("input-timecap-minutos")?.value.trim() || "",
        tc_d: document.getElementById("input-timecap-descanso")?.value.trim() || "",
        tc_sb: document.getElementById("input-timecap-subbloque")?.value.trim() || "",
        tc_not: document.getElementById("input-timecap-notas")?.value.trim() || "",

        sn: Array.from(document.querySelectorAll('#contenedor-filas-series .fila-serie')).map(f => f.querySelector('.input-serie-reps')?.value + "|" + f.querySelector('.input-serie-fuerza')?.value + "|" + f.querySelector('.input-serie-rir')?.value),

        se: Array.from(document.querySelectorAll('#contenedor-minutos-emom .caja-minuto-emom')).map(c => c.querySelector('.input-ejercicio-emom')?.value + "|" + c.querySelector('.input-reps-emom')?.value + "|" + c.querySelector('.input-rm-emom')?.value + "|" + c.querySelector('.input-rir-emom')?.value),

        sa: Array.from(document.querySelectorAll('#contenedor-ejercicios-amrap .fila-amrap')).map(c => c.querySelector('.input-ejercicio-amrap')?.value + "|" + c.querySelector('.input-reps-amrap')?.value + "|" + c.querySelector('.input-rm-amrap')?.value + "|" + c.querySelector('.input-rir-amrap')?.value),

        st: Array.from(document.querySelectorAll('#contenedor-ejercicios-tabata .fila-tabata')).map(c => c.querySelector('.input-ejercicio-tabata')?.value + "|" + c.querySelector('.input-reps-tabata')?.value + "|" + c.querySelector('.input-rm-tabata')?.value + "|" + c.querySelector('.input-rir-tabata')?.value),

        stc: Array.from(document.querySelectorAll('#contenedor-ejercicios-timecap .fila-timecap')).map(c => c.querySelector('.input-ejercicio-timecap')?.value + "|" + c.querySelector('.input-reps-timecap')?.value + "|" + c.querySelector('.input-rm-timecap')?.value + "|" + c.querySelector('.input-rir-timecap')?.value)
    };
    return JSON.stringify(estado);
}

function intentarCerrarModal(idModal) {
    if (idModal === 'modal-ejercicio') {
        const estadoActual = obtenerEstadoFormularioEjercicio();

        if (AppState.estadoInicialFormulario !== null && estadoActual !== AppState.estadoInicialFormulario) {
            AppState.modalPendienteDeCierre = idModal;
            document.getElementById('modal-advertencia-cierre').style.display = 'flex';
            return;
        }
    }

    cerrarCualquierModal(idModal);
}

function cerrarAdvertenciaYVolver() {
    document.getElementById('modal-advertencia-cierre').style.display = 'none';
}

function confirmarCierreSinGuardar() {
    document.getElementById('modal-advertencia-cierre').style.display = 'none';
    if (AppState.modalPendienteDeCierre) {
        cerrarCualquierModal(AppState.modalPendienteDeCierre);
        AppState.modalPendienteDeCierre = null;
    }
}



function accionBotonAtrasInteligente() {
    if (AppState.vistaSliderActual === 'ejercicios') {
        cerrarCategoria();
    } else {
        irAlDashboard();
    }
}

function abrirOpcionesCategoria(nombreCategoria) {
    AppState.categoriaOpcionesActiva = nombreCategoria;
    document.getElementById('titulo-opciones-cat').innerText = "Opciones: " + nombreCategoria;
    document.getElementById('modal-opciones-categoria').style.display = 'flex';
}

async function guardarEjercicioEnPack() {
    const zona = document.getElementById("select-pack-ej-zona").value;
    const nombre = document.getElementById("input-pack-ej-nombre").value.trim();
    const notasTexto = document.getElementById("input-pack-ej-notas") ? document.getElementById("input-pack-ej-notas").value.trim() : "";

    if (!nombre) {
        mostrarAlerta("Faltan datos", "Por favor ingresá el nombre del ejercicio.");
        return;
    }

    const seriesTexto = extraerSeriesDelModal('pack');
    const descanso = document.getElementById("input-pack-ej-descanso").value;

    if (AppState.ejercicioPackEditandoIndex !== null) {
        AppState.packActivoEjercicios[AppState.ejercicioPackEditandoIndex] = { zona: zona, nombre: nombre, series: seriesTexto, descanso: descanso, notas: notasTexto };
    } else {
        AppState.packActivoEjercicios.push({ zona: zona, nombre: nombre, series: seriesTexto, descanso: descanso, notas: notasTexto });
    }

    try {
        await clienteSupabase.from('packs_rutinas').update({ ejercicios: AppState.packActivoEjercicios }).eq('id', AppState.packActivoId);
        document.getElementById("modal-ejercicio-pack").style.display = "none";
        AppState.ejercicioPackEditandoIndex = null;
        cargarEjerciciosDePack();
    } catch (e) { console.error(e); }
}

async function abrirModalSeleccionarPack() {
    document.getElementById("modal-seleccionar-pack").style.display = "flex";
    const contenedor = document.getElementById("lista-seleccionar-packs");
    contenedor.innerHTML = "<p class='text-muted text-center'>Cargando packs...</p>";

    try {
        const { data: packs } = await clienteSupabase.from('packs_rutinas').select('*').eq('profesor_id', AppState.profeActivoId);
        let htmlFinal = "";

        packs.forEach(pack => {

            htmlFinal += `
                <div class="card-alumno tarjeta-pack-importar" onclick="importarPackAAlumno('${pack.id}')">
                    ${obtenerAnimacionHTML(pack.ejercicios?.[0]?.nombre)}
                    <div class="info-central ml-15">
                        <h3 class="fs-120 text-white">${pack.nombre}</h3>
                    </div>
                    <div class="acciones-ejercicio">
                        <span class="text-warning fw-800">Elegir</span>
                    </div>
                </div>`;
        });

        contenedor.innerHTML = htmlFinal;
    } catch (e) { console.error(e); }
}

async function clonarSemanaCompleta(semanaOrigen, semanaDestino) {
    try {
        const { data: ejerciciosOrigen, error: errOrig } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('*')
            .eq('alumno_id', AppState.alumnoSeleccionadoId)
            .eq('semana', semanaOrigen);

        if (errOrig) throw errOrig;

        if (!ejerciciosOrigen || ejerciciosOrigen.length === 0) {
            mostrarAlerta("Aviso", "La Semana 1 está completamente vacía. No hay nada para copiar.");
            return;
        }

        const nuevasCopias = ejerciciosOrigen.map(ej => ({
            alumno_id: ej.alumno_id,
            dia_semana: ej.dia_semana,
            semana: semanaDestino,
            categoria: ej.categoria,
            zona_muscular: ej.zona_muscular,
            ejercicio_nombre: ej.ejercicio_nombre,
            series_reps: ej.series_reps,
            fuerza: ej.fuerza,
            descanso: ej.descanso,
            notas: ej.notas,
            orden: ej.orden
        }));

        const { error: errInsert } = await clienteSupabase.from('rutinas_planificadas').insert(nuevasCopias);
        if (errInsert) throw errInsert;

        mostrarAlerta("¡Semana Copiada!", `Se clonó la rutina entera a la Semana ${semanaDestino}. Ahora podés modificarla sin alterar el resto.`);

        dibujarCategoriasAlumno();
        cargarEjerciciosCategoriaBD();

    } catch (e) {
        console.error(e);
        mostrarAlerta("Error", "No se pudo copiar la semana.");
    }
}

async function guardarOrdenYSubbloque() {
    const contenedores = document.querySelectorAll('.subbloque-contenedor');
    const promesas = [];
    let indexGlobal = 0;

    contenedores.forEach(contenedor => {
        let nombreSub = contenedor.getAttribute('data-sub');
        if (nombreSub === "Sin agrupar") nombreSub = null;

        const tarjetas = contenedor.querySelectorAll('.card-ejercicio');
        tarjetas.forEach(tarjeta => {
            const idEj = tarjeta.getAttribute('data-id');
            promesas.push(
                clienteSupabase.from('rutinas_planificadas')
                    .update({ orden: indexGlobal, sub_bloque: nombreSub })
                    .eq('id', idEj)
            );
            indexGlobal++;
        });
    });

    try {
        await Promise.all(promesas);
        console.log("Orden y sub-bloques guardados en la nube");
    } catch (error) {
        console.error("Error al guardar el nuevo orden:", error.message);
    }
}






function toggleEjerciciosProfe() {
    const check = document.getElementById('check-habilitar-ejercicios').checked;
    const contenedor = document.getElementById('contenedor-inputs-ejercicios-profe');
    if (check) {
        contenedor.style.display = 'flex';
        generarInputsEjerciciosProfe();
    } else {
        contenedor.style.display = 'none';
    }
}

function generarInputsEjerciciosProfe() {
    const check = document.getElementById('check-habilitar-ejercicios');
    if (!check || !check.checked) return;

    const modalidad = document.querySelector('.btn-modalidad-reloj.activo')?.innerText.toUpperCase() || 'EMOM';
    const rondas = parseInt(document.getElementById('input-profe-rondas').value) || 1;
    const trabajoSegs = parsearTiempoAsegundos(document.getElementById('input-profe-trabajo').value);


    const minutos = Math.ceil(trabajoSegs / 60) || 1;

    let cantidad = 1;
    let etiquetaBase = 'Rnd';


    if (modalidad === 'EMOM') {
        cantidad = minutos;
        etiquetaBase = 'Min';
    } else {
        cantidad = rondas;
    }

    const contenedor = document.getElementById('contenedor-inputs-ejercicios-profe');


    let valoresPrevios = [];
    contenedor.querySelectorAll('.input-ej-profe-dinamico').forEach(input => {
        valoresPrevios.push(input.value);
    });

    let html = '';
    for (let i = 1; i <= cantidad; i++) {
        let valor = valoresPrevios[i - 1] || '';
        html += `
            <div class="d-flex align-center gap-8">
                <span class="text-warning fw-600 fs-75 w-45 flex-shrink-0">${etiquetaBase} ${i}:</span>
                
                <div class="d-flex gap-6 flex-1 min-w-0">
                    <input class="input-reloj-config input-ej-profe-dinamico flex-1 fs-90 p-8 text-left min-w-0 m-0" type="text" id="input-ej-profe-${i}" value="${valor}" placeholder="Ej: Burpees...">
                    
                    <!-- BOTÓN LIMPIO PARA EL RELOJ -->
                    <button class="btn-guardar p-0-12 m-0 bg-ff9900 radius-10 d-flex justify-center align-center flex-shrink-0" type="button" onclick="abrirListaEjerciciosReloj('input-ej-profe-${i}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                </div>
            </div>
        `;
    }
    contenedor.innerHTML = html;
}











window.abrirModalEjercicio = abrirModalEjercicio;
window.resetearFormulariosEjercicio = resetearFormulariosEjercicio;
window.abrirModalEditar = abrirModalEditar;
window.abrirModalEditarPorId = abrirModalEditarPorId;
window.borrarEjercicio = borrarEjercicio;
window.guardarEjercicioEnBD = guardarEjercicioEnBD;
window.cargarEjerciciosCategoriaBD = cargarEjerciciosCategoriaBD;
window.abrirPantallaRutinas = abrirPantallaRutinas;
window.abrirDetallePack = abrirDetallePack;
window.cargarPacks = cargarPacks;
window.importarPackAAlumno = importarPackAAlumno;
window.agregarFilaSerie = agregarFilaSerie;
window.eliminarFilaSerie = eliminarFilaSerie;
window.toggleSeries = toggleSeries;
window.generarHtmlSeries = generarHtmlSeries;
window.toggleSubbloque = toggleSubbloque;
window.abrirListaSubbloques = abrirListaSubbloques;
window.abrirModalListaEjercicios = abrirModalListaEjercicios;
window.abrirModalListaEjerciciosPack = abrirModalListaEjerciciosPack;
window.filtrarListaEjerciciosModal = filtrarListaEjerciciosModal;
window.renderizarChipsModal = renderizarChipsModal;
window.abrirBottomSheetEjercicio = abrirBottomSheetEjercicio;
window.cerrarBottomSheet = cerrarBottomSheet;
window.guardarEdicionBS = guardarEdicionBS;
window.abrirImagenFullscreen = abrirImagenFullscreen;
window.cerrarImagenFullscreen = cerrarImagenFullscreen;
window.abrirImagenFullscreenDirecto = abrirImagenFullscreenDirecto;
window.generarMinutosEmom = generarMinutosEmom;
window.guardarCircuitoAvanzado = guardarCircuitoAvanzado;
window.abrirConfiguracionAvanzada = abrirConfiguracionAvanzada;
window.abrirModalEjercicioPack = abrirModalEjercicioPack;
window.abrirModalEditarEjercicioPack = abrirModalEditarEjercicioPack;
window.dibujarCategoriasAlumno = dibujarCategoriasAlumno;
window.abrirCategoria = abrirCategoria;
window.cerrarCategoria = cerrarCategoria;
window.accionBotonFabInteligente = accionBotonFabInteligente;
window.guardarNuevaCategoriaBD = guardarNuevaCategoriaBD;
window.borrarCategoriaActiva = borrarCategoriaActiva;
window.editarNombreCategoria = editarNombreCategoria;
window.guardarRenombrarCategoriaBD = guardarRenombrarCategoriaBD;
window.abrirModalEditarPack = abrirModalEditarPack;
window.guardarEdicionPack = guardarEdicionPack;
window.borrarPack = borrarPack;
window.abrirModalCrearPack = abrirModalCrearPack;
window.guardarPackNuevo = guardarPackNuevo;
window.cargarEjerciciosDePack = cargarEjerciciosDePack;
window.guardarOrdenYSubbloquePack = guardarOrdenYSubbloquePack;
window.renderizarListaEjerciciosModal = renderizarListaEjerciciosModal;
window.cambiarCatModal = cambiarCatModal;
window.cambiarZonaModal = cambiarZonaModal;
window.aplicarFiltrosListaModal = aplicarFiltrosListaModal;
window.seleccionarEjercicioDesdeLista = seleccionarEjercicioDesdeLista;
window.borrarEjercicioDePack = borrarEjercicioDePack;
window.activarEdicionBS = activarEdicionBS;
window.cancelarEdicionBS = cancelarEdicionBS;
window.toggleAvanzadas = toggleAvanzadas;
window.volverSeleccionModalidad = volverSeleccionModalidad;
window.agregarFilaAvanzada = agregarFilaAvanzada;
window.eliminarFilaAvanzada = eliminarFilaAvanzada;
window.extraerSeriesDelModal = extraerSeriesDelModal;
window.sumarSerieSimple = sumarSerieSimple;
window.inicializarModalSeries = inicializarModalSeries;
window.toggleNotasEjercicio = toggleNotasEjercicio;
window.obtenerEstadoFormularioEjercicio = obtenerEstadoFormularioEjercicio;
window.intentarCerrarModal = intentarCerrarModal;
window.cerrarAdvertenciaYVolver = cerrarAdvertenciaYVolver;
window.confirmarCierreSinGuardar = confirmarCierreSinGuardar;
window.accionBotonAtrasInteligente = accionBotonAtrasInteligente;
window.abrirOpcionesCategoria = abrirOpcionesCategoria;
window.guardarEjercicioEnPack = guardarEjercicioEnPack;
window.abrirModalSeleccionarPack = abrirModalSeleccionarPack;
window.clonarSemanaCompleta = clonarSemanaCompleta;
window.guardarOrdenYSubbloque = guardarOrdenYSubbloque;
window.toggleEjerciciosProfe = toggleEjerciciosProfe;
window.generarInputsEjerciciosProfe = generarInputsEjerciciosProfe;