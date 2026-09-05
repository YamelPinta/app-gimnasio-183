
function toggleModal(idModal, mostrar, displayType = 'flex') {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = mostrar ? displayType : 'none';
        
        if (idModal === 'bottom-sheet-overlay') {
            const bsContent = document.getElementById("bottom-sheet-content");
            if (mostrar) {
                setTimeout(() => modal.classList.add("activo"), 10);
            } else {
                modal.classList.remove("activo");
                if(bsContent) bsContent.style.transform = '';
            }
        }
    }
}

window.navegarA = function navegarA(idPantallaDestino, displayType = 'block') {
    const pantallas = [
        'pantalla-inicio', 'pantalla-login', 'pantalla-perfiles', 
        'pantalla-dashboard', 'pantalla-detalle-alumno', 'pantalla-rutinas', 
        'pantalla-detalle-pack', 'pantalla-admin', 'pantalla-alumno-proximamente', 'pantalla-reloj'
    ];
    
    pantallas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const destino = document.getElementById(idPantallaDestino);
    if (destino) destino.style.display = displayType;
};

function cerrarCualquierModal(idModal) {
    toggleModal(idModal, false);
}

function pedirConfirmacion(titulo, mensaje, textoBoton, funcionAConfirmar) {
    document.getElementById("titulo-confirmacion").innerText = titulo;
    document.getElementById("texto-confirmacion").innerText = mensaje;
    document.getElementById("btn-confirmar-accion").innerText = textoBoton;
    
    AppState.accionPendiente = funcionAConfirmar; 
    document.getElementById("modal-confirmacion").style.display = "flex";
}

document.getElementById("btn-confirmar-accion").addEventListener("click", () => {
    if (AppState.accionPendiente) {
        AppState.accionPendiente(); 
        toggleModal('modal-confirmacion', false); 
    }
});

function mostrarAlerta(titulo, mensaje) {
    document.getElementById("titulo-alerta").innerText = titulo;
    document.getElementById("texto-alerta").innerText = mensaje;
    
    const tituloMin = titulo.toLowerCase();
    const esExito = tituloMin.includes('éxito') || 
                    tituloMin.includes('exitosa') || 
                    tituloMin.includes('registrada') || 
                    tituloMin.includes('copiada') || 
                    tituloMin.includes('limpio')||
                    tituloMin.includes('guardado');

    const contenedorIcono = document.getElementById("contenedor-icono-alerta");
    const tituloDOM = document.getElementById("titulo-alerta");

    if (esExito) {
        contenedorIcono.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" class="anim-exito"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
        tituloDOM.style.color = "#2ecc71"; 
    } else {
        contenedorIcono.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2.5" width="48" height="48" class="anim-alerta"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        tituloDOM.style.color = "#ffffff"; 
    }

    document.getElementById("modal-alerta").style.display = "flex";
}

const funcionAlertaOriginal = mostrarAlerta;
mostrarAlerta = function(titulo, mensaje) {
    if (navigator.vibrate) {
        const tituloMin = titulo.toLowerCase();
        const esExito = tituloMin.includes('éxito') || tituloMin.includes('exitosa') || tituloMin.includes('registrada') || tituloMin.includes('copiada') || tituloMin.includes('limpio') || tituloMin.includes('guardado');
        
        if (esExito) {
            navigator.vibrate(100); 
        } else {
            navigator.vibrate([50, 50, 50]); 
        }
    }
    funcionAlertaOriginal(titulo, mensaje); 
};

function inicializarTema() {
    const temaGuardado = localStorage.getItem('temaGlobalGym');
    
    if (temaGuardado === 'claro') {
        AppState.esTemaOscuro = false;
    } else {
        AppState.esTemaOscuro = true; 
    }
    
    aplicarTemaVisual();
}

function alternarTemaGlobal() {
    
    AppState.esTemaOscuro = !AppState.esTemaOscuro;

    localStorage.setItem('temaGlobalGym', AppState.esTemaOscuro ? 'oscuro' : 'claro');
    
    aplicarTemaVisual();
}

