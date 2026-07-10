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

// Sistema de cambio de tema para la nueva pantalla
function alternarTemaInicio() {
    const pantallaInicio = document.getElementById('pantalla-inicio');
    const iconoSol = document.getElementById('icono-sol-inicio');
    const iconoLuna = document.getElementById('icono-luna-inicio');

    pantallaInicio.classList.toggle('modo-claro');

    if (pantallaInicio.classList.contains('modo-claro')) {
        iconoSol.style.display = 'none';
        iconoLuna.style.display = 'block';
    } else {
        iconoSol.style.display = 'block';
        iconoLuna.style.display = 'none';
    }
}


// --- 3. LOGIN Y LOGOUT ---
function iniciarSesion() {
    const emailIngresado = document.getElementById("login-email").value.trim();
    const passIngresada = document.getElementById("login-password").value.trim();

    // Credenciales únicas para todo el equipo
    const correoUnico = "profesores@183.com";
    const passwordUnica = "gimnasio2026";

    if (emailIngresado === correoUnico && passIngresada === passwordUnica) {
        localStorage.setItem('sesionGimnasio', 'activa'); // Guardamos el sello
        document.getElementById("pantalla-login").style.display = "none";
        document.getElementById("pantalla-perfiles").style.display = "flex";
    } else {
        // EN VEZ DEL ALERT FEO, ENCENDEMOS NUESTRA VENTANA HERMOSA
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
    document.getElementById("login-email").value = "";
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

// ESTA FUNCIÓN REEMPLAZA A TU "darDeBajaProfe" VIEJA
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

        const mapaActividades = {
            "Musculación": "imagenes/alumno1.jpeg",
            "Tela": "imagenes/alumno2.jpeg",
            "Funcional": "imagenes/alumno3.jpeg",
            "Calistenia": "imagenes/alumno4.jpeg",
            "Readaptación": "imagenes/alumno5.jpeg"
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
            }

            const actividadReal = alumno.actividad || "Musculación";
            const objetivoReal = alumno.objetivo || "Sin definir";
            const imagenAsignada = mapaActividades[actividadReal] || "imagenes/alumno1.jpeg";
            const textoBotonPago = estaAlDia ? "Pagado" : "Marcar Pago";
            const claseBotonPago = estaAlDia ? "btn-pago-realizado" : "btn-pago-pendiente";

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
                        <div class="info-detalle"><div class="punto-naranja"></div> ${actividadReal}</div>
                        <div class="info-detalle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 5px;"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            ${objetivoReal}
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
                condicion_medica: condicion
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

// --- ABRIR PANTALLA INDIVIDUAL DEL ALUMNO (DISEÑO NUEVO) ---
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

        let fechaFormateada = "Sin definir";
        if (alumno.vencimiento_cuota) {
            const partes = alumno.vencimiento_cuota.split('-'); // Cortamos el 2026-08-15
            fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`; // Lo armamos como 15/08/2026
        }
        document.getElementById("detalle-vencimiento").innerText = fechaFormateada;

        document.getElementById("selector-dia-rutina").value = "Lunes";
        cambiarDiaRutina(); 

    } catch (error) {
        console.error("Error al abrir la ficha:", error.message);
        mostrarAlerta("No se pudo cargar la información del alumno.");
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

// Guardar el ejercicio en la base de datos
async function guardarEjercicioEnBD() {
    const zona = document.getElementById("select-ej-zona").value; 
    const nombre = document.getElementById("select-ej-nombre").value.trim();
    const series = document.getElementById("input-ej-series").value.trim();
    const descanso = document.getElementById("input-ej-descanso").value.trim();
    const dia = document.getElementById("selector-dia-rutina").value;
   // const zona = document.getElementById("input-zona-cuerpo").value.trim();

    if (!zona || !nombre) { mostrarAlerta("Faltan datos","Ponele una zona y un nombre al ejercicio"); return; }

    try {
        if (ejercicioEditandoId) {
            // MODO EDITAR: Actualizamos el registro existente
            const { error } = await clienteSupabase
                .from('rutinas_planificadas')
                .update({ 
                    ejercicio_nombre: nombre, 
                    series_reps: series, 
                    descanso: descanso,
                    zona_muscular: zona
                })
                .eq('id', ejercicioEditandoId);
            if (error) throw error;
        } else {
            // MODO INSERTAR: Creamos un registro nuevo
            const { error } = await clienteSupabase
                .from('rutinas_planificadas')
                .insert([{
                    alumno_id: alumnoSeleccionadoId,
                    dia_semana: dia,
                    zona_muscular: zona,
                    ejercicio_nombre: nombre,
                    series_reps: series,
                    descanso: descanso,
                    orden:999
                }]);
            if (error) throw error;
        }
        
        ejercicioEditandoId = null; // Reseteamos la variable tras guardar
        cerrarModalEjercicio();
        cambiarDiaRutina();
    } catch (error) {
        mostrarAlerta("Error al guardar: " + error.message);
    }
}

// Cargar los ejercicios desde Supabase cuando cambias de día
async function cambiarDiaRutina() {
    const diaSeleccionado = document.getElementById("selector-dia-rutina").value;
    const contenedorEjercicios = document.getElementById("lista-ejercicios-detalle");
    const inputZona = document.getElementById("input-zona-cuerpo");
    
    contenedorEjercicios.innerHTML = "<p style='text-align:center; color:#888; font-size:0.9rem; margin-top: 20px;'>Cargando rutina...</p>";

    try {
        // AGREGAMOS LOS .order PARA QUE RESPETE LA POSICIÓN GUARDADA
        const { data: ejercicios, error } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('*')
            .eq('alumno_id', alumnoSeleccionadoId)
            .eq('dia_semana', diaSeleccionado)
            .order('orden', { ascending: true, nullsFirst: false }) 
            .order('id', { ascending: true }); // Si no tienen orden, usa el ID

        if (error) throw error;
        contenedorEjercicios.innerHTML = ""; 

        if (ejercicios.length === 0) {
            contenedorEjercicios.innerHTML = `<p style="text-align:center; color:#888; font-size: 0.9rem; margin-top: 30px;">No hay ejercicios. Tocá el + para añadir uno.</p>`;
            inputZona.value = ""; 
            return;
        }

        inputZona.value = ejercicios[0].zona_muscular || ""; 
        
        ejercicios.forEach(ej => {

            const nombreEj = ej.ejercicio_nombre;
            
            // 2. Por defecto, ponemos tu cuadrito gris
            let htmlImagen = `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
            
            // 3. BUsqueda
            if (nombreEj === "Vuelos laterales") {
                htmlImagen = `<div class="img-animada anim-vuelos-laterales"></div>`;
            } 
            else if (nombreEj === "Press de banca") {
                htmlImagen = `<div class="img-animada anim-press-banca"></div>`;
            }
            else if (nombreEj === "Back squat") {
                htmlImagen = `<div class="img-animada anim-back-squat"></div>`;
            }
            else if (nombreEj === "Peso muerto") {
                htmlImagen = `<div class="img-animada anim-peso-muerto"></div>`;
            }

            // 4. Dibujamos la tarjeta... (el resto de tu código queda igual)
            contenedorEjercicios.innerHTML += `
                <div class="card-ejercicio" data-id="${ej.id}">
                    <svg class="icono-arrastre" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                    
                    ${htmlImagen}
                    
                    <div class="info-ejercicio">
                        <h4>${ej.ejercicio_nombre}</h4>
                        <div class="detalle-ejercicio">
                            <div class="punto-ama"></div>
                            <span>${ej.series_reps || "-"}</span>
                            <span class="separador">|</span>
                            <span>Descanso ${ej.descanso || "-"}</span>
                        </div>
                    </div>
                    <div class="acciones-ejercicio">
                        <svg onclick="abrirModalEditar('${ej.id}', '${ej.zona_muscular}', '${ej.ejercicio_nombre}', '${ej.series_reps}', '${ej.descanso}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        <svg onclick="borrarEjercicio('${ej.id}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>
            `;
        });

        // --- ACTIVAMOS LA MAGIA DE ARRASTRE ---
        new Sortable(contenedorEjercicios, {
            // AL BORRAR LA PALABRA "HANDLE", TODA LA TARJETA SE VUELVE ARRASTRABLE
            animation: 200,
            
            // TRUCO PARA CELULARES: Mantener presionado un instante para mover
            delay: 200, 
            delayOnTouchOnly: true, 
            
            // PROTECCIÓN: Evita que se mueva la tarjeta si intentas tocar 
            // el lápiz de editar o el tachito de basura
            filter: ".acciones-ejercicio svg", 
            preventOnFilter: false,

            chosenClass: "tarjeta-arrastrando",     // Le pone el contorno a la que tocás
            ghostClass: "tarjeta-indicador-caida",  // Dibuja el hueco amarillo donde va a caer

            onEnd: function () {
                guardarOrdenEjercicios();
            }
        });

    } catch (error) {
        console.error("Error cargando rutina:", error);
    }
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
                cambiarDiaRutina();
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
    
    const btnBorrarAlumnos = document.getElementById("btn-activar-borrado");

    if (modoBorradoActivo) {
        // ACTIVAMOS MODO BORRADO
        btnBorrarAlumnos.innerText = "No borrar";
        btnBorrarAlumnos.classList.remove("peligro"); // Quitamos rojo
        btnBorrarAlumnos.classList.add("gris");       // Ponemos gris
    } else {
        // VOLVEMOS AL ESTADO NORMAL
        btnBorrarAlumnos.innerText = "Eliminar alumnos";
        btnBorrarAlumnos.classList.remove("gris");    // Quitamos gris
        btnBorrarAlumnos.classList.add("peligro");    // Ponemos rojo
    }

    cargarAlumnos();
}


