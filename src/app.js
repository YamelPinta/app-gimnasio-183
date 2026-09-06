import './style.css';


// Limpiador automático de cachés de la versión anterior
if ('caches' in window) {
    caches.keys().then(nombres => {
        nombres.forEach(nombre => {
            if (nombre.includes('gimnasio-estatico') || nombre.includes('gimnasio-dinamico')) {
                caches.delete(nombre);
                console.log('Caché antiguo eliminado:', nombre);
            }
        });
    });
}



let sortableChips = null; 

const estilosChips = document.createElement('style');
estilosChips.innerHTML = `
    .chip-verde { background-color: rgba(46, 204, 113, 0.15) !important; color: #2ecc71 !important; border-color: rgba(46, 204, 113, 0.4) !important; }
    .chip-verde.activo { background-color: #2ecc71 !important; color: #141414 !important; border-color: #2ecc71 !important; }
    .chip-rojo { background-color: rgba(231, 76, 60, 0.1) !important; color: #e74c3c !important; border-color: rgba(231, 76, 60, 0.3) !important; }
    .chip-rojo.activo { background-color: #e74c3c !important; color: #fff !important; border-color: #e74c3c !important; }
`;
document.head.appendChild(estilosChips);


document.addEventListener("DOMContentLoaded", async () => {

    document.querySelectorAll('input:not([list])').forEach(input => {
        input.setAttribute('autocomplete', 'nope'); 
        input.setAttribute('data-lpignore', 'true'); 
    });

    inicializarTema();
    cargarProfesores();


    clienteSupabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
            localStorage.removeItem('sesionGimnasioID');
            localStorage.removeItem('sesionGimnasioNombre');
            localStorage.removeItem('sesionGimnasioApellido');
            
            document.getElementById("pantalla-dashboard").style.display = "none";
            document.getElementById("pantalla-perfiles").style.display = "none";
            document.getElementById("pantalla-inicio").style.display = "flex";
        }
    });


    const { data: { session }, error: errorSesion } = await clienteSupabase.auth.getSession();

    if (session && !errorSesion) {


        const { data: profe } = await clienteSupabase
            .from('profesores') 
            .select('id, nombre, apellido, es_admin')
            .eq('email_auth', session.user.email)
            .single();

        if (profe) {
            AppState.profeActivoId = profe.id;
            AppState.esAdminActual = profe.es_admin || false;
            
            document.getElementById("nombre-profe-activo").innerText = "Profe " + profe.nombre;
            
            document.querySelectorAll('.nav-admin-only').forEach(btn => {
                btn.style.display = AppState.esAdminActual ? 'flex' : 'none';
            });

            document.getElementById("pantalla-inicio").style.display = "none";
            document.getElementById("pantalla-login").style.display = "none";
            document.getElementById("pantalla-perfiles").style.display = "none";
            document.getElementById("pantalla-dashboard").style.display = "block";
           
            cargarAlumnos();
            cargarChips();
            actualizarMenuInferior('alumnos');
        } else {

            await clienteSupabase.auth.signOut();
            document.getElementById("pantalla-inicio").style.display = "flex";
        }
    } else {

        document.getElementById("pantalla-inicio").style.display = "flex";
        document.getElementById("pantalla-login").style.display = "none";
        document.getElementById("pantalla-perfiles").style.display = "none";
        document.getElementById("pantalla-dashboard").style.display = "none";
    }
});


function abrirModalFormularioAlumno(modo) {
    window.scrollTo(0, 0);
    const modal = document.getElementById("modal-alumno");
    const titulo = modal.querySelector("h3");
    
    const setValor = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor;
    };

    if (modo === 'crear') {
        AppState.alumnoEditandoId = null; 
        titulo.innerText = "Añadir Alumno";
        
        setValor("input-alumno-nombre", "");
        setValor("input-alumno-dni", "");
        setValor("select-alumno-tipo", "Con rutina"); 
        setValor("select-alumno-actividad", "Musculación");
        setValor("input-alumno-objetivo", "");
        setValor("input-alumno-edad", "");
        setValor("input-alumno-condicion", "");
        setValor("input-alumno-cuota", "");
        
        const fechaHoy = new Date();
        setValor("input-alumno-pago", fechaHoy.toISOString().split('T')[0]);
        
    } else if (modo === 'editar') {
        if (!AppState.alumnoDataActual) return;
        AppState.alumnoEditandoId = AppState.alumnoSeleccionadoId; 
        titulo.innerText = "Editar Alumno";
        
        const data = AppState.alumnoDataActual;
        setValor("input-alumno-nombre", `${data.nombre} ${data.apellido}`);
        setValor("input-alumno-dni", data.dni || "");
        setValor("select-alumno-tipo", data.tipo_rutina || "Con rutina"); 
        setValor("select-alumno-actividad", data.actividad || "Musculación");
        setValor("input-alumno-objetivo", data.objetivo || "");
        setValor("input-alumno-edad", data.edad || "");
        setValor("input-alumno-condicion", data.condicion_medica || "");
        setValor("input-alumno-cuota", data.cuota ? data.cuota.toLocaleString('es-AR') : "");

        let fechaPago = data.fecha_ultimo_pago;
        if (!fechaPago && data.vencimiento_cuota) {
            let v = new Date(data.vencimiento_cuota + 'T00:00:00');
            v.setDate(v.getDate() - 30);
            fechaPago = v.toISOString().split('T')[0];
        }
        setValor("input-alumno-pago", fechaPago || "");
    }

    modal.style.display = "flex";
}