function aplicarTemaVisual() {
    const pantallasOscuras = ['pantalla-inicio', 'pantalla-login', 'pantalla-perfiles'];
    pantallasOscuras.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            if(AppState.esTemaOscuro) el.classList.remove('modo-claro');
            else el.classList.add('modo-claro');
        }
    });

    const pantallasClaras = ['pantalla-dashboard', 'pantalla-detalle-alumno', 'pantalla-rutinas', 'pantalla-detalle-pack', 'pantalla-admin'];
    pantallasClaras.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            if(AppState.esTemaOscuro) el.classList.add('modo-oscuro');
            else el.classList.remove('modo-oscuro');
        }
    });

    if(AppState.esTemaOscuro) {
        document.body.classList.add('tema-oscuro');
    } else {
        document.body.classList.remove('tema-oscuro');
    }

    const soles = document.querySelectorAll('[id^="icono-sol"]');
    const lunas = document.querySelectorAll('[id^="icono-luna"]');

    if(AppState.esTemaOscuro) {
        soles.forEach(sol => sol.style.display = 'block'); 
        lunas.forEach(luna => luna.style.display = 'none');
    } else {
        soles.forEach(sol => sol.style.display = 'none');
        lunas.forEach(luna => luna.style.display = 'block'); 
    }
}

function alternarTemaInicio() { alternarTemaGlobal(); }
function alternarTemaLogin() { alternarTemaGlobal(); }
function alternarTemaPerfiles() { alternarTemaGlobal(); }
function alternarTemaDashboard() { alternarTemaGlobal(); }

window.history.pushState({ appAbierta: true }, "", "");

window.addEventListener('popstate', function (event) {
    let interceptado = false;

    if (typeof AppState.vistaSliderActual !== 'undefined' && AppState.vistaSliderActual === 'ejercicios') {
        cerrarCategoria();
        interceptado = true;
    }

    if (!interceptado) {
        const idsModales = [
            "modal-confirmacion", "modal-alerta", "modal-error-login", "modal-notificaciones",
            "modal-seleccionar-pack", "modal-ejercicio-pack", "modal-crear-pack", "modal-ejercicio",
            "modal-editar-dias", "modal-renombrar-categoria", "modal-opciones-categoria", "modal-categoria",
            "modal-rendimiento", "modal-editar-alumno", "modal-alumno", "modal-editar-profe", "modal-profe",
            "modal-checkin", "modal-terminos", "modal-editar-pack", "modal-cambiar-password", "modal-porcentaje",
            "modal-informe-profe", "modal-time-picker", "modal-advertencia-cierre", "modal-seleccionar-reloj",
            "modal-lista-ejercicios", "modal-editar-chips", "visor-fullscreen", "bottom-sheet-overlay"
        ];

        for (let id of idsModales) {
            const el = document.getElementById(id);
            if (el && (el.style.display === "flex" || el.style.display === "block")) {
                if (id === 'modal-ejercicio') {
                     intentarCerrarModal(id);
                } else if (id === 'bottom-sheet-overlay') {
                     cerrarBottomSheet();
                } else if (id === 'visor-fullscreen') {
                     cerrarImagenFullscreen();
                } else {
                     toggleModal(id, false); 
                }
                interceptado = true;
                break; 
            }
        }
    }

    if (!interceptado) {
        const esVisible = (id) => {
            const el = document.getElementById(id);
            return el && (el.style.display === "flex" || el.style.display === "block");
        };

        if (esVisible("pantalla-detalle-pack")) {
            abrirPantallaRutinas();
            interceptado = true;
        } else if (esVisible("pantalla-rutinas") || esVisible("pantalla-detalle-alumno") || esVisible("pantalla-admin")) {
            irAlDashboard();
            interceptado = true;
        } else if (esVisible("pantalla-dashboard")) {
            irAPerfiles();
            interceptado = true;
        } else if (esVisible("pantalla-login")) {
            irAPerfiles();
            interceptado = true;
        } else if (esVisible("pantalla-alumno-proximamente")) {
            navegarA('pantalla-inicio', 'flex');
            interceptado = true;
        } else if (esVisible("pantalla-perfiles")) {
            const sesion = localStorage.getItem('sesionGimnasio');
            if (!sesion) {
                navegarA('pantalla-inicio', 'flex');
                interceptado = true;
            }
        }
        } else if (esVisible("pantalla-reloj")) { irAlDashboard(); interceptado = true;
    }

    if (interceptado) {
        window.history.pushState({ appAbierta: true }, "", "");
    } else {
    }
});

