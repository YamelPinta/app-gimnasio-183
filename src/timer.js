let interaccionConfirmada = false;

document.addEventListener('click', () => interaccionConfirmada = true, { once: true });
document.addEventListener('touchstart', () => interaccionConfirmada = true, { once: true });



function guardarEstadoReloj() {
    if (!AppState.relojActivoId) {
        localStorage.removeItem('relojGlobalData');
        return;
    }
    
    let nombreAlum = "Un alumno tuyo";
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombre) {
        nombreAlum = `${AppState.alumnoDataActual.nombre} ${AppState.alumnoDataActual.apellido || ''}`.trim();
    }

    let nombreEj = "Entrenamiento Avanzado";
    const tituloReloj = document.getElementById('titulo-reloj-avanzado');
    if (tituloReloj && tituloReloj.innerText) {
        nombreEj = tituloReloj.innerText;
    }

    localStorage.setItem('relojGlobalData', JSON.stringify({
        relojActivoId: AppState.relojActivoId, 
        tiempoTotalSegundos: AppState.tiempoTotalSegundos, 
        tiempoRestanteSegundos: AppState.tiempoRestanteSegundos,
        relojFases: AppState.relojFases, 
        relojIndiceFase: AppState.relojIndiceFase, 
        relojEstado: AppState.relojEstado,
        nombreAlumno: nombreAlum,
        nombreEjercicio: nombreEj,
        timestamp: Date.now() 
    }));
}

function restaurarRelojGlobal() {
    const guardado = localStorage.getItem('relojGlobalData');
    if (guardado) {
        try {
            const data = JSON.parse(guardado);
            if (data && data.relojFases) {
                AppState.relojActivoId = data.relojActivoId;
                AppState.tiempoTotalSegundos = data.tiempoTotalSegundos;
                AppState.relojFases = data.relojFases;
                AppState.relojIndiceFase = data.relojIndiceFase || 0;
                AppState.relojEstado = data.relojEstado;

                if (data.nombreAlumno) AppState.relojNombreAlumno = data.nombreAlumno;
                if (data.nombreEjercicio) AppState.relojNombreEjercicio = data.nombreEjercicio;

                if (AppState.relojEstado === 'corriendo') {
                    const segundosPasados = Math.floor((Date.now() - data.timestamp) / 1000);
                    let nuevoRestante = data.tiempoRestanteSegundos - segundosPasados;

                    while (nuevoRestante <= 0 && AppState.relojIndiceFase < AppState.relojFases.length - 1) {
                        AppState.relojIndiceFase++;
                        nuevoRestante += AppState.relojFases[AppState.relojIndiceFase].segundos;
                        AppState.tiempoTotalSegundos = AppState.relojFases[AppState.relojIndiceFase].segundos;
                    }

                    if (nuevoRestante <= 0) {
                        nuevoRestante = 0;
                        AppState.relojEstado = 'detenido';
                        dispararFinEntrenamientoAlumno(data.nombreAlumno, data.nombreEjercicio);
                        localStorage.removeItem('relojGlobalData');
                        return;
                    }
                    
                    AppState.tiempoRestanteSegundos = nuevoRestante;
                    iniciarRelojGlobal(); 
                } else {
                    AppState.tiempoRestanteSegundos = data.tiempoRestanteSegundos;
                }
            }
        } catch(e) {
            localStorage.removeItem('relojGlobalData');
        }
    }
}

function iniciarRelojGlobal() {
    if (AppState.intervaloReloj) clearInterval(AppState.intervaloReloj);
    if (AppState.tiempoRestanteSegundos <= 0) return; 

    AppState.relojEstado = 'corriendo';
    
    const svgIcono = document.getElementById('svg-icono-play');
    if (svgIcono) svgIcono.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';

    let tiempoFin = Date.now() + (AppState.tiempoRestanteSegundos * 1000);
    guardarEstadoReloj();

    AppState.intervaloReloj = setInterval(() => {
        AppState.tiempoRestanteSegundos = Math.ceil((tiempoFin - Date.now()) / 1000);

        if (AppState.tiempoRestanteSegundos <= 0) {
            if (AppState.relojIndiceFase < AppState.relojFases.length - 1) {
                cambiarFaseReloj(1);
            } else {
                AppState.tiempoRestanteSegundos = 0;
                clearInterval(AppState.intervaloReloj);
                AppState.intervaloReloj = null;
                AppState.relojEstado = 'detenido';
                
                if (svgIcono) svgIcono.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';

                actualizarDisplayReloj();
                dispararFinEntrenamientoAlumno(AppState.relojNombreAlumno, AppState.relojNombreEjercicio);
                localStorage.removeItem('relojGlobalData');
            }
        } else {
            actualizarDisplayReloj();
        }
    }, 1000);
}

function pausarRelojGlobal() { 
    if (AppState.intervaloReloj) clearInterval(AppState.intervaloReloj); 
    AppState.intervaloReloj = null;
    AppState.relojEstado = 'pausado';
    
    const svgIcono = document.getElementById('svg-icono-play');
    if (svgIcono) svgIcono.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    
    guardarEstadoReloj();
}

function detenerRelojGlobal() {
    if (AppState.intervaloReloj) clearInterval(AppState.intervaloReloj);
    AppState.intervaloReloj = null;
    AppState.relojEstado = 'detenido';
    
    const svgIcono = document.getElementById('svg-icono-play');
    if (svgIcono) svgIcono.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    
    AppState.relojIndiceFase = 0;
    if(AppState.relojFases && AppState.relojFases.length > 0) {
        AppState.tiempoTotalSegundos = AppState.relojFases[AppState.relojIndiceFase].segundos;
        AppState.tiempoRestanteSegundos = AppState.tiempoTotalSegundos;
        document.getElementById('fase-reloj-texto').innerText = AppState.relojFases[AppState.relojIndiceFase].nombre;
    }
    actualizarDisplayReloj();
    guardarEstadoReloj();
    aplicarColorFase();
}

function cambiarFaseReloj(direccion) {
    if(!AppState.relojFases || AppState.relojFases.length === 0) return;
    AppState.relojIndiceFase += direccion;
    
    if (AppState.relojIndiceFase < 0) AppState.relojIndiceFase = 0;
    if (AppState.relojIndiceFase >= AppState.relojFases.length) AppState.relojIndiceFase = AppState.relojFases.length - 1;
    
    AppState.tiempoTotalSegundos = AppState.relojFases[AppState.relojIndiceFase].segundos;
    AppState.tiempoRestanteSegundos = AppState.tiempoTotalSegundos;
    
    document.getElementById('fase-reloj-texto').innerText = AppState.relojFases[AppState.relojIndiceFase].nombre;
    
    aplicarColorFase();
    actualizarDisplayReloj();

    if (AppState.relojEstado === 'corriendo') {
        iniciarRelojGlobal(); 
    } else {
        guardarEstadoReloj();
    }
}

function actualizarDisplayReloj() {
    const display = document.getElementById('display-tiempo-emom');
    if (display) display.innerText = formatearTiempo(AppState.tiempoRestanteSegundos); 

    const badgeRonda = document.getElementById('contador-rounds');

    if (badgeRonda && AppState.relojFases && AppState.relojFases.length > 0) {
        const faseActual = AppState.relojFases[AppState.relojIndiceFase];
        
        if (faseActual.nombre === 'PREPARACIÓN' || faseActual.nombre === 'PREPARACION') {
            badgeRonda.innerText = "¡Preparate!";
            badgeRonda.style.display = 'inline-block';
        } else if (faseActual.nombre === 'DESCANSO') {
            badgeRonda.innerText = "Recuperación";
            badgeRonda.style.display = 'inline-block';
        } else {
            if (faseActual.tipo === 'amrap' || faseActual.tipo === 'timecap') {
                badgeRonda.innerText = "¡A DARLO TODO!";
                badgeRonda.style.display = 'inline-block';
            } else if (faseActual.tipo === 'tabata') {
                badgeRonda.innerText = `Ronda ${faseActual.rondaActual}/${faseActual.rondasTotales}`;
                badgeRonda.style.display = 'inline-block';
            } else if (faseActual.tipo === 'emom') {
                const segundosTotales = faseActual.segundos;
                const intervaloActual = faseActual.intervalo || 60; 
                const rondasTotales = Math.ceil(segundosTotales / intervaloActual); 
                
                if (rondasTotales > 0) {
                    let rondaActual = rondasTotales - Math.floor((AppState.tiempoRestanteSegundos - 1) / intervaloActual);
                    if (rondaActual > rondasTotales) rondaActual = rondasTotales;
                    if (rondaActual < 1) rondaActual = 1;
                    
                    badgeRonda.innerText = `Ronda ${rondaActual}/${rondasTotales}`;
                    badgeRonda.style.display = 'inline-block';
                } else {
                    badgeRonda.style.display = 'none';
                }
            } else {
                badgeRonda.style.display = 'none'; 
            }
        }
    }
}

