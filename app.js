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

let esAdminActual = false; // <--- NUEVA MEMORIA

// --- SÚPER DICCIONARIO DE EJERCICIOS (3 CATEGORÍAS PRINCIPALES) ---
const catalogoGlobal = {
    "MOVILIDAD": {
        "Cuello y Cervical": ["Flexión-extensión de cuello", "Rotación de cuello", "Inclinación cervical", "Círculos cervicales"],
        "Hombros y Escápulas": ["Círculos de hombros", "Círculos de brazos", "Aperturas de brazos", "Rotación de hombro", "Pasadas de hombro", "Elevación escapular", "Movilidad escapular", "Ángeles en pared", "Rotación en cuadrupedia", "Dislocaciones con banda"],
        "Columna y Tronco": ["Gato-vaca", "Rotación torácica", "Enhebrar la aguja", "Rotación de tronco", "Flexión lateral", "Extensión torácica", "Libro abierto", "Ondulación de columna"],
        "Muñecas y Codos": ["Círculos de muñeca", "Flexión-extensión de muñeca", "Balanceo de muñecas", "Muñecas invertidas", "Rotación de antebrazo", "Movilidad de codos"],
        "Cadera": ["Círculos de cadera", "Apertura de cadera", "CARs de cadera", "Balanceo frontal", "Balanceo lateral", "Cadera 90/90", "Rotación 90/90", "Estocada de cadera", "Estocada con rotación", "Sentadilla profunda", "Balanceo de aductores", "Movilidad de rana"],
        "Rodillas y Tobillos": ["Flexión de rodilla", "Círculos de rodilla", "Rodilla al frente", "Movilidad de rodilla", "Rotación de tibia", "Círculos de tobillo", "Flexión de tobillo", "Rodilla a la pared", "Punta-talón", "Movilidad de dedos", "Movilidad del pie", "Tobillos en sentadilla"],
        "Global": ["World's Greatest Stretch", "Inchworm", "Spiderman con rotación", "Sentadilla y alcance", "Estocadas multidireccionales", "Oso a cobra", "Perro alternado", "Plancha a sentadilla"]
    },
    "ENTRADA EN CALOR": {
        "Activación y Cardio": ["Marcha", "Trote suave", "Jumping jacks", "Pasos laterales", "Talones al glúteo", "Rodillas arriba", "Skaters", "Saltos suaves", "Salto de soga", "Trote continuo", "Caminata rápida", "Trote frontal", "Trote hacia atrás", "Shuffle lateral", "Carioca", "Caminata en puntas", "Caminata sobre talones", "Progresiones", "Zigzag", "Shuttle run"],
        "Piernas": ["Sentadilla libre", "Sentadilla con pausa", "Sentadilla y alcance", "Estocadas alternadas", "Estocadas atrás", "Estocadas laterales", "Estocadas caminando", "Buenos días", "Bisagra de cadera", "Puente de glúteos", "Puente alternado", "Elevación de gemelos", "Step-up", "Pulsos de sentadilla", "Monster walk", "Pasos laterales con banda"],
        "Tren Superior": ["Flexiones con rodillas", "Flexiones", "Flexiones en pared", "Flexiones escapulares", "Toques de hombro", "Inchworm", "Remo con banda", "Pull-aparts", "Rotación externa", "Press con banda", "Jalón con banda", "Elevaciones frontales", "Golpes al aire", "Círculos de brazos"],
        "Core": ["Plancha", "Plancha lateral", "Plancha alta", "Toques de hombro", "Escaladores lentos", "Mountain climbers", "Dead bug", "Bird dog", "Hollow hold suave", "Hollow hold", "Rodillas al pecho", "Bear hold", "Caminata de oso", "Bear crawl", "Plancha a perro", "Rotaciones de tronco"],
        "Dinámicos y Coordinación": ["Pies rápidos", "Dentro-fuera lateral", "Dentro-fuera frontal", "Saltos laterales", "Saltos frontal-trasero", "Toque lateral", "Skipping bajo", "Skipping alto", "Saltos alternados", "Cambios de dirección", "Escalera básica", "Dos apoyos", "Escalera lateral", "Ejercicio de reacción", "Inchworm con flexión", "Spiderman", "Estocada y rodilla", "Burpee caminando", "Plancha a sentadilla", "Sentadilla con salto", "Burpee básico", "Oso lateral", "Estocada con rotación", "Squat thrust"],
        "Con Elementos": ["Remo suave", "Bicicleta suave", "Caminata en cinta", "Trote en cinta", "Air bike", "Soga", "Battle rope suave", "Empuje de trineo liviano", "Arrastre de trineo", "Step-up bajo", "Swing liviano", "Peso muerto técnico", "Remo técnico", "Press técnico"]
    },
    "ENTRENAMIENTO": {
        "Piernas y Glúteos": ["Sentadilla", "Back squat", "Front squat", "Goblet squat", "Sentadilla sumo", "Búlgara", "Pistol squat", "Estocada frontal", "Estocada atrás", "Estocada lateral", "Estocadas caminando", "Prensa", "Hack squat", "Extensión de piernas", "Curl femoral", "Curl femoral sentado", "Peso muerto", "Peso muerto rumano", "Buenos días", "Hip thrust", "Puente de glúteos", "Patada de glúteo", "Abducción de cadera", "Aducción de cadera", "Step-up", "Gemelos de pie", "Gemelos sentado", "Thruster", "Clean", "Snatch"],
        "Pecho": ["Press banca", "Press con mancuernas", "Press inclinado", "Press inclinado mancuernas", "Press declinado", "Press de pecho", "Flexiones", "Flexiones asistidas", "Flexiones inclinadas", "Flexiones declinadas", "Aperturas", "Peck deck", "Cruce de poleas", "Fondos de pecho", "Press con banda"],
        "Espalda": ["Dominadas", "Dominadas asistidas", "Chin-ups", "Jalón al pecho", "Jalón cerrado", "Remo con barra", "Remo con mancuerna", "Remo en polea", "Remo en máquina", "Remo apoyado", "Remo invertido", "Pullover en polea", "Pullover", "Peso muerto", "Peso muerto rumano", "Hiperextensiones", "Buenos días", "Face pull", "Clean", "Snatch", "Muscle-up"],
        "Hombros": ["Press militar", "Press de hombros", "Press Arnold", "Press en máquina", "Elevaciones laterales", "Elevaciones frontales", "Pájaros con mancuernas", "Posteriores en máquina", "Face pull", "Remo al mentón", "Encogimientos", "Parada de manos", "Flexión vertical", "Pike push-up"],
        "Brazos": ["Curl con barra", "Curl barra EZ", "Curl con mancuernas", "Curl alternado", "Curl martillo", "Curl concentrado", "Curl predicador", "Curl inclinado", "Curl en polea", "Curl con banda", "Chin-ups", "Triceps en polea", "Tríceps con cuerda", "Press francés", "Extensión sobre cabeza", "Patada de tríceps", "Press cerrado", "Fondos", "Fondos en banco", "Flexiones diamante", "Tríceps unilateral"],
        "Core y Abdomen": ["Plancha", "Plancha lateral", "Toques de hombro", "Crunch", "Crunch en máquina", "Elevación de piernas", "Rodillas colgado", "Piernas colgado", "Rueda abdominal", "Dead bug", "Bird dog", "Hollow hold", "Arch hold", "Superman", "Mountain climbers", "Giro ruso", "Crunch bicicleta", "Pallof press", "Leñador en polea", "L-sit", "Front lever", "Back lever"],
        "Cuerpo Completo / Cardio": ["Burpee", "Burpee con salto", "Thruster", "Thruster mancuernas", "Devil press", "Clean", "Power clean", "Clean and jerk", "Snatch", "Snatch mancuerna", "Peso muerto y remo", "Kettlebell swing", "Swing ruso", "Swing americano", "Turkish get-up", "Sentadilla y press", "Man maker", "Caminata de oso", "Caminata del granjero", "Arrastre de trineo", "Empuje de trineo", "Correr", "Sprint", "Bicicleta", "Air bike", "Remo", "Ski erg", "Soga", "Box jump", "Battle ropes", "Shuttle run", "Saltos laterales"]
    }
};



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

// --- SISTEMA DE ALERTA VISUAL INTELIGENTE ---
function mostrarAlerta(titulo, mensaje) {
    document.getElementById("titulo-alerta").innerText = titulo;
    document.getElementById("texto-alerta").innerText = mensaje;
    
    // El cerebro: Detecta palabras clave en el título para saber si es un éxito
    const tituloMin = titulo.toLowerCase();
    const esExito = tituloMin.includes('éxito') || 
                    tituloMin.includes('exitosa') || 
                    tituloMin.includes('registrada') || 
                    tituloMin.includes('copiada') || 
                    tituloMin.includes('limpio');

    const contenedorIcono = document.getElementById("contenedor-icono-alerta");
    const tituloDOM = document.getElementById("titulo-alerta");

    if (esExito) {
        // Ícono SVG de Pulgar Arriba (Verde) con animación
        contenedorIcono.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48" class="anim-exito"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
        tituloDOM.style.color = "#2ecc71"; // Título verde
    } else {
        // Ícono SVG de Peligro / Warning (Naranja) con animación
        contenedorIcono.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2.5" width="48" height="48" class="anim-alerta"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        tituloDOM.style.color = "#ffffff"; // Título blanco
    }

    document.getElementById("modal-alerta").style.display = "flex";
}

function cerrarModalAlerta() {
    document.getElementById("modal-alerta").style.display = "none";
}