// --- EDICIÓN DE ALUMNO ---
function abrirModalEditarAlumno() {
    if (!alumnoDataActual) return; 
    
    document.getElementById("modal-editar-alumno").style.display = "flex";
    
    document.getElementById("input-edit-alumno-nombre").value = `${alumnoDataActual.nombre} ${alumnoDataActual.apellido}`;
    document.getElementById("select-edit-alumno-actividad").value = alumnoDataActual.actividad || "Musculación";
    document.getElementById("input-edit-alumno-objetivo").value = alumnoDataActual.objetivo || "";
    document.getElementById("input-edit-alumno-edad").value = alumnoDataActual.edad || "";
    document.getElementById("input-edit-alumno-condicion").value = alumnoDataActual.condicion_medica || "";
    
    // NUEVO: Cargamos la fecha actual en el calendario
    document.getElementById("input-edit-alumno-vencimiento").value = alumnoDataActual.vencimiento_cuota || "";
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
                vencimiento_cuota: vencimiento || null // NUEVO: Guardamos la fecha
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

// --- 11. SISTEMA DE PACKS / RUTINAS PREDEFINIDAS ---
let packActivoId = null;
let packActivoEjercicios = []; // Array en memoria para editar rápido

// Helper maestro para las animaciones (Se usa en Packs y en el Alumno)
function obtenerAnimacionHTML(nombreEj) {
    if (!nombreEj) return `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
    const n = nombreEj.trim();
    if (n === "Vuelos laterales") return `<div class="img-animada anim-vuelos-laterales"></div>`;
    if (n === "Press de banca") return `<div class="img-animada anim-press-banca"></div>`;
    if (n === "Back squat" || n === "Sentadilla") return `<div class="img-animada anim-back-squat"></div>`;
    if (n === "Peso muerto") return `<div class="img-animada anim-peso-muerto"></div>`;
    return `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
}

// 1. Navegación hacia la pantalla
// 1. Navegación hacia la pantalla
function abrirPantallaRutinas() {
    // Apagamos TODAS las demás
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    document.getElementById("pantalla-perfiles").style.display = "none"; // Apagamos el inicio por las dudas
    
    // Encendemos Rutinas
    document.getElementById("pantalla-rutinas").style.display = "block";
    cargarPacks();
}

// 2. Cargar los packs creados
// 2. Cargar los packs creados
async function cargarPacks() {
    const contenedor = document.getElementById("lista-packs");
    contenedor.innerHTML = "<p style='text-align:center;'>Cargando tus rutinas...</p>";
    try {
        const { data: packs, error } = await clienteSupabase.from('packs_rutinas').select('*').eq('profesor_id', profeActivoId);
        if (error) throw error;
        
        contenedor.innerHTML = "";
        if (packs.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.9rem; margin-top:20px;'>No tenés rutinas guardadas.</p>";
            return;
        }
        
        packs.forEach(pack => {
            const ejCount = pack.ejercicios ? pack.ejercicios.length : 0;
            // Magia: extraemos el primer ejercicio para mostrar su animación en la tarjeta principal
            const primerEj = (ejCount > 0) ? pack.ejercicios[0].nombre : null;
            const htmlAnim = obtenerAnimacionHTML(primerEj);

            contenedor.innerHTML += `
                <div class="card-alumno" onclick="abrirDetallePack('${pack.id}', '${pack.nombre}')" style="cursor:pointer;">
                    ${htmlAnim}
                    <div class="info-central" style="margin-left: 15px;">
                        <h3 style="font-size:1.05rem;">${pack.nombre}</h3>
                        <div class="info-detalle" style="font-size:0.8rem;">${ejCount} ejercicios configurados</div>
                    </div>
                    
                    <!-- NUEVO: Botón de borrar que empuja a la derecha -->
                    <div class="acciones-ejercicio" style="margin-left: auto; padding-left: 10px;">
                        <svg onclick="event.stopPropagation(); borrarPack('${pack.id}')" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" width="20">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                </div>
            `;
        });
    } catch (e) { contenedor.innerHTML = "<p>Error al cargar.</p>"; }
}

// Función para eliminar un pack de la base de datos
function borrarPack(idPack) {
    pedirConfirmacion(
        "Eliminar Rutina",
        "¿Seguro que querés eliminar esta rutina predefinida? Esta acción no se puede deshacer.",
        "Eliminar",
        async () => {
            try {
                // Le damos la orden a Supabase de borrar el pack con ese ID
                const { error } = await clienteSupabase
                    .from('packs_rutinas')
                    .delete()
                    .eq('id', idPack);
                    
                if (error) throw error;
                
                // Si todo sale bien, recargamos la pantalla para que desaparezca
                cargarPacks(); 
                
            } catch (error) { 
                mostrarAlerta("Error", "No se pudo borrar la rutina: " + error.message); 
            }
        }
    );
}

// 3. Crear Pack (Creación básica)
function abrirModalCrearPack() {
    document.getElementById("input-pack-nombre").value = "";
    document.getElementById("modal-crear-pack").style.display = "flex";
}
function cerrarModalCrearPack() { document.getElementById("modal-crear-pack").style.display = "none"; }

async function guardarPackNuevo() {
    const nombre = document.getElementById("input-pack-nombre").value.trim();
    if(!nombre) { mostrarAlerta("Faltan datos","Poné un nombre para el pack."); return; }
    
    try {
        const { error } = await clienteSupabase.from('packs_rutinas').insert([{
            profesor_id: profeActivoId,
            nombre: nombre,
            ejercicios: [] // Arranca con un array JSON vacío
        }]);
        if (error) throw error;
        cerrarModalCrearPack();
        cargarPacks();
    } catch (e) { mostrarAlerta("Error: " + e.message); }
}

// 4. Detalle del Pack (Para meterle ejercicios adentro)
async function abrirDetallePack(id, nombre) {
    packActivoId = id;
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "block";
    document.getElementById("detalle-nombre-pack").innerText = nombre;
    cargarEjerciciosDePack();
}

async function cargarEjerciciosDePack() {
    const contenedor = document.getElementById("lista-ejercicios-pack");
    contenedor.innerHTML = "<p style='text-align:center;'>Cargando...</p>";
    try {
        const { data, error } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', packActivoId).single();
        if (error) throw error;
        
        packActivoEjercicios = data.ejercicios || [];
        contenedor.innerHTML = "";
        
        if (packActivoEjercicios.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.9rem; margin-top:30px;'>Pack vacío. Añadí ejercicios con el +</p>";
            return;
        }
        
        packActivoEjercicios.forEach((ej, index) => {
            const htmlAnim = obtenerAnimacionHTML(ej.nombre);
            contenedor.innerHTML += `
                <div class="card-ejercicio">
                    ${htmlAnim}
                    <div class="info-ejercicio">
                        <h4>${ej.nombre} <span style="font-size:0.7rem; color:#888; font-weight: normal;">(${ej.zona})</span></h4>
                        <div class="detalle-ejercicio">
                            <div class="punto-ama"></div>
                            <span>${ej.series}</span> <span class="separador">|</span> <span>Descanso ${ej.descanso}</span>
                        </div>
                    </div>
                    <div class="acciones-ejercicio">
                        <svg onclick="borrarEjercicioDePack(${index})" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
}

// 5. Agregar ejercicios al JSON
function abrirModalEjercicioPack() {
    document.getElementById("select-pack-ej-zona").value = "";
    document.getElementById("select-pack-ej-nombre").innerHTML = '<option value="">Primero elegí una zona...</option>';
    document.getElementById("input-pack-ej-series").value = "";
    document.getElementById("input-pack-ej-descanso").value = "";
    document.getElementById("modal-ejercicio-pack").style.display = "flex";
}
function actualizarListaEjerciciosPack() {
    const zonaSeleccionada = document.getElementById("select-pack-ej-zona").value;
    const selectNombre = document.getElementById("select-pack-ej-nombre");
    selectNombre.innerHTML = "";
    if (!zonaSeleccionada) { selectNombre.innerHTML = '<option value="">Primero elegí una zona...</option>'; return; }
    catalogoEjercicios[zonaSeleccionada].forEach(ej => { selectNombre.innerHTML += `<option value="${ej}">${ej}</option>`; });
}
async function guardarEjercicioEnPack() {
    const zona = document.getElementById("select-pack-ej-zona").value;
    const nombre = document.getElementById("select-pack-ej-nombre").value;
    const series = document.getElementById("input-pack-ej-series").value.trim();
    const descanso = document.getElementById("input-pack-ej-descanso").value.trim();
    if(!zona || !nombre) { mostrarAlerta("Faltan datos","Elegí zona y ejercicio"); return; }
    
    packActivoEjercicios.push({ zona, nombre, series, descanso });
    try {
        const { error } = await clienteSupabase.from('packs_rutinas').update({ ejercicios: packActivoEjercicios }).eq('id', packActivoId);
        if (error) throw error;
        document.getElementById("modal-ejercicio-pack").style.display = "none";
        cargarEjerciciosDePack();
    } catch(e) { mostrarAlerta("Error: " + e.message); }
}
async function borrarEjercicioDePack(index) {
    packActivoEjercicios.splice(index, 1);
    try {
        await clienteSupabase.from('packs_rutinas').update({ ejercicios: packActivoEjercicios }).eq('id', packActivoId);
        cargarEjerciciosDePack();
    } catch(e) { mostrarAlerta("Error: " + e.message); }
}

// --- 6. IMPORTAR PACK AL ALUMNO (LA MEJOR PARTE) ---
async function abrirModalSeleccionarPack() {
    document.getElementById("modal-ejercicio").style.display = "none"; // Cierra el modal manual
    document.getElementById("modal-seleccionar-pack").style.display = "flex";
    
    const contenedor = document.getElementById("lista-seleccionar-packs");
    contenedor.innerHTML = "<p style='text-align:center;'>Cargando rutinas...</p>";
    
    try {
        const { data: packs, error } = await clienteSupabase.from('packs_rutinas').select('*').eq('profesor_id', profeActivoId);
        if (error) throw error;
        
        contenedor.innerHTML = "";
        if (packs.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>No hay rutinas creadas.</p>";
            return;
        }
        
        packs.forEach(pack => {
            const ejCount = pack.ejercicios ? pack.ejercicios.length : 0;
            const primerEj = (ejCount > 0) ? pack.ejercicios[0].nombre : null;
            const htmlAnim = obtenerAnimacionHTML(primerEj);

            contenedor.innerHTML += `
                <div class="card-alumno" onclick="importarPackAAlumno('${pack.id}')" style="cursor:pointer; background: rgb(255, 255, 255); border: 1px solid rgba(255, 255, 255, 0.8); margin-bottom: 10px; backdrop-filter: blur(4px);">
                    ${htmlAnim}
                    <div class="info-central" style="margin-left: 15px;">
                        
                        <h3 style="font-size: 1.3rem; color: #111; text-shadow: none; margin-bottom: 2px;">${pack.nombre}</h3>
                        
                        <div class="info-detalle" style="font-size: 1rem; color: #444444;">${ejCount} ejercicios adentro</div>
                    </div>
                    <div class="acciones-ejercicio">
                        <span style="color:#f39c12; font-weight:800; font-size: 1rem;">Elegir</span>
                    </div>
                </div>
            `;
        });
    } catch(e) { contenedor.innerHTML = "Error al cargar"; }
}

async function importarPackAAlumno(packId) {
    document.getElementById("lista-seleccionar-packs").innerHTML = "<p style='text-align:center;'>Descargando rutina para el alumno...</p>";
    try {
        // 1. Extraemos los ejercicios del pack
        const { data: pack, error: err1 } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', packId).single();
        if (err1) throw err1;
        
        const ejs = pack.ejercicios || [];
        if(ejs.length === 0) { mostrarAlerta("Error","Este pack está vacío."); document.getElementById("modal-seleccionar-pack").style.display = "none"; return; }

        // 2. Armamos la caja de datos masiva para insertar en el alumno
        const diaSelec = document.getElementById("selector-dia-rutina").value;
        const insertData = ejs.map((ej, index) => ({
            alumno_id: alumnoSeleccionadoId,
            dia_semana: diaSelec,
            zona_muscular: ej.zona,
            ejercicio_nombre: ej.nombre,
            series_reps: ej.series,
            descanso: ej.descanso,
            orden: 999 + index // Esto asegura que caigan todos juntitos al final de la lista
        }));

        // 3. Supabase inyecta todos los ejercicios en 1 solo segundo
        const { error: err2 } = await clienteSupabase.from('rutinas_planificadas').insert(insertData);
        if (err2) throw err2;

        document.getElementById("modal-seleccionar-pack").style.display = "none";
        cambiarDiaRutina(); // Refrescamos la pantalla para ver la magia
        
    } catch(e) { mostrarAlerta("Error al importar: " + e.message); }
}

// --- SISTEMA DE TEMA CLARO/OSCURO PARA EL LOGIN ---
function alternarTemaLogin() {
    const pantallaLogin = document.getElementById('pantalla-login');
    const iconoSol = document.getElementById('icono-sol');
    const iconoLuna = document.getElementById('icono-luna');

    // Agrega o saca la clase "modo-claro" como si fuera un interruptor
    pantallaLogin.classList.toggle('modo-claro');

    // Cambia el dibujito del botón
    if (pantallaLogin.classList.contains('modo-claro')) {
        iconoSol.style.display = 'none'; // Esconde el sol
        iconoLuna.style.display = 'block'; // Muestra la luna
    } else {
        iconoSol.style.display = 'block'; // Muestra el sol
        iconoLuna.style.display = 'none'; // Esconde la luna
    }
}

// --- SISTEMA DE TEMA CLARO/OSCURO PARA PERFILES ---
function alternarTemaPerfiles() {
    const pantallaPerfiles = document.getElementById('pantalla-perfiles');
    const iconoSol = document.getElementById('icono-sol-perfiles');
    const iconoLuna = document.getElementById('icono-luna-perfiles');

    pantallaPerfiles.classList.toggle('modo-claro');

    if (pantallaPerfiles.classList.contains('modo-claro')) {
        iconoSol.style.display = 'none'; 
        iconoLuna.style.display = 'block'; 
    } else {
        iconoSol.style.display = 'block'; 
        iconoLuna.style.display = 'none'; 
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