async function guardarFormularioAlumnoEnBD() {
    const getValor = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const nombreCompleto = getValor("input-alumno-nombre");
    const dni = getValor("input-alumno-dni");
    const tipoRutina = document.getElementById("select-alumno-tipo")?.value || "Con rutina"; 
    const actividad = document.getElementById("select-alumno-actividad")?.value || "Musculación";
    let objetivo = getValor("input-alumno-objetivo") || "General";
    const edad = getValor("input-alumno-edad");
    let condicion = getValor("input-alumno-condicion") || "Sin observaciones.";
    const cuota = getValor("input-alumno-cuota");
    
    let fechaPagoStr = getValor("input-alumno-pago");
    let vencimientoCuota = null;
    if (fechaPagoStr) {
        let fPago = new Date(fechaPagoStr + 'T00:00:00');
        fPago.setDate(fPago.getDate() + 30); 
        vencimientoCuota = fPago.toISOString().split('T')[0];
    }

    if (!nombreCompleto) {
        mostrarAlerta("Faltan datos", "Por favor, ingresá el nombre y apellido del alumno.");
        return;
    }

    if (!navigator.onLine) {
        mostrarAlerta("Sin conexión", "No tenés internet. Conectate a una red para poder guardar.");
        return;
    }

    const partes = nombreCompleto.split(" ");
    const nombre = partes[0];
    const apellido = partes.slice(1).join(" ") || ""; 


    const datosAGuardar = {
        nombre: nombre, 
        apellido: apellido, 
        dni: dni || null, 
        tipo_rutina: tipoRutina, 
        vencimiento_cuota: vencimientoCuota, 
        fecha_ultimo_pago: fechaPagoStr || null,
        actividad: actividad,
        objetivo: objetivo,
        edad: edad ? parseInt(edad) : null,
        condicion_medica: condicion,
        cuota: cuota ? parseInt(cuota.replace(/\./g, '')) : null
    };

    const btnGuardar = document.querySelector("#modal-alumno .btn-guardar");
    const textoOriginal = btnGuardar.innerText;
    btnGuardar.innerText = "Guardando...";

    try {
        if (AppState.alumnoEditandoId) {

            const { error } = await clienteSupabase.from('alumnos').update(datosAGuardar).eq('id', AppState.alumnoEditandoId);
            if (error) throw error;
            mostrarAlerta("¡Edición Exitosa!", "Los datos del alumno se actualizaron correctamente.");
        } else {

            datosAGuardar.profesor_id = AppState.profeActivoId;
            const { error } = await clienteSupabase.from('alumnos').insert([datosAGuardar]);
            if (error) throw error;
            mostrarAlerta("¡Guardado con Éxito!", "El alumno se registró correctamente.");
        }
        
        toggleModal('modal-alumno', false);
        cargarAlumnos(); 
        

        if (AppState.alumnoEditandoId && document.getElementById("pantalla-detalle-alumno").style.display === "block") {
            abrirGrillaAlumno(AppState.alumnoEditandoId); 
        }
        
    } catch (error) {
        if (error.message.includes("Failed to fetch")) {
            mostrarAlerta("Sin conexión", "Se cortó el internet intentando guardar.");
        } else {
            mostrarAlerta("Error", "Error al guardar el alumno: " + error.message);
        }
    } finally {
        btnGuardar.innerText = textoOriginal;
    }
}

async function registrarPago(idAlumno, nombreAlumno) {
    const confirmar = confirm(`¿Querés registrar el pago de este mes para ${nombreAlumno}?`);
    if (!confirmar) return;

    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 1);
    const nuevoVencimiento = fecha.toISOString().split('T')[0];

    try {
        const { error } = await clienteSupabase
            .from('alumnos')
            .update({ vencimiento_cuota: nuevoVencimiento })
            .eq('id', idAlumno);

        if (error) throw error;
        cargarAlumnos();
    } catch (error) {
        mostrarAlerta("Error al registrar el pago: " + error.message);
    }
}

async function anularPago(idAlumno, nombreAlumno, fechaVencimientoActual) {
    const confirmar = confirm(`¿Querés deshacer el pago de ${nombreAlumno}? Esto le restará un mes a su vencimiento.`);
    if (!confirmar) return;

    const fecha = new Date(fechaVencimientoActual + 'T00:00:00');
    fecha.setMonth(fecha.getMonth() - 1);
    const vencimientoAnterior = fecha.toISOString().split('T')[0];

    try {
        const { error } = await clienteSupabase
            .from('alumnos')
            .update({ vencimiento_cuota: vencimientoAnterior })
            .eq('id', idAlumno);

        if (error) throw error;
        cargarAlumnos();
    } catch (error) {
        mostrarAlerta("Error al anular el pago: " + error.message);
    }
}


async function cargarAlumnos() {
    const contenedor = document.getElementById("lista-alumnos");
    if (contenedor.innerHTML.trim() === "") {
        contenedor.innerHTML = "<p class='text-center text-muted mt-20'>Cargando alumnos...</p>";
    }

    try {
        const { data: alumnos, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('profesor_id', AppState.profeActivoId)
            .order('nombre', { ascending: true })
            .order('apellido', { ascending: true }); 

        if (error) throw error;


        AppState.alumnosCache = alumnos;
        document.getElementById("contador-alumnos").innerText = `${alumnos.length} alumnos asignados`;

        procesarNotificaciones(alumnos);
        aplicarFiltros();

    } catch (error) {
        console.error("Error al cargar alumnos:", error.message);
        contenedor.innerHTML = "<p>Error al cargar alumnos.</p>";
    }
}


function procesarNotificaciones(alumnos) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    let nuevasNotif = 0;
    let listaNotificaciones = [];
    let leidasGuardadas = JSON.parse(localStorage.getItem('notifLeidas_' + AppState.profeActivoId)) || [];

    alumnos.forEach((alumno) => {
        let vencimientoCalculado = null;
        if (alumno.fecha_ultimo_pago) {
            let f = new Date(alumno.fecha_ultimo_pago + 'T00:00:00');
            f.setDate(f.getDate() + 30);
            vencimientoCalculado = f;
        } else if (alumno.vencimiento_cuota) {
            vencimientoCalculado = new Date(alumno.vencimiento_cuota + 'T00:00:00');
        }

        if (vencimientoCalculado) {
            const diferenciaDias = Math.ceil((vencimientoCalculado - hoy) / (1000 * 60 * 60 * 24));
            
            if (diferenciaDias <= 5) {
                let tipoNotif = diferenciaDias <= 0 ? 'vencida' : 'pronto';
                let fechaNotifStr = vencimientoCalculado.toISOString().split('T')[0];
                let idNotif = `${alumno.id}_${fechaNotifStr}_${tipoNotif}`; 
                let esNueva = !leidasGuardadas.includes(idNotif);
                
                listaNotificaciones.push({
                    idNotif: idNotif, 
                    alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                    tipo: tipoNotif, 
                    dias: Math.abs(diferenciaDias),
                    esNueva: esNueva, 
                    fechaFormateada: formatearFechaSegura(fechaNotifStr)
                });

                if (esNueva) nuevasNotif++;
            }
        }
    });

    AppState.notificacionesGlobales = listaNotificaciones; 
    const badge = document.getElementById("badge-notificaciones");
    if (badge) badge.style.display = nuevasNotif > 0 ? "block" : "none";
}


