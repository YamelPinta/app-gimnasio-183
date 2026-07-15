// --- 1. CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = "https://azssqieevaglrgyacxfl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3NxaWVldmFnbHJneWFjeGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjM4NjYsImV4cCI6MjA5ODIzOTg2Nn0.WsEiF1mmdlqnOILxKWKchOgUXc7Yw84lE6ATbWQha-Q";

const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variable global para saber qué profesor está usando la app
let profeActivoId = null;
let alumnoSeleccionadoId = null;
let ejercicioEditandoId = null;
let modoBorradoActivo = false;
// --- SISTEMA DE CONFIRMACIÓN UNIVERSAL ---
let accionPendiente = null; // Guarda temporalmente la orden de borrado
let alumnoDataActual = null; // Guarda temporalmente toda la info del alumno actual

// --- DICCIONARIO DE EJERCICIOS ---
const catalogoEjercicios = {
    "Pecho": ["Press de banca", "Press inclinado con mancuernas", "Cruces en polea", "Flexiones de brazos"],
    "Espalda": ["Peso muerto", "Dominadas", "Remo con barra", "Remo en polea baja"],
    "Hombros": ["Vuelos laterales", "Press militar", "Vuelos frontales"],
    "Piernas": ["Back squat","Sentadilla","Peso muerto", "Estocadas"],
    "Glúteos": ["Hip thrust", "Peso muerto","Patada de glúteo en polea", "Sentadilla búlgara"],
    "Brazos": ["Curl de bíceps con barra", "Curl martillo", "Extensiones de tríceps en polea"],
    "Core": ["Plancha abdominal", "Elevación de piernas"]
};

// Esta función actualiza la segunda cajita cuando cambias la zona
function actualizarListaEjercicios() {
    const zonaSeleccionada = document.getElementById("select-ej-zona").value;
    const selectNombre = document.getElementById("select-ej-nombre");
    
    // Limpiamos la lista anterior
    selectNombre.innerHTML = "";

    if (!zonaSeleccionada) {
        selectNombre.innerHTML = '<option value="">Primero elegí una zona...</option>';
        return;
    }

    // Buscamos los ejercicios correspondientes y los agregamos
    const ejercicios = catalogoEjercicios[zonaSeleccionada];
    ejercicios.forEach(ej => {
        selectNombre.innerHTML += `<option value="${ej}">${ej}</option>`;
    });
}

function pedirConfirmacion(titulo, mensaje, textoBoton, funcionAConfirmar) {
    document.getElementById("titulo-confirmacion").innerText = titulo;
    document.getElementById("texto-confirmacion").innerText = mensaje;
    document.getElementById("btn-confirmar-accion").innerText = textoBoton;
    
    accionPendiente = funcionAConfirmar; // Guardamos lo que hay que ejecutar si dice que sí
    document.getElementById("modal-confirmacion").style.display = "flex";
}

function cerrarModalConfirmacion() {
    document.getElementById("modal-confirmacion").style.display = "none";
    accionPendiente = null; // Limpiamos la memoria
}

// Escuchamos el clic del botón rojo del modal
document.getElementById("btn-confirmar-accion").addEventListener("click", () => {
    if (accionPendiente) {
        accionPendiente(); // Ejecuta la función que estaba en espera
        cerrarModalConfirmacion(); // Cierra el modal
    }
});

// --- SISTEMA DE ALERTA VISUAL (Reemplaza al alert común) ---
function mostrarAlerta(titulo, mensaje) {
    document.getElementById("titulo-alerta").innerText = titulo;
    document.getElementById("texto-alerta").innerText = mensaje;
    document.getElementById("modal-alerta").style.display = "flex";
}

function cerrarModalAlerta() {
    document.getElementById("modal-alerta").style.display = "none";
}

// --- 2. ARRANQUE DE LA APP, MEMORIA Y NAVEGACIÓN INICIAL ---
document.addEventListener("DOMContentLoaded", () => {
    const sesionGuardada = localStorage.getItem('sesionGimnasio');

    if (sesionGuardada === 'activa') {
        // Si hay sesión, salta todo y va al dashboard de profes
        document.getElementById("pantalla-inicio").style.display = "none";
        document.getElementById("pantalla-login").style.display = "none";
        document.getElementById("pantalla-perfiles").style.display = "flex";
    } else {
        // Si es la primera vez, arranca en la nueva Pantalla de Inicio
        document.getElementById("pantalla-inicio").style.display = "flex";
        document.getElementById("pantalla-login").style.display = "none";
    }
    
    inicializarTema();
    cargarProfesores();
});

// Botón "PROFESOR": Te lleva al login
function irPantallaLoginProfe() {
    document.getElementById("pantalla-inicio").style.display = "none";
    document.getElementById("pantalla-login").style.display = "flex";
}

// Botón "ALUMNO": Te lleva a la futura pantalla de alumnos
function irPantallaAlumno() {
    document.getElementById("pantalla-inicio").style.display = "none";
    document.getElementById("pantalla-alumno-proximamente").style.display = "flex";
}

// Botones para volver atrás a la selección de roles
function volverDesdeLoginAInicio() {
    document.getElementById("pantalla-login").style.display = "none";
    document.getElementById("pantalla-inicio").style.display = "flex";
}

function volverDesdeAlumnoAInicio() {
    document.getElementById("pantalla-alumno-proximamente").style.display = "none";
    document.getElementById("pantalla-inicio").style.display = "flex";
}



// --- 3. LOGIN Y LOGOUT ---
// --- 3. LOGIN Y LOGOUT ---
function iniciarSesion() {
    const passIngresada = document.getElementById("login-password").value.trim();

    // Contraseña única para todo el equipo
    const passwordUnica = "gimnasio2026";

    if (passIngresada === passwordUnica) {
        localStorage.setItem('sesionGimnasio', 'activa'); // Guardamos el sello
        document.getElementById("pantalla-login").style.display = "none";
        document.getElementById("pantalla-perfiles").style.display = "flex";
    } else {
        // Encendemos nuestra ventana hermosa de error
        document.getElementById("modal-error-login").style.display = "flex";
    }
}

// Función para cerrar la ventanita de error
function cerrarModalErrorLogin() {
    document.getElementById("modal-error-login").style.display = "none";
}

function cerrarSesion() {
    localStorage.removeItem('sesionGimnasio'); // Borramos el sello
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-login").style.display = "flex";
    // Solo vaciamos la cajita de la contraseña
    document.getElementById("login-password").value = "";
}