// --- 2. ARRANQUE DE LA APP, MEMORIA Y NAVEGACIÓN INICIAL ---
document.addEventListener("DOMContentLoaded", () => {
    
    // ---> NUEVO: Bloquear el gestor de contraseñas de Google en toda la app
    // EXCEPTO en los inputs que tienen un "list" (para que el desplegable de ejercicios funcione en el celu)
    document.querySelectorAll('input:not([list])').forEach(input => {
        input.setAttribute('autocomplete', 'nope'); 
        input.setAttribute('data-lpignore', 'true'); 
    });

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
function iniciarSesion() {
    const passIngresada = document.getElementById("login-password").value.trim();
    const checkboxTyC = document.getElementById("checkbox-tyc").checked; // <-- Capturamos la casilla

    // Si no aceptó los términos, lo frenamos en seco
    if (!checkboxTyC) {
        mostrarAlerta("Atención", "Debés aceptar los Términos y Condiciones para poder ingresar.");
        return;
    }

    // Contraseña única para todo el equipo
    const passwordUnica = "gimnasio2026";

    if (passIngresada === passwordUnica) {
        localStorage.setItem('sesionGimnasio', 'activa'); 
        document.getElementById("pantalla-login").style.display = "none";
        document.getElementById("pantalla-perfiles").style.display = "flex";
    } else {
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

let fotoProfeElegida = "imagenes/perfil1.png"; // Guarda el texto (Ruta o URL)
let archivoFotoProfeBlob = null; // NUEVO: Guarda el archivo físico comprimido listo para subir

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

function procesarFotoSubida(event) {
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
            
            // LA MAGIA DE LA OPTIMIZACIÓN: Convertimos el canvas a un archivo JPG miniatura puro (Blob)
            canvas.toBlob((blob) => {
                archivoFotoProfeBlob = blob; // Guardamos el archivo físico en la memoria
                
                // Creamos una URL temporal solo para que el profe se vea en la pantallita antes de guardar
                fotoProfeElegida = URL.createObjectURL(blob); 
                document.getElementById("img-preview-profe").src = fotoProfeElegida;
                document.getElementById("select-profe-avatar").value = ""; 
            }, "image/jpeg", 0.7);
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
        let urlFinalParaBaseDeDatos = fotoProfeElegida; // Por defecto, es el avatar que eligió

        // Si el usuario subió una foto real (tenemos el archivo atrapado en la memoria)
        if (archivoFotoProfeBlob) {
            // 1. Le inventamos un nombre único para que no se pisen
            const nombreArchivo = `profe_${Date.now()}.jpg`;
            
            // 2. Subimos la foto al Storage de Supabase (Al cajón 'avatares')
            const { error: errStorage } = await clienteSupabase.storage
                .from('avatares')
                .upload(nombreArchivo, archivoFotoProfeBlob, { contentType: 'image/jpeg' });

            if (errStorage) throw errStorage;

            // 3. Le pedimos a Supabase el Link público de la foto que acabamos de subir
            const { data: publicUrlData } = clienteSupabase.storage
                .from('avatares')
                .getPublicUrl(nombreArchivo);
                
            urlFinalParaBaseDeDatos = publicUrlData.publicUrl; // Guardamos el link limpio!
        }

        // 4. Guardamos todo en la base de datos (con la URL súper liviana)
        const { error } = await clienteSupabase.from('profesores').insert([{ 
            nombre: nombre, 
            apellido: apellido, 
            foto_url: urlFinalParaBaseDeDatos 
        }]); 
        
        if (error) throw error;

        // Limpiamos la memoria para el próximo profe
        archivoFotoProfeBlob = null; 
        
        cerrarModalProfe();
        cargarProfesores(); 

    } catch (error) {
        mostrarAlerta("Error al guardar el profesor", error.message);
    }
}

// --- 5. NAVEGACIÓN Y DASHBOARD DE ALUMNOS ---
function entrarPerfil(id, nombre, apellido) {
    profeActivoId = id; 
    document.getElementById("nombre-profe-activo").innerText = "Profe " + nombre;
    
    // MAGIA: Unimos el nombre y apellido para buscar, pasándolo a minúsculas
    const nombreCompleto = (nombre + " " + apellido).toLowerCase();
    
    // Le damos superpoderes de Admin a Moye y a German Varelli
    esAdminActual = (
        nombreCompleto.includes('moye') || 
        nombreCompleto.includes('german varelli') || 
        nombreCompleto.includes('germán varelli') // Por si acaso lo guardaron con tilde
    );

    // Mostramos u ocultamos los botones del menú inferior para admins
    document.querySelectorAll('.nav-admin-only').forEach(btn => {
        btn.style.display = esAdminActual ? 'flex' : 'none';
    });

    // Apagamos TODAS las pantallas
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    document.getElementById("pantalla-admin").style.display = "none"; // Apagamos el informe por si acaso
    
    // Encendemos solo el Dashboard (Alumnos)
    document.getElementById("pantalla-dashboard").style.display = "block";
    
    cargarAlumnos(); 
    cargarChips();
    actualizarNavActivo('alumnos');
}
// ==========================================
// FUNCIONES EXCLUSIVAS DEL PANEL DE ADMIN (ESTILO EXCEL)
// ==========================================

let datosAdminActualParaExcel = null; // Memoria para armar el Excel rápido

function abrirPantallaInforme() {
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";

    // ---> LA MAGIA: Cambiamos "block" por "flex" para que no se aplaste
    document.getElementById("pantalla-admin").style.display = "flex"; 
    
    cambiarVistaAdmin('actual');
    cargarPanelAdmin();
    actualizarNavActivo('informe');
}

function cambiarVistaAdmin(vista) {
    const track = document.getElementById("track-admin");
    const btnActual = document.getElementById("tab-admin-actual");
    const btnHistorial = document.getElementById("tab-admin-historial");

    if (vista === 'actual') {
        track.style.transform = 'translateX(0%)';
        btnActual.classList.add("activo");
        btnHistorial.classList.remove("activo");
    } else {
        track.style.transform = 'translateX(-50%)';
        btnHistorial.classList.add("activo");
        btnActual.classList.remove("activo");
        dibujarHistorialAdmin(); 
    }
}

async function cargarPanelAdmin() {
    const contenedor = document.getElementById("contenedor-admin-columnas");
    
    // Configuración general del contenedor (Sin scroll visible)
    contenedor.style.display = "block"; 
    contenedor.style.overflowY = "auto";
    contenedor.style.scrollbarWidth = "none"; 
    contenedor.style.msOverflowStyle = "none"; 
    
    contenedor.innerHTML = `
        <style>
            #contenedor-admin-columnas::-webkit-scrollbar {
                display: none;
            }
        </style>
        <p style='text-align:center; width: 100%; padding-top: 20px; color: #888;'>Cargando base de datos...</p>
    `;
    
    try {
        const { data: profes } = await clienteSupabase.from('profesores').select('*');
        const { data: alumnos } = await clienteSupabase.from('alumnos').select('*');
        
        let htmlFilasProfes = "";
        
        if (!profes || profes.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; width: 100%; color:#888;'>No hay profesores registrados.</p>";
            return;
        }

        let granTotalGym = 0;
        datosAdminActualParaExcel = { profesores: [], granTotal: 0 }; 

        profes.forEach(profe => {
            const alumnosProfe = alumnos.filter(a => a.profesor_id === profe.id);
            let totalProfeGym = 0;
            let conteoCat = {};
            let htmlFilasAlumnos = "";

            alumnosProfe.forEach(a => {
                let cuota = a.cuota || 0;
                let gymCut = cuota * 0.30; 
                totalProfeGym += gymCut;
                granTotalGym += gymCut;

                let act = a.actividad || "Sin Categoría";
                conteoCat[act] = (conteoCat[act] || 0) + 1;

                // (Adentro del profes.forEach)
                htmlFilasAlumnos += `
                    <tr>
                        <td style="padding: 10px 15px; font-weight: 400; font-size: 0.85rem;">${a.nombre} ${a.apellido}</td>
                        <td style="padding: 10px 15px; font-size: 0.75rem;">${act}</td>
                        <td style="padding: 10px 15px; text-align: right; font-weight: 500; font-size: 0.75rem;">$${gymCut.toLocaleString('es-AR')}</td>
                    </tr>
                `;
            });

            let strCategorias = Object.entries(conteoCat).map(([c, v]) => `${c}: ${v}`).join(' | ');

            datosAdminActualParaExcel.profesores.push({
                nombre: `${profe.nombre} ${profe.apellido}`, alumnos: alumnosProfe,
                totalGym: totalProfeGym, categorias: strCategorias
            });

            // TARJETA DEL PROFESOR (LIMPIA DE COLORES FORZADOS)
            htmlFilasProfes += `
                <div class="tarjeta-admin-profe">
                    <div class="admin-profe-header" onclick="toggleAcordeonAdmin('tabla-profe-${profe.id}', 'flecha-profe-${profe.id}')">
                        <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                            <svg id="flecha-profe-${profe.id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" style="transition: transform 0.3s; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            <div style="display: flex; flex-direction: column; min-width: 0;">
                                <strong style="font-size: 1rem; letter-spacing: 0.3px;">${profe.nombre} ${profe.apellido}</strong>
                                <span>${alumnosProfe.length} alumnos | ${strCategorias || "Sin alumnos"}</span>
                            </div>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex-shrink: 0; padding-left: 10px;">
                            <strong class="precio" style="font-size: 1.1rem; font-weight: 600;">$${totalProfeGym.toLocaleString('es-AR')}</strong>
                            <span class="btn-eliminar-admin" onclick="event.stopPropagation(); darDeBajaProfe('${profe.id}')">Eliminar</span>
                        </div>
                    </div>
                    <div id="tabla-profe-${profe.id}" class="admin-profe-tabla" style="display: none;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">
                                    <th style="padding: 10px 15px; font-weight: 600;">Alumno</th>
                                    <th style="padding: 10px 15px; font-weight: 600;">Act.</th>
                                    <th style="padding: 10px 15px; font-weight: 600; text-align: right;">30% Gym</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${htmlFilasAlumnos || "<tr><td colspan='3' style='text-align:center; padding: 15px; font-size: 0.8rem;'>Sin alumnos asignados</td></tr>"}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
        
        datosAdminActualParaExcel.granTotal = granTotalGym;
        contenedor.innerHTML = htmlFilasProfes;
        
        // CAJA DE RECAUDACIÓN TOTAL (LIMPIA)
        const cajaGranTotal = document.getElementById("monto-gran-total").parentElement;
        cajaGranTotal.removeAttribute("style"); // Borramos toda la basura inline vieja
        cajaGranTotal.className = "caja-gran-total-dinamica"; 
        
        const tituloTotal = cajaGranTotal.querySelector("h3");
        tituloTotal.removeAttribute("style"); 
        
        const monto = document.getElementById("monto-gran-total");
        monto.removeAttribute("style");
        monto.style.fontSize = "2.2rem";
        monto.style.color = "#2ecc71"; // Este sí lo dejamos fijo en verde
        monto.style.fontWeight = "bold";
        monto.style.marginTop = "4px";
        monto.innerText = `$${granTotalGym.toLocaleString('es-AR')}`;
        
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = "<p style='color:red; text-align:center;'>Error al cargar el panel.</p>";
    }
}

// ---> NUEVA FUNCIÓN: EL MOTOR DEL ACORDEÓN <---
// (Pegá esto justo debajo de cargarPanelAdmin)
function toggleAcordeonAdmin(idTabla, idFlecha) {
    const tabla = document.getElementById(idTabla);
    const flecha = document.getElementById(idFlecha);
    
    // Si está oculto, lo mostramos y giramos la flechita
    if (tabla.style.display === "none" || tabla.style.display === "") {
        tabla.style.display = "block";
        flecha.style.transform = "rotate(180deg)"; 
    } else {
        // Si está abierto, lo ocultamos y la flecha vuelve a apuntar abajo
        tabla.style.display = "none";
        flecha.style.transform = "rotate(0deg)"; 
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
                cargarPanelAdmin(); // Refresca la pantalla del panel admin
                cargarProfesores(); // Refresca la grilla principal de perfiles
                
            } catch (e) { mostrarAlerta("Error al dar de baja: " + e.message); }
        }
    );
}

// Lógica de Descarga Global
function descargarExcelAdmin() {
    if (!datosAdminActualParaExcel || datosAdminActualParaExcel.profesores.length === 0) {
        mostrarAlerta("Sin datos", "No hay información para generar el reporte.");
        return;
    }

    const fechaEmision = new Date().toLocaleDateString('es-AR');
    const horaEmision = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    let matrizExcel = [];

    matrizExcel.push(["INFORME GLOBAL DE PROFESORES Y GIMNASIO"]);
    matrizExcel.push(["Fecha de emisión:", fechaEmision, "Hora:", horaEmision]);
    matrizExcel.push([]);
    matrizExcel.push(["RECAUDACIÓN TOTAL DEL GIMNASIO (30%):", `$${datosAdminActualParaExcel.granTotal.toLocaleString('es-AR')}`]);
    matrizExcel.push([]);

    datosAdminActualParaExcel.profesores.forEach(profe => {
        matrizExcel.push(["PROFESOR:", profe.nombre]);
        matrizExcel.push(["Total Alumnos:", profe.alumnos.length, "Recaudación Gym (30%):", `$${profe.totalGym.toLocaleString('es-AR')}`]);
        matrizExcel.push(["Desglose por Categoría:", profe.categorias]);
        matrizExcel.push([]); // Espacio
        
        // Cabeceras de los alumnos de ESTE profe
        matrizExcel.push(["Nombre Alumno", "Categoría", "Cuota Total", "Aporte al Gym (30%)"]);
        
        profe.alumnos.forEach(a => {
            let cuota = a.cuota || 0;
            let gymCut = cuota * 0.30;
            matrizExcel.push([
                `${a.nombre} ${a.apellido}`,
                a.actividad || "Sin Categoría",
                `$${cuota.toLocaleString('es-AR')}`,
                `$${gymCut.toLocaleString('es-AR')}`
            ]);
        });
        
        matrizExcel.push([]); // Separador visual entre profes
        matrizExcel.push([]);
    });

    const libroExcel = XLSX.utils.book_new();
    const hojaExcel = XLSX.utils.aoa_to_sheet(matrizExcel);
    
    hojaExcel['!cols'] = [{wch: 30}, {wch: 20}, {wch: 25}, {wch: 25}];

    XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Resumen Global");

    const fechaArchivo = fechaEmision.replace(/\//g, '-');
    XLSX.writeFile(libroExcel, `Informe_GLOBAL_Gimnasio_${fechaArchivo}.xlsx`);

    guardarHistorialAdmin(fechaArchivo, JSON.stringify(matrizExcel));
    mostrarAlerta("¡Descarga Exitosa!", "La planilla global del gimnasio se descargó correctamente.");
}

function guardarHistorialAdmin(fechaString, contenidoDelExcel) {
    const llaveMemoria = 'historial_admin_global';
    let historial = JSON.parse(localStorage.getItem(llaveMemoria)) || [];
    
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    historial.unshift({ fecha: fechaString, hora: hora, datos: contenidoDelExcel }); 
    
    if (historial.length > 15) historial.pop(); 
    localStorage.setItem(llaveMemoria, JSON.stringify(historial));
}

function dibujarHistorialAdmin() {
    const contenedor = document.getElementById("lista-historial-admin");
    const llaveMemoria = 'historial_admin_global';
    let historial = JSON.parse(localStorage.getItem(llaveMemoria)) || [];

    contenedor.innerHTML = "";

    if (historial.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; color:#555; font-size: 0.9rem; margin-top:20px;'>Aún no descargaste ninguna planilla global.</p>";
        return;
    }

    historial.forEach((registro, index) => {
        contenedor.innerHTML += `
            <div class="tarjeta-historial" style="display: flex; flex-direction: column; align-items: stretch;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p>Planilla Global (Gimnasio)</p>
                        <span>Descargado el ${registro.fecha} a las ${registro.hora}</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" width="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                
                <button class="btn-re-descarga" onclick="volverADescargarExcelAdmin(${index})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Volver a descargar
                </button>
            </div>
        `;
    });
}

function volverADescargarExcelAdmin(index) {
    const llaveMemoria = 'historial_admin_global';
    let historial = JSON.parse(localStorage.getItem(llaveMemoria)) || [];
    const registro = historial[index];
    
    if (!registro || !registro.datos) return;

    try {
        const matrizRecuperada = JSON.parse(registro.datos);
        const libroExcel = XLSX.utils.book_new();
        const hojaExcel = XLSX.utils.aoa_to_sheet(matrizRecuperada);
        hojaExcel['!cols'] = [{wch: 30}, {wch: 20}, {wch: 25}, {wch: 25}];
        
        XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Copia Global");
        XLSX.writeFile(libroExcel, `Copia_GLOBAL_${registro.fecha}.xlsx`);
        mostrarAlerta("¡Re-descarga Exitosa!", "El informe global se descargó nuevamente.");
    } catch (e) {
        console.error(e);
        mostrarAlerta("Error", "No se pudo recuperar el archivo.");
    }
}

function volverAPerfiles() {
    profeActivoId = null;
    esAdminActual = false; // Le sacamos la llave maestra al salir
    
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    document.getElementById("pantalla-admin").style.display = "none"; 
    
    document.getElementById("pantalla-perfiles").style.display = "flex";
}

function volverAlDashboard() {
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-rutinas").style.display = "none";
    document.getElementById("pantalla-detalle-pack").style.display = "none";
    document.getElementById("pantalla-perfiles").style.display = "none";
    document.getElementById("pantalla-admin").style.display = "none"; 
    
    document.getElementById("pantalla-dashboard").style.display = "block";
    cargarAlumnos();
    actualizarNavActivo('alumnos');
}

async function cargarAlumnos() {
    const contenedor = document.getElementById("lista-alumnos");
    
    // CORRECCIÓN 1: Solo mostramos "Cargando" si la lista está completamente vacía (la primera vez).
    // Si ya hay alumnos, no borramos la pantalla para evitar que el celular pegue un salto.
    if (contenedor.innerHTML.trim() === "") {
        contenedor.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>Cargando alumnos...</p>";
    }

    try {
        const { data: alumnos, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('profesor_id', profeActivoId)
            .order('nombre', { ascending: true })
            .order('apellido', { ascending: true }); // Orden alfabético perfecto

        if (error) throw error;

        document.getElementById("contador-alumnos").innerText = `${alumnos.length} alumnos asignados`;

        let htmlFinal = ""; // Memoria temporal para armar las tarjetas súper rápido

        if (alumnos.length === 0) {
            htmlFinal = `<p style="color: #a0a0a0; text-align: center; margin-top: 20px;">Aún no tenés alumnos asignados.</p>`;
        } else {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); 

            let nuevasNotif = 0;
            let listaNotificaciones = [];
            let leidasGuardadas = JSON.parse(localStorage.getItem('notifLeidas_' + profeActivoId)) || [];

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
                let estaAlDia = false;

                if (alumno.vencimiento_cuota) {
                    const fechaVencimiento = new Date(alumno.vencimiento_cuota + 'T00:00:00'); 
                    const diferenciaTiempo = fechaVencimiento - hoy;
                    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

                    if (diferenciaDias < 0) {
                        claseBadge = "badge-vencida"; textoBadge = "Vencida";
                    } else if (diferenciaDias <= 5) {
                        claseBadge = "badge-vencepronto"; textoBadge = "Vence pronto";
                    } else {
                        claseBadge = "badge-aldia"; textoBadge = "Al día"; estaAlDia = true;
                    }

                    if (diferenciaDias <= 5) {
                        let tipoNotif = diferenciaDias < 0 ? 'vencida' : 'pronto';
                        let idNotif = `${alumno.id}_${alumno.vencimiento_cuota}_${tipoNotif}`; 
                        let esNueva = !leidasGuardadas.includes(idNotif);
                        let fechaFormateada = alumno.vencimiento_cuota.split('-').reverse().join('/');

                        listaNotificaciones.push({
                            idNotif: idNotif, alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                            tipo: tipoNotif, dias: Math.abs(diferenciaDias),
                            esNueva: esNueva, fechaFormateada: fechaFormateada
                        });

                        if (esNueva) nuevasNotif++;
                    }
                }

                const actividadReal = alumno.actividad || "Musculación";
                const imagenAsignada = mapaActividades[actividadReal] || "imagenes/MUSCULACION.jpg";
                const textoBotonPago = estaAlDia ? "Pagado" : "Marcar Pago";
                const claseBotonPago = estaAlDia ? "btn-pago-realizado" : "btn-pago-pendiente";
                const cuotaTexto = alumno.cuota ? alumno.cuota.toLocaleString('es-AR') : "-";

                let htmlBotonBorrar = "";
                if (modoBorradoActivo) {
                    htmlBotonBorrar = `<button class="btn-accion-admin peligro" onclick="event.stopPropagation(); borrarAlumno('${alumno.id}')" style="margin-bottom: 5px;">Borrar</button>`;
                }

                let textoUltimaSesion = "Sin asistencias";
                let colorUltimaSesion = "#777";
                let iconoUltimaSesion = `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`; 

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
                        iconoUltimaSesion = `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`; 
                    }
                }

                let htmlBotonAsistencia = "";
                if (estaPresenteHoy) {
                    htmlBotonAsistencia = `<button class="btn-asistencia-presente" onclick="event.stopPropagation(); deshacerAsistencia('${alumno.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>Presente</button>`;
                } else {
                    htmlBotonAsistencia = `<button class="btn-asistencia-pendiente" onclick="event.stopPropagation(); abrirModalCheckin('${alumno.id}')">Asistencia</button>`;
                }

                const modalidad = alumno.tipo_rutina || "Con rutina";
                let etiquetaModalidad = modalidad === "Libre" 
                    ? `<span class="badge-libre" style="margin-left: 0; font-family: inherit; font-size: 0.7rem;">ALUMNO LIBRE</span>` 
                    : `<span style="font-family: inherit; font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">CON RUTINA</span>`;

                htmlFinal += `
                    <div class="card-alumno" onclick="abrirGrillaAlumno('${alumno.id}')">
                        <img src="${imagenAsignada}" class="avatar-actividad" alt="Actividad">
                        <div class="info-central">
                            <h3>${alumno.nombre} ${alumno.apellido}</h3>
                            <div class="info-detalle" style="margin-bottom: 6px;">${etiquetaModalidad}</div>
                            <div class="info-detalle"><svg viewBox="0 0 24 24" fill="#f39c12" width="14" height="14" style="margin-right: 6px; flex-shrink: 0;"><circle cx="12" cy="12" r="7.5"></circle></svg>${actividadReal}</div>
                            <div class="info-detalle" style="margin-top: 2px;"><svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" width="14" height="14" style="margin-right: 6px; flex-shrink: 0;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg><span style="color: #f39c12; font-weight: 600;">${cuotaTexto}</span></div>
                            <div class="info-detalle" style="margin-top: 2px;"><svg viewBox="0 0 24 24" fill="none" stroke="${colorUltimaSesion}" stroke-width="2" width="14" height="14" style="margin-right: 6px; flex-shrink: 0;">${iconoUltimaSesion}</svg><span style="color: ${colorUltimaSesion}; font-weight: 500;">${textoUltimaSesion}</span></div>
                        </div>
                        <div class="estado-derecha">
                            <span class="badge-estado ${claseBadge}">${textoBadge}</span>
                            ${htmlBotonBorrar}
                            <div class="contenedor-accion-pago">
                                <button class="btn-pago-status ${claseBotonPago}" onclick="event.stopPropagation(); modificarCicloPago('${alumno.id}', '${alumno.vencimiento_cuota}', ${estaAlDia})">${textoBotonPago}</button>
                                ${htmlBotonAsistencia}
                            </div>
                        </div>
                    </div>
                `;
            });

            window.notificacionesGlobales = listaNotificaciones; 
            const badge = document.getElementById("badge-notificaciones");
            if (badge) {
                badge.style.display = nuevasNotif > 0 ? "block" : "none";
            }
        }

        // PISAMOS todo el HTML de golpe (Cero parpadeo, muchísimo más rápido)
        contenedor.innerHTML = htmlFinal;

        // CORRECCIÓN 2: Re-aplicamos los filtros para que los alumnos no "salten" si tenías alguno seleccionado
        reaplicarFiltrosSilenciosamente();

    } catch (error) {
        console.error("Error al cargar alumnos:", error.message);
        contenedor.innerHTML = "<p>Error al cargar alumnos.</p>";
    }
}

// CORRECCIÓN 3: El cerebro que recuerda qué botones o busquedas tenías activas
function reaplicarFiltrosSilenciosamente() {
    const inputBuscador = document.getElementById("buscador-alumnos");
    const textoBusqueda = inputBuscador ? inputBuscador.value.toLowerCase() : "";

    let actividadesPrendidas = [];
    let estadosPrendidos = [];
    let modalidadesPrendidas = [];
    let chipTodosActivo = false;

    const todosLosChips = document.querySelectorAll("#contenedor-chips-dinamicos .chip");
    todosLosChips.forEach((chip, index) => {
        if (index === 0) return; // Saltamos el lápiz
        if (index === 1 && chip.classList.contains("activo")) chipTodosActivo = true;

        if (chip.classList.contains("activo") && index > 1) {
            const txt = chip.innerText.trim();
            if (txt === 'Cuota al día') estadosPrendidos.push('al día');
            else if (txt === 'Vencida') estadosPrendidos.push('vencida');
            else if (txt === 'Con rutina') modalidadesPrendidas.push('con rutina');
            else if (txt === 'Libre') modalidadesPrendidas.push('alumno libre'); 
            else actividadesPrendidas.push(txt.toLowerCase());
        }
    });

    const tarjetas = document.querySelectorAll("#lista-alumnos .card-alumno");
    
    tarjetas.forEach(tarjeta => {
        const contenido = tarjeta.innerText.toLowerCase();
        const nombre = tarjeta.querySelector("h3").innerText.toLowerCase();
        
        const pasaBuscador = nombre.includes(textoBusqueda);
        
        let pasaChips = chipTodosActivo;
        if (!chipTodosActivo) {
            const pasaAct = actividadesPrendidas.length === 0 || actividadesPrendidas.some(act => contenido.includes(act));
            const pasaEst = estadosPrendidos.length === 0 || estadosPrendidos.some(est => contenido.includes(est));
            const pasaMod = modalidadesPrendidas.length === 0 || modalidadesPrendidas.some(mod => contenido.includes(mod));
            pasaChips = pasaAct && pasaEst && pasaMod;
        }

        if (pasaBuscador && pasaChips) {
            tarjeta.style.display = "flex";
        } else {
            tarjeta.style.display = "none";
        }
    });
}

// --- LÓGICA PARA CREAR ALUMNO CON VENTANA EMERGENTE ---

// --- LÓGICA DE ALUMNOS (A PRUEBA DE FALLOS) ---
function abrirModalAlumno() {
    document.getElementById("modal-alumno").style.display = "flex";
    
    const setValor = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor;
    };

    setValor("input-alumno-nombre", "");
    setValor("input-alumno-dni", "");
    setValor("select-alumno-tipo", "Con rutina"); // <-- NUEVO
    setValor("select-alumno-actividad", "Musculación");
    setValor("input-alumno-objetivo", "");
    setValor("input-alumno-edad", "");
    setValor("input-alumno-condicion", "");
    setValor("input-alumno-cuota", "");

    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 1);
    setValor("input-alumno-vencimiento", fecha.toISOString().split('T')[0]);
}