function aplicarFiltros() {
    const inputBuscador = document.getElementById("buscador-alumnos");
    const textoBusqueda = inputBuscador ? normalizarTexto(inputBuscador.value) : "";
    
    let actividadesPrendidas = [];
    let estadosPrendidos = [];
    let modalidadesPrendidas = [];
    let chipTodosActivo = false;


    const todosLosChips = document.querySelectorAll("#contenedor-chips-dinamicos .chip");
    todosLosChips.forEach((chip, index) => {
        if (index === 0) return;
        if (index === 1 && chip.classList.contains("activo")) chipTodosActivo = true;

        if (chip.classList.contains("activo") && index > 1) {
            const txt = chip.innerText.trim();
            if (txt === 'Cuota al día') estadosPrendidos.push('al dia');
            else if (txt === 'Vencida') estadosPrendidos.push('vencida');
            else if (txt === 'Con rutina') modalidadesPrendidas.push('con rutina');
            else if (txt === 'Libre') modalidadesPrendidas.push('alumno libre'); 
            else actividadesPrendidas.push(normalizarTexto(txt));
        }
    });

    const hoy = new Date();
    hoy.setHours(0,0,0,0);


    const filtrados = AppState.alumnosCache.filter(alumno => {
        const nombreCompleto = normalizarTexto(`${alumno.nombre} ${alumno.apellido}`);
        const pasaBuscador = nombreCompleto.includes(textoBusqueda);
        
        let pasaChips = chipTodosActivo;
        
        if (!chipTodosActivo) {

            let estadoPago = "al dia";
            let vCalc = null;
            if (alumno.fecha_ultimo_pago) {
                vCalc = new Date(alumno.fecha_ultimo_pago + 'T00:00:00');
                vCalc.setDate(vCalc.getDate() + 30);
            } else if (alumno.vencimiento_cuota) {
                vCalc = new Date(alumno.vencimiento_cuota + 'T00:00:00');
            }
            if (vCalc && Math.ceil((vCalc - hoy) / (1000 * 60 * 60 * 24)) <= 0) {
                estadoPago = "vencida";
            }


            const modalidadStr = alumno.tipo_rutina === "Libre" ? "alumno libre" : "con rutina";
            const actividadStr = normalizarTexto(alumno.actividad || "musculacion");
            const textoVirtual = `${modalidadStr} ${actividadStr} ${estadoPago}`;


            const pasaAct = actividadesPrendidas.length === 0 || actividadesPrendidas.some(act => textoVirtual.includes(act));
            const pasaEst = estadosPrendidos.length === 0 || estadosPrendidos.some(est => textoVirtual.includes(est));
            const pasaMod = modalidadesPrendidas.length === 0 || modalidadesPrendidas.some(mod => textoVirtual.includes(mod));
            
            pasaChips = pasaAct && pasaEst && pasaMod;
        }

        return pasaBuscador && pasaChips;
    });

    renderizarListaAlumnos(filtrados);
}


function filtrarAlumnos() { aplicarFiltros(); }

function filtrarPorChip(botonClickeado, textoFiltro) {
    const todosLosChips = Array.from(document.querySelectorAll("#contenedor-chips-dinamicos .chip"));
    const chipLapiz = todosLosChips[0]; 
    const chipTodos = todosLosChips[1]; 

    if (textoFiltro === 'Todos') {
        todosLosChips.forEach(chip => {
            if (chip !== chipLapiz) chip.classList.remove("activo");
        });
        chipTodos.classList.add("activo");
    } else {
        chipTodos.classList.remove("activo");
        botonClickeado.classList.toggle("activo");

        const hayAlgunoPrendido = todosLosChips.some(c => c !== chipLapiz && c.classList.contains("activo"));
        if (!hayAlgunoPrendido) {
            chipTodos.classList.add("activo");
        }
    }

    document.getElementById("buscador-alumnos").value = "";
    aplicarFiltros();
}