function togglePlayPauseReloj() {
    if (AppState.relojEstado === 'corriendo') {
        pausarRelojGlobal();
    } else {
        iniciarRelojGlobal();
    }
}

function aplicarColorFase() {
    const contenedor = document.getElementById('contenedor-reloj-emom');
    const textoFase = document.getElementById('fase-reloj-texto');
    if (!contenedor || !textoFase) return;

    contenedor.classList.remove('fase-preparacion', 'fase-entrenamiento', 'fase-descanso');
    const nombreFase = textoFase.innerText.toUpperCase();

    if (nombreFase === 'PREPARACIÓN' || nombreFase === 'PREPARACION') {
        contenedor.classList.add('fase-preparacion');
    } else if (nombreFase === 'ENTRENAMIENTO') {
        contenedor.classList.add('fase-entrenamiento');
    } else if (nombreFase === 'DESCANSO') {
        contenedor.classList.add('fase-descanso');
    }
}

function dispararFinEntrenamientoAlumno(nombreGuardado, ejercicioGuardado) {
    let nombreAlumno = nombreGuardado || "Un alumno tuyo";
    if (!nombreGuardado && typeof AppState.alumnoDataActual !== 'undefined' && AppState.alumnoDataActual && AppState.alumnoDataActual.nombre) {
        nombreAlumno = `${AppState.alumnoDataActual.nombre} ${AppState.alumnoDataActual.apellido || ''}`.trim();
    }

    let tipoEntrenamiento = ejercicioGuardado || "Entrenamiento Avanzado";
    if (!ejercicioGuardado) {
        const tituloReloj = document.getElementById('titulo-reloj-avanzado');
        if (tituloReloj && tituloReloj.innerText) {
            tipoEntrenamiento = tituloReloj.innerText; 
        }
    }
    
    mostrarNotificacionPushWhatsApp(nombreAlumno, tipoEntrenamiento);
}


function mostrarNotificacionPushWhatsApp(nombreAlumno, tipoEntrenamiento) {
    const pantallaPerfiles = document.getElementById('pantalla-perfiles');
    const pantallaLogin = document.getElementById('pantalla-login');
    if ((pantallaPerfiles && pantallaPerfiles.style.display !== 'none') || 
        (pantallaLogin && pantallaLogin.style.display !== 'none')) {
        return; 
    }

    const banner = document.getElementById('banner-notificacion-push');
    const mensajeHtml = document.getElementById('banner-push-mensaje');
    const tituloHtml = document.getElementById('banner-push-titulo');
    
    if(!banner) return;

    tituloHtml.innerText = "¡Rutina Finalizada!";
    mensajeHtml.innerHTML = `Un alumno acaba de terminar su tiempo de entrenamiento. Tocá aquí para ver quién fue.`;
    
   banner.classList.remove('descartar-derecha');
    banner.classList.add('mostrar');

    reproducirAlertaRing();
    
    const badge = document.getElementById('badge-notificaciones');
    if (badge) {
        badge.style.display = 'flex'; 
        let valorActual = parseInt(badge.innerText);
        if (isNaN(valorActual)) {
            badge.innerText = "1"; 
        } else {
            badge.innerText = valorActual + 1; 
        }
    }

    registrarNotificacionEnTuLista(nombreAlumno, tipoEntrenamiento);
    configurarDescarteDeslizante(banner);

    setTimeout(() => {
        if (banner.classList.contains('mostrar')) {
            banner.classList.remove('mostrar');
        }
    }, 6000);
}

function registrarNotificacionEnTuLista(nombreAlumno, tipoEntrenamiento) {
    const hora = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let historial = JSON.parse(localStorage.getItem('historialAlertasGym')) || [];
    historial.unshift({ nombreAlumno, tipoEntrenamiento, hora });
    if(historial.length > 15) historial.pop(); 
    localStorage.setItem('historialAlertasGym', JSON.stringify(historial));

    inyectarTarjetaNotificacion(nombreAlumno, tipoEntrenamiento, hora);
}

function inyectarTarjetaNotificacion(nombreAlumno, tipoEntrenamiento, hora) {
    const contenedorLista = document.getElementById('lista-notificaciones-emom');
    if (!contenedorLista) return;

    const nombreSeguro = escaparHTML(nombreAlumno);
    const tipoSeguro = escaparHTML(tipoEntrenamiento);

    const nuevaNotif = document.createElement('div');
    nuevaNotif.className = 'item-notificacion nueva notif-emom-dinamica';

    nuevaNotif.innerHTML = `
        <div class="d-flex justify-between mb-4 w-100">
            <strong class="text-warning fs-75 text-uppercase ls-05">Tiempo Finalizado</strong>
            <span class="text-666 fs-70">${hora}</span>
        </div>
        <h4 class="fs-95 text-white m-0 mb-4 fw-600">${nombreSeguro}</h4>
        <p class="m-0 text-ccc fs-80 lh-1-3 text-warning fw-600">Terminó el bloque de: <span>${tipoSeguro}</span></p>
    `;

    contenedorLista.prepend(nuevaNotif);
}

function restaurarNotificacionesEmomGuardadas() {
    let historial = JSON.parse(localStorage.getItem('historialAlertasGym')) || [];
    const modalNotif = document.getElementById('modal-notificaciones');
    if (!modalNotif) return;
    
    const viejas = modalNotif.querySelectorAll('.notif-emom-dinamica');
    viejas.forEach(v => v.remove());

    [...historial].reverse().forEach(notif => {
        inyectarTarjetaNotificacion(notif.nombreAlumno, notif.tipoEntrenamiento, notif.hora);
    });
}

function abrirCampanitaDesdeNotificacion() {
    const banner = document.getElementById('banner-notificacion-push');
    if (banner) banner.classList.remove('mostrar');

    if (typeof abrirModalNotificaciones === 'function') {
        abrirModalNotificaciones();
        
        let intentos = 0;
        const intervaloInyeccion = setInterval(() => {
            restaurarNotificacionesEmomGuardadas();
            intentos++;
            if (intentos > 8) clearInterval(intervaloInyeccion);
        }, 250);
    }
}

function configurarDescarteDeslizante(elemento) {
    let touchStartX = 0;
    let touchEndX = 0;

    elemento.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elemento.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        let diferencia = touchEndX - touchStartX;

        if (diferencia > 60) {
            elemento.classList.add('descartar-derecha');
            setTimeout(() => {
                elemento.classList.remove('mostrar');
                elemento.classList.remove('descartar-derecha');
            }, 300);
        }
    }, { passive: true });
}
function reproducirAlertaRing() {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
    
    try {
        const ctx = obtenerAudioContext();
        if (!ctx || ctx.state === 'suspended') return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(987.77, ctx.currentTime); 
        osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); 
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        // Silenciar
        console.log("El navegador bloqueó el sonido automático.");
    }
}

function abrirModalSelectorReloj() {
    if (!AppState.ejerciciosActualesCache) return;
    
    let avanzados = AppState.ejerciciosActualesCache.filter(ej => 
        (ej.descanso && ej.descanso.includes('EMOM_SEG:')) || 
        (ej.ejercicio_nombre && (
            ej.ejercicio_nombre.toUpperCase().startsWith("EMOM") || 
            ej.ejercicio_nombre.toUpperCase().startsWith("AMRAP") || 
            ej.ejercicio_nombre.toUpperCase().startsWith("TIMECAP") || 
            ej.ejercicio_nombre.toUpperCase().startsWith("TABATA")
        ))
    );

    const contenedor = document.getElementById('lista-relojes-disponibles');
    contenedor.innerHTML = "";

    if (avanzados.length === 0) {
        contenedor.innerHTML = "<p class='text-muted text-center'>No hay ejercicios avanzados en esta rutina.</p>";
    } else {
        avanzados.forEach(ej => {
            const esActivo = String(ej.id) === String(AppState.relojActivoId);
            
            contenedor.innerHTML += `
                <button onclick="seleccionarRelojManual('${ej.id}')" style="background: ${esActivo ? 'rgba(243, 156, 18, 0.2)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${esActivo ? '#f39c12' : '#333'};" class="d-flex justify-between align-center p-12 radius-8 text-white cursor-pointer text-left w-100 transition-200 mb-8">
                    <span style="font-weight: ${esActivo ? 'bold' : 'normal'}; color: ${esActivo ? '#f39c12' : '#fff'};">${ej.ejercicio_nombre}</span>
                    ${esActivo ? '<svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" width="16"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                </button>
            `;
        });
    }

    document.getElementById('modal-seleccionar-reloj').style.display = 'flex';
}

function seleccionarRelojManual(idEj) {
    if (AppState.intervaloReloj) clearInterval(AppState.intervaloReloj);
    AppState.intervaloReloj = null;
    AppState.relojEstado = 'detenido';
    localStorage.removeItem('emomData');

    AppState.relojFases = [];
    
    AppState.relojActivoId = idEj;
    
    document.getElementById('modal-seleccionar-reloj').style.display = 'none';
    cargarEjerciciosCategoriaBD();
}