window.addEventListener('offline', () => {
    document.getElementById('modal-offline').style.display = 'flex';
    
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); 
    }
});

window.addEventListener('online', () => {
    document.getElementById('modal-offline').style.display = 'none';
    mostrarAlerta("¡Conexión Exitosa!", "Ya tenés internet de nuevo. Volviste a estar conectado.");
});

document.addEventListener('click', function(e) {
    if (!navigator.vibrate) return; 
    const elementoTocado = e.target.closest('button, .card-alumno, .tarjeta-perfil-moderna, .tarjeta-rol, .chip, svg[onclick]');
    if (elementoTocado) navigator.vibrate(15); 
});

document.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        
        let valorOriginal = e.target.value;
        const idInput = e.target.id || '';
        const esCampoRutina = idInput.includes('-ej-') || 
                              idInput.includes('bs-input-') || 
                              idInput.includes('-serie-');

        if (e.target.type === 'text' || e.target.tagName === 'TEXTAREA') {
            
            if (!idInput.includes('foto') && e.target.type !== 'email') {
                
                if (esCampoRutina) {
                    const tieneSimbolosRutina = /[<>{}]/g.test(valorOriginal);
                    
                    if (tieneSimbolosRutina) {
                        mostrarAlerta("Símbolo no permitido", "En los textos de las rutinas no se permiten los símbolos: < > { }");
                        let valorLimpio = valorOriginal.replace(/[<>{}]/g, '');
                        e.target.value = valorLimpio;
                    }
                } else {
                    const tieneSimbolos = /[<>{}`=]/g.test(valorOriginal); 
                    const tieneHttp = /http/i.test(valorOriginal);     

                    if (tieneSimbolos || tieneHttp) {
                        mostrarAlerta("Símbolo no permitido", "Por seguridad no se permiten enlaces web ni usar los símbolos: < > { } ` =");
                        let valorLimpio = valorOriginal.replace(/[<>{}`=]/g, '').replace(/http/gi, '');
                        e.target.value = valorLimpio;
                    }
                }
            }
        }

        if (e.target.type === 'number') {
            if (parseFloat(valorOriginal) < 0) {
                mostrarAlerta("Valor inválido", "No se permiten ingresar números negativos.");
                e.target.value = Math.abs(valorOriginal);
            }
        }
    }
});


function irAlDashboard() {
    if (document.getElementById("pantalla-dashboard").style.display === "block") return;

    window.scrollTo(0, 0);
    
    const pantallas = [
        "pantalla-inicio", "pantalla-login", "pantalla-perfiles",
        "pantalla-detalle-alumno", "pantalla-rutinas",
        "pantalla-detalle-pack", "pantalla-admin", "pantalla-reloj" 
    ];
    pantallas.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    document.getElementById("pantalla-dashboard").style.display = "block";
    actualizarMenuInferior('alumnos');
    
    setTimeout(() => {
        if (typeof cargarAlumnos === 'function') cargarAlumnos();
    }, 50);
}

function irAPerfiles() {
    AppState.profeActivoId = null;
    AppState.esAdminActual = false;
    
    actualizarMenuInferior('perfiles'); 

    requestAnimationFrame(() => {
        setTimeout(() => {
            navegarA('pantalla-perfiles', 'flex');
        }, 0);
    });
}

function abrirModalTerminos() {
    document.getElementById("modal-terminos").style.display = "flex";
}

function abrirModalNotificaciones() {
    const contenedor = document.getElementById("lista-notificaciones");

    if (!AppState.notificacionesGlobales || AppState.notificacionesGlobales.length === 0) {
        contenedor.innerHTML = "<p class='text-center mt-20 text-aaa'>No hay vencimientos pendientes.</p>";
    } else {
        AppState.notificacionesGlobales.sort((a, b) => b.esNueva - a.esNueva);

        let htmlFinal = "";

        AppState.notificacionesGlobales.forEach(notif => {
            let claseLeida = notif.esNueva ? "nueva" : "leida";
            let claseTipo = notif.tipo === 'vencida' ? "vencida" : "";
            let textoEstado = notif.tipo === 'vencida' ? `Vencida hace ${notif.dias} días` : `Vence en ${notif.dias} días`;

            const nombreSeguro = escaparHTML(notif.alumnoNombre);

            htmlFinal += `
                <div class="item-notificacion ${claseTipo} ${claseLeida}">
                    <h4>${nombreSeguro}</h4>
                    <p>${textoEstado} (${notif.fechaFormateada})</p>
                </div>
            `;
        });
        
        contenedor.innerHTML = htmlFinal;
    }

    document.getElementById("modal-notificaciones").style.display = "flex";

    if (AppState.notificacionesGlobales && AppState.notificacionesGlobales.length > 0) {
        let leidasGuardadas = JSON.parse(localStorage.getItem('notifLeidas_' + AppState.profeActivoId)) || [];
        
        AppState.notificacionesGlobales.forEach(n => {
            if (!leidasGuardadas.includes(n.idNotif)) {
                leidasGuardadas.push(n.idNotif); 
            }
        });
        
        localStorage.setItem('notifLeidas_' + AppState.profeActivoId, JSON.stringify(leidasGuardadas));

        const badge = document.getElementById("badge-notificaciones");
        if (badge) badge.style.display = "none";
        
        AppState.notificacionesGlobales.forEach(n => n.esNueva = false);
    }
}

document.addEventListener('click', function(e) {
    const btnNav = e.target.closest('.nav-item');
    
    if (btnNav && !btnNav.classList.contains('tab-reloj')) {
        const pantallaReloj = document.getElementById('pantalla-reloj');
        if (pantallaReloj) {
            pantallaReloj.style.display = 'none';
        }
    }
});

function actualizarMenuInferior(pestanaActiva) {
    const menuGlobal = document.getElementById('menu-inferior-global');
    if (!menuGlobal) return;

    menuGlobal.classList.remove('oculto-por-panel');

    if (pestanaActiva !== 'reloj' && typeof relojRotado !== 'undefined' && relojRotado) {
        relojRotado = false;
        const pantallaReloj = document.getElementById('pantalla-reloj');
        if (pantallaReloj) pantallaReloj.classList.remove('pantalla-reloj-apaisada');

        const main = document.querySelector('main.contenedor-app');
        if (main) main.appendChild(menuGlobal);

        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(e => console.log(e));
        }
    }

    if (pestanaActiva === 'inicio' || pestanaActiva === 'login' || pestanaActiva === 'perfiles') {
        menuGlobal.style.display = 'none';
        return;
    } else {
        menuGlobal.style.display = 'flex';
    }

    const botones = menuGlobal.querySelectorAll('.nav-item');
    botones.forEach(btn => btn.classList.remove('activo'));

    const botonActivo = menuGlobal.querySelector(`.tab-${pestanaActiva}`);
    if (botonActivo) {
        botonActivo.classList.add('activo');
    }

    if (pestanaActiva === 'reloj') {
        menuGlobal.classList.add('modo-reloj');
    } else {
        menuGlobal.classList.remove('modo-reloj');
    }

    const btnInforme = menuGlobal.querySelector('.tab-informe');
    if (btnInforme && typeof AppState !== 'undefined') {
        btnInforme.style.display = AppState.esAdminActual ? 'flex' : 'none';
    }
}



window.toggleModal = toggleModal;
window.navegarA = navegarA;
window.cerrarCualquierModal = cerrarCualquierModal;
window.pedirConfirmacion = pedirConfirmacion;
window.mostrarAlerta = mostrarAlerta;
window.inicializarTema = inicializarTema;
window.alternarTemaGlobal = alternarTemaGlobal;
window.aplicarTemaVisual = aplicarTemaVisual;
window.alternarTemaInicio = alternarTemaInicio;
window.alternarTemaLogin = alternarTemaLogin;
window.alternarTemaPerfiles = alternarTemaPerfiles;
window.alternarTemaDashboard = alternarTemaDashboard;
window.irAlDashboard = irAlDashboard;
window.irAPerfiles = irAPerfiles;
window.abrirModalTerminos = abrirModalTerminos;
window.abrirModalNotificaciones = abrirModalNotificaciones;
window.actualizarMenuInferior = actualizarMenuInferior;