// --- 4. GESTIÓN DE PROFESORES (PERFILES) ---
async function cargarProfesores() {
    const contenedor = document.getElementById("grilla-profesores");
    contenedor.innerHTML = "";

    // 1. Perfil fijo del Administrador
    contenedor.innerHTML += `
        <div class="tarjeta-perfil-moderna" onclick="entrarPerfil('admin', 'Administrador', '')">
            <img src="imagenes/perfil2.png" class="avatar-profe">
            <p>Admin</p>
        </div>
    `;

    // 2. Cargamos profes desde la base de datos
    try {
        const { data: profesores, error } = await clienteSupabase
            .from('profesores')
            .select('*')
            .order('creado_en', { ascending: true });

        if (error) throw error;
        
        profesores.forEach(profe => {
            // Usamos la foto que guardamos en la base de datos
            // Si no tiene foto, ponemos una por defecto
            const foto = profe.foto_url || "imagenes/perfil2.png"; 
            
            contenedor.innerHTML += `
                <div class="tarjeta-perfil-moderna" onclick="entrarPerfil('${profe.id}', '${profe.nombre}', '${profe.apellido}')">
                    <img src="${foto}" class="avatar-profe" onerror="this.src='imagenes/perfil1.png'">
                    <p>${profe.nombre} ${profe.apellido}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar profesores:", error.message);
    }
}

// --- LÓGICA PARA CREAR PROFESOR CON VENTANA EMERGENTE ---

let fotoProfeElegida = "imagenes/perfil1.png"; // Memoria para guardar temporalmente la foto

function abrirModalProfe() {
    document.getElementById("modal-profe").style.display = "flex";
    
    // Limpiamos los campos al abrir
    document.getElementById("input-profe-nombre").value = "";
    document.getElementById("select-profe-avatar").value = "imagenes/perfil1.png";
    document.getElementById("input-foto-profe").value = ""; 
    
    // Reseteamos la foto visual
    fotoProfeElegida = "imagenes/perfil1.png";
    document.getElementById("img-preview-profe").src = fotoProfeElegida;
}

function cerrarModalProfe() {
    document.getElementById("modal-profe").style.display = "none";
}

// Si el usuario elige un avatar de la lista
function cambiarPreviewAvatar() {
    fotoProfeElegida = document.getElementById("select-profe-avatar").value;
    document.getElementById("img-preview-profe").src = fotoProfeElegida;
    document.getElementById("input-foto-profe").value = ""; // Borra la foto real si se arrepiente y elige avatar
}

// Si el usuario saca una foto o elige de la galería (COMPRESIÓN AUTOMÁTICA)
function procesarFotoSubida(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Magia para comprimir la foto y que la base de datos no explote
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 300; // Tamaño perfecto y liviano para perfil
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convertimos la imagen a código texto para guardarla fácil en Supabase
            fotoProfeElegida = canvas.toDataURL("image/jpeg", 0.7); 
            
            // Actualizamos el circulito de la pantalla
            document.getElementById("img-preview-profe").src = fotoProfeElegida;
            // Ponemos el selector en blanco porque ahora está usando su foto
            document.getElementById("select-profe-avatar").value = ""; 
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Guardar finalmente en Supabase
async function guardarProfeEnBD() {
    const nombreCompleto = document.getElementById("input-profe-nombre").value.trim();

    if (!nombreCompleto) {
        mostrarAlerta("Faltan datos","Por favor, ingresá el nombre y apellido del profesor.");
        return;
    }

    const partes = nombreCompleto.split(" ");
    const nombre = partes[0];
    const apellido = partes.slice(1).join(" ") || ""; 

    try {
        // Enviamos todo a la base de datos
        const { error } = await clienteSupabase.from('profesores').insert([{ 
            nombre: nombre, 
            apellido: apellido, 
            foto_url: fotoProfeElegida // Acá viaja el Avatar o la Selfie real
        }]); 
        
        if (error) throw error;

        cerrarModalProfe();
        cargarProfesores(); 

    } catch (error) {
        mostrarAlerta("Error al guardar el profesor: " + error.message);
    }
}

// --- 5. NAVEGACIÓN Y DASHBOARD DE ALUMNOS ---
function entrarPerfil(id, nombre, apellido) {

    if (id === 'admin') {
        abrirPantallaAdmin();
        return; 
    }

    profeActivoId = id; 
    document.getElementById("nombre-profe-activo").innerText = "Profe " + nombre;
    
    // Apagamos TODAS las pantallas
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    
    // Encendemos solo el Dashboard (Alumnos)
    document.getElementById("pantalla-dashboard").style.display = "block";
    
    cargarAlumnos(); 
}

// ==========================================
// FUNCIONES EXCLUSIVAS DEL PANEL DE ADMIN
// ==========================================

function abrirPantallaAdmin() {
    // Apagamos todas las demás pantallas operativas
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    
    // Encendemos Admin
    document.getElementById("pantalla-admin").style.display = "block";
    cargarPanelAdmin();
}

function volverDesdeAdminAPerfiles() {
    document.getElementById("pantalla-admin").style.display = "none";
    document.getElementById("pantalla-perfiles").style.display = "flex";
}

async function cargarPanelAdmin() {
    const contenedor = document.getElementById("contenedor-admin-general");
    contenedor.innerHTML = "<p style='text-align:center;'>Cargando base de datos...</p>";
    
    try {
        // Traemos toda la info de golpe
        const { data: profes } = await clienteSupabase.from('profesores').select('*');
        const { data: alumnos } = await clienteSupabase.from('alumnos').select('*');
        const { data: rutinas } = await clienteSupabase.from('rutinas_planificadas').select('*');
        
        contenedor.innerHTML = "";
        
        if (!profes || profes.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888;'>No hay profesores registrados.</p>";
            return;
        }

        // Armamos la tarjeta por cada profe
        profes.forEach(profe => {
            const alumnosDelProfe = alumnos.filter(a => a.profesor_id === profe.id);
            let htmlAlumnos = "";
            
            if (alumnosDelProfe.length === 0) {
                htmlAlumnos = "<p style='font-size:0.85rem; color:#888; margin-top: 10px;'>Aún no tiene alumnos asignados.</p>";
            } else {
                // Por cada alumno, buscamos sus ejercicios
                alumnosDelProfe.forEach(alumno => {
                    const rutinasAlumno = rutinas.filter(r => r.alumno_id === alumno.id);
                    // Juntamos los nombres de los ejercicios sin repetir
                    let listaEjercicios = [...new Set(rutinasAlumno.map(r => r.ejercicio_nombre))].join(", ");
                    if(!listaEjercicios) listaEjercicios = "Sin rutina configurada";
                    
                    htmlAlumnos += `
                        <div style="margin-top: 10px; padding: 12px; background: #f9f9f9; border-radius: 10px; border-left: 4px solid #f39c12;">
                            <strong style="font-size: 0.95rem; color: #2c2c2c;">${alumno.nombre} ${alumno.apellido}</strong> 
                            <span style="font-size:0.75rem; color:#666; background: #eee; padding: 2px 6px; border-radius: 8px; margin-left: 5px;">${alumno.actividad}</span>
                            <p style="font-size: 0.8rem; margin-top:5px; color:#555; line-height: 1.4;">
                                <strong>Ejercicios activos:</strong> ${listaEjercicios}
                            </p>
                        </div>
                    `;
                });
            }
            
            // Dibujamos la caja blanca que envuelve al profe y a sus alumnos
            contenedor.innerHTML += `
                <div style="background: white; border-radius: 16px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #eee; padding-bottom:12px;">
                        
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${profe.foto_url || 'imagenes/perfil1.png'}" style="width: 45px; height: 45px; border-radius: 50%; object-fit:cover; border: 2px solid #f39c12;" onerror="this.src='imagenes/perfil1.png'">
                            <div>
                                <h3 style="font-size: 1.1rem; color:#2c2c2c; margin-bottom: 2px;">${profe.nombre} ${profe.apellido}</h3>
                                <p style="font-size: 0.75rem; color:#888;">${alumnosDelProfe.length} alumnos asignados</p>
                            </div>
                        </div>

                        <button class="btn-accion-admin peligro" onclick="darDeBajaProfe('${profe.id}')" style="margin:0;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" style="margin-right: 4px;"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Borrar
                        </button>
                    </div>
                    
                    <div style="margin-top: 5px;">
                        ${htmlAlumnos}
                    </div>
                </div>
            `;
        });
        
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = "<p>Error al cargar el panel.</p>";
    }
}

function darDeBajaProfe(idAEliminar) {
    pedirConfirmacion(
        "Eliminar Profesor",
        "Se borrará permanentemente este profesor, todos sus alumnos y sus rutinas.",
        "Eliminar definitivamente",
        async () => {
            try {
                // Buscamos a todos sus alumnos
                const { data: alumnos } = await clienteSupabase.from('alumnos').select('id').eq('profesor_id', idAEliminar);
                
                if (alumnos && alumnos.length > 0) {
                    const idsAlumnos = alumnos.map(a => a.id);
                    // Borramos todas las rutinas de esos alumnos
                    await clienteSupabase.from('rutinas_planificadas').delete().in('alumno_id', idsAlumnos);
                    // Borramos a los alumnos
                    await clienteSupabase.from('alumnos').delete().eq('profesor_id', idAEliminar);
                }
                
                // Finalmente borramos al profesor
                const { error } = await clienteSupabase.from('profesores').delete().eq('id', idAEliminar);
                if (error) throw error;
                
                // Actualizamos las listas al instante
                cargarPanelAdmin(); // Refresca la pantalla que estamos viendo
                cargarProfesores(); // Refresca la grilla principal de forma invisible
                
            } catch (e) { mostrarAlerta("Error al dar de baja: " + e.message); }
        }
    );
}

function volverAPerfiles() {
    profeActivoId = null;
    
    // Apagamos TODAS las pantallas operativas
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    
    // Volvemos a Inicio
    document.getElementById("pantalla-perfiles").style.display = "flex";
}

function volverAlDashboard() {
    // Apagamos TODAS las demás
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    document.getElementById("pantalla-perfiles").style.display = "none";
    
    // Encendemos solo Dashboard
    document.getElementById("pantalla-dashboard").style.display = "block";
    cargarAlumnos();
}

async function cargarAlumnos() {
    const contenedor = document.getElementById("lista-alumnos");
    contenedor.innerHTML = "<p>Cargando alumnos...</p>";

    try {
        const { data: alumnos, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('profesor_id', profeActivoId)
            .order('nombre', { ascending: true })
            .order('apellido', { ascending: true }); // Orden alfabético perfecto

        if (error) throw error;
        contenedor.innerHTML = "";

        document.getElementById("contador-alumnos").innerText = `${alumnos.length} alumnos asignados`;

        if (alumnos.length === 0) {
            contenedor.innerHTML = `<p style="color: #a0a0a0; text-align: center; margin-top: 20px;">Aún no tenés alumnos asignados.</p>`;
            return;
        } 

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); 

        // ----- SISTEMA DE NOTIFICACIONES -----
        let nuevasNotif = 0;
        let listaNotificaciones = [];
        let leidasGuardadas = JSON.parse(localStorage.getItem('notifLeidas_' + profeActivoId)) || [];
        // -------------------------------------

        const mapaActividades = {
            "Musculación": "imagenes/MUSCULACION.jpg",
            "Tela": "imagenes/TELA.jpg",
            "Funcional": "imagenes/REHABILITACION.jpg",
            "Calistenia": "imagenes/CALISTENIA.jpg",
            "Readaptación": "imagenes/READAPTACION.jpg",
            "Hyrox": "imagenes/HYROX.jpg",
            "Crossfit": "imagenes/CROSSFIT.jpg",
        };

        alumnos.forEach((alumno) => {
            let claseBadge = "badge-vencida"; 
            let textoBadge = "Vencida";
            let textoRutina = "Rutina vencida";
            let estaAlDia = false;

            if (alumno.vencimiento_cuota) {
                const fechaVencimiento = new Date(alumno.vencimiento_cuota + 'T00:00:00'); 
                const diferenciaTiempo = fechaVencimiento - hoy;
                const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

                if (diferenciaDias < 0) {
                    claseBadge = "badge-vencida";
                    textoBadge = "Vencida";
                    textoRutina = "Rutina vencida";
                } else if (diferenciaDias <= 5) {
                    claseBadge = "badge-vencepronto";
                    textoBadge = "Vence pronto";
                    textoRutina = "Rutina activa";
                } else {
                    claseBadge = "badge-aldia";
                    textoBadge = "Al día";
                    textoRutina = "Rutina activa";
                    estaAlDia = true;
                }

                // Generar alerta en segundo plano si está por vencer o venció
                if (diferenciaDias <= 5) {
                    let tipoNotif = diferenciaDias < 0 ? 'vencida' : 'pronto';
                    // Creamos un código único para esta alerta (Ej: Juan_2026-08-10_vencida)
                    let idNotif = `${alumno.id}_${alumno.vencimiento_cuota}_${tipoNotif}`; 
                    let esNueva = !leidasGuardadas.includes(idNotif); // ¿Ya la vio el profe?

                    let fechaFormateada = alumno.vencimiento_cuota.split('-').reverse().join('/');

                    listaNotificaciones.push({
                        idNotif: idNotif,
                        alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                        tipo: tipoNotif,
                        dias: Math.abs(diferenciaDias),
                        esNueva: esNueva,
                        fechaFormateada: fechaFormateada
                    });

                    if (esNueva) nuevasNotif++;
                }
            }

            const actividadReal = alumno.actividad || "Musculación";
            const objetivoReal = alumno.objetivo || "Sin definir";
            const imagenAsignada = mapaActividades[actividadReal] || "imagenes/MUSCULACION.jpg";
            const textoBotonPago = estaAlDia ? "Pagado" : "Marcar Pago";
            const claseBotonPago = estaAlDia ? "btn-pago-realizado" : "btn-pago-pendiente";

            // ---> NUEVO: Preparamos el texto de la cuota para mostrarlo
            const cuotaTexto = alumno.cuota ? `$${alumno.cuota}` : "$ -";

            // Lógica del botón borrar (solo aparece si el modo está activo)
            let htmlBotonBorrar = "";
            if (modoBorradoActivo) {
                htmlBotonBorrar = `
                    <button class="btn-accion-admin peligro" onclick="event.stopPropagation(); borrarAlumno('${alumno.id}')" style="margin-bottom: 5px;">
                        Borrar
                    </button>
                `;
            }

            // Construcción final de la tarjeta
            contenedor.innerHTML += `
                <div class="card-alumno" onclick="abrirGrillaAlumno('${alumno.id}')">
                    <img src="${imagenAsignada}" class="avatar-actividad" alt="Actividad">
                    
                    <div class="info-central">
                        <h3>${alumno.nombre} ${alumno.apellido}</h3>
                        
                        <div class="info-detalle">
                            <div class="punto-naranja"></div> ${actividadReal}
                        </div>
                        
                        <div class="info-detalle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 5px;"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            ${objetivoReal}
                        </div>
                        
                        <!-- NUEVO RENGLÓN: Cuota debajo del objetivo -->
                        <div class="info-detalle" style="margin-top: 2px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" width="14" height="14" style="margin-right: 5px;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            <span style="color: #f39c12; font-weight: 600;">${cuotaTexto}</span>
                        </div>
                    </div>

                    <div class="estado-derecha">
                        <span class="badge-estado ${claseBadge}">${textoBadge}</span>
                        ${htmlBotonBorrar}
                        <div class="contenedor-accion-pago">
                            <button class="btn-pago-status ${claseBotonPago}" 
                                onclick="event.stopPropagation(); modificarCicloPago('${alumno.id}', '${alumno.vencimiento_cuota}', ${estaAlDia})">
                                ${textoBotonPago}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        // ACTUALIZAR PUNTITO DE LA CAMPANITA
        window.notificacionesGlobales = listaNotificaciones; // Las guardamos en memoria
        const badge = document.getElementById("badge-notificaciones");
        if (badge) {
            badge.style.display = nuevasNotif > 0 ? "block" : "none";
        }

    } catch (error) {
        console.error("Error al cargar alumnos:", error.message);
        contenedor.innerHTML = "<p>Error al cargar alumnos.</p>";
    }
}

// --- LÓGICA PARA CREAR ALUMNO CON VENTANA EMERGENTE ---

function abrirModalAlumno() {
    document.getElementById("modal-alumno").style.display = "flex";
    
    // Limpiamos los campos
    document.getElementById("input-alumno-nombre").value = "";
    document.getElementById("select-alumno-actividad").value = "Musculación";
    document.getElementById("input-alumno-objetivo").value = "";
    document.getElementById("input-alumno-edad").value = "";
    document.getElementById("input-alumno-condicion").value = "";
    document.getElementById("input-alumno-cuota").value = "";

    // NUEVO: Sugerimos un vencimiento de 1 mes por defecto
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 1);
    document.getElementById("input-alumno-vencimiento").value = fecha.toISOString().split('T')[0];
}

async function guardarAlumnoEnBD() {
    const nombreCompleto = document.getElementById("input-alumno-nombre").value.trim();
    const actividad = document.getElementById("select-alumno-actividad").value;
    let objetivo = document.getElementById("input-alumno-objetivo").value.trim();
    const edad = document.getElementById("input-alumno-edad").value.trim();
    let condicion = document.getElementById("input-alumno-condicion").value.trim();
    const cuota = document.getElementById("input-alumno-cuota").value.trim();
    
    // NUEVO: Capturamos la fecha que eligió el profe
    let vencimientoCuota = document.getElementById("input-alumno-vencimiento").value;

    if (!nombreCompleto) {
        mostrarAlerta("Faltan datos", "Por favor, ingresá el nombre y apellido del alumno.");
        return;
    }

    if (!objetivo) objetivo = "General"; 
    if (!condicion) condicion = "Sin observaciones.";

    const partes = nombreCompleto.split(" ");
    const nombre = partes[0];
    const apellido = partes.slice(1).join(" "); 

    try {
        const { error } = await clienteSupabase
            .from('alumnos')
            .insert([{ 
                nombre: nombre, 
                apellido: apellido, 
                profesor_id: profeActivoId, 
                vencimiento_cuota: vencimientoCuota || null, // ACA GUARDAMOS LA FECHA MANUAL
                actividad: actividad,
                objetivo: objetivo,
                edad: edad ? parseInt(edad) : null,
                condicion_medica: condicion,
                // Adentro del insert de guardarAlumnoEnBD:
                cuota: cuota ? parseInt(cuota.replace(/\./g, '')) : null
            }]); 

        if (error) throw error;
        
        cerrarModalAlumno();
        cargarAlumnos(); 
        
    } catch (error) {
        mostrarAlerta("Error", "Error al añadir alumno: " + error.message);
    }
}

function cerrarModalAlumno() {
    document.getElementById("modal-alumno").style.display = "none";
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


// Función para alternar la visibilidad de la contraseña
function alternarPassword() {
    const inputPass = document.getElementById("login-password");
    
    if (inputPass.type === "password") {
        inputPass.type = "text"; // Muestra la contraseña
    } else {
        inputPass.type = "password"; // Oculta la contraseña
    }
}

// --- 7. BUSCADOR DE ALUMNOS ---
function filtrarAlumnos() {
    // 1. Obtenemos lo que escribiste en el buscador y lo pasamos a minúsculas
    const textoBusqueda = document.getElementById("buscador-alumnos").value.toLowerCase();
    
    // 2. Agarramos todas las tarjetas de alumnos que están en la pantalla
    const tarjetas = document.querySelectorAll("#lista-alumnos .card-alumno");

    // 3. Revisamos tarjeta por tarjeta
    tarjetas.forEach(tarjeta => {
        // Buscamos el nombre del alumno (que está adentro de la etiqueta <h3>)
        const nombreAlumno = tarjeta.querySelector("h3").innerText.toLowerCase();
        
        // Si el nombre incluye lo que escribiste, mostramos la tarjeta. Si no, la ocultamos.
        if (nombreAlumno.includes(textoBusqueda)) {
            tarjeta.style.display = "flex";
        } else {
            tarjeta.style.display = "none";
        }
    });
}

// --- 8. FILTROS POR CHIPS (BOTONES) ---
function filtrarPorChip(botonClickeado, textoFiltro) {
    // 1. Le sacamos el color naranja a todos los botones y se lo ponemos solo al que tocaste
    const todosLosChips = document.querySelectorAll(".chip");
    todosLosChips.forEach(chip => chip.classList.remove("activo"));
    botonClickeado.classList.add("activo");

    // 2. Limpiamos la barra de búsqueda por si había algo escrito
    document.getElementById("buscador-alumnos").value = "";

    // 3. Agarramos todas las tarjetas y las revisamos
    const tarjetas = document.querySelectorAll("#lista-alumnos .card-alumno");
    
    tarjetas.forEach(tarjeta => {
        const contenidoTarjeta = tarjeta.innerText.toLowerCase();
        
        // Si tocaste "Todos", mostramos la tarjeta. Si no, revisamos si contiene la palabra buscada
        if (textoFiltro === 'Todos') {
            tarjeta.style.display = "flex";
        } else if (contenidoTarjeta.includes(textoFiltro.toLowerCase())) {
            tarjeta.style.display = "flex";
        } else {
            tarjeta.style.display = "none";
        }
    });
}

// --- 9. REGISTRO Y CANCELACIÓN DE PAGOS EN TARJETAS ---
async function modificarCicloPago(alumnoId, fechaVencimientoActual, yaEstabaPagado) {
    let baseFecha = fechaVencimientoActual && fechaVencimientoActual !== "null" ? new Date(fechaVencimientoActual + 'T00:00:00') : new Date();

    if (yaEstabaPagado) {
        // MODO DESHACER PAGO USANDO EL NUEVO MODAL Lindo
        pedirConfirmacion(
            "Anular Pago",
            "¿Querés deshacer el pago? Se retrasará un mes su fecha de vencimiento.",
            "Anular pago",
            async () => {
                baseFecha.setMonth(baseFecha.getMonth() - 1);
                ejecutarCambioDePago(alumnoId, baseFecha, false);
            }
        );
    } else {
        // MODO REGISTRAR PAGO DIRECTO
        baseFecha.setMonth(baseFecha.getMonth() + 1);
        ejecutarCambioDePago(alumnoId, baseFecha, true);
    }
}

// Pequeña función auxiliar para no repetir código en los pagos
async function ejecutarCambioDePago(alumnoId, baseFecha, estadoActivo) {
    const nuevaFecha = baseFecha.toISOString().split('T')[0];
    try {
        const { error } = await clienteSupabase.from('alumnos').update({ 
            vencimiento_cuota: nuevaFecha, activo: estadoActivo 
        }).eq('id', alumnoId);
        if (error) throw error;
        cargarAlumnos();
    } catch (error) { mostrarAlerta("Error al actualizar pago: " + error.message); }
}

// --- 10. LÓGICA DE DÍAS Y RUTINAS (CON SUPABASE) ---

// Abrir y cerrar la ventanita
function abrirModalEjercicio() {
    document.getElementById("modal-ejercicio").style.display = "flex";
    
    // Reiniciamos las listas y los campos
    document.getElementById("select-ej-zona").value = "";
    actualizarListaEjercicios(); // Esto resetea la lista de nombres
    document.getElementById("input-ej-series").value = "";
    document.getElementById("input-ej-descanso").value = "";
}

function cerrarModalEjercicio() {
    ejercicioEditandoId = null;
    document.getElementById("modal-ejercicio").style.display = "none";
}


// --- LÓGICA DE EDICIÓN Y BORRADO ---

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

function abrirModalEditar(id, zona, nombre, series, descanso) {
    ejercicioEditandoId = id; 
    document.getElementById("modal-ejercicio").style.display = "flex";
    
    // 1. Cargamos la zona y forzamos a que se cree la lista de ejercicios
    document.getElementById("select-ej-zona").value = zona;
    actualizarListaEjercicios();
    
    // 2. Ahora sí podemos seleccionar el ejercicio específico
    document.getElementById("select-ej-nombre").value = nombre;
    
    document.getElementById("input-ej-series").value = series;
    document.getElementById("input-ej-descanso").value = descanso;
}

// --- EDICIÓN DE PROFESOR ---

let fotoEditProfeElegida = ""; // Guarda temporalmente la foto durante la edición

// Abrir ventana y cargar los datos
async function editarProfe() {
    try {
        const { data: profe, error } = await clienteSupabase
            .from('profesores')
            .select('*')
            .eq('id', profeActivoId)
            .single();
        
        if (error) throw error;

        // Rellenamos los textos
        document.getElementById("input-edit-nombre").value = profe.nombre || "";
        document.getElementById("input-edit-apellido").value = profe.apellido || ""; 
        
        // Cargamos la foto que ya tenía en la base de datos
        fotoEditProfeElegida = profe.foto_url || "imagenes/perfil1.png";
        document.getElementById("img-preview-edit-profe").src = fotoEditProfeElegida;
        
        // Reseteamos los selectores
        document.getElementById("select-edit-profe-avatar").value = "";
        document.getElementById("input-foto-edit-profe").value = "";

        document.getElementById("modal-editar-profe").style.display = "flex";
        
    } catch (error) {
        mostrarAlerta("Error al cargar los datos del perfil: " + error.message);
    }
}

// Ventana de cerrar
function cerrarModalEditarProfe() {
    document.getElementById("modal-editar-profe").style.display = "none";
}

// Si en la edición elige cambiar por un avatar de la lista
function cambiarPreviewEditAvatar() {
    const avatarElegido = document.getElementById("select-edit-profe-avatar").value;
    if (avatarElegido) {
        fotoEditProfeElegida = avatarElegido;
        document.getElementById("img-preview-edit-profe").src = fotoEditProfeElegida;
        document.getElementById("input-foto-edit-profe").value = ""; // Descartamos la foto subida
    }
}

// Si se saca una selfie nueva o sube de galería (Compresión automática)
function procesarFotoEditSubida(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 300; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Guardamos la foto comprimida
            fotoEditProfeElegida = canvas.toDataURL("image/jpeg", 0.7); 
            
            // Actualizamos la vista previa visual
            document.getElementById("img-preview-edit-profe").src = fotoEditProfeElegida;
            document.getElementById("select-edit-profe-avatar").value = ""; // Limpiamos el avatar
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Guardar los cambios nuevos
async function guardarEdicionProfe() {
    const nuevoNombre = document.getElementById("input-edit-nombre").value.trim();
    const nuevoApellido = document.getElementById("input-edit-apellido").value.trim();
    
    if (!nuevoNombre) {
        mostrarAlerta("Faltan datos","El nombre no puede estar vacío.");
        return;
    }

    try {
        const { data: profeActualizado, error } = await clienteSupabase
            .from('profesores')
            .update({ 
                nombre: nuevoNombre, 
                apellido: nuevoApellido,
                foto_url: fotoEditProfeElegida // Acá viaja la nueva foto (o la vieja si no la tocó)
            })
            .eq('id', profeActivoId)
            .select();
        
        if (error) throw error;

        cerrarModalEditarProfe();
        document.getElementById("nombre-profe-activo").innerText = "Profe " + nuevoNombre;
        
        cargarProfesores(); 

    } catch (e) { 
        mostrarAlerta("Error al actualizar: " + e.message); 
        console.error(e);
    }
}

function borrarAlumno(id) {
    pedirConfirmacion(
        "Eliminar Alumno",
        "Se perderán todos sus datos y rutinas. Esta acción no se puede deshacer.",
        "Eliminar",
        async () => {
            try {
                await clienteSupabase.from('rutinas_planificadas').delete().eq('alumno_id', id);
                const { error } = await clienteSupabase.from('alumnos').delete().eq('id', id);
                if (error) throw error;
                cargarAlumnos();
            } catch (error) { mostrarAlerta("Error al borrar: " + error.message); }
        }
    );
}

function activarModoBorrado() {
    modoBorradoActivo = !modoBorradoActivo; 
    
    const btnTachito = document.getElementById("btn-activar-borrado");

    if (modoBorradoActivo) {
        // ACTIVAMOS MODO BORRADO: El tachito se pone rojo
        btnTachito.classList.add("activo"); 
    } else {
        // VOLVEMOS AL ESTADO NORMAL: El tachito vuelve a gris
        btnTachito.classList.remove("activo"); 
    }

    cargarAlumnos(); // Refrescamos la lista para que aparezcan/desaparezcan los botones de borrar en cada alumno
}


// --- EDICIÓN DE ALUMNO ---
function abrirModalEditarAlumno() {
    if (!alumnoDataActual) return; 
    
    document.getElementById("modal-editar-alumno").style.display = "flex";
    
    // Rellenamos TODOS los campos con la info que ya existía para que no estén vacíos
    document.getElementById("input-edit-alumno-nombre").value = `${alumnoDataActual.nombre} ${alumnoDataActual.apellido}`;
    document.getElementById("select-edit-alumno-actividad").value = alumnoDataActual.actividad || "Musculación";
    document.getElementById("input-edit-alumno-objetivo").value = alumnoDataActual.objetivo || "";
    document.getElementById("input-edit-alumno-edad").value = alumnoDataActual.edad || "";
    document.getElementById("input-edit-alumno-condicion").value = alumnoDataActual.condicion_medica || "";
    document.getElementById("input-edit-alumno-vencimiento").value = alumnoDataActual.vencimiento_cuota || "";
    document.getElementById("input-edit-alumno-cuota").value = alumnoDataActual.cuota ? alumnoDataActual.cuota.toLocaleString('es-AR') : "";
}

function cerrarModalEditarAlumno() {
    document.getElementById("modal-editar-alumno").style.display = "none";
}

async function guardarEdicionAlumnoEnBD() {
    const nombreCompleto = document.getElementById("input-edit-alumno-nombre").value.trim();
    const actividad = document.getElementById("select-edit-alumno-actividad").value;
    const objetivo = document.getElementById("input-edit-alumno-objetivo").value.trim();
    const edad = document.getElementById("input-edit-alumno-edad").value.trim();
    const condicion = document.getElementById("input-edit-alumno-condicion").value.trim();
    const cuota = document.getElementById("input-edit-alumno-cuota").value.trim();
    
    // NUEVO: Capturamos la fecha editada
    const vencimiento = document.getElementById("input-edit-alumno-vencimiento").value;

    if (!nombreCompleto) {
        mostrarAlerta("Faltan datos", "El nombre no puede estar vacío.");
        return;
    }

    const partes = nombreCompleto.split(" ");
    const nombre = partes[0];
    const apellido = partes.slice(1).join(" ") || "";

    try {
        const { error } = await clienteSupabase
            .from('alumnos')
            .update({ 
                nombre: nombre, 
                apellido: apellido, 
                actividad: actividad,
                objetivo: objetivo,
                edad: edad ? parseInt(edad) : null,
                condicion_medica: condicion,
                vencimiento_cuota: vencimiento || null, // NUEVO: Guardamos la fecha
                // Adentro del update de guardarEdicionAlumnoEnBD:
                cuota: cuota ? parseInt(cuota.replace(/\./g, '')) : null
            })
            .eq('id', alumnoSeleccionadoId);
        
        if (error) throw error;

        cerrarModalEditarAlumno();
        cargarAlumnos(); 
        abrirGrillaAlumno(alumnoSeleccionadoId); 

    } catch (e) { 
        mostrarAlerta("Error", "Error al actualizar: " + e.message); 
    }
}

// --- GUARDAR EL ORDEN AL ARRASTRAR ---
async function guardarOrdenEjercicios() {
    // Agarramos todas las tarjetas en el nuevo orden visual
    const tarjetas = document.querySelectorAll("#lista-ejercicios-detalle .card-ejercicio");
    const promesasDeGuardado = [];

    // Recorremos una por una
    tarjetas.forEach((tarjeta, index) => {
        const idEjercicio = tarjeta.getAttribute("data-id");
        
        // Armamos el aviso para Supabase: "A este ID le toca esta posición (index)"
        const peticion = clienteSupabase
            .from('rutinas_planificadas')
            .update({ orden: index })
            .eq('id', idEjercicio);
            
        promesasDeGuardado.push(peticion);
    });

    try {
        // Disparamos todos los avisos al mismo tiempo para que sea instantáneo
        await Promise.all(promesasDeGuardado);
        console.log("Nuevo orden guardado en la nube");
    } catch (error) {
        console.error("Error al guardar el nuevo orden:", error.message);
    }
}



// ==========================================
// SISTEMA GLOBAL DE VIBRACIÓN (FEEDBACK HÁPTICO)
// ==========================================
document.addEventListener('click', function(e) {
    // Verificamos si el navegador del celular soporta vibración
    if (!navigator.vibrate) return; 

    // 1. Buscamos si lo que tocó el usuario es algo interactivo
    const elementoTocado = e.target.closest('button, .card-alumno, .tarjeta-perfil-moderna, .tarjeta-rol, .chip, svg[onclick]');
    
    // Si tocó algo interactivo, hacemos una vibración cortita y elegante (15 milisegundos)
    if (elementoTocado) {
        navigator.vibrate(15); 
    }
});

// También podemos mejorar nuestra alerta visual para que vibre fuerte cuando hay un error
const funcionAlertaOriginal = mostrarAlerta;
mostrarAlerta = function(titulo, mensaje) {
    if (navigator.vibrate) {
        // Vibra dos veces rápido para llamar la atención (Alerta)
        navigator.vibrate([50, 50, 50]); 
    }
    funcionAlertaOriginal(titulo, mensaje); // Llama a tu alerta gráfica normal
};

// ==========================================
// SISTEMA DE RENDIMIENTO Y EVALUACIONES
// ==========================================
let graficoInstancia = null; // Memoria del gráfico para poder actualizarlo

function abrirModalRendimiento() {
    document.getElementById("modal-rendimiento").style.display = "flex";
    
    // Setear mes y año actual automáticamente al abrir
    const hoy = new Date();
    document.getElementById("select-rend-anio").value = hoy.getFullYear().toString();
    document.getElementById("select-rend-mes").value = (hoy.getMonth() + 1).toString();
    
    cargarRendimiento(); // Trae los datos de Supabase
}

function cerrarModalRendimiento() {
    document.getElementById("modal-rendimiento").style.display = "none";
}

async function cargarRendimiento() {
    const anio = document.getElementById("select-rend-anio").value;
    const mes = document.getElementById("select-rend-mes").value.padStart(2, '0');
    const contenedor = document.getElementById("lista-comentarios-rend");
    
    contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.85rem;'>Consultando base de datos...</p>";
    
    try {
        // Armamos el rango de búsqueda real para Supabase (Ej: de 2026-03-01 a 2026-03-31)
        const fechaInicio = `${anio}-${mes}-01`;
        const ultimoDia = new Date(anio, mes, 0).getDate();
        const fechaFin = `${anio}-${mes}-${ultimoDia}`;

        const { data: evaluaciones, error } = await clienteSupabase
            .from('evaluaciones_rendimiento')
            .select('*')
            .eq('alumno_id', alumnoSeleccionadoId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true });

        if (error) throw error;

        // 1. DIBUJAR COMENTARIOS
        contenedor.innerHTML = "";
        if (evaluaciones.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.85rem;'>No hay registros de rendimiento en este período.</p>";
        } else {
            evaluaciones.forEach(ev => {
                const fechaFormateada = ev.fecha.split('-').reverse().join('/'); // Pasa de 2026-10-05 a 05/10/2026
                
                if (ev.tipo === 'alumno') {
                    contenedor.innerHTML += `
                        <div class="burbuja-alumno">
                            <strong style="color: #3498db; font-size:0.8rem;">Autoevaluación (${fechaFormateada}) - Nota: ${ev.calificacion}/10</strong>
                            <p style="font-size:0.85rem; color:#ddd; margin-top:4px;">"${ev.comentario}"</p>
                        </div>
                    `;
                } else {
                    contenedor.innerHTML += `
                        <div class="burbuja-profe">
                            <strong style="color: #f39c12; font-size:0.8rem;">Mi Evaluación (${fechaFormateada})</strong>
                            <p style="font-size:0.85rem; color:#ddd; margin-top:4px;">"${ev.comentario}"</p>
                        </div>
                    `;
                }
            });
        }

        // 2. DIBUJAR GRÁFICO (Solo con los datos reales del alumno)
        dibujarGraficoRendimiento(evaluaciones);

    } catch (e) {
        contenedor.innerHTML = `<p style='color:#e74c3c; font-size:0.85rem;'>Error al cargar: ${e.message}</p>`;
    }
}

function dibujarGraficoRendimiento(evaluaciones) {
    const ctx = document.getElementById('grafico-rendimiento').getContext('2d');
    
    // Si ya había un gráfico antes, lo destruimos para dibujar el nuevo mes sin que se superpongan
    if (graficoInstancia) { graficoInstancia.destroy(); }

    // Filtramos SOLO las evaluaciones del alumno que tengan una nota numérica
    const evAlumno = evaluaciones.filter(e => e.tipo === 'alumno' && e.calificacion);
    
    // Extraemos las etiquetas (fechas) y los datos (notas). Si no hay, queda vacío esperando datos reales.
    const labels = evAlumno.map(e => e.fecha.split('-').reverse().slice(0,2).join('/')); // Muestra Ej: "05/10"
    const data = evAlumno.map(e => e.calificacion);

    graficoInstancia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sensación de esfuerzo (Real)',
                data: data,
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.2)',
                borderWidth: 2.5,
                tension: 0.4, // Curvas suaves
                pointBackgroundColor: '#ffffff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 10, ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } }
            },
            plugins: {
                legend: { labels: { color: 'white', font: { size: 11 } } }
            }
        }
    });
}