window.addEventListener('load', restaurarRelojGlobal);

window.addEventListener('load', restaurarRelojGlobal);

function generarOpcionesPicker() {
    const arrColumnas = ['picker-horas', 'picker-minutos', 'picker-segundos'];
    
    arrColumnas.forEach((id, colIndex) => {
        const col = document.getElementById(id);
        let html = '';
        const max = colIndex === 0 ? 99 : 59; 
        
        for(let i = 0; i <= max; i++) {
            html += `<div class="picker-item" data-val="${i}">${String(i).padStart(2, '0')}</div>`;
        }
        col.innerHTML = html;
    });
}

function abrirTimePicker(idInput, max10) {
    inputDestinoPicker = idInput;
    limite10MinutosActivado = max10;
    
    if(document.getElementById('picker-horas').children.length === 0) {
        generarOpcionesPicker();
    }
    
    document.getElementById('modal-time-picker').style.display = 'flex';
    
    const valorActual = document.getElementById(idInput).value;
    const segsTotales = parsearTiempoAsegundos(valorActual);
    
    const h = Math.floor(segsTotales / 3600);
    const m = Math.floor((segsTotales % 3600) / 60);
    const s = segsTotales % 60;
    
    setTimeout(() => {
        document.getElementById('picker-horas').scrollTop = h * 40;
        document.getElementById('picker-minutos').scrollTop = m * 40;
        document.getElementById('picker-segundos').scrollTop = s * 40;
        
        actualizarSeleccionPicker('picker-horas');
        actualizarSeleccionPicker('picker-minutos');
        actualizarSeleccionPicker('picker-segundos');
    }, 50);
}

function cerrarTimePicker() {
    document.getElementById('modal-time-picker').style.display = 'none';
}

function actualizarSeleccionPicker(idCol) {
    const col = document.getElementById(idCol);
    const indexSeleccionado = Math.round(col.scrollTop / 40);
    const items = col.querySelectorAll('.picker-item');
    
    items.forEach(i => i.classList.remove('seleccionado'));
    
    if(items[indexSeleccionado]) {
        items[indexSeleccionado].classList.add('seleccionado');
    }
}

function aceptarTimePicker() {
    const h = Math.round(document.getElementById('picker-horas').scrollTop / 40);
    const m = Math.round(document.getElementById('picker-minutos').scrollTop / 40);
    const s = Math.round(document.getElementById('picker-segundos').scrollTop / 40);
    
    let segsTotales = (h * 3600) + (m * 60) + s;
    
    if (limite10MinutosActivado && segsTotales > 600) {
        mostrarAlerta("Límite superado", "El tiempo máximo de entrenamiento para un EMOM es de 10 minutos.");
        segsTotales = 600; 
    }
    
    const inputOriginal = document.getElementById(inputDestinoPicker);
    if (inputOriginal) {
        inputOriginal.value = formatearTiempo(segsTotales);
        
        if (inputDestinoPicker === 'input-emom-minutos' || inputDestinoPicker === 'input-emom-intervalo') {
            generarMinutosEmom(); 
        }
        
        if (inputDestinoPicker.includes('profe')) {
            if (typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
            if (typeof generarInputsEjerciciosProfe === 'function') generarInputsEjerciciosProfe();
        }
    }
    
    cerrarTimePicker();
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        restaurarRelojGlobal(); 
    }
});


setTimeout(() => {
    const btnCampana = document.querySelector('.contenedor-campanita');
    if (btnCampana) {
        btnCampana.addEventListener('click', () => {
            let intentos = 0;
            const intervaloInyeccion = setInterval(() => {
                restaurarNotificacionesEmomGuardadas();
                intentos++;
                if (intentos > 8) clearInterval(intervaloInyeccion);
            }, 250);
        });
    }
}, 1000);

let inputDestinoPicker = null;
let limite10MinutosActivado = false;


function abrirPantallaReloj() {
    const pantallaReloj = document.getElementById("pantalla-reloj");

    if (pantallaReloj.style.display === "flex") {
        return; 
    }

    requestAnimationFrame(() => {
        setTimeout(() => {
            const pantallas = [
                "pantalla-perfiles", "pantalla-dashboard", "pantalla-detalle-alumno",
                "pantalla-rutinas", "pantalla-detalle-pack", "pantalla-admin"
            ];
            pantallas.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            });

            pantallaReloj.style.display = "flex";
            window.scrollTo(0,0);

            actualizarMenuInferior('reloj');
        }, 0);
    });
}

let ProfeTimer = {
    intervalo: null,
    estado: 'detenido',
    fases: [],
    indiceFase: 0,
    tiempoRestante: 0,
    tiempoTotal: 0
};

function abrirMenuReloj() {
    document.getElementById('overlay-menu-reloj').style.display = 'block';
    
    const nav = document.getElementById('menu-inferior-global');
    if(nav) nav.classList.add('oculto-por-panel');

    cargarRelojesGuardados();

    setTimeout(() => {
        document.getElementById('menu-lateral-reloj').classList.add('abierto');
    }, 10);
}

function cerrarMenuReloj() {
    document.getElementById('menu-lateral-reloj').classList.remove('abierto');
    
    const nav = document.getElementById('menu-inferior-global');
    if(nav) nav.classList.remove('oculto-por-panel');

    setTimeout(() => {
        document.getElementById('overlay-menu-reloj').style.display = 'none';
    }, 300);
}