function renderizarListaAlumnos(alumnosFiltrados) {
    const contenedor = document.getElementById("lista-alumnos");
    contenedor.innerHTML = '';

    if (alumnosFiltrados.length === 0) {
        const p = document.createElement("p");
        p.className = "text-light-muted text-center mt-20";
        p.textContent = "No se encontraron alumnos.";
        contenedor.appendChild(p);
        return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    const mapaActividades = {
        "Musculación": "./imagenes/MUSCULACION.webp", "Tela": "./imagenes/TELA.webp",
        "Funcional": "./imagenes/REHABILITACION.webp", "Calistenia": "./imagenes/CALISTENIA.webp",
        "Readaptación": "./imagenes/ADAPTACION.webp", "Hyrox": "./imagenes/HYROX.webp",
        "Crossfit": "./imagenes/CROSSFIT.webp",
    };

    const template = document.getElementById('tmpl-tarjeta-alumno');

    alumnosFiltrados.forEach((alumno) => {
        let claseBadge = "badge-vencida"; 
        let textoBadge = "Vencida";
        let estaAlDia = false;

        let vencimientoCalculado = null;
        if (alumno.fecha_ultimo_pago) {
            let f = new Date(alumno.fecha_ultimo_pago + 'T00:00:00');
            f.setDate(f.getDate() + 30);
            vencimientoCalculado = f;
        } else if (alumno.vencimiento_cuota) {
            vencimientoCalculado = new Date(alumno.vencimiento_cuota + 'T00:00:00');
        }

        if (vencimientoCalculado) {
            const diferenciaDias = Math.ceil((vencimientoCalculado - hoy) / (1000 * 60 * 60 * 24));
            if (diferenciaDias <= 0) {
                claseBadge = "badge-vencida"; textoBadge = "Vencida";
            } else if (diferenciaDias <= 5) {
                claseBadge = "badge-vencepronto"; textoBadge = "Vence pronto";
            } else {
                claseBadge = "badge-aldia"; textoBadge = "Al día"; estaAlDia = true;
            }
        }

        const actividadReal = alumno.actividad || "Musculación";
        const imagenAsignada = mapaActividades[actividadReal] || "./imagenes/MUSCULACION.webp";
        const textoBotonPago = estaAlDia ? "Pagado" : "Marcar Pago";
        const claseBotonPago = estaAlDia ? "btn-pago-realizado" : "btn-pago-pendiente";
        const cuotaTexto = alumno.cuota ? alumno.cuota.toLocaleString('es-AR') : "-";

        let textoUltimaSesion = "Sin asistencias";
        let colorUltimaSesion = "#777";
        let iconoMalo = false;

        const tmpHoy = new Date();
        const fechaHoyStr = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;
        const estaPresenteHoy = (alumno.ultima_sesion === fechaHoyStr); 

        if (alumno.ultima_sesion) {
            const fechaUltima = new Date(alumno.ultima_sesion + 'T00:00:00');
            const difTiempoSesion = hoy - fechaUltima;
            const difDiasSesion = Math.floor(difTiempoSesion / (1000 * 60 * 60 * 24));

            if (difDiasSesion === 0) {
                textoUltimaSesion = "Entrenó hoy"; colorUltimaSesion = "#2ecc71"; 
            } else if (difDiasSesion === 1) {
                textoUltimaSesion = "Entrenó ayer"; colorUltimaSesion = "#2ecc71"; 
            } else if (difDiasSesion <= 7) {
                textoUltimaSesion = `Última vez: hace ${difDiasSesion} días`; colorUltimaSesion = "#f39c12"; 
            } else {
                textoUltimaSesion = `Ausente hace ${difDiasSesion} días`; colorUltimaSesion = "#e74c3c"; 
                iconoMalo = true;
            }
        }


        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card-alumno');
        
        card.onclick = () => abrirGrillaAlumno(alumno.id);
        clone.querySelector('.avatar-actividad').src = imagenAsignada;
        clone.querySelector('.tmpl-nombre-completo').textContent = `${alumno.nombre} ${alumno.apellido}`;
        

        const modoEl = clone.querySelector('.tmpl-modalidad');
        if (alumno.tipo_rutina === "Libre") {
            modoEl.className = 'info-detalle mb-6 tmpl-modalidad badge-libre ml-0 font-inherit fs-70';
            modoEl.textContent = 'ALUMNO LIBRE';
        } else {
            modoEl.className = 'info-detalle mb-6 tmpl-modalidad font-inherit fs-75 text-muted fw-600 text-uppercase ls-05';
            modoEl.textContent = 'CON RUTINA';
        }
        
        clone.querySelector('.tmpl-actividad-real').textContent = actividadReal;
        clone.querySelector('.tmpl-cuota-texto').textContent = cuotaTexto;
        

        const contSesion = clone.querySelector('.tmpl-ultima-sesion-container');
        const textoSesion = contSesion.querySelector('.tmpl-texto-sesion');
        textoSesion.textContent = textoUltimaSesion;
        textoSesion.style.color = colorUltimaSesion;

        const svgOk = contSesion.querySelector('.svg-sesion-ok');
        const svgMal = contSesion.querySelector('.svg-sesion-mal');

        if (iconoMalo) {
            svgOk.style.display = 'none';
            svgMal.style.display = 'block';
            svgMal.setAttribute('stroke', colorUltimaSesion);
        } else {
            svgOk.style.display = 'block';
            svgMal.style.display = 'none';
            svgOk.setAttribute('stroke', colorUltimaSesion);
        }


        const badge = clone.querySelector('.tmpl-badge-estado');
        badge.textContent = textoBadge;
        badge.classList.add(claseBadge);
        
        if (AppState.modoBorradoActivo) {
            const btnBorrar = clone.querySelector('.tmpl-btn-borrar');
            btnBorrar.style.display = 'block';
            btnBorrar.onclick = (e) => { e.stopPropagation(); borrarAlumno(alumno.id); };
        }
        
        const btnPago = clone.querySelector('.tmpl-btn-pago');
        btnPago.textContent = textoBotonPago;
        btnPago.classList.add(claseBotonPago);
        btnPago.onclick = (e) => { e.stopPropagation(); modificarCicloPago(alumno.id, alumno.fecha_ultimo_pago, estaAlDia); };
        
        if (estaPresenteHoy) {
            const btnPres = clone.querySelector('.tmpl-btn-asistencia-presente');
            btnPres.style.display = 'flex';
            btnPres.onclick = (e) => { e.stopPropagation(); deshacerAsistencia(alumno.id); };
        } else {
            const btnPend = clone.querySelector('.tmpl-btn-asistencia-pendiente');
            btnPend.style.display = 'block';
            btnPend.onclick = (e) => { e.stopPropagation(); abrirModalCheckin(alumno.id); };
        }
        
        contenedor.appendChild(clone);
    });
}

async function modificarCicloPago(alumnoId, fechaUltimoPagoDb, yaEstabaPagado) {
    let fechaBasePago = new Date();
    
    if (yaEstabaPagado) {
        pedirConfirmacion(
            "Anular Pago",
            "¿Querés deshacer el pago? Se restarán 30 días de su vencimiento.",
            "Anular pago",
            async () => {
                
                if (fechaUltimoPagoDb && fechaUltimoPagoDb !== "null") {
                    fechaBasePago = new Date(fechaUltimoPagoDb + 'T00:00:00');
                    fechaBasePago.setDate(fechaBasePago.getDate() - 30);
                } else {
                    fechaBasePago.setDate(fechaBasePago.getDate() - 30);
                }
                ejecutarCambioDePago(alumnoId, fechaBasePago, false);
            }
        );
    } else {
        
        fechaBasePago = new Date(); 
        ejecutarCambioDePago(alumnoId, fechaBasePago, true);
    }
}

async function ejecutarCambioDePago(alumnoId, fechaPagoReal, estadoActivo) {
    const fechaPagoStr = fechaPagoReal.toISOString().split('T')[0];
    
    let vencimiento = new Date(fechaPagoReal);
    vencimiento.setDate(vencimiento.getDate() + 30);
    const vencimientoStr = vencimiento.toISOString().split('T')[0];

    try {
        const { error } = await clienteSupabase.from('alumnos').update({ 
            fecha_ultimo_pago: fechaPagoStr,
            vencimiento_cuota: vencimientoStr,
            activo: estadoActivo
        }).eq('id', alumnoId);
        
        if (error) throw error;
        cargarAlumnos();
    } catch (error) { 
        mostrarAlerta("Error al actualizar pago: " + error.message); 
    }
}

function borrarAlumno(id) {
    pedirConfirmacion(
        "Eliminar Alumno",
        "Se perderán todos sus datos y rutinas. Esta acción no se puede deshacer.",
        "Eliminar",
        async () => {
            try {

                const { error } = await clienteSupabase.from('alumnos').delete().eq('id', id);
                if (error) throw error;
                cargarAlumnos();
            } catch (error) { mostrarAlerta("Error al borrar: " + error.message); }
        }
    );
}


function activarModoBorrado() {
    AppState.modoBorradoActivo = !AppState.modoBorradoActivo; 
    
    const btnTachito = document.getElementById("btn-activar-borrado");

    if (AppState.modoBorradoActivo) {
        btnTachito.classList.add("activo"); 
    } else {
        btnTachito.classList.remove("activo"); 
    }

    cargarAlumnos(); 
}

async function abrirGrillaAlumno(id) {
    window.scrollTo(0, 0);
    AppState.alumnoSeleccionadoId = id; 


    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "block";
    document.getElementById("detalle-nombre-completo").innerText = "Cargando alumno...";


    setTimeout(async () => {
        const hoy = new Date();
        const diaHoy = hoy.getDate();
        const mesActual = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();
        const primerDiaMes = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`;
        const ultimoDiaMes = new Date(anioActual, mesActual, 0).getDate();
        const fechaFinMes = `${anioActual}-${String(mesActual).padStart(2, '0')}-${ultimoDiaMes}`;

        if (diaHoy <= 7) AppState.semanaActiva = 1;
        else if (diaHoy <= 14) AppState.semanaActiva = 2;
        else if (diaHoy <= 21) AppState.semanaActiva = 3;
        else AppState.semanaActiva = 4;

        try {
            const { data: alumno, error } = await clienteSupabase
                .from('alumnos').select('*').eq('id', id).single(); 
            if (error) throw error;
            AppState.alumnoDataActual = alumno;

            AppState.asistenciasDiasAlumno = alumno.historial_dias ? alumno.historial_dias.split(',') : [];

            const { data: asistencias } = await clienteSupabase
                .from('registro_ejercicios').select('fecha').eq('alumno_id', id)
                .gte('fecha', primerDiaMes).lte('fecha', fechaFinMes);

            let fechasAsistencia = [];
            if (asistencias) fechasAsistencia = asistencias.map(a => a.fecha);
            if (alumno.ultima_sesion && alumno.ultima_sesion.startsWith(`${anioActual}-${String(mesActual).padStart(2, '0')}`)) {
                fechasAsistencia.push(alumno.ultima_sesion);
            }
            AppState.asistenciasAlumnoMes = [...new Set(fechasAsistencia)];

            document.getElementById("detalle-nombre-completo").innerText = `${alumno.nombre} ${alumno.apellido}`;
            document.getElementById("detalle-objetivo").innerText = alumno.objetivo || "General";
            document.getElementById("detalle-edad").innerText = alumno.edad ? alumno.edad : "No especificada"; 
            document.getElementById("detalle-salud").innerText = alumno.condicion_medica || "Sin observaciones.";
            document.getElementById("detalle-cuota").innerText = alumno.cuota ? alumno.cuota.toLocaleString('es-AR') : "No definida";
            
            let fechaFormateada = "Sin definir";
            let vencimientoCalculado = null;
            
            if (alumno.fecha_ultimo_pago) {
                let f = new Date(alumno.fecha_ultimo_pago + 'T00:00:00');
                f.setDate(f.getDate() + 30); 
                vencimientoCalculado = f;
            } else if (alumno.vencimiento_cuota) {
                vencimientoCalculado = new Date(alumno.vencimiento_cuota + 'T00:00:00');
            }

            if (vencimientoCalculado) {
                const isoString = vencimientoCalculado.toISOString().split('T')[0];
                const partes = isoString.split('-'); 
                fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`; 
            }
            document.getElementById("detalle-vencimiento").innerText = fechaFormateada;

            let fechaAltaVisual = "Sin registro";
            const fechaBase = alumno.creado_en || alumno.created_at; 
            if (fechaBase && fechaBase !== "null") {
                try {
                    const soloFecha = fechaBase.split('T')[0]; 
                    const partes = soloFecha.split('-'); 
                    if (partes.length === 3) fechaAltaVisual = `${partes[2]}/${partes[1]}/${partes[0]}`; 
                } catch(e) {}
            }
            document.getElementById("detalle-fecha-alta").innerText = fechaAltaVisual;

            cerrarCategoria(); 
            generarChipsRutina(); 

        } catch (error) {
            mostrarAlerta("Error", "No se pudo cargar la información del alumno.");
        }
    }, 50);
}