async function guardarEvaluacionProfe() {
    const comentario = document.getElementById("input-comentario-profe").value.trim();
    if (!comentario) {
        mostrarAlerta("Atención", "No escribiste nada en la evaluación.");
        return;
    }
    
    const hoy = new Date().toISOString().split('T')[0];

    try {
        const { error } = await clienteSupabase.from('evaluaciones_rendimiento').insert([{
            alumno_id: alumnoSeleccionadoId,
            profesor_id: profeActivoId,
            tipo: 'profe',
            comentario: comentario,
            fecha: hoy
            // No le pasamos "calificacion" porque eso es solo para el alumno
        }]);
        
        if (error) throw error;
        
        document.getElementById("input-comentario-profe").value = "";
        cargarRendimiento(); // Recarga la base de datos para mostrar tu comentario instantáneamente
        
    } catch (e) {
        mostrarAlerta("Error", "No se pudo guardar: " + e.message);
    }
}

// --- ABRIR PANTALLA INDIVIDUAL DEL ALUMNO (VERSIÓN LIMPIA) ---
async function abrirGrillaAlumno(id) {
    alumnoSeleccionadoId = id; 

    try {
        const { data: alumno, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('id', id)
            .single(); 

        if (error) throw error;

        alumnoDataActual = alumno;

        document.getElementById("pantalla-dashboard").style.display = "none";
        document.getElementById("pantalla-detalle-alumno").style.display = "block";

        // Llenamos la tarjeta superior con la información 100% real
        document.getElementById("detalle-nombre-completo").innerText = `${alumno.nombre} ${alumno.apellido}`;
        document.getElementById("detalle-objetivo").innerText = alumno.objetivo || "General";
        
        // Colocamos la edad y condición de la base de datos
        document.getElementById("detalle-edad").innerText = alumno.edad ? alumno.edad : "No especificada"; 
        document.getElementById("detalle-salud").innerText = alumno.condicion_medica || "Sin observaciones.";

        // Mostramos el valor de la cuota
        document.getElementById("detalle-cuota").innerText = alumno.cuota ? alumno.cuota.toLocaleString('es-AR') : "No definida";

        let fechaFormateada = "Sin definir";
        if (alumno.vencimiento_cuota) {
            const partes = alumno.vencimiento_cuota.split('-'); // Cortamos el 2026-08-15
            fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`; // Lo armamos como 15/08/2026
        }
        document.getElementById("detalle-vencimiento").innerText = fechaFormateada;

        // Reseteamos la vista al slider principal y cargamos los chips
        cerrarCategoria(); 
        generarChipsRutina(); // <-- Dibuja las semanas y días

    } catch (error) {
        console.error("Error al abrir la ficha:", error.message);
        mostrarAlerta("No se pudo cargar la información del alumno.");
    }
}

// ==========================================
// SISTEMA DE CHIPS (SEMANAS Y DÍAS)
// ==========================================
let semanaActiva = 1; 
let diaActivo = 1;    

function generarChipsRutina() {
    const contenedorSemanas = document.getElementById("chips-semanas");
    const contenedorDias = document.getElementById("chips-dias");

    // 1. DIBUJAR SEMANAS (1 a 4)
    contenedorSemanas.innerHTML = "";
    for (let i = 1; i <= 4; i++) {
        const claseActivo = (i === semanaActiva) ? "activo" : "";
        contenedorSemanas.innerHTML += `<button class="chip-rutina ${claseActivo}" onclick="seleccionarSemana(${i})">Semana ${i}</button>`;
    }

    // 2. DIBUJAR DÍAS PERSONALIZADOS
    let dias = ["D1", "D2", "D3", "D4", "D5"];
    
    // Si el alumno tiene días guardados en la BD, los usamos:
    if (alumnoDataActual && alumnoDataActual.nombres_dias && alumnoDataActual.nombres_dias.length === 5) {
        dias = alumnoDataActual.nombres_dias;
    }
    
    contenedorDias.innerHTML = "";
    dias.forEach((diaTexto, index) => {
        const numDia = index + 1;
        const claseActivo = (numDia === diaActivo) ? "activo" : "";
        contenedorDias.innerHTML += `<button class="chip-rutina ${claseActivo}" onclick="seleccionarDia(${numDia})">${diaTexto}</button>`;
    });

    // 3. BOTONCITO DE EDITAR AL FINAL
    contenedorDias.innerHTML += `
        <button class="chip-rutina" style="padding: 8px 12px; border-color: #ccc; color: #888; display: flex; align-items: center;" onclick="abrirModalEditarDias()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
    `;

    // Si estamos viendo las barras, las redibujamos para actualizar la cantidad de ejercicios por día
    if (vistaSliderActual === 'categorias') {
        dibujarCategoriasAlumno();
    }
}

// Cuando el profe toca una Semana
function seleccionarSemana(numSemana) {
    semanaActiva = numSemana;
    
    // 1. Pintamos de naranja el botón tocado (Sin borrar el HTML, así dejamos que rebote!)
    const botonesSemanas = document.querySelectorAll("#chips-semanas .chip-rutina");
    botonesSemanas.forEach((btn, index) => {
        if (index + 1 === numSemana) btn.classList.add("activo");
        else btn.classList.remove("activo");
    });

    // 2. Actualizamos la info de abajo
    if(vistaSliderActual === 'categorias') dibujarCategoriasAlumno();
    if(vistaSliderActual === 'ejercicios') cargarEjerciciosCategoriaBD(); 
}

// Cuando el profe toca un Día
function seleccionarDia(numDia) {
    diaActivo = numDia;
    
    // 1. Pintamos de naranja el botón tocado (Sin borrar el HTML, así dejamos que rebote!)
    const botonesDias = document.querySelectorAll("#chips-dias .chip-rutina");
    botonesDias.forEach((btn, index) => {
        if (index + 1 === numDia) btn.classList.add("activo");
        else btn.classList.remove("activo");
    });

    // 2. Actualizamos la info de abajo
    if(vistaSliderActual === 'categorias') dibujarCategoriasAlumno();
    if(vistaSliderActual === 'ejercicios') cargarEjerciciosCategoriaBD(); 
}

// Abre la ventana y rellena los inputs con los nombres actuales
function abrirModalEditarDias() {
    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias && alumnoDataActual.nombres_dias.length === 5) {
        dias = alumnoDataActual.nombres_dias;
    }
    
    document.getElementById("input-dia-1").value = dias[0];
    document.getElementById("input-dia-2").value = dias[1];
    document.getElementById("input-dia-3").value = dias[2];
    document.getElementById("input-dia-4").value = dias[3];
    document.getElementById("input-dia-5").value = dias[4];
    
    document.getElementById("modal-editar-dias").style.display = "flex";
}

// Guarda los nombres nuevos
async function guardarEdicionDias() {
    const nuevosDias = [
        document.getElementById("input-dia-1").value.trim() || "D1",
        document.getElementById("input-dia-2").value.trim() || "D2",
        document.getElementById("input-dia-3").value.trim() || "D3",
        document.getElementById("input-dia-4").value.trim() || "D4",
        document.getElementById("input-dia-5").value.trim() || "D5"
    ];

    // Lo actualizamos en la memoria visual instantáneamente
    if (!alumnoDataActual) alumnoDataActual = {};
    alumnoDataActual.nombres_dias = nuevosDias;
    
    generarChipsRutina(); // Redibuja los botones al instante
    document.getElementById("modal-editar-dias").style.display = "none";

    // Lo mandamos a Supabase para que quede guardado para siempre
    try {
        const { error } = await clienteSupabase
            .from('alumnos')
            .update({ nombres_dias: nuevosDias })
            .eq('id', alumnoSeleccionadoId);
        
        if (error) throw error;
    } catch (e) {
        mostrarAlerta("Error", "Error al guardar en Supabase.");
    }
}

// ==========================================
// CONTROLADOR DEL SLIDER Y CATEGORÍAS (BARRAS REALES)
// ==========================================
let vistaSliderActual = 'categorias'; 
let categoriaSeleccionada = null;
let categoriaOpcionesActiva = null; 

async function dibujarCategoriasAlumno() {
    const contenedor = document.getElementById("lista-categorias-rutina");
    contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.9rem; margin-top:20px;'>Cargando barras...</p>";

    // 1. Buscamos las barras del alumno en Supabase (o le damos las 3 por defecto)
    let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
    if (alumnoDataActual && alumnoDataActual.categorias_rutina) {
        categorias = alumnoDataActual.categorias_rutina;
    }

    // 2. Traemos el día actual para contar cuántos ejercicios tiene cada barra
    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias) { dias = alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[diaActivo - 1]; 

    try {
        // Consultamos todos los ejercicios del día para hacer el conteo
        const { data: ejercicios } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('categoria')
            .eq('alumno_id', alumnoSeleccionadoId)
            .eq('dia_semana', diaSeleccionado);

        contenedor.innerHTML = "";
        
        categorias.forEach(cat => {
            // Contamos los ejercicios. (Si la categoría es "Entrenamiento", incluimos los ejercicios viejos que no tenían categoría)
            let cantidad = 0;
            if (ejercicios) {
                cantidad = ejercicios.filter(e => {
                    if (cat.toUpperCase() === 'ENTRENAMIENTO') return !e.categoria || e.categoria === cat;
                    return e.categoria === cat;
                }).length;
            }

            // Asignamos íconos visuales
            // Por defecto dejamos una estrellita por si el profe crea una categoría nueva (ej: "Estiramiento")
            let iconoHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            
            // Si es una de las principales, usamos tus imágenes espectaculares
            if (cat.toUpperCase() === "MOVILIDAD") {
                iconoHTML = `<img src="imagenes/MOVILIDAD.jpg" class="img-cat-rutina" alt="Movilidad">`;
            }
            if (cat.toUpperCase() === "ENTRADA EN CALOR") {
                iconoHTML = `<img src="imagenes/ENTRADAENCALOR.jpg" class="img-cat-rutina" alt="Entrada en calor">`;
            }
            if (cat.toUpperCase() === "ENTRENAMIENTO") {
                iconoHTML = `<img src="imagenes/ENTRENAMIENTO.jpg" class="img-cat-rutina" alt="Entrenamiento">`;
            }

            contenedor.innerHTML += `
                <div class="card-categoria" onclick="abrirCategoria('${cat}')">
                    <div class="menu-puntos-izq" onclick="event.stopPropagation(); abrirOpcionesCategoria('${cat}')">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                    </div>
                    <div class="icono-categoria">${iconoHTML}</div>
                    <div class="info-categoria">
                        <h4>${cat.toUpperCase()}</h4>
                        <p>${cantidad} ejercicios cargados</p>
                    </div>
                    <svg class="flecha-derecha" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2.5" width="20"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

function abrirCategoria(nombreCategoria) {
    categoriaSeleccionada = nombreCategoria;
    document.getElementById('titulo-categoria-activa').innerText = nombreCategoria.toUpperCase();
    document.getElementById('track-slider-rutinas').style.transform = 'translateX(-50%)';
    vistaSliderActual = 'ejercicios';
    cargarEjerciciosCategoriaBD(); 
}

function cerrarCategoria() {
    categoriaSeleccionada = null;
    document.getElementById('track-slider-rutinas').style.transform = 'translateX(0%)';
    vistaSliderActual = 'categorias';
    dibujarCategoriasAlumno(); // Actualiza los numeritos al volver atrás
}

function accionBotonFabInteligente() {
    if (vistaSliderActual === 'categorias') {
        document.getElementById('input-nueva-categoria').value = '';
        document.getElementById('modal-categoria').style.display = 'flex';
    } else {
        abrirModalEjercicio(); 
    }
}

function abrirOpcionesCategoria(nombreCategoria) {
    categoriaOpcionesActiva = nombreCategoria;
    document.getElementById('titulo-opciones-cat').innerText = "Opciones: " + nombreCategoria;
    document.getElementById('modal-opciones-categoria').style.display = 'flex';
}

// CONEXIÓN: CREAR BARRA EN BD
async function guardarNuevaCategoriaBD() { 
    const nuevaCat = document.getElementById('input-nueva-categoria').value.trim();
    if(!nuevaCat) return;
    
    let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
    if (alumnoDataActual && alumnoDataActual.categorias_rutina) { categorias = alumnoDataActual.categorias_rutina; }
    
    categorias.push(nuevaCat);
    alumnoDataActual.categorias_rutina = categorias; 
    
    document.getElementById('modal-categoria').style.display = 'none';
    dibujarCategoriasAlumno(); 
    
    try { await clienteSupabase.from('alumnos').update({ categorias_rutina: categorias }).eq('id', alumnoSeleccionadoId); } 
    catch (e) { console.error(e); }
}

// CONEXIÓN: BORRAR BARRA EN BD
async function borrarCategoriaActiva() { 
    document.getElementById('modal-opciones-categoria').style.display = 'none';
    pedirConfirmacion("Borrar Categoría", `¿Seguro que querés borrar '${categoriaOpcionesActiva}' y TODOS sus ejercicios adentro?`, "Borrar", async () => {
        let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
        if (alumnoDataActual && alumnoDataActual.categorias_rutina) { categorias = alumnoDataActual.categorias_rutina; }
        
        categorias = categorias.filter(c => c !== categoriaOpcionesActiva);
        alumnoDataActual.categorias_rutina = categorias;
        dibujarCategoriasAlumno();
        
        try { 
            // Borra la barra del alumno y borra todos los ejercicios que vivían ahí adentro
            await clienteSupabase.from('alumnos').update({ categorias_rutina: categorias }).eq('id', alumnoSeleccionadoId); 
            await clienteSupabase.from('rutinas_planificadas').delete().eq('alumno_id', alumnoSeleccionadoId).eq('categoria', categoriaOpcionesActiva);
        } catch (e) { console.error(e); }
    });
}

// Abre la ventana hermosa para renombrar
function editarNombreCategoria() { 
    document.getElementById('modal-opciones-categoria').style.display = 'none';
    document.getElementById('input-renombrar-categoria').value = categoriaOpcionesActiva;
    document.getElementById('modal-renombrar-categoria').style.display = 'flex';
}

// Guarda el nuevo nombre en la pantalla y en Supabase
async function guardarRenombrarCategoriaBD() {
    const nuevoNombre = document.getElementById('input-renombrar-categoria').value.trim();
    
    if (!nuevoNombre || nuevoNombre === "" || nuevoNombre.toUpperCase() === categoriaOpcionesActiva.toUpperCase()) {
        document.getElementById('modal-renombrar-categoria').style.display = 'none';
        return;
    }

    document.getElementById('modal-renombrar-categoria').style.display = 'none';

    let categorias = ["Movilidad", "Entrada en calor", "Entrenamiento"];
    if (alumnoDataActual && alumnoDataActual.categorias_rutina) { 
        categorias = alumnoDataActual.categorias_rutina; 
    }
    
    const index = categorias.indexOf(categoriaOpcionesActiva);
    if (index !== -1) categorias[index] = nuevoNombre;
    
    alumnoDataActual.categorias_rutina = categorias;
    dibujarCategoriasAlumno();

    try {
        // Actualiza el nombre en el alumno, y muda todos los ejercicios a la barra con el nombre nuevo
        await clienteSupabase.from('alumnos').update({ categorias_rutina: categorias }).eq('id', alumnoSeleccionadoId);
        await clienteSupabase.from('rutinas_planificadas').update({ categoria: nuevoNombre }).eq('alumno_id', alumnoSeleccionadoId).eq('categoria', categoriaOpcionesActiva);
    } catch (e) { 
        console.error(e); 
    }
}

function obtenerAnimacionHTML(nombreEj) {
    if (!nombreEj) return `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
    const n = nombreEj.trim();
    if (n === "Vuelos laterales") return `<div class="img-animada anim-vuelos-laterales"></div>`;
    if (n === "Press de banca") return `<div class="img-animada anim-press-banca"></div>`;
    if (n === "Back squat" || n === "Sentadilla") return `<div class="img-animada anim-back-squat"></div>`;
    if (n === "Peso muerto") return `<div class="img-animada anim-peso-muerto"></div>`;
    return `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
}

// ==========================================
// EJERCICIOS Y RUTINAS DESDE BD
// ==========================================
async function cargarEjerciciosCategoriaBD() {
    const contenedorEjercicios = document.getElementById("lista-ejercicios-detalle");
    contenedorEjercicios.innerHTML = "<p style='text-align:center; color:#888; font-size:0.9rem; margin-top: 20px;'>Cargando rutina...</p>";

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias) { dias = alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[diaActivo - 1]; 

    try {
        // Consulta base: el alumno y el día
        let query = clienteSupabase.from('rutinas_planificadas').select('*')
            .eq('alumno_id', alumnoSeleccionadoId)
            .eq('dia_semana', diaSeleccionado) 
            .order('orden', { ascending: true, nullsFirst: false }) 
            .order('id', { ascending: true }); 

        // MAGIA DE RESCATE: Si estamos en "Entrenamiento", traemos los ejercicios nuevos Y los viejos de Ana Banana (que no tienen categoría)
        if (categoriaSeleccionada.toUpperCase() === 'ENTRENAMIENTO') {
            query = query.or(`categoria.eq.${categoriaSeleccionada},categoria.is.null`);
        } else {
            query = query.eq('categoria', categoriaSeleccionada);
        }

        const { data: ejercicios, error } = await query;
        if (error) throw error;
        
        contenedorEjercicios.innerHTML = ""; 

        if (ejercicios.length === 0) {
            contenedorEjercicios.innerHTML = `<p style="text-align:center; color:#888; font-size: 0.9rem; margin-top: 30px;">No hay ejercicios acá. Tocá el + para añadir uno.</p>`;
            return;
        }
        
        ejercicios.forEach(ej => {
            let htmlImagen = obtenerAnimacionHTML(ej.ejercicio_nombre);
            contenedorEjercicios.innerHTML += `
                <div class="card-ejercicio" data-id="${ej.id}">
                    <svg class="icono-arrastre" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                    ${htmlImagen}
                    <div class="info-ejercicio">
                        <h4>${ej.ejercicio_nombre}</h4>
                        <div class="detalle-ejercicio"><div class="punto-ama"></div><span>${ej.series_reps || "-"}</span><span class="separador">|</span><span>Descanso ${ej.descanso || "-"}</span></div>
                    </div>
                    <div class="acciones-ejercicio">
                        <svg onclick="abrirModalEditar('${ej.id}', '${ej.zona_muscular}', '${ej.ejercicio_nombre}', '${ej.series_reps}', '${ej.descanso}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        <svg onclick="borrarEjercicio('${ej.id}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>`;
        });

        new Sortable(contenedorEjercicios, {
            animation: 200, delay: 200, delayOnTouchOnly: true, filter: ".acciones-ejercicio svg", preventOnFilter: false,
            chosenClass: "tarjeta-arrastrando", ghostClass: "tarjeta-indicador-caida",
            onEnd: function () { guardarOrdenEjercicios(); }
        });
    } catch (e) { console.error(e); }
}

async function guardarEjercicioEnBD() {
    const zona = document.getElementById("select-ej-zona").value; 
    const nombre = document.getElementById("select-ej-nombre").value.trim();
    if (!zona || !nombre) { mostrarAlerta("Faltan datos","Ponele zona y nombre."); return; }

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias) { dias = alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[diaActivo - 1]; 

    try {
        if (ejercicioEditandoId) {
            await clienteSupabase.from('rutinas_planificadas').update({ 
                ejercicio_nombre: nombre, series_reps: document.getElementById("input-ej-series").value, 
                descanso: document.getElementById("input-ej-descanso").value, zona_muscular: zona
            }).eq('id', ejercicioEditandoId);
        } else {
            await clienteSupabase.from('rutinas_planificadas').insert([{
                alumno_id: alumnoSeleccionadoId, 
                dia_semana: diaSeleccionado, 
                categoria: categoriaSeleccionada, // AHORA SE GUARDA EN SU BARRA CORRESPONDIENTE
                zona_muscular: zona,
                ejercicio_nombre: nombre, 
                series_reps: document.getElementById("input-ej-series").value,
                descanso: document.getElementById("input-ej-descanso").value, 
                orden:999
            }]);
        }
        ejercicioEditandoId = null; cerrarModalEjercicio(); cargarEjerciciosCategoriaBD();
    } catch (e) { mostrarAlerta("Error", e.message); }
}

// --- 11. SISTEMA DE PACKS PREDEFINIDOS ---
let packActivoId = null;
let packActivoEjercicios = []; 

function abrirPantallaRutinas() {
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-perfiles").style.display = "none"; 
    document.getElementById("pantalla-rutinas").style.display = "block";
    cargarPacks();
}

async function cargarPacks() {
    const contenedor = document.getElementById("lista-packs");
    contenedor.innerHTML = "<p style='text-align:center;'>Cargando tus rutinas...</p>";
    try {
        const { data: packs, error } = await clienteSupabase.from('packs_rutinas').select('*').eq('profesor_id', profeActivoId);
        if (error) throw error;
        contenedor.innerHTML = "";
        if (packs.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888;'>No tenés rutinas guardadas.</p>"; return;
        }
        packs.forEach(pack => {
            const ejCount = pack.ejercicios ? pack.ejercicios.length : 0;
            contenedor.innerHTML += `
                <div class="card-alumno" onclick="abrirDetallePack('${pack.id}', '${pack.nombre}')" style="cursor:pointer;">
                    ${obtenerAnimacionHTML((ejCount > 0) ? pack.ejercicios[0].nombre : null)}
                    <div class="info-central" style="margin-left: 15px;"><h3>${pack.nombre}</h3><div class="info-detalle">${ejCount} ejercicios configurados</div></div>
                    <div class="acciones-ejercicio" style="margin-left: auto; padding-left: 10px;">
                        <svg onclick="event.stopPropagation(); borrarPack('${pack.id}')" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" width="20"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>`;
        });
    } catch (e) { contenedor.innerHTML = "<p>Error al cargar packs.</p>"; }
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

function cerrarModalCrearPack() { 
    document.getElementById("modal-crear-pack").style.display = "none"; 
}

async function guardarPackNuevo() {
    const nombre = document.getElementById("input-pack-nombre").value.trim();
    if(!nombre) return;
    try { 
        await clienteSupabase.from('packs_rutinas').insert([{ profesor_id: profeActivoId, nombre: nombre, ejercicios: [] }]); 
        cerrarModalCrearPack(); 
        cargarPacks(); 
    } catch (e) { 
        console.error(e); 
    }
}

async function abrirDetallePack(id, nombre) {
    packActivoId = id;
    document.getElementById("pantalla-rutinas").style.display = "none"; 
    document.getElementById("pantalla-detalle-pack").style.display = "block";
    document.getElementById("detalle-nombre-pack").innerText = nombre; 
    cargarEjerciciosDePack();
}

async function cargarEjerciciosDePack() {
    const contenedor = document.getElementById("lista-ejercicios-pack");
    try {
        const { data, error } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', packActivoId).single();
        if (error) throw error;
        packActivoEjercicios = data.ejercicios || [];
        contenedor.innerHTML = "";
        packActivoEjercicios.forEach((ej, index) => {
            contenedor.innerHTML += `<div class="card-ejercicio">${obtenerAnimacionHTML(ej.nombre)}<div class="info-ejercicio"><h4>${ej.nombre}</h4><div class="detalle-ejercicio"><span>${ej.series}</span></div></div><div class="acciones-ejercicio"><svg onclick="borrarEjercicioDePack(${index})" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></div></div>`;
        });
    } catch(e) { console.error(e); }
}

function abrirModalEjercicioPack() { 
    document.getElementById("modal-ejercicio-pack").style.display = "flex"; 
}

function actualizarListaEjerciciosPack() {
    const z = document.getElementById("select-pack-ej-zona").value;
    const s = document.getElementById("select-pack-ej-nombre");
    s.innerHTML = ""; if(!z) return;
    catalogoEjercicios[z].forEach(ej => { s.innerHTML += `<option value="${ej}">${ej}</option>`; });
}

async function guardarEjercicioEnPack() {
    packActivoEjercicios.push({ zona: document.getElementById("select-pack-ej-zona").value, nombre: document.getElementById("select-pack-ej-nombre").value, series: document.getElementById("input-pack-ej-series").value, descanso: document.getElementById("input-pack-ej-descanso").value });
    try { await clienteSupabase.from('packs_rutinas').update({ ejercicios: packActivoEjercicios }).eq('id', packActivoId); document.getElementById("modal-ejercicio-pack").style.display = "none"; cargarEjerciciosDePack(); } catch(e) { console.error(e); }
}

async function borrarEjercicioDePack(index) { 
    packActivoEjercicios.splice(index, 1); 
    await clienteSupabase.from('packs_rutinas').update({ ejercicios: packActivoEjercicios }).eq('id', packActivoId); 
    cargarEjerciciosDePack(); 
}

async function abrirModalSeleccionarPack() {
    document.getElementById("modal-seleccionar-pack").style.display = "flex";
    const contenedor = document.getElementById("lista-seleccionar-packs");
    try {
        const { data: packs } = await clienteSupabase.from('packs_rutinas').select('*').eq('profesor_id', profeActivoId);
        contenedor.innerHTML = "";
        packs.forEach(pack => {
            contenedor.innerHTML += `<div class="card-alumno" onclick="importarPackAAlumno('${pack.id}')" style="cursor:pointer; background: white; margin-bottom:10px;">${obtenerAnimacionHTML(pack.ejercicios?.[0]?.nombre)}<div class="info-central" style="margin-left: 15px;"><h3 style="font-size:1.2rem;">${pack.nombre}</h3></div><div class="acciones-ejercicio"><span style="color:#f39c12; font-weight:800;">Elegir</span></div></div>`;
        });
    } catch(e) { console.error(e); }
}

async function importarPackAAlumno(packId) {
    try {
        const { data: pack } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', packId).single();
        let dias = ["D1", "D2", "D3", "D4", "D5"];
        if (alumnoDataActual && alumnoDataActual.nombres_dias) { dias = alumnoDataActual.nombres_dias; }
        const diaSelec = dias[diaActivo - 1]; 
        
        const insertData = pack.ejercicios.map((ej, index) => ({
            alumno_id: alumnoSeleccionadoId, 
            dia_semana: diaSelec, 
            categoria: categoriaSeleccionada, // LOS PACKS TAMBIÉN CAEN ADENTRO DE LA BARRA ACTIVA
            zona_muscular: ej.zona,
            ejercicio_nombre: ej.nombre, series_reps: ej.series, descanso: ej.descanso, orden: 999 + index
        }));
        await clienteSupabase.from('rutinas_planificadas').insert(insertData);
        document.getElementById("modal-seleccionar-pack").style.display = "none";
        document.getElementById("modal-ejercicio").style.display = "none";
        cargarEjerciciosCategoriaBD(); 
    } catch(e) { console.error(e); }
}

// Función para volver desde perfiles a la pantalla de inicio de roles
function volverDesdePerfilesAInicio() {
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-inicio").style.display = "flex";
}

// --- FORMATEO AUTOMÁTICO DE CUOTAS ---
function formatearMiles(input) {
    // 1. Borramos todo lo que no sea un número (para evitar que metan letras o símbolos raros)
    let valorStr = input.value.replace(/\D/g, "");
    
    if (valorStr !== "") {
        // 2. Lo transformamos a número y le pedimos a JS que le ponga el formato argentino (con punto para los miles)
        input.value = parseInt(valorStr).toLocaleString('es-AR');
    } else {
        input.value = "";
    }
}


// ==========================================
// VENTANA DE NOTIFICACIONES (LA CAMPANITA)
// ==========================================

function abrirModalNotificaciones() {
    const contenedor = document.getElementById("lista-notificaciones");
    contenedor.innerHTML = "";

    if (!window.notificacionesGlobales || window.notificacionesGlobales.length === 0) {
        contenedor.innerHTML = "<p style='color: #aaa; text-align: center; margin-top: 20px;'>No hay vencimientos pendientes.</p>";
    } else {
        // Ordenamos para que las nuevas aparezcan arriba de todo
        window.notificacionesGlobales.sort((a, b) => b.esNueva - a.esNueva);

        window.notificacionesGlobales.forEach(notif => {
            let claseLeida = notif.esNueva ? "nueva" : "leida";
            let claseTipo = notif.tipo === 'vencida' ? "vencida" : "";
            let textoEstado = notif.tipo === 'vencida' ? `Vencida hace ${notif.dias} días` : `Vence en ${notif.dias} días`;

            contenedor.innerHTML += `
                <div class="item-notificacion ${claseTipo} ${claseLeida}">
                    <h4>${notif.alumnoNombre}</h4>
                    <p>${textoEstado} (${notif.fechaFormateada})</p>
                </div>
            `;
        });
    }

    // Mostramos la ventana
    document.getElementById("modal-notificaciones").style.display = "flex";

    // Al abrirla, marcamos TODAS automáticamente como leídas
    if (window.notificacionesGlobales && window.notificacionesGlobales.length > 0) {
        let leidasGuardadas = JSON.parse(localStorage.getItem('notifLeidas_' + profeActivoId)) || [];
        
        window.notificacionesGlobales.forEach(n => {
            if (!leidasGuardadas.includes(n.idNotif)) {
                leidasGuardadas.push(n.idNotif); // Se guardan en la memoria del celular
            }
        });
        
        localStorage.setItem('notifLeidas_' + profeActivoId, JSON.stringify(leidasGuardadas));

        // Borramos el puntito rojo al instante
        const badge = document.getElementById("badge-notificaciones");
        if (badge) badge.style.display = "none";
        
        // Las actualizamos internamente para que no salgan como nuevas la próxima vez que abra el modal hoy
        window.notificacionesGlobales.forEach(n => n.esNueva = false);
    }
}

function cerrarModalNotificaciones() {
    document.getElementById("modal-notificaciones").style.display = "none";
}

// ==========================================
// CEREBRO GLOBAL DEL TEMA (CLARO/OSCURO)
// ==========================================
let esTemaOscuro = true; // La app arranca en oscuro por defecto

function inicializarTema() {
    // 1. Preguntamos a la memoria del celular qué eligió el usuario la última vez
    const temaGuardado = localStorage.getItem('temaGlobalGym');
    
    if (temaGuardado === 'claro') {
        esTemaOscuro = false;
    } else {
        esTemaOscuro = true; // Si es la primera vez que entra, es oscuro
    }
    
    // 2. Aplicamos los colores a TODAS las pantallas
    aplicarTemaVisual();
}

function alternarTemaGlobal() {
    // 1. Invertimos el estado (si era oscuro pasa a claro, y viceversa)
    esTemaOscuro = !esTemaOscuro;
    
    // 2. Lo guardamos en el celular para siempre
    localStorage.setItem('temaGlobalGym', esTemaOscuro ? 'oscuro' : 'claro');
    
    // 3. Pintamos toda la app
    aplicarTemaVisual();
}

function aplicarTemaVisual() {
    // A. Pantallas que "de fábrica" son OSCURAS (Inicio, Login, Perfiles)
    const pantallasOscuras = ['pantalla-inicio', 'pantalla-login', 'pantalla-perfiles'];
    pantallasOscuras.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            if(esTemaOscuro) el.classList.remove('modo-claro');
            else el.classList.add('modo-claro');
        }
    });

    // B. Pantallas que "de fábrica" son CLARAS (Dashboard, Alumno, Rutinas, Packs, Admin)
    const pantallasClaras = ['pantalla-dashboard', 'pantalla-detalle-alumno', 'pantalla-rutinas', 'pantalla-detalle-pack', 'pantalla-admin'];
    pantallasClaras.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            if(esTemaOscuro) el.classList.add('modo-oscuro');
            else el.classList.remove('modo-oscuro');
        }
    });

    // C. Sincronizar absolutamente todos los íconos de la app al mismo tiempo
    const soles = document.querySelectorAll('[id^="icono-sol"]');
    const lunas = document.querySelectorAll('[id^="icono-luna"]');

    if(esTemaOscuro) {
        soles.forEach(sol => sol.style.display = 'block'); // Muestra los soles para que toques y vayas al claro
        lunas.forEach(luna => luna.style.display = 'none');
    } else {
        soles.forEach(sol => sol.style.display = 'none');
        lunas.forEach(luna => luna.style.display = 'block'); // Muestra las lunas para que toques y vayas al oscuro
    }
}

// Conectamos los botones viejos al nuevo Cerebro Central
function alternarTemaInicio() { alternarTemaGlobal(); }
function alternarTemaLogin() { alternarTemaGlobal(); }
function alternarTemaPerfiles() { alternarTemaGlobal(); }
function alternarTemaDashboard() { alternarTemaGlobal(); }