async function guardarAlumnoEnBD() {
    const getValor = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const nombreCompleto = getValor("input-alumno-nombre");
    const dni = getValor("input-alumno-dni");
    
    const selectTipo = document.getElementById("select-alumno-tipo");
    const tipoRutina = selectTipo ? selectTipo.value : "Con rutina"; 

    const selectActividad = document.getElementById("select-alumno-actividad");
    const actividad = selectActividad ? selectActividad.value : "Musculación";
    
    let objetivo = getValor("input-alumno-objetivo");
    const edad = getValor("input-alumno-edad");
    let condicion = getValor("input-alumno-condicion");
    const cuota = getValor("input-alumno-cuota");
    let vencimientoCuota = getValor("input-alumno-vencimiento");

    if (!nombreCompleto) {
        mostrarAlerta("Faltan datos", "Por favor, ingresá el nombre y apellido del alumno.");
        return;
    }

    // ---> ESCUDO OFFLINE: Frena la función si no hay internet
    if (!navigator.onLine) {
        mostrarAlerta("Sin conexión", "No tenés internet. Conectate a una red para poder guardar al alumno nuevo.");
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
                dni: dni || null, 
                tipo_rutina: tipoRutina, 
                profesor_id: profeActivoId, 
                vencimiento_cuota: vencimientoCuota || null,
                actividad: actividad,
                objetivo: objetivo,
                edad: edad ? parseInt(edad) : null,
                condicion_medica: condicion,
                cuota: cuota ? parseInt(cuota.replace(/\./g, '')) : null
            }]); 

        if (error) throw error;
        
        cerrarModalAlumno();
        cargarAlumnos(); 
        mostrarAlerta("¡Guardado con Éxito!", "El alumno se registró correctamente.");
        
    } catch (error) {
        // Segundo escudo por si el internet se corta justo a la mitad del proceso
        if (error.message.includes("Failed to fetch")) {
            mostrarAlerta("Sin conexión", "Se cortó el internet intentando guardar. Revisá tu señal e intentá de nuevo.");
        } else {
            mostrarAlerta("Error", "Error al añadir alumno: " + error.message);
        }
    }
}

function abrirModalEditarAlumno() {
    if (!alumnoDataActual) return; 
    
    document.getElementById("modal-editar-alumno").style.display = "flex";
    
    const setValor = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.value = valor;
    };

    setValor("input-edit-alumno-nombre", `${alumnoDataActual.nombre} ${alumnoDataActual.apellido}`);
    setValor("input-edit-alumno-dni", alumnoDataActual.dni || "");
    setValor("select-edit-alumno-tipo", alumnoDataActual.tipo_rutina || "Con rutina"); // <-- NUEVO
    setValor("select-edit-alumno-actividad", alumnoDataActual.actividad || "Musculación");
    setValor("input-edit-alumno-objetivo", alumnoDataActual.objetivo || "");
    setValor("input-edit-alumno-edad", alumnoDataActual.edad || "");
    setValor("input-edit-alumno-condicion", alumnoDataActual.condicion_medica || "");
    setValor("input-edit-alumno-vencimiento", alumnoDataActual.vencimiento_cuota || "");
    setValor("input-edit-alumno-cuota", alumnoDataActual.cuota ? alumnoDataActual.cuota.toLocaleString('es-AR') : "");
}