function generarChipsRutina() {
    const contenedorSemanas = document.getElementById("chips-semanas");
    const contenedorDias = document.getElementById("chips-dias");

    const hoy = new Date();
    const diaHoy = hoy.getDate();
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();

    contenedorSemanas.innerHTML = ""; 
    contenedorDias.innerHTML = "";

    const rangosSemanas = [
        { sem: 1, inicio: 1, fin: 7 },
        { sem: 2, inicio: 8, fin: 14 },
        { sem: 3, inicio: 15, fin: 21 },
        { sem: 4, inicio: 22, fin: ultimoDiaMes }
    ];

    rangosSemanas.forEach(rango => {
        let asistioEstaSemana = false;
        let semanaYaPaso = diaHoy > rango.fin; 
        
        if (AppState.asistenciasAlumnoMes) {
            asistioEstaSemana = AppState.asistenciasAlumnoMes.some(fechaStr => {
                const diaAsistencia = parseInt(fechaStr.split('-')[2]);
                return diaAsistencia >= rango.inicio && diaAsistencia <= rango.fin;
            });
        }

        if (!asistioEstaSemana && AppState.asistenciasDiasAlumno) {
            asistioEstaSemana = AppState.asistenciasDiasAlumno.some(codigo => codigo.includes(`_Sem_${rango.sem}_`));
        }

        let colorClase = "";
        if (asistioEstaSemana) colorClase = "chip-verde";
        else if (semanaYaPaso && !asistioEstaSemana) colorClase = "chip-rojo"; 

        const btn = document.createElement("button");
        btn.className = `chip-rutina ${rango.sem === AppState.semanaActiva ? 'activo' : ''} ${colorClase}`;
        btn.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; padding: 6px 12px;";
        btn.onclick = () => seleccionarSemana(rango.sem);

        const spanSem = document.createElement("span");
        spanSem.style.fontSize = "0.85rem";
        spanSem.textContent = `Semana ${rango.sem}`;

        const spanFechas = document.createElement("span");
        spanFechas.style.cssText = "font-size: 0.6rem; opacity: 0.8; font-weight: normal; margin-top: 2px;";
        spanFechas.textContent = `${rango.inicio} al ${rango.fin}`;

        btn.appendChild(spanSem);
        btn.appendChild(spanFechas);
        contenedorSemanas.appendChild(btn);
    });
    
    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias && AppState.alumnoDataActual.nombres_dias.length > 0) {
        dias = AppState.alumnoDataActual.nombres_dias;
    }
    
    const rangoSemanaSeleccionada = rangosSemanas.find(r => r.sem === AppState.semanaActiva);
    const semanaElegidaYaPaso = diaHoy > rangoSemanaSeleccionada.fin;

    dias.forEach((diaTexto, index) => {
        const numDia = index + 1;
        const anioMes = `${hoy.getFullYear()}-${hoy.getMonth() + 1}`;
        const codigoDia = `${anioMes}_Sem_${AppState.semanaActiva}_${diaTexto}`;
        
        const hizoEsteDia = AppState.asistenciasDiasAlumno && AppState.asistenciasDiasAlumno.includes(codigoDia);
        let colorClase = hizoEsteDia ? "chip-verde" : (semanaElegidaYaPaso ? "chip-rojo" : "");

        const btn = document.createElement("button");
        btn.className = `chip-rutina ${numDia === AppState.diaActivo ? 'activo' : ''} ${colorClase}`;
        btn.textContent = diaTexto;
        btn.onclick = () => seleccionarDia(numDia);
        contenedorDias.appendChild(btn);
    });

    const btnEditar = document.createElement("button");
    btnEditar.className = "chip-rutina p-8-12 border-ccc text-muted d-flex align-center";
    btnEditar.onclick = abrirModalEditarDias;
    btnEditar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
    contenedorDias.appendChild(btnEditar);

    if (AppState.vistaSliderActual === 'categorias') dibujarCategoriasAlumno();
}