function seleccionarModalidadReloj(btn, tipo) {
    document.querySelectorAll('.btn-modalidad-reloj').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    
    const cajaRondas = document.getElementById('caja-profe-rondas');
    const cajaCiclos = document.getElementById('caja-profe-ciclos');
    
    if (cajaRondas && cajaCiclos) {
        if (tipo === 'emom') {
            cajaRondas.style.display = 'none';  
            cajaCiclos.style.display = 'none'; 
        } else {
            cajaRondas.style.display = 'flex'; 
            cajaCiclos.style.display = 'flex'; 
        }
    }

    if (tipo === 'tabata') {
        document.getElementById('input-profe-prep').value = "00:10";
        document.getElementById('input-profe-trabajo').value = "00:20";
        document.getElementById('input-profe-descanso').value = "00:10";
        document.getElementById('input-profe-rondas').value = "8";
        document.getElementById('input-profe-ciclos').value = "1";
    } else if (tipo === 'timecap' || tipo === 'amrap' || tipo === 'cronometro') {
        document.getElementById('input-profe-prep').value = "00:10";
        document.getElementById('input-profe-descanso').value = "00:00";
        document.getElementById('input-profe-rondas').value = "1";
        document.getElementById('input-profe-ciclos').value = "1";
    } else {
        document.getElementById('input-profe-prep').value = "00:10";
        document.getElementById('input-profe-trabajo').value = "01:00";
        document.getElementById('input-profe-descanso').value = "00:00";
        document.getElementById('input-profe-rondas').value = "1";
        document.getElementById('input-profe-ciclos').value = "1";
    }
    
    if (typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
    if (typeof generarInputsEjerciciosProfe === 'function') generarInputsEjerciciosProfe();
}

function prepararRelojProfe() {
    if (typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
    const prep = parsearTiempoAsegundos(document.getElementById('input-profe-prep').value);
    let trabajo = parsearTiempoAsegundos(document.getElementById('input-profe-trabajo').value);
    const desc = parsearTiempoAsegundos(document.getElementById('input-profe-descanso').value);
    let rondas = parseInt(document.getElementById('input-profe-rondas').value) || 1;
    let ciclos = parseInt(document.getElementById('input-profe-ciclos').value) || 1;

    if (trabajo <= 0) {
        mostrarAlerta("Error", "El tiempo de trabajo no puede ser 0.");
        return;
    }

    const modalidad = document.querySelector('.btn-modalidad-reloj.activo')?.innerText.toUpperCase() || 'EMOM';

    if (modalidad === 'EMOM') {
        rondas = Math.ceil(trabajo / 60);
        if (trabajo >= 60) trabajo = 60; 
        ciclos = 1; 
    }

    const habilitarEjercicios = document.getElementById('check-habilitar-ejercicios')?.checked;

    ProfeTimer.fases = [];
    if (prep > 0) ProfeTimer.fases.push({ nombre: 'PREPARACIÓN', segundos: prep, ejercicio: '¡Preparate!', modalidad: modalidad });

    for (let c = 1; c <= ciclos; c++) {
        for (let i = 1; i <= rondas; i++) {
            let nombreEj = "";
            if (habilitarEjercicios) {
                const inputEj = document.getElementById(`input-ej-profe-${i}`);
                if (inputEj && inputEj.value.trim() !== "") nombreEj = inputEj.value.trim();
            }

            ProfeTimer.fases.push({ nombre: 'ENTRENAMIENTO', segundos: trabajo, ronda: i, rondasTotales: rondas, ciclo: c, ciclosTotales: ciclos, ejercicio: nombreEj, modalidad: modalidad });
            
            if (desc > 0) {
                ProfeTimer.fases.push({ nombre: 'DESCANSO', segundos: desc, ejercicio: nombreEj ? `(Descanso) ${nombreEj}` : 'RECUPERACIÓN', modalidad: modalidad });
            }
        }
    }
    
    ProfeTimer.tiempoTotalGlobal = 0;
    ProfeTimer.fases.forEach(f => ProfeTimer.tiempoTotalGlobal += f.segundos);
    
    ProfeTimer.indiceFase = 0;
    ProfeTimer.tiempoTotal = ProfeTimer.fases[0].segundos;
    ProfeTimer.tiempoRestante = ProfeTimer.tiempoTotal;
    
    cerrarMenuReloj();
    document.getElementById('controles-reloj-profe').classList.remove('oculto-animado-abajo');

    const pantalla = document.getElementById('pantalla-reloj');
    const estiloFondo = window.getComputedStyle(pantalla, '::before').getPropertyValue('background-position');
    pantalla.style.setProperty('--pos-actual', estiloFondo);

    pantalla.classList.remove('fase-preparacion', 'fase-entrenamiento', 'fase-descanso');
    pantalla.classList.add('congelar-luz');

    document.getElementById('fase-reloj-profe-texto').innerText = "INICIANDO...";
    const tituloReloj = document.getElementById('titulo-ejercicio-profe');
    if (tituloReloj) tituloReloj.innerText = "";

    setTimeout(() => {
        pantalla.classList.remove('congelar-luz');
        pantalla.classList.add('fase-preparacion');
    }, 50);

    setTimeout(() => {
        actualizarDisplayProfe(); 
        iniciarRelojProfe();    
        anunciarFaseActual();
    }, 70);
}

function actualizarDisplayProfe() {
    if (ProfeTimer.fases.length === 0) return;
    
    const fase = ProfeTimer.fases[ProfeTimer.indiceFase];

    if (fase.modalidad === 'CRONÓMETRO' && fase.nombre === 'ENTRENAMIENTO') {
        const transcurrido = ProfeTimer.tiempoTotal - ProfeTimer.tiempoRestante;
        document.getElementById('display-tiempo-profe').innerText = formatearTiempo(transcurrido);
    } else {
        document.getElementById('display-tiempo-profe').innerText = formatearTiempo(ProfeTimer.tiempoRestante);
    }
    
    document.getElementById('fase-reloj-profe-texto').innerText = fase.nombre;
    
    const badge = document.getElementById('contador-rounds-profe');
    
    if (fase.nombre === 'ENTRENAMIENTO') {
        let workoutTotal = 0;
        let workoutTranscurrido = 0;

        for (let i = 0; i < ProfeTimer.fases.length; i++) {
            let f = ProfeTimer.fases[i];
            if (f.nombre !== 'PREPARACIÓN') {
                workoutTotal += f.segundos;
                
                if (i < ProfeTimer.indiceFase) {
                    workoutTranscurrido += f.segundos;
                } else if (i === ProfeTimer.indiceFase) {
                    workoutTranscurrido += (f.segundos - ProfeTimer.tiempoRestante);
                }
            }
        }
        
        let workoutRestante = workoutTotal - workoutTranscurrido;

        if (fase.modalidad === 'CRONÓMETRO') {
            badge.innerText = `Total: ${formatearTiempo(workoutTotal)}`;
        } else {
            badge.innerText = `Total: ${formatearTiempo(workoutRestante)}`;
        }
    } else {
        badge.innerText = fase.nombre === 'PREPARACIÓN' ? '¡Preparate!' : 'Recuperación';
    }
    
    badge.style.display = 'inline-block';

    const divRondas = document.getElementById('display-rondas-lateral');
    const divCiclos = document.getElementById('display-ciclos-lateral');

    if (fase.ronda) {
        if (divRondas) {
            divRondas.style.opacity = '1';
            document.getElementById('valor-ronda-actual').innerText = fase.ronda;
            document.getElementById('valor-ronda-total').innerText = `/${fase.rondasTotales}`;
        }
        if (divCiclos) {
            divCiclos.style.opacity = '1';
            document.getElementById('valor-ciclo-actual').innerText = fase.ciclo;
            document.getElementById('valor-ciclo-total').innerText = `/${fase.ciclosTotales}`;
        }
    } else {
        if (divRondas) divRondas.style.opacity = '0';
        if (divCiclos) divCiclos.style.opacity = '0';
    }
    
    const tituloReloj = document.getElementById('titulo-ejercicio-profe');
    if (tituloReloj) {
        let textoParaMostrar = "";
        
        if (fase.nombre === 'ENTRENAMIENTO') {
            if (fase.ejercicio && fase.ejercicio.trim() !== "") {
                textoParaMostrar = fase.ejercicio.toUpperCase();
            } else {
                textoParaMostrar = document.querySelector('.btn-modalidad-reloj.activo')?.innerText || 'CRONÓMETRO';
            }
        } 
        
        tituloReloj.innerText = textoParaMostrar;

        const cantidadLetras = textoParaMostrar.length;
        if (cantidadLetras > 32) {
            tituloReloj.style.fontSize = "0.75rem";
        } else if (cantidadLetras > 24) {
            tituloReloj.style.fontSize = "0.9rem";
        } else if (cantidadLetras > 17) {
            tituloReloj.style.fontSize = "1.05rem";
        } else {
            tituloReloj.style.fontSize = "1.3rem";
        }
    }
    
    actualizarAnimacionTopReloj(fase.ejercicio, fase.nombre);

    const pantalla = document.getElementById('pantalla-reloj');
    pantalla.classList.remove('fase-preparacion', 'fase-entrenamiento', 'fase-descanso');
    
    if (fase.nombre === 'PREPARACIÓN') pantalla.classList.add('fase-preparacion');
    else if (fase.nombre === 'ENTRENAMIENTO') pantalla.classList.add('fase-entrenamiento');
    else if (fase.nombre === 'DESCANSO') pantalla.classList.add('fase-descanso');
    
}

function detenerRelojProfe() {
    permitirApagarPantalla();
    if (ProfeTimer.intervalo) clearInterval(ProfeTimer.intervalo);
    ProfeTimer.intervalo = null;
    ProfeTimer.estado = 'detenido';
    document.getElementById('svg-icono-play-profe').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    
    document.getElementById('display-tiempo-profe').innerText = "00:00";
    document.getElementById('fase-reloj-profe-texto').innerText = "ESPERANDO...";
    document.getElementById('contador-rounds-profe').style.display = 'none';
    
    const tituloReloj = document.getElementById('titulo-ejercicio-profe');
    if (tituloReloj) tituloReloj.innerText = "";

    const divRondas = document.getElementById('display-rondas-lateral');
    const divCiclos = document.getElementById('display-ciclos-lateral');
    if (divRondas) divRondas.style.opacity = '0';
    if (divCiclos) divCiclos.style.opacity = '0';
    
    if (typeof actualizarAnimacionTopReloj === 'function') {
        actualizarAnimacionTopReloj("", "ESPERANDO");
    }

    const pantalla = document.getElementById('pantalla-reloj');
    pantalla.classList.remove('fase-preparacion', 'fase-entrenamiento', 'fase-descanso', 'congelar-luz');
    
    abrirMenuReloj();
    document.getElementById('controles-reloj-profe').classList.add('oculto-animado-abajo');
    
    if (typeof guardarEstadoProfeTimer === 'function') guardarEstadoProfeTimer();
}

function iniciarRelojProfe() {
    mantenerPantallaPrendida();
    if (ProfeTimer.intervalo) clearInterval(ProfeTimer.intervalo);
    if (ProfeTimer.tiempoRestante <= 0) return;

    ProfeTimer.estado = 'corriendo';
    document.getElementById('svg-icono-play-profe').innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    
    let tiempoFin = Date.now() + (ProfeTimer.tiempoRestante * 1000);
    if (typeof guardarEstadoProfeTimer === 'function') guardarEstadoProfeTimer();

    ProfeTimer.ultimoSegundoBeep = -1;

    ProfeTimer.intervalo = setInterval(() => {
        ProfeTimer.tiempoRestante = Math.ceil((tiempoFin - Date.now()) / 1000);

        if (ProfeTimer.tiempoRestante > 0 && ProfeTimer.tiempoRestante <= 3) {
            if (ProfeTimer.ultimoSegundoBeep !== ProfeTimer.tiempoRestante) {
                reproducirBeep('corto');
                if (vibracionRelojActivada && navigator.vibrate) navigator.vibrate(50); 
                if (vozRelojActivada) hablar(ProfeTimer.tiempoRestante.toString());
                ProfeTimer.ultimoSegundoBeep = ProfeTimer.tiempoRestante;
            }
        }

        if (ProfeTimer.tiempoRestante <= 0) {
            if (ProfeTimer.indiceFase < ProfeTimer.fases.length - 1) {
                reproducirBeep('largo'); 
                if (vibracionRelojActivada && navigator.vibrate) navigator.vibrate([200, 100, 200]); 
                cambiarFaseRelojProfe(1); 
                tiempoFin = Date.now() + (ProfeTimer.tiempoRestante * 1000); 
                ProfeTimer.ultimoSegundoBeep = -1; 
            } else {
                ProfeTimer.tiempoRestante = 0;
                reproducirBeep('largo'); 
                if (vibracionRelojActivada && navigator.vibrate) navigator.vibrate([200, 100, 200]); 
                if (vozRelojActivada) hablar("Terminamos, muy bien"); 
                detenerRelojProfe();
                reproducirAlertaRing(); 
            }
        } else {
            actualizarDisplayProfe();
        }
    }, 250);
}

function pausarRelojProfe() {
    permitirApagarPantalla();
    if (ProfeTimer.intervalo) clearInterval(ProfeTimer.intervalo);
    ProfeTimer.intervalo = null;
    ProfeTimer.estado = 'pausado';
    document.getElementById('svg-icono-play-profe').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    if (typeof guardarEstadoProfeTimer === 'function') guardarEstadoProfeTimer();
}

function togglePlayPauseRelojProfe() {
    if (ProfeTimer.estado === 'corriendo') pausarRelojProfe();
    else iniciarRelojProfe();
}

function cambiarFaseRelojProfe(direccion) {
    if (!ProfeTimer.fases || ProfeTimer.fases.length === 0) return;
    
    ProfeTimer.indiceFase += direccion;
    if (ProfeTimer.indiceFase < 0) ProfeTimer.indiceFase = 0;
    if (ProfeTimer.indiceFase >= ProfeTimer.fases.length) ProfeTimer.indiceFase = ProfeTimer.fases.length - 1;
    
    ProfeTimer.tiempoTotal = ProfeTimer.fases[ProfeTimer.indiceFase].segundos;
    ProfeTimer.tiempoRestante = ProfeTimer.tiempoTotal;
    
    actualizarDisplayProfe();
    anunciarFaseActual();
    
    if (ProfeTimer.estado === 'corriendo') {
        if (ProfeTimer.intervalo) clearInterval(ProfeTimer.intervalo);
        iniciarRelojProfe();
    } else {
        if (typeof guardarEstadoProfeTimer === 'function') guardarEstadoProfeTimer();
    }
}


function guardarConfigRelojProfe() {
    let arrayEjercicios = [];
    const checkEj = document.getElementById('check-habilitar-ejercicios')?.checked;
    if (checkEj) {
        document.querySelectorAll('.input-ej-profe-dinamico').forEach(input => arrayEjercicios.push(input.value));
    }

    const config = {
        prep: document.getElementById('input-profe-prep').value,
        trabajo: document.getElementById('input-profe-trabajo').value,
        descanso: document.getElementById('input-profe-descanso').value,
        rondas: document.getElementById('input-profe-rondas').value,
        ciclos: document.getElementById('input-profe-ciclos')?.value || 1, 
        modalidadActiva: document.querySelector('.btn-modalidad-reloj.activo')?.innerText || 'EMOM',
        ejerciciosHabilitados: checkEj,
        ejercicios: arrayEjercicios 
    };
    localStorage.setItem('configRelojProfe', JSON.stringify(config));
}

function guardarEstadoProfeTimer() {
    if (ProfeTimer.estado === 'detenido') {
        localStorage.removeItem('estadoProfeTimer');
        return;
    }
    localStorage.setItem('estadoProfeTimer', JSON.stringify({
        fases: ProfeTimer.fases,
        indiceFase: ProfeTimer.indiceFase,
        tiempoRestante: ProfeTimer.tiempoRestante,
        tiempoTotal: ProfeTimer.tiempoTotal,
        tiempoTotalGlobal: ProfeTimer.tiempoTotalGlobal, 
        estado: ProfeTimer.estado,
        timestamp: Date.now()
    }));
}

function restaurarRelojProfeCompleto() {
    const configGuardada = localStorage.getItem('configRelojProfe');
    if (configGuardada) {
        try {
            const config = JSON.parse(configGuardada);
            if (config.prep) document.getElementById('input-profe-prep').value = config.prep;
            if (config.trabajo) document.getElementById('input-profe-trabajo').value = config.trabajo;
            if (config.descanso) document.getElementById('input-profe-descanso').value = config.descanso;
            if (config.rondas) document.getElementById('input-profe-rondas').value = config.rondas;
            if (config.ciclos && document.getElementById('input-profe-ciclos')) document.getElementById('input-profe-ciclos').value = config.ciclos;

            if (config.modalidadActiva) {
                document.querySelectorAll('.btn-modalidad-reloj').forEach(btn => {
                    if (btn.innerText.trim() === config.modalidadActiva.trim()) btn.classList.add('activo');
                    else btn.classList.remove('activo');
                });
                
                const cajaRondas = document.getElementById('caja-profe-rondas');
                const cajaCiclos = document.getElementById('caja-profe-ciclos');
                if (cajaRondas && cajaCiclos) {
                    if (config.modalidadActiva.toUpperCase() === 'EMOM') {
                        cajaRondas.style.display = 'none';
                        cajaCiclos.style.display = 'none';
                    } else {
                        cajaRondas.style.display = 'flex';
                        cajaCiclos.style.display = 'flex';
                    }
                }
            }
            
            const check = document.getElementById('check-habilitar-ejercicios');
            if (check) {
                check.checked = config.ejerciciosHabilitados || false;
                toggleEjerciciosProfe(); 
                if (config.ejerciciosHabilitados && config.ejercicios) {
                    config.ejercicios.forEach((ej, i) => {
                        const input = document.getElementById(`input-ej-profe-${i+1}`);
                        if (input) input.value = ej;
                    });
                }
            }
        } catch(e) { console.warn("Error leyendo configRelojProfe del caché:", e); }
    }

    const estadoGuardado = localStorage.getItem('estadoProfeTimer');
    if (estadoGuardado) {
        try {
            const data = JSON.parse(estadoGuardado);
            if (data && data.fases && data.fases.length > 0) {
                ProfeTimer.fases = data.fases;
                ProfeTimer.indiceFase = data.indiceFase || 0;
                ProfeTimer.estado = data.estado;
                ProfeTimer.tiempoTotal = data.tiempoTotal;
                
                ProfeTimer.tiempoTotalGlobal = data.tiempoTotalGlobal || 0;
                if (!ProfeTimer.tiempoTotalGlobal && ProfeTimer.fases) {
                    ProfeTimer.fases.forEach(f => ProfeTimer.tiempoTotalGlobal += f.segundos);
                }

                document.getElementById('controles-reloj-profe').classList.remove('oculto-animado-abajo');
                
                if (ProfeTimer.estado === 'corriendo') {
                    const segundosPasados = Math.floor((Date.now() - data.timestamp) / 1000);
                    let nuevoRestante = data.tiempoRestante - segundosPasados;

                    while (nuevoRestante <= 0 && ProfeTimer.indiceFase < ProfeTimer.fases.length - 1) {
                        ProfeTimer.indiceFase++;
                        nuevoRestante += ProfeTimer.fases[ProfeTimer.indiceFase].segundos;
                        ProfeTimer.tiempoTotal = ProfeTimer.fases[ProfeTimer.indiceFase].segundos;
                    }

                    if (nuevoRestante <= 0) {
                        detenerRelojProfe();
                        return;
                    }
                    
                    ProfeTimer.tiempoRestante = nuevoRestante;
                    actualizarDisplayProfe();
                    iniciarRelojProfe(); 
                } else if (ProfeTimer.estado === 'pausado') {
                    ProfeTimer.tiempoRestante = data.tiempoRestante;
                    actualizarDisplayProfe();
                    document.getElementById('svg-icono-play-profe').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
                }
            }
        } catch(e) { console.warn("Error leyendo estadoProfeTimer del caché:", e); }
    }
}

document.addEventListener('change', (e) => {
    if (e.target.id === 'check-habilitar-ejercicios') {
        if (typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
    }
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'input-profe-rondas' || e.target.id === 'input-profe-ciclos') {
        if (typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
        if (typeof generarInputsEjerciciosProfe === 'function') generarInputsEjerciciosProfe();
    }
    
    if (e.target.classList && e.target.classList.contains('input-ej-profe-dinamico')) {
        if (typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
    }
});

window.addEventListener('load', restaurarRelojProfeCompleto);

async function cargarRelojesGuardados() {
    const contenedor = document.getElementById('lista-relojes-guardados');
    if (!contenedor) return;

    try {
        const { data, error } = await clienteSupabase
            .from('profesores')
            .select('relojes_guardados')
            .eq('id', AppState.profeActivoId)
            .single();
        
        if (error) throw error;

        AppState.relojesGuardados = data.relojes_guardados || [];
        renderizarRelojesGuardados();
    } catch (e) {
        console.error("Error al cargar relojes guardados:", e);
        contenedor.innerHTML = `<p class="text-danger fs-80">Error de conexión.</p>`;
    }
}

function renderizarRelojesGuardados() {
    const contenedor = document.getElementById('lista-relojes-guardados');
    contenedor.innerHTML = "";

    if (!AppState.relojesGuardados || AppState.relojesGuardados.length === 0) {
        contenedor.innerHTML = `<p class="text-dark-muted fs-80 font-italic">No tenés configuraciones guardadas todavía.</p>`;
        return;
    }

    AppState.relojesGuardados.forEach((reloj, index) => {
        contenedor.innerHTML += `
            <div class="d-flex align-center bg-black border-333 radius-10 p-10 gap-10 transition-200">
                <div class="flex-grow-1 cursor-pointer" onclick="aplicarRelojGuardado(${index})">
                    <h4 class="text-white fs-90 m-0 mb-2">${reloj.nombre}</h4>
                    <p class="text-warning fs-75 m-0 fw-500">
                        ${reloj.modalidad} | P: ${reloj.prep} - T: ${reloj.trabajo} - D: ${reloj.descanso} | ${reloj.rondas} Rnd
                    </p>
                </div>
                <button onclick="borrarRelojGuardado(${index})" class="btn-borrar-reloj">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    });
}

function guardarRelojPersonalizado() {
    document.getElementById('input-nombre-reloj-favorito').value = "";
    document.getElementById('modal-guardar-reloj-favorito').style.display = 'flex';
}

async function confirmarGuardarRelojPersonalizado() {
    const nombre = document.getElementById('input-nombre-reloj-favorito').value.trim();
    if (!nombre) { mostrarAlerta("Atención", "Por favor, escribí un nombre."); return; }

    const btnGuardar = document.querySelector('#modal-guardar-reloj-favorito .btn-guardar');
    const textoOriginal = btnGuardar.innerText;
    btnGuardar.innerText = "Guardando...";

    let arrayEjercicios = [];
    const checkEj = document.getElementById('check-habilitar-ejercicios')?.checked;
    if (checkEj) {
        document.querySelectorAll('.input-ej-profe-dinamico').forEach(input => arrayEjercicios.push(input.value));
    }

    const configActual = {
        nombre: nombre,
        prep: document.getElementById('input-profe-prep').value,
        trabajo: document.getElementById('input-profe-trabajo').value,
        descanso: document.getElementById('input-profe-descanso').value,
        rondas: document.getElementById('input-profe-rondas').value,
        ciclos: document.getElementById('input-profe-ciclos')?.value || 1, 
        modalidad: document.querySelector('.btn-modalidad-reloj.activo')?.innerText || 'EMOM',
        ejerciciosHabilitados: checkEj,
        ejercicios: arrayEjercicios
    };

    if (!AppState.relojesGuardados) AppState.relojesGuardados = [];
    AppState.relojesGuardados.push(configActual);
    renderizarRelojesGuardados();

    try {
        await clienteSupabase.from('profesores').update({ relojes_guardados: AppState.relojesGuardados }).eq('id', AppState.profeActivoId);
        document.getElementById('modal-guardar-reloj-favorito').style.display = 'none';
        mostrarAlerta("¡Guardado!", `'${nombre}' se guardó en tus favoritos.`);
    } catch (e) { mostrarAlerta("Error", "No se pudo guardar."); } finally { btnGuardar.innerText = textoOriginal; }
}

function aplicarRelojGuardado(index) {
    const reloj = AppState.relojesGuardados[index];
    if (!reloj) return;

    document.getElementById('input-profe-prep').value = reloj.prep;
    document.getElementById('input-profe-trabajo').value = reloj.trabajo;
    document.getElementById('input-profe-descanso').value = reloj.descanso;
    document.getElementById('input-profe-rondas').value = reloj.rondas;
    if (reloj.ciclos && document.getElementById('input-profe-ciclos')) document.getElementById('input-profe-ciclos').value = reloj.ciclos;

    document.querySelectorAll('.btn-modalidad-reloj').forEach(btn => {
        if (btn.innerText.trim() === reloj.modalidad) btn.classList.add('activo');
        else btn.classList.remove('activo');
    });

    const cajaRondas = document.getElementById('caja-profe-rondas');
    const cajaCiclos = document.getElementById('caja-profe-ciclos');
    if (cajaRondas && cajaCiclos) {
        if (reloj.modalidad.toUpperCase() === 'EMOM') {
            cajaRondas.style.display = 'none';
            cajaCiclos.style.display = 'none';
        } else {
            cajaRondas.style.display = 'flex';
            cajaCiclos.style.display = 'flex';
        }
    }

    const check = document.getElementById('check-habilitar-ejercicios');
    if (check) {
        check.checked = reloj.ejerciciosHabilitados || false;
        toggleEjerciciosProfe(); 
        if (reloj.ejerciciosHabilitados && reloj.ejercicios) {
            reloj.ejercicios.forEach((ej, i) => {
                const input = document.getElementById(`input-ej-profe-${i+1}`);
                if (input) input.value = ej;
            });
        }
    }
    
    if(typeof guardarConfigRelojProfe === 'function') guardarConfigRelojProfe();
    if (navigator.vibrate) navigator.vibrate(20);
}

function borrarRelojGuardado(index) {
    pedirConfirmacion(
        "Borrar Favorito", 
        "¿Seguro que querés eliminar este cronómetro guardado?", 
        "Borrar", 
        async () => {
            AppState.relojesGuardados.splice(index, 1);
            renderizarRelojesGuardados();

            try {
                await clienteSupabase
                    .from('profesores')
                    .update({ relojes_guardados: AppState.relojesGuardados })
                    .eq('id', AppState.profeActivoId);
            } catch (e) {
                console.error("Error al borrar en Supabase", e);
            }
        }
    );
}

function reiniciarRelojProfeCompleto() {
    if (!ProfeTimer.fases || ProfeTimer.fases.length === 0) return;
    
    ProfeTimer.indiceFase = 0;
    ProfeTimer.tiempoTotal = ProfeTimer.fases[0].segundos;
    ProfeTimer.tiempoRestante = ProfeTimer.tiempoTotal;
    
    actualizarDisplayProfe();
    
    pausarRelojProfe();
}

function reiniciarFaseActualProfe() {
    if (!ProfeTimer.fases || ProfeTimer.fases.length === 0) return;
    
    ProfeTimer.tiempoRestante = ProfeTimer.tiempoTotal;
    
    actualizarDisplayProfe();
    
    pausarRelojProfe();
}


let mostrarAnimacionReloj = false; 
let ultimoEjercicioDibujado = null; 

function toggleAnimacionRelojProfe() {
    mostrarAnimacionReloj = !mostrarAnimacionReloj;
    const svgOjo = document.getElementById('svg-ojo-animacion');
    
    if (mostrarAnimacionReloj) {
        svgOjo.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        svgOjo.setAttribute('stroke', '#000');
    } else {
        svgOjo.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        svgOjo.setAttribute('stroke', '#555');
    }
    
    ultimoEjercicioDibujado = null; 
    if (ProfeTimer && ProfeTimer.fases.length > 0) {
        actualizarAnimacionTopReloj(ProfeTimer.fases[ProfeTimer.indiceFase].ejercicio, ProfeTimer.fases[ProfeTimer.indiceFase].nombre);
    }
}

function actualizarAnimacionTopReloj(nombreEjercicio, nombreFase) {
    const divLogo = document.getElementById('logo-reloj-profe');
    const divAnim = document.getElementById('animacion-reloj-profe');
    const btnOjo = document.getElementById('btn-ojo-animacion');

    if (!nombreEjercicio || nombreEjercicio.trim() === "" || nombreFase !== 'ENTRENAMIENTO') {
        if (divLogo) { divLogo.classList.add('activo'); divLogo.classList.remove('oculto'); }
        if (divAnim) { divAnim.classList.remove('activo'); divAnim.classList.add('oculto'); }
        if (btnOjo) btnOjo.style.display = 'none';
        ultimoEjercicioDibujado = null;
        return;
    }

    if (btnOjo) btnOjo.style.display = 'flex';

    if (mostrarAnimacionReloj) {
        if (ultimoEjercicioDibujado !== nombreEjercicio) {
            ultimoEjercicioDibujado = nombreEjercicio;
            
            let frames = null;
            if (typeof normalizarTexto === 'function' && typeof aliasEjercicios !== 'undefined' && typeof mapaAnimaciones !== 'undefined') {
                const clave = normalizarTexto(nombreEjercicio.trim());
                const nombreOficial = aliasEjercicios[clave] || clave;
                frames = mapaAnimaciones[nombreOficial];
            }

            if (frames) {
                divAnim.innerHTML = `<div class="anim-dinamica w-100 h-100 radius-0 bg-cover bg-no-repeat" style="--img-1: url(\'${frames[0]}\'); --img-2: url(\'${frames[1]}\');"></div>`;
            } else {
                divAnim.innerHTML = `<div class="anim-placeholder">SIN<br>FOTO</div>`;
            }
        }
        
        divLogo.classList.remove('activo'); divLogo.classList.add('oculto');
        divAnim.classList.remove('oculto'); divAnim.classList.add('activo');

    } else {
        divLogo.classList.add('activo'); divLogo.classList.remove('oculto');
        divAnim.classList.remove('activo'); divAnim.classList.add('oculto');
    }
}

function abrirListaEjerciciosReloj(idInputDestino) {
    inputDestinoEjercicio = idInputDestino; 
    modalIdSelectZona = "";
    
    esContextoPackModal = true; 
    modalFiltroCategoria = "Entrenamiento";
    modalFiltroZona = "Todas";

    const contenedorCat = document.getElementById("contenedor-chips-modal-cat");
    const contenedorZona = document.getElementById("contenedor-chips-modal-zona");
    
    if (contenedorCat) contenedorCat.style.display = "flex";
    if (contenedorZona) contenedorZona.style.display = "flex";

    const contenedorBuscador = document.getElementById("buscador-modal-ejercicios")?.parentElement;
    if (contenedorBuscador) contenedorBuscador.style.display = "flex";
    
    const buscador = document.getElementById("buscador-modal-ejercicios");
    if (buscador) {
        buscador.placeholder = "Buscar nombre o alias...";
        buscador.onkeyup = filtrarListaEjerciciosModal;
        buscador.value = ""; 
    }

    const tituloModal = document.querySelector("#modal-lista-ejercicios h3");
    if (tituloModal) tituloModal.innerText = "Elegí un ejercicio para el Reloj";

    renderizarChipsModal();
    aplicarFiltrosListaModal();
    
    document.getElementById("modal-lista-ejercicios").style.display = "flex";
}

let audioCtxGym = null;
let volumenReloj = 1.0; 
let audioDesbloqueadoIOS = false;

function obtenerAudioContext() {
    if (!audioCtxGym) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtxGym = new AudioContextClass();
        }
    }
    if (audioCtxGym && audioCtxGym.state === 'suspended') {
        audioCtxGym.resume().catch(() => {});
    }
    return audioCtxGym;
}

function inicializarAudioApple() {
    if (audioDesbloqueadoIOS) return;
    
    try {
        const ctx = obtenerAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = 0.00001;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.001);

        if ('speechSynthesis' in window) {
            const mensajeMudo = new SpeechSynthesisUtterance('');
            mensajeMudo.volume = 0;
            window.speechSynthesis.speak(mensajeMudo);
        }

        audioDesbloqueadoIOS = true;
    } catch (e) {
    }
}

document.addEventListener('touchstart', inicializarAudioApple, { once: true, passive: true });
document.addEventListener('click', inicializarAudioApple, { once: true });

function reproducirBeep(tipo) {
    if (!sonidoRelojActivado) return;

    try {
        const ctx = obtenerAudioContext();
        if (!ctx || ctx.state === 'suspended') return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const volReal = Math.max(0.0001, Math.pow(volumenReloj, 3));
        const casiCero = 0.00001;

        if (tipo === 'corto') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime); 
            gain.gain.setValueAtTime(volReal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(casiCero, ctx.currentTime + 0.1); 
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } else if (tipo === 'largo') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, ctx.currentTime); 
            gain.gain.setValueAtTime(volReal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(casiCero, ctx.currentTime + 0.5); 
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        }
    } catch (e) {
    }
}

let sonidoRelojActivado = true;
let vozRelojActivada = false;
let vibracionRelojActivada = true; 
let vocesDisponibles = [];
let vozSeleccionadaURI = null;

function cargarVocesDisponibles() {
    vocesDisponibles = window.speechSynthesis.getVoices();
    const selectVoz = document.getElementById('select-voz-reloj');
    if (!selectVoz) return;

    const vocesEspañol = vocesDisponibles.filter(voz => voz.lang.startsWith('es'));
    
    if (vocesEspañol.length === 0) {
        selectVoz.innerHTML = '<option value="">Voz por defecto del sistema</option>';
        return;
    }

    selectVoz.innerHTML = '';
    vocesEspañol.forEach(voz => {
        const opcion = document.createElement('option');
        opcion.value = voz.voiceURI;
        let nombreLindo = voz.name.replace(/Microsoft|Google|Apple|Desktop|Mobile/gi, '').trim();
        opcion.textContent = `${nombreLindo} (${voz.lang})`;
        selectVoz.appendChild(opcion);
    });

    if (vozSeleccionadaURI) {
        selectVoz.value = vozSeleccionadaURI;
    } else {
        const vozAR = vocesEspañol.find(v => v.lang === 'es-AR');
        if (vozAR) selectVoz.value = vozAR.voiceURI;
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = cargarVocesDisponibles;
}

function cambiarTipoVoz() {
    const selectVoz = document.getElementById('select-voz-reloj');
    vozSeleccionadaURI = selectVoz.value;
    localStorage.setItem('preferenciaTipoVoz', vozSeleccionadaURI);
    
    if (vozRelojActivada) hablar("Probando nueva voz");
}

function hablar(texto) {
    if (!vozRelojActivada || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    
    if (vozSeleccionadaURI && vocesDisponibles.length > 0) {
        const voz = vocesDisponibles.find(v => v.voiceURI === vozSeleccionadaURI);
        if (voz) utterance.voice = voz;
    } else {
        utterance.lang = 'es-AR'; 
    }
    
    utterance.rate = 1.3; 
    utterance.volume = volumenReloj; 
    window.speechSynthesis.speak(utterance);
}

function anunciarFaseActual() {
    if (!vozRelojActivada) return;
    const fase = ProfeTimer.fases[ProfeTimer.indiceFase];
    let frase = "";
    
    if (fase.nombre === 'PREPARACIÓN' || fase.nombre === 'PREPARACION') {
        frase = "Prepárate";
    } else if (fase.nombre === 'DESCANSO') {
        frase = "A descansar";
    } else if (fase.nombre === 'ENTRENAMIENTO') {
        frase = "A entrenar";
        if (fase.ejercicio && fase.ejercicio.trim() !== "" && fase.ejercicio.toUpperCase() !== "RECUPERACIÓN" && fase.ejercicio.toUpperCase() !== "¡PREPARATE!") {
            frase += ". Toca " + fase.ejercicio;
        }
    }
    if (frase !== "") hablar(frase);
}

function abrirMenuDerecho() {
    const overlay = document.getElementById('overlay-menu-derecho');
    const menu = document.getElementById('menu-lateral-derecho');
    overlay.style.display = 'block';
    
    const nav = document.getElementById('menu-inferior-global');
    if(nav) nav.classList.add('oculto-por-panel');

    setTimeout(() => { overlay.style.opacity = '1'; menu.style.right = '0'; }, 10);
    if (vocesDisponibles.length === 0) cargarVocesDisponibles();
}

function cerrarMenuDerecho() {
    const overlay = document.getElementById('overlay-menu-derecho');
    const menu = document.getElementById('menu-lateral-derecho');
    
    overlay.style.opacity = '0'; 
    menu.style.right = '-800px'; 
    
    const nav = document.getElementById('menu-inferior-global');
    if(nav) nav.classList.remove('oculto-por-panel');

    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function cambiarSonidoReloj() {
    const check = document.getElementById('check-sonido-reloj');
    const slider = document.getElementById('slider-sonido');
    const bola = document.getElementById('bola-sonido');
    const contenedorVol = document.getElementById('contenedor-volumen'); 
    
    sonidoRelojActivado = check.checked;
    
    if (sonidoRelojActivado) {
        slider.style.backgroundColor = '#f39c12'; bola.style.left = '24px';
        if (contenedorVol) { contenedorVol.style.opacity = '1'; contenedorVol.style.pointerEvents = 'auto'; }
    } else {
        slider.style.backgroundColor = '#444'; bola.style.left = '4px';
        if (contenedorVol) { contenedorVol.style.opacity = '0.3'; contenedorVol.style.pointerEvents = 'none'; }
    }
    localStorage.setItem('preferenciaSonidoReloj', sonidoRelojActivado);
}

function cambiarVolumenReloj() {
    const rango = document.getElementById('rango-volumen');
    volumenReloj = parseFloat(rango.value);
    localStorage.setItem('volumenRelojGym', volumenReloj);
    if (sonidoRelojActivado) reproducirBeep('corto');
}

function actualizarEstiloVolumen() {
    const rango = document.getElementById('rango-volumen');
    if(!rango) return;
    volumenReloj = parseFloat(rango.value); 
    const porcentaje = ((rango.value - 0.1) / 0.9) * 100;
    rango.style.background = `linear-gradient(to right, #f39c12 ${porcentaje}%, #444 ${porcentaje}%)`;
}

function cambiarVozReloj(cargaInicial = false) {
    const check = document.getElementById('check-voz-reloj');
    const slider = document.getElementById('slider-voz');
    const bola = document.getElementById('bola-voz');
    const contenedorSelect = document.getElementById('contenedor-selector-voz');
    
    vozRelojActivada = check.checked;
    
    if (vozRelojActivada) {
        slider.style.backgroundColor = '#f39c12'; bola.style.left = '24px';
        if (contenedorSelect) contenedorSelect.style.display = 'block'; 
        
        if (vocesDisponibles.length === 0) cargarVocesDisponibles();
        if (!cargaInicial) hablar("Voz activada"); 
    } else {
        slider.style.backgroundColor = '#444'; bola.style.left = '4px';
        if (contenedorSelect) contenedorSelect.style.display = 'none'; 
        if (!cargaInicial) window.speechSynthesis.cancel();
    }
    
    localStorage.setItem('preferenciaVozReloj', vozRelojActivada);
}

function cambiarVibracionReloj(cargaInicial = false) {
    const check = document.getElementById('check-vibracion-reloj');
    const slider = document.getElementById('slider-vibracion');
    const bola = document.getElementById('bola-vibracion');
    
    vibracionRelojActivada = check.checked;
    
    if (vibracionRelojActivada) {
        slider.style.backgroundColor = '#f39c12'; bola.style.left = '24px';
     
        if (!cargaInicial && navigator.vibrate) navigator.vibrate(50); 
    } else {
        slider.style.backgroundColor = '#444'; bola.style.left = '4px';
    }
    
    localStorage.setItem('preferenciaVibracionReloj', vibracionRelojActivada);
}

function restaurarPreferenciasSonido() {
    const guardado = localStorage.getItem('preferenciaSonidoReloj');
    if (guardado !== null) {
        const check = document.getElementById('check-sonido-reloj');
        if (check) check.checked = (guardado === 'true');
    }

    const guardadoVol = localStorage.getItem('volumenRelojGym');
    if (guardadoVol !== null) {
        volumenReloj = parseFloat(guardadoVol);
        const rango = document.getElementById('rango-volumen');
        if (rango) rango.value = volumenReloj;
    }
    
    const guardadoTipoVoz = localStorage.getItem('preferenciaTipoVoz');
    if (guardadoTipoVoz !== null) {
        vozSeleccionadaURI = guardadoTipoVoz;
    }
    
    const guardadoVoz = localStorage.getItem('preferenciaVozReloj');
    if (guardadoVoz !== null) {
        const checkVoz = document.getElementById('check-voz-reloj');
        if (checkVoz) checkVoz.checked = (guardadoVoz === 'true');
    }

    const guardadoVib = localStorage.getItem('preferenciaVibracionReloj');
    if (guardadoVib !== null) {
        const checkVib = document.getElementById('check-vibracion-reloj');
        if (checkVib) checkVib.checked = (guardadoVib === 'true');
    }
    
    cambiarSonidoReloj(); 
    actualizarEstiloVolumen(); 
    cambiarVozReloj(true); 
    cambiarVibracionReloj(true); 
    
    cargarVocesDisponibles();
}

window.addEventListener('load', restaurarPreferenciasSonido);


let relojRotado = false;

function toggleRotacionReloj() {
    const pantalla = document.getElementById('pantalla-reloj');
    const menuGlobal = document.getElementById('menu-inferior-global');
    relojRotado = !relojRotado;
    
    if (relojRotado) {
        pantalla.classList.add('pantalla-reloj-apaisada');
        if (menuGlobal) pantalla.appendChild(menuGlobal);
    } else {
        pantalla.classList.remove('pantalla-reloj-apaisada');

        const main = document.querySelector('main.contenedor-app');
        if (menuGlobal && main) main.appendChild(menuGlobal);
    }
}

document.addEventListener('click', function(e) {
    const btnNav = e.target.closest('#menu-inferior-global .nav-item');
    
    if (btnNav && !btnNav.classList.contains('tab-reloj')) {
        const pantalla = document.getElementById('pantalla-reloj');
        
        if (pantalla && pantalla.classList.contains('pantalla-reloj-apaisada')) {
            relojRotado = false;
            pantalla.classList.remove('pantalla-reloj-apaisada');
            
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(e => console.log(e));
            }
        }
    }
});


let pantallaGymWakeLock = null;

async function mantenerPantallaPrendida() {
    if ('wakeLock' in navigator) {
        try {
            pantallaGymWakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.log('No se pudo bloquear la pantalla encendida:', err);
        }
    }
}

function permitirApagarPantalla() {
    if (pantallaGymWakeLock !== null) {
        pantallaGymWakeLock.release().then(() => {
            pantallaGymWakeLock = null;
        });
    }
}






window.guardarEstadoReloj = guardarEstadoReloj;
window.restaurarRelojGlobal = restaurarRelojGlobal;
window.iniciarRelojGlobal = iniciarRelojGlobal;
window.pausarRelojGlobal = pausarRelojGlobal;
window.detenerRelojGlobal = detenerRelojGlobal;
window.cambiarFaseReloj = cambiarFaseReloj;
window.actualizarDisplayReloj = actualizarDisplayReloj;
window.togglePlayPauseReloj = togglePlayPauseReloj;
window.aplicarColorFase = aplicarColorFase;
window.dispararFinEntrenamientoAlumno = dispararFinEntrenamientoAlumno;
window.mostrarNotificacionPushWhatsApp = mostrarNotificacionPushWhatsApp;
window.registrarNotificacionEnTuLista = registrarNotificacionEnTuLista;
window.inyectarTarjetaNotificacion = inyectarTarjetaNotificacion;
window.restaurarNotificacionesEmomGuardadas = restaurarNotificacionesEmomGuardadas;
window.abrirCampanitaDesdeNotificacion = abrirCampanitaDesdeNotificacion;
window.configurarDescarteDeslizante = configurarDescarteDeslizante;
window.reproducirAlertaRing = reproducirAlertaRing;
window.abrirModalSelectorReloj = abrirModalSelectorReloj;
window.seleccionarRelojManual = seleccionarRelojManual;
window.generarOpcionesPicker = generarOpcionesPicker;
window.abrirTimePicker = abrirTimePicker;
window.cerrarTimePicker = cerrarTimePicker;
window.actualizarSeleccionPicker = actualizarSeleccionPicker;
window.aceptarTimePicker = aceptarTimePicker;
window.abrirPantallaReloj = abrirPantallaReloj;
window.abrirMenuReloj = abrirMenuReloj;
window.cerrarMenuReloj = cerrarMenuReloj;
window.seleccionarModalidadReloj = seleccionarModalidadReloj;
window.prepararRelojProfe = prepararRelojProfe;
window.actualizarDisplayProfe = actualizarDisplayProfe;
window.detenerRelojProfe = detenerRelojProfe;
window.iniciarRelojProfe = iniciarRelojProfe;
window.pausarRelojProfe = pausarRelojProfe;
window.togglePlayPauseRelojProfe = togglePlayPauseRelojProfe;
window.cambiarFaseRelojProfe = cambiarFaseRelojProfe;
window.guardarConfigRelojProfe = guardarConfigRelojProfe;
window.guardarEstadoProfeTimer = guardarEstadoProfeTimer;
window.restaurarRelojProfeCompleto = restaurarRelojProfeCompleto;
window.cargarRelojesGuardados = cargarRelojesGuardados;
window.renderizarRelojesGuardados = renderizarRelojesGuardados;
window.guardarRelojPersonalizado = guardarRelojPersonalizado;
window.confirmarGuardarRelojPersonalizado = confirmarGuardarRelojPersonalizado;
window.aplicarRelojGuardado = aplicarRelojGuardado;
window.borrarRelojGuardado = borrarRelojGuardado;
window.reiniciarRelojProfeCompleto = reiniciarRelojProfeCompleto;
window.reiniciarFaseActualProfe = reiniciarFaseActualProfe;
window.toggleAnimacionRelojProfe = toggleAnimacionRelojProfe;
window.actualizarAnimacionTopReloj = actualizarAnimacionTopReloj;
window.abrirListaEjerciciosReloj = abrirListaEjerciciosReloj;
window.obtenerAudioContext = obtenerAudioContext;
window.inicializarAudioApple = inicializarAudioApple;
window.reproducirBeep = reproducirBeep;
window.cargarVocesDisponibles = cargarVocesDisponibles;
window.cambiarTipoVoz = cambiarTipoVoz;
window.hablar = hablar;
window.anunciarFaseActual = anunciarFaseActual;
window.abrirMenuDerecho = abrirMenuDerecho;
window.cerrarMenuDerecho = cerrarMenuDerecho;
window.cambiarSonidoReloj = cambiarSonidoReloj;
window.cambiarVolumenReloj = cambiarVolumenReloj;
window.actualizarEstiloVolumen = actualizarEstiloVolumen;
window.cambiarVozReloj = cambiarVozReloj;
window.cambiarVibracionReloj = cambiarVibracionReloj;
window.restaurarPreferenciasSonido = restaurarPreferenciasSonido;
window.toggleRotacionReloj = toggleRotacionReloj;
window.mantenerPantallaPrendida = mantenerPantallaPrendida;
window.permitirApagarPantalla = permitirApagarPantalla;