async function guardarEdicionAlumnoEnBD() {
    const getValor = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const nombreCompleto = getValor("input-edit-alumno-nombre");
    const dni = getValor("input-edit-alumno-dni");
    
    const selectTipo = document.getElementById("select-edit-alumno-tipo");
    const tipoRutina = selectTipo ? selectTipo.value : "Con rutina"; 

    const selectActividad = document.getElementById("select-edit-alumno-actividad");
    const actividad = selectActividad ? selectActividad.value : "Musculación";
    
    const objetivo = getValor("input-edit-alumno-objetivo");
    const edad = getValor("input-edit-alumno-edad");
    const condicion = getValor("input-edit-alumno-condicion");
    const cuota = getValor("input-edit-alumno-cuota");
    const vencimiento = getValor("input-edit-alumno-vencimiento");

    if (!nombreCompleto) {
        mostrarAlerta("Faltan datos", "El nombre no puede estar vacío.");
        return;
    }

    // ---> ESCUDO OFFLINE: Frena la función si no hay internet
    if (!navigator.onLine) {
        mostrarAlerta("Sin conexión", "No tenés internet. Conectate a una red para guardar los cambios.");
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
                dni: dni || null,
                tipo_rutina: tipoRutina, 
                actividad: actividad,
                objetivo: objetivo,
                edad: edad ? parseInt(edad) : null,
                condicion_medica: condicion,
                vencimiento_cuota: vencimiento || null,
                cuota: cuota ? parseInt(cuota.replace(/\./g, '')) : null
            })
            .eq('id', alumnoSeleccionadoId);
        
        if (error) throw error;

        cerrarModalEditarAlumno();
        cargarAlumnos(); 
        abrirGrillaAlumno(alumnoSeleccionadoId); 
        mostrarAlerta("¡Edición Exitosa!", "Los datos del alumno se actualizaron correctamente.");

    } catch (error) { 
        if (error.message.includes("Failed to fetch")) {
            mostrarAlerta("Sin conexión", "Se cortó el internet intentando guardar. Revisá tu señal e intentá de nuevo.");
        } else {
            mostrarAlerta("Error al actualizar", error.message); 
        }
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

// --- 8. FILTROS POR CHIPS (BOTONES MÚLTIPLES E INTELIGENTES) ---
function filtrarPorChip(botonClickeado, textoFiltro) {
    const todosLosChips = Array.from(document.querySelectorAll("#contenedor-chips-dinamicos .chip"));
    
    // CORRECCIÓN MAGISTRAL: Separamos el lápiz del botón "Todos"
    const chipLapiz = todosLosChips[0]; // El índice 0 ahora es siempre el Lápiz
    const chipTodos = todosLosChips[1]; // El índice 1 es siempre "Todos"

    // 1. Lógica de prendido y apagado visual
    if (textoFiltro === 'Todos') {
        todosLosChips.forEach(chip => {
            // Le sacamos el estado "activo" a todos menos al lápiz (que nunca debe tenerlo)
            if (chip !== chipLapiz) chip.classList.remove("activo");
        });
        chipTodos.classList.add("activo");
    } else {
        chipTodos.classList.remove("activo");
        botonClickeado.classList.toggle("activo");

        // Si desmarcó todo, volvemos a prender "Todos" automáticamente
        const hayAlgunoPrendido = todosLosChips.some(c => c !== chipLapiz && c.classList.contains("activo"));
        if (!hayAlgunoPrendido) {
            chipTodos.classList.add("activo");
        }
    }

    // 2. Limpiamos la barra de búsqueda escrita por las dudas
    document.getElementById("buscador-alumnos").value = "";

    // 3. Recolectamos qué cosas están prendidas (Ignorando el lápiz y el botón Todos)
    let actividadesPrendidas = [];
    let estadosPrendidos = [];
    let modalidadesPrendidas = []; 

    todosLosChips.forEach(chip => {
        if (chip !== chipLapiz && chip !== chipTodos && chip.classList.contains("activo")) {
            const textoBoton = chip.innerText.trim();
            
            if (textoBoton === 'Cuota al día') {
                estadosPrendidos.push('al día');
            } else if (textoBoton === 'Vencida') {
                estadosPrendidos.push('vencida');
            } else if (textoBoton === 'Con rutina') {
                modalidadesPrendidas.push('con rutina');
            } else if (textoBoton === 'Libre') {
                modalidadesPrendidas.push('alumno libre'); 
            } else {
                actividadesPrendidas.push(textoBoton.toLowerCase());
            }
        }
    });

    // 4. Filtramos las tarjetas (Motor Lógico Inteligente)
    const tarjetas = document.querySelectorAll("#lista-alumnos .card-alumno");
    
    tarjetas.forEach(tarjeta => {
        if (chipTodos.classList.contains("activo")) {
            tarjeta.style.display = "flex";
            return;
        }

        const contenidoTarjeta = tarjeta.innerText.toLowerCase();

        const pasaActividad = actividadesPrendidas.length === 0 || actividadesPrendidas.some(act => contenidoTarjeta.includes(act));
        const pasaEstado = estadosPrendidos.length === 0 || estadosPrendidos.some(est => contenidoTarjeta.includes(est));
        const pasaModalidad = modalidadesPrendidas.length === 0 || modalidadesPrendidas.some(mod => contenidoTarjeta.includes(mod));

        if (pasaActividad && pasaEstado && pasaModalidad) {
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
    
    // NUEVO: Capturamos el día exacto en el que el profe apretó el botón
    const fechaHoy = estadoActivo ? new Date().toISOString().split('T')[0] : null;

    try {
        const { error } = await clienteSupabase.from('alumnos').update({ 
            vencimiento_cuota: nuevaFecha, 
            activo: estadoActivo,
            fecha_ultimo_pago: fechaHoy // <-- Guardamos la fecha del clic en la base de datos
        }).eq('id', alumnoId);
        
        if (error) throw error;
        cargarAlumnos();
    } catch (error) { 
        mostrarAlerta("Error al actualizar pago: " + error.message); 
    }
}

// --- 10. LÓGICA DE DÍAS Y RUTINAS (CON SUPABASE) ---

function abrirModalEjercicio() {
    document.getElementById("modal-ejercicio").style.display = "flex";
    let catActual = "ENTRENAMIENTO"; 
    if (categoriaSeleccionada) {
        const cat = categoriaSeleccionada.toUpperCase();
        if (cat === "MOVILIDAD" || cat === "ENTRADA EN CALOR") catActual = cat;
    }
    const selectZona = document.getElementById("select-ej-zona");
    selectZona.innerHTML = '<option value="">Seleccioná una zona / tipo...</option>';
    const zonasDeEstaCategoria = Object.keys(catalogoGlobal[catActual]);
    zonasDeEstaCategoria.forEach(zona => {
        selectZona.innerHTML += `<option value="${zona}">${zona}</option>`;
    });

    document.getElementById("input-ej-nombre").value = "";
    document.getElementById("input-ej-descanso").value = "";
    document.getElementById("input-ej-subbloque").value = ""; // Blanqueamos el sub-bloque
    
    const contenedorSeries = document.getElementById('contenedor-filas-series');
    if (contenedorSeries) {
        contenedorSeries.innerHTML = `
            <div class="fila-serie">
                <span class="numero-serie">1</span>
                <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
                <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
                <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
                <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    }
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

function abrirModalEditar(id, zona, nombre, seriesRepsJson, fuerza, descanso, subBloque) {
    ejercicioEditandoId = id; 
    document.getElementById("modal-ejercicio").style.display = "flex";
    let catActual = "ENTRENAMIENTO"; 
    if (categoriaSeleccionada) {
        const cat = categoriaSeleccionada.toUpperCase();
        if (cat === "MOVILIDAD" || cat === "ENTRADA EN CALOR") catActual = cat;
    }
    const selectZona = document.getElementById("select-ej-zona");
    selectZona.innerHTML = '<option value="">Seleccioná una zona / tipo...</option>';
    Object.keys(catalogoGlobal[catActual]).forEach(z => {
        selectZona.innerHTML += `<option value="${z}">${z}</option>`;
    });

    document.getElementById("select-ej-zona").value = zona || "";
    document.getElementById("input-ej-nombre").value = nombre || "";
    document.getElementById("input-ej-descanso").value = descanso !== 'undefined' && descanso !== 'null' ? descanso : "";
    document.getElementById("input-ej-subbloque").value = subBloque || "";

    const contenedorSeries = document.getElementById('contenedor-filas-series');
    if (contenedorSeries) {
        contenedorSeries.innerHTML = ""; 
        let arraySeries = [];
        try {
            if (seriesRepsJson && typeof seriesRepsJson === 'string' && seriesRepsJson.startsWith('[')) {
                arraySeries = JSON.parse(seriesRepsJson);
            }
        } catch (e) {}

        if (arraySeries.length > 0) {
            arraySeries.forEach((s, index) => {
                contenedorSeries.innerHTML += `
                    <div class="fila-serie">
                        <span class="numero-serie">${index + 1}</span>
                        <input type="number" class="input-serie-fuerza input-modal" value="${s.fuerza || ''}" placeholder="% RM">
                        <input type="number" class="input-serie-reps input-modal" value="${s.reps || ''}" placeholder="Reps">
                        <input type="number" class="input-serie-rir input-modal" value="${s.rir || ''}" placeholder="RIR">
                        <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            });
        } else {
            contenedorSeries.innerHTML = `
                <div class="fila-serie">
                    <span class="numero-serie">1</span>
                    <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
                    <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
                    <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
                    <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
        }
    }
}

async function abrirModalEditarPorId(idEjercicio) {
    try {
        // Buscamos el ejercicio fresco y limpio de la base de datos
        const { data: ej, error } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('*')
            .eq('id', idEjercicio)
            .single();

        if (error) throw error;
        if (!ej) return;

        // Llamamos a nuestra función de edición pasando los datos de forma segura
        abrirModalEditar(ej.id, ej.zona_muscular, ej.ejercicio_nombre, ej.series_reps, ej.fuerza, ej.descanso, ej.sub_bloque);

    } catch (e) {
        console.error("Error al abrir para editar:", e);
        mostrarAlerta("Error", "No se pudo cargar el ejercicio para editar.");
    }
}

// --- EDICIÓN DE PROFESOR ---

let fotoEditProfeElegida = ""; 
let archivoEditFotoProfeBlob = null; // NUEVA memoria temporal para la edición

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
            
            canvas.toBlob((blob) => {
                archivoEditFotoProfeBlob = blob; 
                fotoEditProfeElegida = URL.createObjectURL(blob); 
                document.getElementById("img-preview-edit-profe").src = fotoEditProfeElegida;
                document.getElementById("select-edit-profe-avatar").value = ""; 
            }, "image/jpeg", 0.7);
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
        let urlFinalParaBaseDeDatos = fotoEditProfeElegida;

        if (archivoEditFotoProfeBlob) {
            const nombreArchivo = `profe_edit_${Date.now()}.jpg`;
            
            const { error: errStorage } = await clienteSupabase.storage
                .from('avatares')
                .upload(nombreArchivo, archivoEditFotoProfeBlob, { contentType: 'image/jpeg' });

            if (errStorage) throw errStorage;

            const { data: publicUrlData } = clienteSupabase.storage
                .from('avatares')
                .getPublicUrl(nombreArchivo);
                
            urlFinalParaBaseDeDatos = publicUrlData.publicUrl;
        }

        const { error } = await clienteSupabase
            .from('profesores')
            .update({ 
                nombre: nuevoNombre, 
                apellido: nuevoApellido,
                foto_url: urlFinalParaBaseDeDatos 
            })
            .eq('id', profeActivoId);
        
        if (error) throw error;

        archivoEditFotoProfeBlob = null; // Limpiamos

        cerrarModalEditarProfe();
        document.getElementById("nombre-profe-activo").innerText = "Profe " + nuevoNombre;
        
        cargarProfesores(); 

    } catch (e) { 
        mostrarAlerta("Error al actualizar", e.message); 
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



function cerrarModalEditarAlumno() {
    document.getElementById("modal-editar-alumno").style.display = "none";
}


// --- GUARDAR EL ORDEN AL ARRASTRAR ---
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


// ==========================================
// SISTEMA GLOBAL DE VIBRACIÓN (FEEDBACK HÁPTICO)
// ==========================================
document.addEventListener('click', function(e) {
    if (!navigator.vibrate) return; 
    const elementoTocado = e.target.closest('button, .card-alumno, .tarjeta-perfil-moderna, .tarjeta-rol, .chip, svg[onclick]');
    if (elementoTocado) navigator.vibrate(15); 
});

const funcionAlertaOriginal = mostrarAlerta;
mostrarAlerta = function(titulo, mensaje) {
    if (navigator.vibrate) {
        const tituloMin = titulo.toLowerCase();
        const esExito = tituloMin.includes('éxito') || tituloMin.includes('exitosa') || tituloMin.includes('registrada') || tituloMin.includes('copiada') || tituloMin.includes('limpio');
        
        if (esExito) {
            // Vibración de éxito: Una sola vibración larga y satisfactoria
            navigator.vibrate(100); 
        } else {
            // Vibración de error: Tres cortitas de alerta
            navigator.vibrate([50, 50, 50]); 
        }
    }
    funcionAlertaOriginal(titulo, mensaje); 
};

// ==========================================
// SISTEMA DE RENDIMIENTO Y EVALUACIONES
// ==========================================
let graficoInstancia = null; 
let graficoRadarInstancia = null; // NUEVA MEMORIA PARA EL RADAR

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
    
    contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.85rem;'>Analizando datos del alumno...</p>";
    
    try {
        const fechaInicio = `${anio}-${mes}-01`;
        const ultimoDia = new Date(anio, mes, 0).getDate();
        const fechaFin = `${anio}-${mes}-${ultimoDia}`;

        // 1. Traemos las evaluaciones
        const { data: evaluaciones, error: errEval } = await clienteSupabase
            .from('evaluaciones_rendimiento')
            .select('*')
            .eq('alumno_id', alumnoSeleccionadoId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true });

        if (errEval) throw errEval;

        // 2. Traemos LA RUTINA DEL ALUMNO para armar el gráfico muscular
        const { data: rutina, error: errRut } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('zona_muscular, fuerza') /* ACÁ AGREGAMOS LA FUERZA */
            .eq('alumno_id', alumnoSeleccionadoId);

        if (errRut) throw errRut;

        // 3. Traemos el HISTORIAL REAL DE PESOS para el gráfico de evolución
        const { data: historialPeso, error: errHistorial } = await clienteSupabase
            .from('registro_ejercicios')
            .select('*')
            .eq('alumno_id', alumnoSeleccionadoId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true });

        if (errHistorial) throw errHistorial;

        // --- RENDERIZADO DE COMENTARIOS ---
        contenedor.innerHTML = "";
        if (evaluaciones.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888; font-size:0.85rem;'>No hay evaluaciones en este período.</p>";
        } else {
            evaluaciones.forEach(ev => {
                const fechaFormateada = ev.fecha.split('-').reverse().join('/'); 
                if (ev.tipo === 'alumno') {
                    contenedor.innerHTML += `
                        <div class="burbuja-alumno">
                            <strong style="color: #3498db; font-size:0.8rem;">Auto-reporte (${fechaFormateada}) - Esfuerzo: ${ev.calificacion}/10</strong>
                            <p style="font-size:0.85rem; color:#ddd; margin-top:4px;">"${ev.comentario}"</p>
                        </div>`;
                } else {
                    contenedor.innerHTML += `
                        <div class="burbuja-profe">
                            <strong style="color: #f39c12; font-size:0.8rem;">Profe (${fechaFormateada})</strong>
                            <p style="font-size:0.85rem; color:#ddd; margin-top:4px;">"${ev.comentario}"</p>
                        </div>`;
                }
            });
        }

        // --- CÁLCULO DE KPIs ---
        const evAlumno = evaluaciones.filter(e => e.tipo === 'alumno' && e.calificacion);
        
        // Calcular Esfuerzo Promedio
        if (evAlumno.length > 0) {
            const suma = evAlumno.reduce((acc, curr) => acc + parseInt(curr.calificacion), 0);
            const promedio = (suma / evAlumno.length).toFixed(1);
            document.getElementById("kpi-esfuerzo").innerHTML = `${promedio} <span style="font-size:0.9rem; color:#888;">/10</span>`;
            
            // Simular cumplimiento de asistencia basado en cantidad de reportes (ej: 12 reportes al mes = 100%)
            let porcentaje = Math.min(Math.round((evAlumno.length / 12) * 100), 100);
            document.getElementById("kpi-asistencia").innerText = `${porcentaje}%`;
            document.getElementById("kpi-barra-fill").style.width = `${porcentaje}%`;
        } else {
            document.getElementById("kpi-esfuerzo").innerHTML = `-- <span style="font-size:0.9rem; color:#888;">/10</span>`;
            document.getElementById("kpi-asistencia").innerText = `0%`;
            document.getElementById("kpi-barra-fill").style.width = `0%`;
        }

        // --- DIBUJAR LOS 2 GRÁFICOS ---
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
        const fechaArg = reg.fecha.split('-').reverse().slice(0,2).join('/');
        fechasSet.add(fechaArg);
        
        // Si viene nulo de la base de datos, usamos "General"
        let zonaGrafico = reg.zona_muscular || "General";
        
        if(!zonasMap[zonaGrafico]) zonasMap[zonaGrafico] = {};
        
        // Al ser porcentaje, no sumamos, pisamos con el promedio guardado ese día
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
            label: zona + ' (%)', // Texto con porcentaje
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
                    suggestedMax: 100, // Forzamos escala de 0 a 100%
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
    
    // Recopilamos el promedio de RM y RIR para cada músculo
    const statsZonas = {};
    
    if(rutina) {
        rutina.forEach(ej => {
            // Sacamos el filtro estricto de zona
            if (ej.series_reps) {
                let zonaAsignada = ej.zona_muscular || "General";

                try {
                    let series = JSON.parse(ej.series_reps);
                    if (Array.isArray(series)) {
                        series.forEach(s => {
                            let rm = parseFloat(s.fuerza);
                            let rir = parseFloat(s.rir);
                            
                            // Si tiene asignado al menos % RM, lo contamos
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
                } catch(e) {}
            }
        });
    }

    const labels = Object.keys(statsZonas);
    // Armamos la info matemática
    const dataRM = labels.map(zona => statsZonas[zona].cant > 0 ? Math.round(statsZonas[zona].rm / statsZonas[zona].cant) : 0);
    const dataRIR = labels.map(zona => statsZonas[zona].cant > 0 ? (statsZonas[zona].rir / statsZonas[zona].cant).toFixed(1) : 0);

    // Creamos el Gráfico de Barras Doble
    graficoRadarInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Intensidad (% RM)',
                    data: dataRM,
                    backgroundColor: 'rgba(52, 152, 219, 0.8)', // Azul
                    borderRadius: 4,
                    yAxisID: 'y' // Lo ata a la escala izquierda
                },
                {
                    label: 'RIR Promedio',
                    data: dataRIR,
                    backgroundColor: 'rgba(243, 156, 18, 0.8)', // Naranja
                    borderRadius: 4,
                    yAxisID: 'y1' // Lo ata a la escala derecha
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
    
    // CORRECCIÓN HORARIA: Usamos la hora exacta de tu dispositivo
    const tmpHoy = new Date();
    const fechaHoyStr = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;

    try {
        const { error } = await clienteSupabase.from('evaluaciones_rendimiento').insert([{
            alumno_id: alumnoSeleccionadoId,
            profesor_id: profeActivoId,
            tipo: 'profe',
            comentario: comentario,
            fecha: fechaHoyStr,
            calificacion: null // <-- BLINDAJE: Le avisamos a Supabase que el profe no pone puntaje numérico
        }]);
        
        if (error) throw error;
        
        document.getElementById("input-comentario-profe").value = "";
        
        // NUEVO: Feedback visual para que sepas que se guardó
        mostrarAlerta("¡Éxito!", "La evaluación se guardó correctamente."); 
        
        cargarRendimiento(); // Recarga la base de datos para mostrar tu comentario al instante
        
    } catch (e) {
        mostrarAlerta("Error", "No se pudo guardar la anotación: " + e.message);
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

        // ... (código anterior que ya tenías) ...
        
        let fechaFormateada = "Sin definir";
        if (alumno.vencimiento_cuota) {
            const partes = alumno.vencimiento_cuota.split('-'); // Cortamos el 2026-08-15
            fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`; // Lo armamos como 15/08/2026
        }
        document.getElementById("detalle-vencimiento").innerText = fechaFormateada;

        // ---> NUEVO: Formateamos la fecha a prueba de balas (adiós al NaN)
        let fechaAltaVisual = "Sin registro";
        
        // Agarramos el campo (leemos creado_en y por las dudas created_at)
        const fechaBase = alumno.creado_en || alumno.created_at; 
        
        if (fechaBase && fechaBase !== "null") {
            try {
                // Supabase devuelve un texto como "2026-07-16T18:45:35" o "2026-07-16"
                const soloFecha = fechaBase.split('T')[0]; // Nos quedamos solo con la fecha "2026-07-16"
                const partes = soloFecha.split('-'); // Cortamos los guiones: [2026, 07, 16]
                
                if (partes.length === 3) {
                    fechaAltaVisual = `${partes[2]}/${partes[1]}/${partes[0]}`; // Lo armamos a la argentina: DD/MM/YYYY
                }
            } catch(e) {
                console.error("Error al formatear fecha:", e);
            }
        }
        document.getElementById("detalle-fecha-alta").innerText = fechaAltaVisual;

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

async function guardarEdicionDias() {
    const nuevosDias = [
        document.getElementById("input-dia-1").value.trim() || "D1",
        document.getElementById("input-dia-2").value.trim() || "D2",
        document.getElementById("input-dia-3").value.trim() || "D3",
        document.getElementById("input-dia-4").value.trim() || "D4",
        document.getElementById("input-dia-5").value.trim() || "D5"
    ];

    // 1. Rescatamos los nombres VIEJOS antes de pisarlos
    let viejosDias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias && alumnoDataActual.nombres_dias.length === 5) {
        viejosDias = alumnoDataActual.nombres_dias;
    }

    // 2. Lo actualizamos en la memoria visual instantáneamente
    if (!alumnoDataActual) alumnoDataActual = {};
    alumnoDataActual.nombres_dias = nuevosDias;

    generarChipsRutina(); // Redibuja los botones al instante
    document.getElementById("modal-editar-dias").style.display = "none";

    try {
        // 3. Guardamos los nombres nuevos en la tabla del alumno en Supabase
        const { error } = await clienteSupabase
            .from('alumnos')
            .update({ nombres_dias: nuevosDias })
            .eq('id', alumnoSeleccionadoId);
        
        if (error) throw error;

        // 4. LA MAGIA: Mudamos todos los ejercicios de los días viejos a los días nuevos
        const promesasMudanza = [];
        for (let i = 0; i < 5; i++) {
            if (viejosDias[i] !== nuevosDias[i]) {
                // Si el nombre cambió, le avisamos a Supabase que mude las rutinas
                promesasMudanza.push(
                    clienteSupabase.from('rutinas_planificadas')
                        .update({ dia_semana: nuevosDias[i] })
                        .eq('alumno_id', alumnoSeleccionadoId)
                        .eq('dia_semana', viejosDias[i])
                );
            }
        }

        // 5. Si hubo cambios de nombre, disparamos las mudanzas todas juntas
        if (promesasMudanza.length > 0) {
            await Promise.all(promesasMudanza);
            
            // Actualizamos la vista de abajo para que los ejercicios reaparezcan al instante
            if (vistaSliderActual === 'ejercicios') {
                cargarEjerciciosCategoriaBD();
            } else if (vistaSliderActual === 'categorias') {
                dibujarCategoriasAlumno();
            }
        }

    } catch (e) {
        mostrarAlerta("Error", "Error al guardar los nuevos nombres de días en Supabase.");
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
            .eq('dia_semana', diaSeleccionado)
            .eq('semana', semanaActiva); // <--- NUEVO FILTRO

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
    contenedorEjercicios.innerHTML = "<p style='text-align:center; color:#888; margin-top: 20px;'>Cargando rutina...</p>";

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias) { dias = alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[diaActivo - 1]; 

    try {
        let query = clienteSupabase.from('rutinas_planificadas').select('*')
            .eq('alumno_id', alumnoSeleccionadoId).eq('dia_semana', diaSeleccionado).eq('semana', semanaActiva)
            .order('orden', { ascending: true, nullsFirst: false }).order('id', { ascending: true }); 

        if (categoriaSeleccionada.toUpperCase() === 'ENTRENAMIENTO') {
            query = query.or(`categoria.eq.${categoriaSeleccionada},categoria.is.null`);
        } else {
            query = query.eq('categoria', categoriaSeleccionada);
        }

        const { data: ejercicios, error } = await query;
        if (error) throw error;
        
        contenedorEjercicios.innerHTML = ""; 

        if (ejercicios.length === 0) {
            let htmlBotonCopiar = "";
            if (semanaActiva !== 1) {
                htmlBotonCopiar = `<button class="btn-guardar" onclick="clonarSemanaCompleta(1, ${semanaActiva})" style="width: 100%; margin-top: 15px; background-color: #3498db; color: white;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" style="vertical-align: middle; margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copiar toda la rutina de la Semana 1 acá</button>`;
            }
            contenedorEjercicios.innerHTML = `<p style="text-align:center; color:#888; font-size: 0.9rem; margin-top: 30px;">No hay ejercicios en esta semana.</p>${htmlBotonCopiar}`;
            return;
        }

        // 1. AGRUPAMOS POR SUB-BLOQUE
        const grupos = {};
        ejercicios.forEach(ej => {
            const nombreGrupo = ej.sub_bloque || "Sin agrupar";
            if (!grupos[nombreGrupo]) grupos[nombreGrupo] = [];
            grupos[nombreGrupo].push(ej);
        });

        let htmlFinal = "";

        // Función armadora de tarjetas
        const generarTarjeta = (ej) => `
            <div class="card-ejercicio" data-id="${ej.id}">
                <svg class="icono-arrastre" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                ${obtenerAnimacionHTML(ej.ejercicio_nombre)}
                <div class="info-ejercicio" style="min-width: 0;">
                    <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${ej.ejercicio_nombre}</h4>
                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                        <div style="display: flex; align-items: flex-start; gap: 6px; line-height: 1.3; font-size: 0.75rem;">
                            <div class="punto-ama" style="margin-top: 5px; flex-shrink: 0;"></div>
                            <span style="word-break: break-word;">${formatearResumenSeries(ej.series_reps)}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; opacity: 0.7; margin-left: 12px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>Descanso: ${ej.descanso || "-"}</span>
                        </div>
                    </div>
                </div>
                <div class="acciones-ejercicio">
                    <svg onclick="abrirModalEditarPorId('${ej.id}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>                        
                    <svg onclick="borrarEjercicio('${ej.id}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
            </div>`;

        // 2. RENDERIZAMOS PRIMERO LOS "SIN AGRUPAR" (Para que queden sueltos como siempre)
        if (grupos["Sin agrupar"]) {
            htmlFinal += `<div class="subbloque-contenedor" data-sub="Sin agrupar">`;
            grupos["Sin agrupar"].forEach(ej => htmlFinal += generarTarjeta(ej));
            htmlFinal += `</div>`;
            delete grupos["Sin agrupar"]; 
        }

        // 3. RENDERIZAMOS LOS BLOQUES
        for (const [nombreSub, ejsDelSub] of Object.entries(grupos)) {
            const idAcordeon = 'acordeon-' + nombreSub.replace(/[^a-zA-Z0-9]/g, '-');
            htmlFinal += `
                <div class="tarjeta-subbloque">
                    <div class="header-subbloque" onclick="toggleSubbloque('${idAcordeon}', this)">
                        <div style="display:flex; align-items:center; gap:8px; min-width: 0; flex: 1; margin-right: 10px;">
                            <svg class="flecha-subbloque" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" style="transform: rotate(180deg); transition: 0.3s; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            <h4 style="margin: 0; white-space: normal; overflow-wrap: anywhere; word-break: break-word; line-height: 1.2;">${nombreSub}</h4>
                        </div>
                        <span class="badge-subbloque" style="flex-shrink: 0;">${ejsDelSub.length} ej</span>
                    </div>
                    <div id="${idAcordeon}" class="cuerpo-subbloque subbloque-contenedor" data-sub="${nombreSub}" style="display: flex;">
            `;
            ejsDelSub.forEach(ej => htmlFinal += generarTarjeta(ej));
            htmlFinal += `</div></div>`;
        }

        contenedorEjercicios.innerHTML = htmlFinal;

        // 4. ACTIVAMOS EL MOTOR DE ARRASTRE MULTI-GRUPO
        document.querySelectorAll('.subbloque-contenedor').forEach(cont => {
            new Sortable(cont, {
                group: 'rutina-compartida', // ¡Permite arrastrar un ej adentro de otro bloque!
                animation: 200, delay: 200, delayOnTouchOnly: true, filter: ".acciones-ejercicio svg", preventOnFilter: false,
                chosenClass: "tarjeta-arrastrando", ghostClass: "tarjeta-indicador-caida",
                onEnd: function () { guardarOrdenYSubbloque(); } // Función nueva inteligente
            });
        });
    } catch (e) { console.error(e); }
}

async function guardarEjercicioEnBD() {
    const zona = document.getElementById("select-ej-zona").value; 
    const nombre = document.getElementById("input-ej-nombre").value.trim(); 
    const subBloque = document.getElementById("input-ej-subbloque").value.trim();
    if (!nombre) { mostrarAlerta("Faltan datos", "Por favor, ponele un nombre al ejercicio."); return; }

    let arraySeries = [];
    document.querySelectorAll('#contenedor-filas-series .fila-serie').forEach((fila, index) => {
        let fuerzaVal = fila.querySelector('.input-serie-fuerza').value || "0";
        let repsVal = fila.querySelector('.input-serie-reps').value || "0";
        let rirVal = fila.querySelector('.input-serie-rir').value || "0"; // Capturamos RIR
        arraySeries.push({ numero: index + 1, fuerza: fuerzaVal, reps: repsVal, rir: rirVal });
    });

    const seriesRepsTexto = JSON.stringify(arraySeries);
    const descansoTexto = document.getElementById("input-ej-descanso").value;

    let dias = ["D1", "D2", "D3", "D4", "D5"];
    if (alumnoDataActual && alumnoDataActual.nombres_dias) { dias = alumnoDataActual.nombres_dias; }
    const diaSeleccionado = dias[diaActivo - 1]; 

    try {
        if (ejercicioEditandoId) {
            await clienteSupabase.from('rutinas_planificadas').update({ 
                ejercicio_nombre: nombre, series_reps: seriesRepsTexto, descanso: descansoTexto, zona_muscular: zona || null, sub_bloque: subBloque || null
            }).eq('id', ejercicioEditandoId);
        } else {
            await clienteSupabase.from('rutinas_planificadas').insert([{
                alumno_id: alumnoSeleccionadoId, dia_semana: diaSeleccionado, semana: semanaActiva,
                categoria: categoriaSeleccionada, zona_muscular: zona || null, ejercicio_nombre: nombre, 
                series_reps: seriesRepsTexto, fuerza: null, descanso: descansoTexto, orden: 999, sub_bloque: subBloque || null
            }]);
        }
        ejercicioEditandoId = null; cerrarModalEjercicio(); cargarEjerciciosCategoriaBD();
    } catch (e) { mostrarAlerta("Error", e.message); }
}

async function guardarEjercicioEnPack() {
    const zona = document.getElementById("select-pack-ej-zona").value; 
    const nombre = document.getElementById("input-pack-ej-nombre").value.trim(); 
    
    if(!nombre) {
        mostrarAlerta("Faltan datos", "Por favor ingresá el nombre del ejercicio.");
        return;
    }

    let arraySeries = [];
    document.querySelectorAll('#contenedor-filas-series-pack .fila-serie').forEach((fila, index) => {
        let fuerzaVal = fila.querySelector('.input-serie-fuerza').value || "0";
        let repsVal = fila.querySelector('.input-serie-reps').value || "0";
        let rirVal = fila.querySelector('.input-serie-rir').value || "0";
        arraySeries.push({ numero: index + 1, fuerza: fuerzaVal, reps: repsVal, rir: rirVal });
    });
    
    const seriesTexto = JSON.stringify(arraySeries);
    const descanso = document.getElementById("input-pack-ej-descanso").value; 

    // Si abrimos con el lápiz, actualizamos. Si es nuevo, lo agregamos a la lista.
    if (ejercicioPackEditandoIndex !== null) {
        packActivoEjercicios[ejercicioPackEditandoIndex] = { zona: zona, nombre: nombre, series: seriesTexto, descanso: descanso };
    } else {
        packActivoEjercicios.push({ zona: zona, nombre: nombre, series: seriesTexto, descanso: descanso });
    }

    try { 
        await clienteSupabase.from('packs_rutinas').update({ ejercicios: packActivoEjercicios }).eq('id', packActivoId); 
        document.getElementById("modal-ejercicio-pack").style.display = "none"; 
        ejercicioPackEditandoIndex = null; // Reseteamos la memoria
        cargarEjerciciosDePack(); 
    } catch(e) { console.error(e); }
}

function formatearResumenSeries(seriesRepsJson) {
    if (!seriesRepsJson) return "-";
    if (typeof seriesRepsJson === 'string' && !seriesRepsJson.trim().startsWith('[')) return seriesRepsJson;

    try {
        let arraySeries = typeof seriesRepsJson === 'string' ? JSON.parse(seriesRepsJson) : seriesRepsJson;
        if (!Array.isArray(arraySeries) || arraySeries.length === 0) return "-";

        let resumen = arraySeries.map(s => {
            // Si el profe le puso un RIR, lo mostramos. Si lo dejó vacío, no lo mostramos.
            let rirTexto = (s.rir && s.rir !== "0") ? ` (RIR ${s.rir})` : "";
            return `${s.fuerza}% x ${s.reps}r${rirTexto}`;
        }).join('  |  ');
        return resumen;
        
    } catch (e) {
        return String(seriesRepsJson);
    }
}

// --- 11. SISTEMA DE PACKS PREDEFINIDOS (Navegación Blindada) ---
let packActivoId = null;
let packActivoEjercicios = []; 
let ejercicioPackEditandoIndex = null; // Nos avisa si estamos editando o creando uno nuevo

function abrirPantallaRutinas() {
    document.getElementById("pantalla-dashboard").style.display = "none";
    document.getElementById("pantalla-detalle-alumno").style.display = "none";
    document.getElementById("pantalla-perfiles").style.display = "none"; 
    document.getElementById("pantalla-admin").style.display = "none"; 
    
    // --> ESTO ARREGLA LA SUPERPOSICIÓN (Apaga el detalle del pack)
    document.getElementById("pantalla-detalle-pack").style.display = "none"; 
    
    document.getElementById("pantalla-rutinas").style.display = "block";
    cargarPacks();
    actualizarNavActivo('rutinas'); // Prende la luz naranja del botón
}

async function abrirDetallePack(id, nombre) {
    packActivoId = id;
    document.getElementById("pantalla-rutinas").style.display = "none"; 
    document.getElementById("pantalla-detalle-pack").style.display = "block";
    document.getElementById("detalle-nombre-pack").innerText = nombre; 
    cargarEjerciciosDePack();
    
    // --> ESTO HACE QUE EL BOTÓN SIGA BRILLANDO CUANDO ENTRÁS AL PACK
    actualizarNavActivo('rutinas'); 
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
                    <div class="info-central" style="margin-left: 15px; min-width: 0;">
                        <h3 style="font-size: 1.1rem; white-space: normal; overflow-wrap: anywhere; word-break: break-word; line-height: 1.2; margin-bottom: 2px;">${pack.nombre}</h3>
                        <div class="info-detalle">${ejCount} ejercicios configurados</div>
                    </div>
                    <div class="acciones-ejercicio" style="margin-left: auto; padding-left: 10px; display: flex; gap: 4px;">
                        <svg onclick="event.stopPropagation(); abrirModalEditarPack('${pack.id}', '${pack.nombre}')" viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" width="22"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        <svg onclick="event.stopPropagation(); borrarPack('${pack.id}')" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" width="22"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>`;
        });
    } catch (e) { contenedor.innerHTML = "<p>Error al cargar packs.</p>"; }
}

// Memoria para saber qué pack estamos renombrando
let packAEditarId = null;

function abrirModalEditarPack(id, nombreActual) {
    packAEditarId = id;
    document.getElementById("input-edit-pack-nombre").value = nombreActual;
    document.getElementById("modal-editar-pack").style.display = "flex";
}

function cerrarModalEditarPack() {
    document.getElementById("modal-editar-pack").style.display = "none";
    packAEditarId = null;
}

async function guardarEdicionPack() {
    const nuevoNombre = document.getElementById("input-edit-pack-nombre").value.trim();
    
    if(!nuevoNombre) {
        mostrarAlerta("Faltan datos", "El nombre de la rutina no puede estar vacío.");
        return;
    }

    try {
        // Le avisamos a Supabase que le cambie el nombre a este ID específico
        const { error } = await clienteSupabase
            .from('packs_rutinas')
            .update({ nombre: nuevoNombre })
            .eq('id', packAEditarId);
            
        if (error) throw error;
        
        cerrarModalEditarPack();
        cargarPacks(); // Recargamos la lista para ver el nombre nuevo
        
        // Si justo tenés abierto el detalle de ESE pack, también le actualizamos el título gigante arriba
        if (packActivoId === packAEditarId) {
            const tituloDetalle = document.getElementById("detalle-nombre-pack");
            if(tituloDetalle) tituloDetalle.innerText = nuevoNombre;
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

async function cargarEjerciciosDePack() {
    const contenedor = document.getElementById("lista-ejercicios-pack");
    try {
        const { data, error } = await clienteSupabase.from('packs_rutinas').select('ejercicios').eq('id', packActivoId).single();
        if (error) throw error;
        packActivoEjercicios = data.ejercicios || [];
        contenedor.innerHTML = "";
        
        packActivoEjercicios.forEach((ej, index) => {
            contenedor.innerHTML += `
                <div class="card-ejercicio">
                    ${obtenerAnimacionHTML(ej.nombre)}
                    <div class="info-ejercicio" style="min-width: 0;">
                        <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${ej.nombre}</h4>
                        <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                            <div style="display: flex; align-items: flex-start; gap: 6px; line-height: 1.3; font-size: 0.75rem;">
                                <div class="punto-ama" style="margin-top: 5px; flex-shrink: 0;"></div>
                                <span style="word-break: break-word;">${formatearResumenSeries(ej.series)}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; opacity: 0.7; margin-left: 12px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <span>Descanso: ${ej.descanso || "-"}</span>
                            </div>
                        </div>
                    </div>
                    <div class="acciones-ejercicio">
                        <svg onclick="abrirModalEditarEjercicioPack(${index})" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        <svg onclick="borrarEjercicioDePack(${index})" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>`;
        });
    } catch(e) { console.error(e); }
}

// Abre la ventana para CREAR un ejercicio nuevo en el pack
function abrirModalEjercicioPack() { 
    ejercicioPackEditandoIndex = null; // Nos aseguramos de estar en modo "Nuevo"
    document.getElementById("modal-ejercicio-pack").style.display = "flex"; 
    
    const selectZonaPack = document.getElementById("select-pack-ej-zona");
    selectZonaPack.innerHTML = '<option value="">Seleccioná una zona / tipo...</option>';

    let todasLasZonas = [];
    Object.keys(catalogoGlobal).forEach(granCategoria => {
        Object.keys(catalogoGlobal[granCategoria]).forEach(zona => {
            if (!todasLasZonas.includes(zona)) todasLasZonas.push(zona);
        });
    });

    todasLasZonas.sort().forEach(zona => {
        selectZonaPack.innerHTML += `<option value="${zona}">${zona}</option>`;
    });

    document.getElementById("input-pack-ej-nombre").value = "";
    document.getElementById("input-pack-ej-descanso").value = "";

    // Vaciamos la lista y dejamos 1 sola fila por defecto
    const contenedorSeries = document.getElementById('contenedor-filas-series-pack');
    if (contenedorSeries) {
        contenedorSeries.innerHTML = `
            <div class="fila-serie">
                <span class="numero-serie">1</span>
                <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
                <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
                <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
                <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
    }
}

// Abre la ventana para EDITAR un ejercicio que ya existe en el pack
function abrirModalEditarEjercicioPack(index) {
    ejercicioPackEditandoIndex = index; // Avisamos que estamos en modo Edición
    const ej = packActivoEjercicios[index]; // Traemos todos los datos guardados
    
    document.getElementById("modal-ejercicio-pack").style.display = "flex"; 
    
    const selectZonaPack = document.getElementById("select-pack-ej-zona");
    selectZonaPack.innerHTML = '<option value="">Seleccioná una zona / tipo...</option>';

    let todasLasZonas = [];
    Object.keys(catalogoGlobal).forEach(granCategoria => {
        Object.keys(catalogoGlobal[granCategoria]).forEach(zona => {
            if (!todasLasZonas.includes(zona)) todasLasZonas.push(zona);
        });
    });

    todasLasZonas.sort().forEach(zona => {
        selectZonaPack.innerHTML += `<option value="${zona}">${zona}</option>`;
    });

    document.getElementById("select-pack-ej-zona").value = ej.zona || "";
    document.getElementById("input-pack-ej-nombre").value = ej.nombre || "";
    document.getElementById("input-pack-ej-descanso").value = ej.descanso || "";

    // Armamos las series dinámicas leyendo lo que había guardado
    const contenedorSeries = document.getElementById('contenedor-filas-series-pack');
    if (contenedorSeries) {
        contenedorSeries.innerHTML = ""; 
        let arraySeries = [];
        try {
            if (ej.series && typeof ej.series === 'string' && ej.series.startsWith('[')) {
                arraySeries = JSON.parse(ej.series);
            }
        } catch (e) {}

        if (arraySeries.length > 0) {
            arraySeries.forEach((s, idx) => {
                contenedorSeries.innerHTML += `
                    <div class="fila-serie">
                        <span class="numero-serie">${idx + 1}</span>
                        <input type="number" class="input-serie-fuerza input-modal" value="${s.fuerza || ''}" placeholder="% RM">
                        <input type="number" class="input-serie-reps input-modal" value="${s.reps || ''}" placeholder="Reps">
                        <input type="number" class="input-serie-rir input-modal" value="${s.rir || ''}" placeholder="RIR">
                        <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
            });
        } else {
            contenedorSeries.innerHTML = `
                <div class="fila-serie">
                    <span class="numero-serie">1</span>
                    <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
                    <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
                    <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
                    <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
        }
    }
}

// ==========================================
// NUEVO SISTEMA DE LISTA DE EJERCICIOS EMERGENTE
// ==========================================
let inputDestinoEjercicio = ""; // Memoria para saber qué cajita rellenar

// 1. Lista emergente para la rutina normal (muestra todos si no hay zona elegida)
function abrirModalListaEjercicios(idInputDestino, idSelectZona) {
    const zona = document.getElementById(idSelectZona).value;
    inputDestinoEjercicio = idInputDestino; 
    const contenedor = document.getElementById("contenedor-botones-ejercicios");
    contenedor.innerHTML = ""; 

    let catActual = "ENTRENAMIENTO"; 
    if (categoriaSeleccionada) {
        const cat = categoriaSeleccionada.toUpperCase();
        if (cat === "MOVILIDAD" || cat === "ENTRADA EN CALOR") catActual = cat;
    }

    let ejerciciosAMostrar = [];

    if (zona) {
        // Si eligió una zona específica, mostramos solo esos
        ejerciciosAMostrar = catalogoGlobal[catActual][zona] || [];
    } else {
        // Si NO eligió zona, juntamos TODOS los ejercicios de todas las zonas de esta categoría
        Object.keys(catalogoGlobal[catActual]).forEach(z => {
            const listaZona = catalogoGlobal[catActual][z] || [];
            listaZona.forEach(ej => {
                if (!ejerciciosAMostrar.includes(ej)) ejerciciosAMostrar.push(ej);
            });
        });
        ejerciciosAMostrar.sort(); // Los ordenamos alfabéticamente
    }
    
    if (ejerciciosAMostrar.length === 0) {
         contenedor.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>No hay ejercicios precargados.</p>";
    } else {
        ejerciciosAMostrar.forEach(ej => {
            const btn = document.createElement("button");
            btn.style.cssText = "display: block; width: 100%; text-align: left; padding: 14px 15px; margin-bottom: 8px; border-radius: 10px; font-size: 1.05rem; background: #2c3e50; color: #fff; border: 1px solid #34495e; cursor: pointer; transition: 0.2s;";
            btn.innerText = ej;
            btn.onclick = () => seleccionarEjercicioDesdeLista(ej);
            contenedor.appendChild(btn);
        });
    }
    document.getElementById("modal-lista-ejercicios").style.display = "flex";
}

// 2. Lista emergente para los packs predefinidos (muestra todos si no hay zona elegida)
function abrirModalListaEjerciciosPack(idInputDestino, idSelectZona) {
    const zona = document.getElementById(idSelectZona).value;
    inputDestinoEjercicio = idInputDestino;
    const contenedor = document.getElementById("contenedor-botones-ejercicios");
    contenedor.innerHTML = "";

    let ejerciciosDelPack = [];
    
    Object.keys(catalogoGlobal).forEach(granCategoria => {
        const zonasAConsiderar = zona ? [zona] : Object.keys(catalogoGlobal[granCategoria]);
        
        zonasAConsiderar.forEach(z => {
            if (catalogoGlobal[granCategoria][z]) {
                catalogoGlobal[granCategoria][z].forEach(ej => {
                    if (!ejerciciosDelPack.includes(ej)) ejerciciosDelPack.push(ej);
                });
            }
        });
    });

    ejerciciosDelPack.sort();

    if (ejerciciosDelPack.length === 0) {
         contenedor.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>No hay ejercicios.</p>";
    } else {
        ejerciciosDelPack.forEach(ej => {
            const btn = document.createElement("button");
            btn.style.cssText = "display: block; width: 100%; text-align: left; padding: 14px 15px; margin-bottom: 8px; border-radius: 10px; font-size: 1.05rem; background: #2c3e50; color: #fff; border: 1px solid #34495e; cursor: pointer; transition: 0.2s;";
            btn.innerText = ej;
            btn.onclick = () => seleccionarEjercicioDesdeLista(ej);
            contenedor.appendChild(btn);
        });
    }
    document.getElementById("modal-lista-ejercicios").style.display = "flex";
}

// 3. Cuando el profe toca un botón de la lista emergente
function seleccionarEjercicioDesdeLista(nombreEjercicio) {
    // Escribe el nombre en la cajita correcta
    document.getElementById(inputDestinoEjercicio).value = nombreEjercicio;
    // Cierra la ventana emergente de la lista
    document.getElementById("modal-lista-ejercicios").style.display = "none";
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
            semana: semanaActiva,
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

    // C. NUEVO: Le avisamos al cuerpo entero de la app para que los Modales se enteren
    if(esTemaOscuro) {
        document.body.classList.add('tema-oscuro');
    } else {
        document.body.classList.remove('tema-oscuro');
    }

    // D. Sincronizar soles y lunas
    const soles = document.querySelectorAll('[id^="icono-sol"]');
    const lunas = document.querySelectorAll('[id^="icono-luna"]');

    if(esTemaOscuro) {
        soles.forEach(sol => sol.style.display = 'block'); 
        lunas.forEach(luna => luna.style.display = 'none');
    } else {
        soles.forEach(sol => sol.style.display = 'none');
        lunas.forEach(luna => luna.style.display = 'block'); 
    }
}

// Conectamos los botones viejos al nuevo Cerebro Central
function alternarTemaInicio() { alternarTemaGlobal(); }
function alternarTemaLogin() { alternarTemaGlobal(); }
function alternarTemaPerfiles() { alternarTemaGlobal(); }
function alternarTemaDashboard() { alternarTemaGlobal(); }


// ==========================================
// CONTROL DEL BOTÓN "ATRÁS" DEL CELULAR
// ==========================================

// 1. Apenas arranca la app, creamos un "historial falso" para atrapar el primer clic
window.history.pushState({ appAbierta: true }, "", "");

// 2. Escuchamos cuando el usuario aprieta el botón físico de "Atrás"
window.addEventListener('popstate', function (event) {
    let interceptado = false; // Bandera para saber si cerramos algo

    // A. CHEQUEO DE VISTAS INTERNAS (Ej: Viendo ejercicios y querer volver a las categorías)
    if (typeof vistaSliderActual !== 'undefined' && vistaSliderActual === 'ejercicios') {
        cerrarCategoria();
        interceptado = true;
    }

    // B. CHEQUEO DE MODALES Y VENTANAS EMERGENTES (De mayor a menor prioridad)
    if (!interceptado) {
        const modales = [
            { id: "modal-confirmacion", cerrar: cerrarModalConfirmacion },
            { id: "modal-alerta", cerrar: cerrarModalAlerta },
            { id: "modal-error-login", cerrar: cerrarModalErrorLogin },
            { id: "modal-notificaciones", cerrar: typeof cerrarModalNotificaciones !== "undefined" ? cerrarModalNotificaciones : () => document.getElementById("modal-notificaciones").style.display = "none" },
            { id: "modal-seleccionar-pack", cerrar: () => document.getElementById("modal-seleccionar-pack").style.display = "none" },
            { id: "modal-ejercicio-pack", cerrar: () => document.getElementById("modal-ejercicio-pack").style.display = "none" },
            { id: "modal-crear-pack", cerrar: cerrarModalCrearPack },
            { id: "modal-ejercicio", cerrar: cerrarModalEjercicio },
            { id: "modal-editar-dias", cerrar: () => document.getElementById("modal-editar-dias").style.display = "none" },
            { id: "modal-renombrar-categoria", cerrar: () => document.getElementById("modal-renombrar-categoria").style.display = "none" },
            { id: "modal-opciones-categoria", cerrar: () => document.getElementById("modal-opciones-categoria").style.display = "none" },
            { id: "modal-categoria", cerrar: () => document.getElementById("modal-categoria").style.display = "none" },
            { id: "modal-rendimiento", cerrar: cerrarModalRendimiento },
            { id: "modal-editar-alumno", cerrar: cerrarModalEditarAlumno },
            { id: "modal-alumno", cerrar: cerrarModalAlumno },
            { id: "modal-editar-profe", cerrar: cerrarModalEditarProfe },
            { id: "modal-profe", cerrar: cerrarModalProfe },
            { id: "modal-checkin", cerrar: cerrarModalCheckin },
            { id: "modal-terminos", cerrar: cerrarModalTerminos },
            { id: "modal-editar-pack", cerrar: cerrarModalEditarPack },
            { id: "modal-informe-profe", cerrar: cerrarModalInformeProfe }
        ];

        for (let modal of modales) {
            const el = document.getElementById(modal.id);
            // Si la ventanita existe y está visible en la pantalla
            if (el && (el.style.display === "flex" || el.style.display === "block")) {
                modal.cerrar();
                interceptado = true;
                break; // Cortamos acá para que el botón cierre solo UNA cosa por vez
            }
        }
    }

    // C. CHEQUEO DE PANTALLAS PRINCIPALES (Si no había modales para cerrar)
    if (!interceptado) {
        const esVisible = (id) => {
            const el = document.getElementById(id);
            return el && (el.style.display === "flex" || el.style.display === "block");
        };

        if (esVisible("pantalla-detalle-pack")) {
            abrirPantallaRutinas();
            interceptado = true;
        } else if (esVisible("pantalla-rutinas")) {
            volverAlDashboard();
            interceptado = true;
        } else if (esVisible("pantalla-detalle-alumno")) {
            volverAlDashboard();
            interceptado = true;
        } else if (esVisible("pantalla-admin")) {
            volverAlDashboard();
            interceptado = true;
        } else if (esVisible("pantalla-dashboard")) {
            volverAPerfiles();
            interceptado = true;
        } else if (esVisible("pantalla-login")) {
            volverDesdeLoginAInicio();
            interceptado = true;
        } else if (esVisible("pantalla-alumno-proximamente")) {
            volverDesdeAlumnoAInicio();
            interceptado = true;
        } else if (esVisible("pantalla-perfiles")) {
            // Si no inició sesión, lo mandamos al inicio. Si inició sesión, Perfiles es la "raíz" y dejamos que salga.
            const sesion = localStorage.getItem('sesionGimnasio');
            if (!sesion) {
                volverDesdePerfilesAInicio();
                interceptado = true;
            }
        }
    }

    // 3. LA TRAMPA: Si atrapamos el botón y cerramos algo, volvemos a empujar el historial
    // para que el usuario no se salga de la app en su próximo clic.
    if (interceptado) {
        window.history.pushState({ appAbierta: true }, "", "");
    } else {
        // Si no interceptamos nada (ej: estaba en la pantalla principal de Inicio), 
        // no ponemos la trampa y permitimos que el celular cierre la app de forma natural.
    }
});


// ==========================================
// SISTEMA DE ASISTENCIA RÁPIDA (CHECK-IN)
// ==========================================
let checkinAlumnoId = null;

async function abrirModalCheckin(alumnoId) {
    checkinAlumnoId = alumnoId;
    document.getElementById("modal-checkin").style.display = "flex";
    
    const contenedorDias = document.getElementById("lista-dias-checkin");
    contenedorDias.innerHTML = "<p style='color:#888; font-size:0.8rem;'>Cargando días...</p>";

    try {
        // 1. Buscamos rápidamente si el alumno le cambió los nombres a sus días (Ej: "Día de Pierna")
        const { data: alumno, error } = await clienteSupabase
            .from('alumnos')
            .select('nombres_dias')
            .eq('id', alumnoId)
            .single();
        
        if (error) throw error;

        let dias = ["D1", "D2", "D3", "D4", "D5"];
        if (alumno && alumno.nombres_dias && alumno.nombres_dias.length === 5) {
            dias = alumno.nombres_dias;
        }

        // 2. Dibujamos un botón para cada día
        contenedorDias.innerHTML = "";
        dias.forEach(diaTexto => {
            contenedorDias.innerHTML += `
                <button class="btn-dia-checkin" onclick="procesarCheckin('${diaTexto}')">
                    ${diaTexto}
                </button>
            `;
        });
    } catch(e) {
        console.error(e);
        contenedorDias.innerHTML = "<p style='color:#e74c3c; font-size:0.8rem;'>Error al cargar los días.</p>";
    }
}

function cerrarModalCheckin() {
    document.getElementById("modal-checkin").style.display = "none";
    checkinAlumnoId = null;
}

// 3. El motor que lee la fuerza y la guarda mágicamente en el historial
async function procesarCheckin(diaSeleccionado) {
    const idSeguro = checkinAlumnoId; 
    cerrarModalCheckin(); 
    
    try {
        const { data: ejercicios, error: errorSupabase } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('zona_muscular, series_reps')
            .eq('alumno_id', idSeguro)
            .eq('dia_semana', diaSeleccionado);

        if (errorSupabase) throw errorSupabase;

        const tmpHoy = new Date();
        const fechaHoy = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;
        let mensajeAlerta = "";

        // 1. SI HAY EJERCICIOS, calculamos el porcentaje y lo guardamos para el gráfico
        if (ejercicios && ejercicios.length > 0) {
            const fuerzaPorZona = {};
            
            ejercicios.forEach(ej => {
                // Sacamos el "ej.zona_muscular &&" para que procese todos
                if (ej.series_reps) {
                    // Si el profe no le puso zona, le asignamos "General"
                    let zonaAsignada = ej.zona_muscular || "General"; 
                    
                    try {
                        let series = JSON.parse(ej.series_reps);
                        if (Array.isArray(series)) {
                            series.forEach(s => {
                                let f = parseFloat(s.fuerza);
                                if (!isNaN(f) && f > 0) {
                                    if (!fuerzaPorZona[zonaAsignada]) {
                                        fuerzaPorZona[zonaAsignada] = { suma: 0, cantidad: 0 };
                                    }
                                    fuerzaPorZona[zonaAsignada].suma += f;
                                    fuerzaPorZona[zonaAsignada].cantidad += 1;
                                }
                            });
                        }
                    } catch(e) { } // Ignora ejercicios viejos mal formateados
                }
            });

            const registros = Object.keys(fuerzaPorZona).map(zona => ({
                alumno_id: idSeguro, 
                fecha: fechaHoy,
                zona_muscular: zona,
                peso_total: Math.round(fuerzaPorZona[zona].suma / fuerzaPorZona[zona].cantidad)
            }));

            if (registros.length > 0) {
                const { error: errorHistorial } = await clienteSupabase.from('registro_ejercicios').insert(registros);
                if (errorHistorial) throw errorHistorial;
                mensajeAlerta = `El entrenamiento de ${diaSeleccionado} se guardó correctamente en el historial.`;
            } else {
                mensajeAlerta = `Asistencia tomada. (La rutina no tenía porcentajes para graficar).`;
            }
        } else {
            // SI NO HAY EJERCICIOS, preparamos este mensaje especial
            mensajeAlerta = `Se marcó el presente para el día "${diaSeleccionado}" (No había rutina cargada).`;
        }

        // 2. LA MAGIA: SIEMPRE guardamos la asistencia (haya o no haya ejercicios)
        await clienteSupabase.from('alumnos').update({ ultima_sesion: fechaHoy }).eq('id', idSeguro);
        
        cargarAlumnos();
        mostrarAlerta("¡Asistencia Registrada!", mensajeAlerta);
        
    } catch(e) {
        console.error(e);
        mostrarAlerta("Error Crítico", "No se pudo procesar la solicitud.");
    }
}

// 4. El motor para DESHACER la asistencia
function deshacerAsistencia(alumnoId) {
    pedirConfirmacion(
        "Deshacer Asistencia",
        "¿Querés deshacer la Asistencia de este alumno?",
        "Aceptar",
        async () => {
            const tmpHoy = new Date();
            const fechaHoyStr = `${tmpHoy.getFullYear()}-${String(tmpHoy.getMonth() + 1).padStart(2, '0')}-${String(tmpHoy.getDate()).padStart(2, '0')}`;
            try {
                // 1. Borramos el historial de ejercicios de hoy (para que no sume kilos falsos)
                await clienteSupabase
                    .from('registro_ejercicios')
                    .delete()
                    .eq('alumno_id', alumnoId)
                    .eq('fecha', fechaHoyStr);

                // 2. Buscamos la fecha anterior a la que vino (por si entrenó ayer) para no dejarlo en blanco
                const { data: historialViejo } = await clienteSupabase
                    .from('registro_ejercicios')
                    .select('fecha')
                    .eq('alumno_id', alumnoId)
                    .lt('fecha', fechaHoyStr)
                    .order('fecha', { ascending: false })
                    .limit(1);

                let fechaAnterior = null;
                if (historialViejo && historialViejo.length > 0) {
                    fechaAnterior = historialViejo[0].fecha;
                }

                // 3. Devolvemos el alumno a su estado anterior en la base de datos
                await clienteSupabase
                    .from('alumnos')
                    .update({ ultima_sesion: fechaAnterior })
                    .eq('id', alumnoId);

                // 4. Refrescamos la pantalla (el botón vuelve a estar gris automáticamente)
                cargarAlumnos();
                
            } catch (error) {
                mostrarAlerta("Error", "No se pudo deshacer la asistencia: " + error.message);
            }
        }
    );
}

// ==========================================
// CLONAR SEMANA COMPLETA
// ==========================================
async function clonarSemanaCompleta(semanaOrigen, semanaDestino) {
    try {
        // 1. Buscamos TODOS los ejercicios del alumno en la Semana 1 (de todos los días y barras)
        const { data: ejerciciosOrigen, error: errOrig } = await clienteSupabase
            .from('rutinas_planificadas')
            .select('*')
            .eq('alumno_id', alumnoSeleccionadoId)
            .eq('semana', semanaOrigen);

        if (errOrig) throw errOrig;

        if (!ejerciciosOrigen || ejerciciosOrigen.length === 0) {
            mostrarAlerta("Aviso", "La Semana 1 está completamente vacía. No hay nada para copiar.");
            return;
        }

        // 2. Creamos copias exactas, pero le cambiamos el número de semana
        const nuevasCopias = ejerciciosOrigen.map(ej => ({
            alumno_id: ej.alumno_id,
            dia_semana: ej.dia_semana,
            semana: semanaDestino, // Le ponemos la semana nueva (ej: 2)
            categoria: ej.categoria,
            zona_muscular: ej.zona_muscular,
            ejercicio_nombre: ej.ejercicio_nombre,
            series_reps: ej.series_reps,
            fuerza: ej.fuerza,
            descanso: ej.descanso,
            orden: ej.orden
        }));

        // 3. Insertamos todo de golpe en la base de datos
        const { error: errInsert } = await clienteSupabase.from('rutinas_planificadas').insert(nuevasCopias);
        if (errInsert) throw errInsert;

        mostrarAlerta("¡Semana Copiada!", `Se clonó la rutina entera a la Semana ${semanaDestino}. Ahora podés modificarla sin alterar el resto.`);
        
        // 4. Refrescamos la pantalla para mostrar los ejercicios nuevos
        dibujarCategoriasAlumno(); 
        cargarEjerciciosCategoriaBD();

    } catch (e) {
        console.error(e);
        mostrarAlerta("Error", "No se pudo copiar la semana.");
    }
}


function actualizarNavActivo(pestaña) {
    // Apagamos todas las pestañas primero
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('activo'));
    
    // Encendemos solo la que nos interesa
    if (pestaña === 'alumnos') document.querySelectorAll('.tab-alumnos').forEach(btn => btn.classList.add('activo'));
    if (pestaña === 'rutinas') document.querySelectorAll('.tab-rutinas').forEach(btn => btn.classList.add('activo'));
    if (pestaña === 'informe') document.querySelectorAll('.tab-informe').forEach(btn => btn.classList.add('activo'));
}

function volverAlDashboardDesdeAdmin() {
    // 1. Apagamos el panel de informe
    document.getElementById("pantalla-admin").style.display = "none";
    
    // 2. Encendemos el Dashboard (el del profesor que está logueado)
    document.getElementById("pantalla-dashboard").style.display = "block";
    
    // 3. Cargamos los alumnos específicos de este profesor
    // (Como el ID ya está guardado en la variable 'profeActivoId', carga los suyos)
    cargarAlumnos();
    
    // 4. Actualizamos el menú inferior para que marque "Alumnos" como activo
    actualizarNavActivo('alumnos');
}





// ==========================================
// SISTEMA DE INFORME EXCEL Y PLANILLAS
// ==========================================
let alumnosParaInformeActual = []; // Memoria de los alumnos que procesamos

function abrirModalInformeProfe() {
    document.getElementById("modal-informe-profe").style.display = "flex";
    cambiarVistaInforme('actual'); // Siempre arranca en la tabla
    cargarDatosParaInforme();
}

function cerrarModalInformeProfe() {
    document.getElementById("modal-informe-profe").style.display = "none";
}

function cambiarVistaInforme(vista) {
    const track = document.getElementById("track-informe");
    const btnActual = document.getElementById("tab-informe-actual");
    const btnHistorial = document.getElementById("tab-informe-historial");
    const filtroOrden = document.getElementById("contenedor-filtros-informe"); // Capturamos el nuevo filtro

    if (vista === 'actual') {
        track.style.transform = 'translateX(0%)';
        btnActual.classList.add("activo");
        btnHistorial.classList.remove("activo");
        if (filtroOrden) filtroOrden.style.display = "flex"; // Lo mostramos en la tabla
    } else {
        track.style.transform = 'translateX(-50%)';
        btnHistorial.classList.add("activo");
        btnActual.classList.remove("activo");
        if (filtroOrden) filtroOrden.style.display = "none"; // Lo ocultamos en el historial
        dibujarHistorialInformes(); 
    }
}

async function cargarDatosParaInforme() {
    const tabla = document.getElementById("tabla-informe-alumnos");
    const kpis = document.getElementById("resumen-informe-kpis");
    const ordenElegido = document.getElementById("select-orden-informe").value; 
    
    tabla.innerHTML = "<tr><td style='text-align:center;'>Cargando datos de la base...</td></tr>";

    try {
        const { data: alumnosBD, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('profesor_id', profeActivoId);

        if (error) throw error;

        let alumnos = [...alumnosBD];

        if (ordenElegido === 'actividad') {
            alumnos.sort((a, b) => {
                const actA = (a.actividad || "Sin Categoría").toLowerCase();
                const actB = (b.actividad || "Sin Categoría").toLowerCase();
                if (actA === actB) return (a.nombre || "").localeCompare(b.nombre || "");
                return actA.localeCompare(actB);
            });
        } else if (ordenElegido === 'alfabetico') {
            alumnos.sort((a, b) => {
                const nombreA = (a.nombre || "").toLowerCase();
                const nombreB = (b.nombre || "").toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
        } else if (ordenElegido === 'ingreso') {
            alumnos.sort((a, b) => {
                const fechaA = new Date(a.creado_en || a.created_at || 0);
                const fechaB = new Date(b.creado_en || b.created_at || 0);
                return fechaA - fechaB; 
            });
        }

        alumnosParaInformeActual = alumnos; 

        tabla.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Modalidad</th> <!-- NUEVA COLUMNA -->
                <th>Actividad</th>
                <th>Vencimiento</th>
                <th>Día de Pago</th>
                <th>Cuota</th>
                <th>Estado</th>
            </tr>
        `;

        if (alumnos.length === 0) {
            tabla.innerHTML += `<tr><td colspan="7" style="text-align:center;">No hay alumnos.</td></tr>`;
        } else {
            let actividadActual = "";
            const hoy = new Date();
            hoy.setHours(0,0,0,0);

            alumnos.forEach(a => {
                if (ordenElegido === 'actividad') {
                    const actividadAlumno = a.actividad || "Sin Categoría";
                    if (actividadAlumno !== actividadActual) {
                        tabla.innerHTML += `<tr><td colspan="7" class="tabla-separador-cat">${actividadAlumno.toUpperCase()}</td></tr>`;
                        actividadActual = actividadAlumno;
                    }
                }

                let estado = "Al día";
                let colorEstado = "#888"; 
                let fechaArg = "-";

                if (a.vencimiento_cuota) {
                    const fechaVencimiento = new Date(a.vencimiento_cuota + 'T00:00:00');
                    const diferenciaDias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
                    fechaArg = a.vencimiento_cuota.split('-').reverse().join('/');
                    
                    if (diferenciaDias < 0) {
                        estado = "Vencida"; colorEstado = "#d32f2f"; 
                    } else if (diferenciaDias <= 5) {
                        estado = "Pronto a vencer"; colorEstado = "#f39c12"; 
                    }
                }

                let fechaPagoArg = "-";
                if (a.fecha_ultimo_pago) {
                    fechaPagoArg = a.fecha_ultimo_pago.split('-').reverse().join('/');
                }

                const cuotaMonto = a.cuota ? `$${a.cuota.toLocaleString('es-AR')}` : "$0";
                const modalidad = a.tipo_rutina || "Con rutina"; // Rescatamos el dato

                tabla.innerHTML += `
                    <tr>
                        <td style="color: #eee; font-weight: 500;">${a.nombre} ${a.apellido}</td>
                        <td style="color: #3498db; font-weight: 500;">${modalidad}</td>
                        <td style="color: #aaa;">${a.actividad || "Sin Categoría"}</td> 
                        <td>${fechaArg}</td>
                        <td>${fechaPagoArg}</td>
                        <td>${cuotaMonto}</td>
                        <td style="color: ${colorEstado}; font-weight:500;">${estado}</td>
                    </tr>
                `;
            });
        }

        let totalDinero = 0;
        let conteoActividades = {};

        alumnos.forEach(a => {
            if (a.cuota) totalDinero += a.cuota;
            const act = a.actividad || "Sin Categoría";
            conteoActividades[act] = (conteoActividades[act] || 0) + 1;
        });

        const porcentajeGimnasio = totalDinero * 0.30;
        const porcentajeProfesor = totalDinero * 0.70;

        let desgloseCategorias = "";
        for (const [cat, cantidad] of Object.entries(conteoActividades)) {
            desgloseCategorias += `${cat}: ${cantidad} | `;
        }

        const fechaEmision = new Date().toLocaleDateString('es-AR');

        kpis.innerHTML = `
            <div class="kpi-item">
                <span>Total Alumnos</span>
                <strong style="font-size: 1.2rem;">${alumnos.length}</strong>
            </div>
            <div class="kpi-item" style="display: flex; flex-direction: column;">
                <span>Recaudación Total</span>
                <strong style="font-size: 1.2rem;">$${totalDinero.toLocaleString('es-AR')}</strong>
                <span style="font-size: 0.75rem; margin-top: 5px; text-transform: none;">
                    Gym (30%): -$${porcentajeGimnasio.toLocaleString('es-AR')}
                </span>
                <span style="font-size: 0.75rem; margin-top: 2px; text-transform: none;">
                    Tu parte (70%): $${porcentajeProfesor.toLocaleString('es-AR')}
                </span>
            </div>
            <div class="kpi-item" style="grid-column: span 2;">
                <span>Desglose</span>
                <strong style="font-size: 0.8rem; font-weight: 500;">${desgloseCategorias || "Sin datos"}</strong>
            </div>
            <div class="kpi-item" style="grid-column: span 2; text-align: center; margin-top: 5px;">
                <span>Fecha de emisión: ${fechaEmision}</span>
            </div>
        `;

    } catch (e) {
        tabla.innerHTML = `<tr><td style="color:red; text-align:center;">Error al cargar: ${e.message}</td></tr>`;
    }
}

function dibujarHistorialInformes() {
    const contenedor = document.getElementById("lista-historial-informes");
    const llaveMemoria = 'historial_informes_' + profeActivoId;
    let historial = JSON.parse(localStorage.getItem(llaveMemoria)) || [];

    contenedor.innerHTML = "";

    if (historial.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; color:#555; font-size: 0.9rem; margin-top:20px;'>Aún no descargaste ninguna planilla.</p>";
        return;
    }

    historial.forEach((registro, index) => {
        // Tarjetas oscuras y botón sobrio
        contenedor.innerHTML += `
            <div class="tarjeta-historial" style="display: flex; flex-direction: column; align-items: stretch;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p>Planilla de Alumnos</p>
                        <span>Descargado el ${registro.fecha} a las ${registro.hora}</span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" width="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                
                <button class="btn-re-descarga" onclick="volverADescargarExcel(${index})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Volver a descargar
                </button>
            </div>
        `;
    });
}
// ==========================================
// GENERADOR DE ARCHIVO EXCEL REAL (.xlsx) - RESUMEN LADO A LADO
// ==========================================
function descargarExcelProfe() {
    if (!alumnosParaInformeActual || alumnosParaInformeActual.length === 0) {
        mostrarAlerta("Sin datos", "No hay alumnos para generar el informe.");
        return;
    }

    const fechaEmision = new Date().toLocaleDateString('es-AR');
    const horaEmision = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const tipoOrden = document.getElementById("select-orden-informe").options[document.getElementById("select-orden-informe").selectedIndex].text;

    let matrizExcel = [];

    matrizExcel.push(["INFORME GENERAL DE ALUMNOS"]);
    matrizExcel.push(["Fecha de emisión:", fechaEmision]);
    matrizExcel.push(["Hora de emisión:", horaEmision]);
    matrizExcel.push(["Ordenado por:", tipoOrden]);
    matrizExcel.push([]); 

    matrizExcel.push(["Nombre", "Apellido", "DNI", "Fecha de Ingreso", "Modalidad", "Actividad", "Edad", "Condición", "Objetivo", "Vencimiento", "Día de Pago", "Cuota Mensual"]);

    let totalDinero = 0;
    let conteoActividades = {};

    alumnosParaInformeActual.forEach(a => {
        let fechaIngreso = "-";
        const fechaBase = a.creado_en || a.created_at; 
        if (fechaBase && fechaBase !== "null") {
            try { fechaIngreso = fechaBase.split('T')[0].split('-').reverse().join('/'); } catch(e) {}
        }

        let vencimiento = a.vencimiento_cuota ? a.vencimiento_cuota.split('-').reverse().join('/') : "-";
        let diaDePago = a.fecha_ultimo_pago ? a.fecha_ultimo_pago.split('-').reverse().join('/') : "-";
        let cuota = a.cuota || 0;
        
        totalDinero += cuota;
        const act = a.actividad || "Sin Categoría";
        conteoActividades[act] = (conteoActividades[act] || 0) + 1;

        matrizExcel.push([
            a.nombre || "",
            a.apellido || "",
            a.dni || "-",
            fechaIngreso,
            a.tipo_rutina || "Con rutina", 
            act,
            a.edad || "-",
            a.condicion_medica || "-",
            a.objetivo || "-",
            vencimiento,
            diaDePago,
            cuota
        ]);
    });

    // 3. CÁLCULOS Y RESUMEN FINAL (ALINEADOS A LA DERECHA Y SEPARADOS)
    const porcentajeGimnasio = totalDinero * 0.30;
    const porcentajeProfesor = totalDinero * 0.70;

    matrizExcel.push([]); // Renglón vacío para dar aire
    matrizExcel.push([]); 

    // Convertimos la lista de categorías en un formato amigable
    const categoriasArr = Object.entries(conteoActividades);

    // Fila de Títulos (Columna B para la Plata, Columna F para las Categorías)
    matrizExcel.push(["", "RESUMEN GENERAL", "", "", "", "ALUMNOS POR CATEGORÍA", "", ""]);

    // Fila 1
    let cat1 = categoriasArr[0] || ["", ""];
    matrizExcel.push(["", "Total Alumnos:", "", alumnosParaInformeActual.length, "", cat1[0] ? cat1[0]+":" : "", "", cat1[1]]);

    // Fila 2 (Le agregamos el formato de plata directamente al Excel)
    let cat2 = categoriasArr[1] || ["", ""];
    matrizExcel.push(["", "Total Recaudado:", "", totalDinero ? `$${totalDinero.toLocaleString('es-AR')}` : "$0", "", cat2[0] ? cat2[0]+":" : "", "", cat2[1]]);

    // Fila 3
    let cat3 = categoriasArr[2] || ["", ""];
    matrizExcel.push(["", "Gimnasio (30%):", "", porcentajeGimnasio ? `-$${porcentajeGimnasio.toLocaleString('es-AR')}` : "$0", "", cat3[0] ? cat3[0]+":" : "", "", cat3[1]]);

    // Fila 4
    let cat4 = categoriasArr[3] || ["", ""];
    matrizExcel.push(["", "Tu parte (70%):", "", porcentajeProfesor ? `$${porcentajeProfesor.toLocaleString('es-AR')}` : "$0", "", cat4[0] ? cat4[0]+":" : "", "", cat4[1]]);

    // Fila 5 en adelante (por si el profe tiene 5, 6 o más actividades distintas que no entraron arriba)
    for (let i = 4; i < categoriasArr.length; i++) {
        matrizExcel.push(["", "", "", "", "", categoriasArr[i][0] + ":", "", categoriasArr[i][1]]);
    }

    const libroExcel = XLSX.utils.book_new();
    const hojaExcel = XLSX.utils.aoa_to_sheet(matrizExcel);
    
    hojaExcel['!cols'] = [
        {wch: 15}, {wch: 15}, {wch: 12}, {wch: 15}, {wch: 12}, 
        {wch: 15}, {wch: 8}, {wch: 22}, {wch: 22}, {wch: 12}, 
        {wch: 12}, {wch: 14}
    ];

    XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Planilla Alumnos");

    const fechaArchivo = fechaEmision.replace(/\//g, '-');
    XLSX.writeFile(libroExcel, `Informe_Alumnos_${fechaArchivo}.xlsx`);

    guardarEnHistorial(fechaArchivo, JSON.stringify(matrizExcel));
    mostrarAlerta("¡Descarga Exitosa!", "El informe se descargó correctamente con el nuevo diseño.");
}

function guardarEnHistorial(fechaString, contenidoDelExcel) {
    const llaveMemoria = 'historial_informes_' + profeActivoId;
    let historial = JSON.parse(localStorage.getItem(llaveMemoria)) || [];
    
    // Guardamos la fecha, la hora y también los datos exactos del archivo
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    historial.unshift({ fecha: fechaString, hora: hora, datos: contenidoDelExcel }); 
    
    // BLINDAJE: Para proteger la memoria del celular, guardamos solo los últimos 15 informes.
    if (historial.length > 15) {
        historial.pop(); // Borra el más antiguo
    }
    
    localStorage.setItem(llaveMemoria, JSON.stringify(historial));
}

// ---> FUNCION MÁGICA DE RE-DESCARGA CON DOBLE COMPATIBILIDAD
function volverADescargarExcel(index) {
    const llaveMemoria = 'historial_informes_' + profeActivoId;
    let historial = JSON.parse(localStorage.getItem(llaveMemoria)) || [];
    const registro = historial[index];
    
    if (!registro || !registro.datos) {
        mostrarAlerta("Error", "Este informe es antiguo y no tiene datos guardados.");
        return;
    }

    try {
        // Intentamos leerlo como Matriz de Excel nuevo (.xlsx)
        const matrizRecuperada = JSON.parse(registro.datos);
        
        const libroExcel = XLSX.utils.book_new();
        const hojaExcel = XLSX.utils.aoa_to_sheet(matrizRecuperada);
        
        hojaExcel['!cols'] = [
            {wch: 15}, {wch: 15}, {wch: 12}, {wch: 15}, {wch: 15}, 
            {wch: 8}, {wch: 22}, {wch: 22}, {wch: 12}, {wch: 12}, {wch: 14}
        ];

        XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Copia Planilla");
        XLSX.writeFile(libroExcel, `Copia_Informe_${registro.fecha}.xlsx`);
        mostrarAlerta("¡Re-descarga Exitosa!", "El informe guardado se descargó en formato Excel (.xlsx).");

    } catch (error) {
        // Si tira error el JSON.parse, significa que es un historial viejo formato CSV (texto crudo). 
        // Lo descargamos a la antigua:
        const blob = new Blob([registro.datos], { type: 'text/csv;charset=utf-8;' });
        const urlVirtual = URL.createObjectURL(blob);
        const linkDescarga = document.createElement("a");
        
        linkDescarga.setAttribute("href", urlVirtual);
        linkDescarga.setAttribute("download", `Copia_Informe_${registro.fecha}.csv`);
        document.body.appendChild(linkDescarga);
        linkDescarga.click();
        document.body.removeChild(linkDescarga);
        
        mostrarAlerta("¡Re-descarga Exitosa!", "Se descargó una versión antigua del informe (CSV).");
    }
}

// ==========================================
// DETECTOR AUTOMÁTICO DE CONEXIÓN A INTERNET
// ==========================================

// 1. Cuando el celular pierde la conexión (Wi-Fi o Datos)
window.addEventListener('offline', () => {
    document.getElementById('modal-offline').style.display = 'flex';
    
    // Si el celular soporta vibración, tira tres latidos de alerta
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); 
    }
});

// 2. Cuando el celular recupera la conexión
window.addEventListener('online', () => {
    // Cerramos el cartel rojo automáticamente
    document.getElementById('modal-offline').style.display = 'none';
    
    // Y le avisamos con tu alerta inteligente (la del pulgar verde) que todo volvió a la normalidad
    mostrarAlerta("¡Conexión Exitosa!", "Ya tenés internet de nuevo. Volviste a estar conectado a la base de datos.");
});

// ==========================================
// SISTEMA DE CHIPS (FILTROS) EDITABLES
// ==========================================
let chipsActuales = [];
let sortableChips = null; 

// 1. CARGAR CHIPS DESDE LA NUBE
async function cargarChips() {
    const contenedor = document.getElementById("contenedor-chips-dinamicos");
    if (contenedor) contenedor.innerHTML = "<p style='color:#888; font-size:0.8rem; margin-left:15px;'>Cargando filtros...</p>";

    try {
        // Le preguntamos a Supabase cuáles son los chips de este profesor
        const { data: profe, error } = await clienteSupabase
            .from('profesores')
            .select('chips_filtros')
            .eq('id', profeActivoId)
            .single();

        if (error) throw error;

        // Si el profe ya había guardado chips en la nube, los usamos
        if (profe && profe.chips_filtros && profe.chips_filtros.length > 0) {
            chipsActuales = profe.chips_filtros;
        } else {
            // Si es un profe nuevo y la columna está vacía, le damos estos por defecto
            chipsActuales = [
                "Musculación", "Tela", "Funcional", "Calistenia", "Readaptación", 
                "Hyrox", "Crossfit", "Cuota al día", "Vencida", "Con rutina", "Libre"
            ];
        }
        dibujarChipsPrincipales();

    } catch (e) {
        console.error("Error al cargar chips de la nube:", e);
        // Si falla el internet, cargamos los de defecto para que no se rompa la app
        chipsActuales = [
            "Musculación", "Tela", "Funcional", "Calistenia", "Readaptación", 
            "Hyrox", "Crossfit", "Cuota al día", "Vencida", "Con rutina", "Libre"
        ];
        dibujarChipsPrincipales();
    }
}

// 2. VENTANA DE EDICIÓN CON EL MOTOR DE ARRASTRE CORREGIDO
function abrirModalEditarChips() {
    document.getElementById("modal-editar-chips").style.display = "flex";
    const contenedor = document.getElementById("lista-chips-editables");
    contenedor.innerHTML = ""; 
    
    chipsActuales.forEach((chip) => {
        agregarChipFila(chip);
    });

    if (sortableChips) {
        sortableChips.destroy();
    }
    
    sortableChips = new Sortable(contenedor, {
        handle: '.handle-arrastre', // <--- Solo arrastra tocando el ícono, libera el teclado
        animation: 200, 
        ghostClass: "tarjeta-indicador-caida", 
    });
}

// 3. FILA DEL CHIP CON EL ÍCONO "AGARRABLE"
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
        <svg class="handle-arrastre" viewBox="0 0 24 24" width="20" style="color: #666; flex-shrink: 0; cursor: grab;"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
        <input type="text" class="input-modal input-chip-edit" value="${valor}" oninput="this.setAttribute('value', this.value)" placeholder="Ej: Pilates..." style="margin: 0; flex-grow: 1; border: none; background: transparent; padding: 0; cursor: text; outline: none;">
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #e74c3c; cursor: pointer; padding: 5px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
    `;
    
    contenedor.appendChild(div);
    setTimeout(() => { contenedor.scrollTop = contenedor.scrollHeight; }, 10);
}

// 4. GUARDAR CHIPS (EN PANTALLA Y EN SUPABASE)
async function guardarEdicionChips() {
    const inputs = document.querySelectorAll(".input-chip-edit");
    let nuevosChips = [];
    
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) nuevosChips.push(val); 
    });
    
    chipsActuales = nuevosChips;
    
    // Cerramos y dibujamos rápido para no hacer esperar al profe
    document.getElementById("modal-editar-chips").style.display = "none";
    dibujarChipsPrincipales();
    
    const chipTodos = document.querySelector("#contenedor-chips-dinamicos .chip:nth-child(2)");
    if (chipTodos) {
        filtrarPorChip(chipTodos, 'Todos');
    } else {
        if (typeof cargarAlumnos === "function") cargarAlumnos();
    }

    // MANDAMOS LOS DATOS A SUPABASE DE FONDO (Silent Save)
    try {
        await clienteSupabase.from('profesores')
            .update({ chips_filtros: chipsActuales })
            .eq('id', profeActivoId);
    } catch (e) {
        console.error("Error guardando los filtros en la nube:", e);
    }
}

function dibujarChipsPrincipales() {
    const contenedor = document.getElementById("contenedor-chips-dinamicos");
    if (!contenedor) return;
    
    // 1. EL LÁPIZ NARANJA (Siempre primero, nunca se borra)
    let html = `
        <button class="chip" style="padding: 0 12px; border-color: #f39c12; color: #f39c12; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" onclick="abrirModalEditarChips()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
    `;
    
    // 2. BOTÓN "TODOS"
    html += `<button class="chip activo" onclick="filtrarPorChip(this, 'Todos')">Todos</button>`;
    
    // 3. LOS CHIPS PERSONALIZADOS
    chipsActuales.forEach(chip => {
        html += `<button class="chip" onclick="filtrarPorChip(this, '${chip}')">${chip}</button>`;
    });
    
    contenedor.innerHTML = html;
}


// --- FUNCIONES PARA SERIES DINÁMICAS ---

function agregarFilaSerie(idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    const nuevaFila = document.createElement('div');
    nuevaFila.className = 'fila-serie';
    nuevaFila.innerHTML = `
        <span class="numero-serie">-</span>
        <input type="number" class="input-serie-fuerza input-modal" placeholder="% RM">
        <input type="number" class="input-serie-reps input-modal" placeholder="Reps">
        <input type="number" class="input-serie-rir input-modal" placeholder="RIR">
        <button type="button" class="btn-eliminar-serie" onclick="eliminarFilaSerie(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
    `;
    contenedor.appendChild(nuevaFila);
    actualizarNumerosDeSerie(idContenedor);
}

function eliminarFilaSerie(botonEliminar) {
    // Busca en qué contenedor (pack o alumno) estamos trabajando
    const contenedor = botonEliminar.closest('div[id^="contenedor-filas-series"]');
    
    // Evitamos borrar la última fila que queda
    if (contenedor.querySelectorAll('.fila-serie').length > 1) {
        const fila = botonEliminar.closest('.fila-serie');
        fila.remove();
        actualizarNumerosDeSerie(contenedor.id);
    } else {
        alert("El ejercicio debe tener al menos 1 serie.");
    }
}

function actualizarNumerosDeSerie(idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    const filas = contenedor.querySelectorAll('.fila-serie');
    
    // Recorremos las filas de arriba a abajo y les ponemos el número correcto
    filas.forEach((fila, index) => {
        fila.querySelector('.numero-serie').textContent = index + 1;
    });
}


function abrirModalTerminos() {
    document.getElementById("modal-terminos").style.display = "flex";
}

function cerrarModalTerminos() {
    document.getElementById("modal-terminos").style.display = "none";
}

// Animación para abrir/cerrar un bloque
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

// Ventana emergente "Los que ya tenés"
async function abrirListaSubbloques() {
    inputDestinoEjercicio = 'input-ej-subbloque';
    const contenedor = document.getElementById("contenedor-botones-ejercicios");
    contenedor.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>Buscando tus bloques...</p>";
    document.getElementById("modal-lista-ejercicios").style.display = "flex";

    try {
        const { data, error } = await clienteSupabase.from('rutinas_planificadas')
            .select('sub_bloque').eq('alumno_id', alumnoSeleccionadoId).not('sub_bloque', 'is', null);

        if (error) throw error;
        const unicos = [...new Set(data.map(item => item.sub_bloque))]; // Filtramos los repetidos

        contenedor.innerHTML = "";
        if (unicos.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#888; margin-top:20px;'>Aún no creaste sub-bloques.</p>";
        } else {
            unicos.forEach(sb => {
                const btn = document.createElement("button");
                btn.style.cssText = "display: block; width: 100%; text-align: left; padding: 14px 15px; margin-bottom: 8px; border-radius: 10px; font-size: 1.05rem; background: #2c3e50; color: #fff; border: 1px solid #34495e; cursor: pointer; transition: 0.2s; word-break: break-word; line-height: 1.2;";
                btn.innerText = sb;
                // Reutilizamos tu función perfecta que inyecta el texto
                btn.onclick = () => seleccionarEjercicioDesdeLista(sb); 
                contenedor.appendChild(btn);
            });
        }
    } catch (e) {
        contenedor.innerHTML = "<p style='text-align:center; color:#e74c3c;'>Error al buscar.</p>";
    }
}