function seleccionarSemana(numSemana) {
    AppState.semanaActiva = numSemana;
    
    generarChipsRutina();

    if(AppState.vistaSliderActual === 'ejercicios') {
        cargarEjerciciosCategoriaBD(); 
    }
}

function seleccionarDia(numDia) {
    AppState.diaActivo = numDia;
    
    const botonesDias = document.querySelectorAll("#chips-dias .chip-rutina");
    botonesDias.forEach((btn, index) => {
        if (index + 1 === numDia) btn.classList.add("activo");
        else btn.classList.remove("activo");
    });
    if(AppState.vistaSliderActual === 'categorias') dibujarCategoriasAlumno();
    if(AppState.vistaSliderActual === 'ejercicios') cargarEjerciciosCategoriaBD(); 
}

let diasEditandoTemp = []; 
let sortableDiasModal = null; 

function abrirModalEditarDias() {
    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias && AppState.alumnoDataActual.nombres_dias.length > 0) {
        dias = AppState.alumnoDataActual.nombres_dias;
    }
    
    diasEditandoTemp = [...dias]; 
    
    const contenedor = document.getElementById("contenedor-inputs-dias");
    contenedor.innerHTML = "";
    
    dias.forEach((dia, index) => {
        contenedor.innerHTML += `
            <div class="fila-editar-dia d-flex gap-8 mb-0 align-center bg-dark p-8 radius-8 border-dark" data-original="${dia}">
                <svg class="handle-dia text-666 flex-shrink-0 cursor-grab" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                <input class="input-modal input-nombre-dia flex-1 m-0 border-none bg-transparent outline-none p-0" type="text" value="${dia}" placeholder="Ej: Día ${index + 1}">
                <button class="btn-eliminar-serie bg-none border-none text-danger cursor-pointer p-5" type="button" onclick="this.parentElement.remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    });
    
    document.getElementById("modal-editar-dias").style.display = "flex";

    if (sortableDiasModal) sortableDiasModal.destroy();
    sortableDiasModal = new Sortable(contenedor, {
        handle: '.handle-dia', 
        animation: 200,
        ghostClass: "tarjeta-indicador-caida"
    });
}

function agregarFilaDia() {
    const contenedor = document.getElementById("contenedor-inputs-dias");
    const index = contenedor.querySelectorAll('.fila-editar-dia').length;
    
    contenedor.insertAdjacentHTML('beforeend', `
        <div class="fila-editar-dia d-flex gap-8 mb-0 align-center bg-dark p-8 radius-8 border-dark">
            <svg class="handle-dia text-666 flex-shrink-0 cursor-grab" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
            <input class="input-modal input-nombre-dia flex-1 m-0 border-none bg-transparent outline-none p-0" type="text" value="D${index + 1}" placeholder="Ej: Día ${index + 1}">
            <button class="btn-eliminar-serie bg-none border-none text-danger cursor-pointer p-5" type="button" onclick="this.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `);
    
    setTimeout(() => { contenedor.parentElement.scrollTop = contenedor.parentElement.scrollHeight; }, 10);
}

async function guardarEdicionDias() {
    const filas = document.querySelectorAll('.fila-editar-dia');
    const nuevosDias = [];
    const mapeoMudanza = []; 
    const diasConservadosOG = [];

    if (filas.length === 0) {
        mostrarAlerta("Atención", "El alumno debe tener al menos un día asignado.");
        return;
    }

    filas.forEach(fila => {
        const nuevoValor = fila.querySelector('.input-nombre-dia').value.trim() || "Día";
        nuevosDias.push(nuevoValor);
        
        const valorOriginal = fila.getAttribute('data-original');
        if (valorOriginal && valorOriginal !== "undefined") {
            diasConservadosOG.push(valorOriginal);
            if (valorOriginal !== nuevoValor) {
                mapeoMudanza.push({ viejo: valorOriginal, nuevo: nuevoValor });
            }
        }
    });

    const diasBorrados = diasEditandoTemp.filter(viejo => !diasConservadosOG.includes(viejo));

    if (AppState.diaActivo > nuevosDias.length) AppState.diaActivo = nuevosDias.length;

    if (!AppState.alumnoDataActual) AppState.alumnoDataActual = {};
    AppState.alumnoDataActual.nombres_dias = nuevosDias;

    generarChipsRutina();
    document.getElementById("modal-editar-dias").style.display = "none";

    try {
        const { error } = await clienteSupabase
            .from('alumnos')
            .update({ nombres_dias: nuevosDias })
            .eq('id', AppState.alumnoSeleccionadoId);
        
        if (error) throw error;

        const promesasMudanza = [];

        mapeoMudanza.forEach(cambio => {
            promesasMudanza.push(
                clienteSupabase.from('rutinas_planificadas')
                    .update({ dia_semana: cambio.nuevo })
                    .eq('alumno_id', AppState.alumnoSeleccionadoId)
                    .eq('dia_semana', cambio.viejo)
            );
        });

        if (diasBorrados.length > 0) {
            promesasMudanza.push(
                clienteSupabase.from('rutinas_planificadas')
                    .delete()
                    .eq('alumno_id', AppState.alumnoSeleccionadoId)
                    .in('dia_semana', diasBorrados)
            );
        }

        if (promesasMudanza.length > 0) {
            await Promise.all(promesasMudanza);
            if (AppState.vistaSliderActual === 'ejercicios') {
                cargarEjerciciosCategoriaBD();
            } else if (AppState.vistaSliderActual === 'categorias') {
                dibujarCategoriasAlumno();
            }
        }
    } catch (e) {
        mostrarAlerta("Error", "No se pudieron actualizar los días.");
    }
}



async function abrirModalCheckin(alumnoId) {
    AppState.checkinAlumnoId = alumnoId;
    document.getElementById("modal-checkin").style.display = "flex";
    
    const contenedorDias = document.getElementById("lista-dias-checkin");
    contenedorDias.innerHTML = ""; 
    
    const pCargando = document.createElement("p");
    pCargando.className = "text-muted fs-80";
    pCargando.textContent = "Cargando días...";
    contenedorDias.appendChild(pCargando);

    try {
        const { data: alumno, error } = await clienteSupabase
            .from('alumnos')
            .select('nombres_dias')
            .eq('id', alumnoId)
            .single();
        
        if (error) throw error;

        let dias = ["D1", "D2", "D3", "D4", "D5"];
        if (alumno && alumno.nombres_dias && alumno.nombres_dias.length > 0) {
            dias = alumno.nombres_dias;
        }

        contenedorDias.innerHTML = ""; 

        dias.forEach(diaTexto => {
            const btn = document.createElement("button");
            btn.className = "btn-dia-checkin";
            btn.textContent = diaTexto;
            btn.onclick = () => procesarCheckin(diaTexto);
            contenedorDias.appendChild(btn);
        });

    } catch(e) {
        console.error(e);
        contenedorDias.innerHTML = "";
        const pError = document.createElement("p");
        pError.className = "text-danger fs-80";
        pError.textContent = "Error al cargar los días.";
        contenedorDias.appendChild(pError);
    }
}

async function procesarCheckin(diaSeleccionado) {
    const idSeguro = AppState.checkinAlumnoId; 
    toggleModal('modal-checkin', false); 
    
    try {
        const { data: ejercicios, error: errorSupabase } = await clienteSupabase
            .from('rutinas_planificadas').select('zona_muscular, series_reps')
            .eq('alumno_id', idSeguro).eq('dia_semana', diaSeleccionado);

        if (errorSupabase) throw errorSupabase;

        const tmpHoy = new Date();
        const fechaHoy = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;
        let mensajeAlerta = "";

        if (ejercicios && ejercicios.length > 0) {
            const fuerzaPorZona = {};
            ejercicios.forEach(ej => {
                if (ej.series_reps) {
                    let zonaAsignada = ej.zona_muscular || "General"; 
                    try {
                        let series = JSON.parse(ej.series_reps);
                        if (Array.isArray(series)) {
                            series.forEach(s => {
                                let f = parseFloat(s.fuerza);
                                if (!isNaN(f) && f > 0) {
                                    if (!fuerzaPorZona[zonaAsignada]) fuerzaPorZona[zonaAsignada] = { suma: 0, cantidad: 0 };
                                    fuerzaPorZona[zonaAsignada].suma += f;
                                    fuerzaPorZona[zonaAsignada].cantidad += 1;
                                }
                            });
                        }
                    } catch(e) { console.warn("Error calculando el peso movido en procesarCheckin:", e); }
                }
            });

            const registros = Object.keys(fuerzaPorZona).map(zona => ({
                alumno_id: idSeguro, fecha: fechaHoy, zona_muscular: zona, peso_total: Math.round(fuerzaPorZona[zona].suma / fuerzaPorZona[zona].cantidad)
            }));

            if (registros.length > 0) {
                await clienteSupabase.from('registro_ejercicios').insert(registros);
                mensajeAlerta = `El entrenamiento de ${diaSeleccionado} se guardó correctamente.`;
            } else {
                mensajeAlerta = `Asistencia tomada.`;
            }
        } else {
            mensajeAlerta = `Se marcó el presente para "${diaSeleccionado}"`;
        }

        const anioMes = `${tmpHoy.getFullYear()}-${tmpHoy.getMonth() + 1}`;
        const codigoDia = `${anioMes}_Sem_${AppState.semanaActiva}_${diaSeleccionado}`;
        
        if (!AppState.asistenciasDiasAlumno) AppState.asistenciasDiasAlumno = [];
        if (!AppState.asistenciasDiasAlumno.includes(codigoDia)) {
            AppState.asistenciasDiasAlumno.push(codigoDia);
        }
        const nuevoHistorialDias = AppState.asistenciasDiasAlumno.join(',');

        await clienteSupabase.from('alumnos').update({ 
            ultima_sesion: fechaHoy,
            historial_dias: nuevoHistorialDias
        }).eq('id', idSeguro);
        
        cargarAlumnos();
        
        if (AppState.alumnoSeleccionadoId === idSeguro && document.getElementById("pantalla-detalle-alumno").style.display === "block") {
            abrirGrillaAlumno(idSeguro);
        }
        
        mostrarAlerta("¡Asistencia Registrada!", mensajeAlerta);
        
    } catch(e) {
        mostrarAlerta("Error Crítico", "No se pudo procesar la solicitud.");
    }
}

function deshacerAsistencia(alumnoId) {
    pedirConfirmacion(
        "Deshacer Asistencia",
        "¿Querés deshacer la Asistencia de hoy?",
        "Aceptar",
        async () => {
            const tmpHoy = new Date();
            const fechaHoyStr = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;
            try {
                await clienteSupabase.from('registro_ejercicios').delete().eq('alumno_id', alumnoId).eq('fecha', fechaHoyStr);

                const { data: historialViejo } = await clienteSupabase.from('registro_ejercicios').select('fecha').eq('alumno_id', alumnoId).lt('fecha', fechaHoyStr).order('fecha', { ascending: false }).limit(1);

                let fechaAnterior = null;
                if (historialViejo && historialViejo.length > 0) fechaAnterior = historialViejo[0].fecha;

                const anioMes = `${tmpHoy.getFullYear()}-${tmpHoy.getMonth() + 1}`;
                if (AppState.asistenciasDiasAlumno) {
                    let dias = ["D1", "D2", "D3", "D4", "D5"];
                    if (AppState.alumnoDataActual && AppState.alumnoDataActual.nombres_dias) dias = AppState.alumnoDataActual.nombres_dias;
    
                    dias.forEach(d => {
                        const codigoDia = `${anioMes}_Sem_${AppState.semanaActiva}_${d}`;
                        AppState.asistenciasDiasAlumno = AppState.asistenciasDiasAlumno.filter(item => item !== codigoDia);
                    });
                }
                const nuevoHistorialDias = AppState.asistenciasDiasAlumno ? AppState.asistenciasDiasAlumno.join(',') : "";
                
                await clienteSupabase.from('alumnos').update({ 
                    ultima_sesion: fechaAnterior,
                    historial_dias: nuevoHistorialDias
                }).eq('id', alumnoId);

                cargarAlumnos();
                
                if (AppState.alumnoSeleccionadoId === alumnoId && document.getElementById("pantalla-detalle-alumno").style.display === "block") {
                    abrirGrillaAlumno(alumnoId);
                }
                
            } catch (error) {
                mostrarAlerta("Error", "No se pudo deshacer la asistencia: " + error.message);
            }
        }
    );
}


async function cargarChips() {
    const contenedor = document.getElementById("contenedor-chips-dinamicos");
    if (contenedor) contenedor.innerHTML = "<p style='margin-left:15px;' class='text-muted fs-80'>Cargando filtros...</p>";

    try {
        const { data: profe, error } = await clienteSupabase
            .from('profesores')
            .select('chips_filtros')
            .eq('id', AppState.profeActivoId)
            .single();

        if (error) throw error;

        if (profe && profe.chips_filtros && profe.chips_filtros.length > 0) {
            AppState.chipsActuales = profe.chips_filtros;
        } else {
            AppState.chipsActuales = [
                "Musculación", "Tela", "Funcional", "Calistenia", "Readaptación", 
                "Hyrox", "Crossfit", "Cuota al día", "Vencida", "Con rutina", "Libre"
            ];
        }
        dibujarChipsPrincipales();

    } catch (e) {
        console.error("Error al cargar chips de la nube:", e);
        AppState.chipsActuales = [
            "Musculación", "Tela", "Funcional", "Calistenia", "Readaptación", 
            "Hyrox", "Crossfit", "Cuota al día", "Vencida", "Con rutina", "Libre"
        ];
        dibujarChipsPrincipales();
    }
}

function abrirModalEditarChips() {
    document.getElementById("modal-editar-chips").style.display = "flex";
    const contenedor = document.getElementById("lista-chips-editables");
    contenedor.innerHTML = ""; 
    
    AppState.chipsActuales.forEach((chip) => {
        agregarChipFila(chip);
    });

    if (sortableChips) {
        sortableChips.destroy();
    }
    
    sortableChips = new Sortable(contenedor, {
        handle: '.handle-arrastre', 
        animation: 200, 
        ghostClass: "tarjeta-indicador-caida", 
    });
}

function agregarChipFila(valor = "") {
    const contenedor = document.getElementById("lista-chips-editables");
    
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.gap = "12px";
    div.style.alignItems = "center";
    div.style.background = "#141414"; 
    div.style.border = "1px solid #262626";
    div.style.padding = "8px 12px";
    div.style.borderRadius = "8px";
    div.style.marginBottom = "6px";
    
    div.innerHTML = `
        <svg class="handle-arrastre text-666 flex-shrink-0 cursor-grab" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
        <input class="input-modal input-chip-edit m-0 flex-grow-1 border-none bg-transparent p-0 cursor-text outline-none" type="text" value="${valor}" oninput="this.setAttribute('value', this.value)" placeholder="Ej: Pilates...">
        <button onclick="this.parentElement.remove()" class="bg-none border-none text-danger cursor-pointer p-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
    `;
    
    contenedor.appendChild(div);
    setTimeout(() => { contenedor.scrollTop = contenedor.scrollHeight; }, 10);
}

async function guardarEdicionChips() {
    const inputs = document.querySelectorAll(".input-chip-edit");
    let nuevosChips = [];
    
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) nuevosChips.push(val); 
    });
    
    AppState.chipsActuales = nuevosChips;
    
    document.getElementById("modal-editar-chips").style.display = "none";
    dibujarChipsPrincipales();
    
    const chipTodos = document.querySelector("#contenedor-chips-dinamicos .chip:nth-child(2)");
    if (chipTodos) {
        filtrarPorChip(chipTodos, 'Todos');
    } else {
        if (typeof cargarAlumnos === "function") cargarAlumnos();
    }

    try {
        await clienteSupabase.from('profesores')
            .update({ chips_filtros: AppState.chipsActuales })
            .eq('id', AppState.profeActivoId);
    } catch (e) {
        console.error("Error guardando los filtros en la nube:", e);
    }
}

function dibujarChipsPrincipales() {
    const contenedor = document.getElementById("contenedor-chips-dinamicos");
    if (!contenedor) return;
    
    let html = `
        <button class="chip p-0-12 border-warning text-warning d-flex align-center justify-center flex-shrink-0" onclick="abrirModalEditarChips()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
    `;

    html += `<button class="chip activo" onclick="filtrarPorChip(this, 'Todos')">Todos</button>`;
    
    AppState.chipsActuales.forEach(chip => {
        html += `<button class="chip" onclick="filtrarPorChip(this, '${chip}')">${chip}</button>`;
    });
    
    contenedor.innerHTML = html;
}

// --- FUNCIÓN PARA FORZAR ACTUALIZACIÓN DE LA APP ---
async function forzarActualizacion() {
    mostrarAlerta("Actualizando...", "Limpiando la memoria para descargar la última versión. Aguardá unos segundos...");
    
    setTimeout(async () => {
        try {
            // 1. Desregistrar todos los Service Workers (la PWA instalada)
            if ('serviceWorker' in navigator) {
                const registros = await navigator.serviceWorker.getRegistrations();
                for (let registro of registros) {
                    await registro.unregister();
                }
            }
            // 2. Borrar absolutamente todos los cachés guardados
            if ('caches' in window) {
                const nombresCaches = await caches.keys();
                for (let nombre of nombresCaches) {
                    await caches.delete(nombre);
                }
            }
            // 3. Recargar la página forzadamente evadiendo la memoria
            window.location.reload(true);
        } catch (error) {
            console.error("Error al limpiar:", error);
            window.location.reload(true);
        }
    }, 1500); // Le damos 1.5 segs para que el usuario llegue a leer la alerta
}

// --- ACTUALIZACIÓN AUTOMÁTICA SILENCIOSA ---
if ('serviceWorker' in navigator) {
    // 1. Cada vez que el profe saca la app de segundo plano (la vuelve a abrir)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registro => {
                // Le pedimos al celular que vaya a GitHub a ver si hay código nuevo
                registro.update();
            });
        }
    });

    // 2. Si encontró código nuevo y lo descargó, recargamos la pantalla automáticamente
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log("¡Nueva versión detectada! Recargando...");
        window.location.reload();
    });
}

// Lo hacemos global para poder llamarlo desde el HTML
window.forzarActualizacion = forzarActualizacion;




window.abrirModalFormularioAlumno = abrirModalFormularioAlumno;
window.guardarFormularioAlumnoEnBD = guardarFormularioAlumnoEnBD;
window.registrarPago = registrarPago;
window.anularPago = anularPago;
window.cargarAlumnos = cargarAlumnos;
window.procesarNotificaciones = procesarNotificaciones;
window.aplicarFiltros = aplicarFiltros;
window.filtrarAlumnos = filtrarAlumnos;
window.filtrarPorChip = filtrarPorChip;
window.renderizarListaAlumnos = renderizarListaAlumnos;
window.modificarCicloPago = modificarCicloPago;
window.ejecutarCambioDePago = ejecutarCambioDePago;
window.borrarAlumno = borrarAlumno;
window.activarModoBorrado = activarModoBorrado;
window.abrirGrillaAlumno = abrirGrillaAlumno;
window.generarChipsRutina = generarChipsRutina;
window.seleccionarSemana = seleccionarSemana;
window.seleccionarDia = seleccionarDia;
window.abrirModalEditarDias = abrirModalEditarDias;
window.agregarFilaDia = agregarFilaDia;
window.guardarEdicionDias = guardarEdicionDias;
window.abrirModalCheckin = abrirModalCheckin;
window.procesarCheckin = procesarCheckin;
window.deshacerAsistencia = deshacerAsistencia;
window.cargarChips = cargarChips;
window.abrirModalEditarChips = abrirModalEditarChips;
window.agregarChipFila = agregarChipFila;
window.guardarEdicionChips = guardarEdicionChips;
window.dibujarChipsPrincipales = dibujarChipsPrincipales;