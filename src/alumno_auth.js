import { clienteSupabase } from './config.js';

export async function iniciarSesionAlumno() {
    const dniInput = document.getElementById("login-dni-alumno").value.trim();
    
    if (!dniInput) {
        mostrarAlerta("Atención", "Por favor, ingresá tu documento.");
        return;
    }

    const btnContinuar = document.getElementById("btn-continuar-alumno");
    const txtOriginal = btnContinuar.innerText;
    btnContinuar.innerText = "BUSCANDO...";
    btnContinuar.disabled = true;

    try {
        // Buscamos al alumno por DNI en Supabase
        const { data: alumno, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('dni', dniInput)
            .single();

        if (error || !alumno) {
            mostrarAlerta("No encontrado", "No encontramos un alumno con ese documento. Consultá con tu profe.");
            return;
        }

        // Si lo encuentra, guardamos sus datos en el estado y en LocalStorage
        AppState.alumnoLogueadoId = alumno.id;
        AppState.alumnoLogueadoData = alumno;
        localStorage.setItem('sesionAlumnoDNI', dniInput);

        const modalidadDB = alumno.tipo_rutina; 
        
        // Si ya tiene modalidad asignada por el profe, saltamos a la pantalla 3 (Empezar)
        if (modalidadDB) {
            prepararPantallaEmpezar(alumno.nombre, modalidadDB);
            navegarA('pantalla-empezar-alumno', 'flex');
        } else {
            // Si por alguna razón no tiene, lo llevamos a la pantalla 2 para que elija
            navegarA('pantalla-modalidad-alumno', 'flex');
        }

    } catch (e) {
        console.error(e);
        mostrarAlerta("Error", "Error al conectar con la base de datos.");
    } finally {
        btnContinuar.innerText = txtOriginal;
        btnContinuar.disabled = false;
    }
}

export function seleccionarModalidadAlumno(tipo) {
    AppState.alumnoLogueadoData.tipo_rutina = tipo;
    prepararPantallaEmpezar(AppState.alumnoLogueadoData.nombre, tipo);
    navegarA('pantalla-empezar-alumno', 'flex');
}

export function prepararPantallaEmpezar(nombre, modalidad) {
    const textoModalidad = modalidad === 'Libre' ? 'ALUMNO LIBRE' : 'ALUMNO CON PROFE';
    const label = document.getElementById("label-alumno-modalidad");
    if (label) {
        label.innerText = `${nombre} — ${textoModalidad}`;
    }
}

export function empezarEntrenamientoAlumno() {
    const pantallaEmpezar = document.getElementById('pantalla-empezar-alumno');
    const pantallaDashboard = document.getElementById('pantalla-dashboard-alumno');
    const menuInferior = document.getElementById('menu-inferior-alumno');

    // 1. Cargamos el saludo con el nombre real
    const nombre = AppState.alumnoLogueadoData ? AppState.alumnoLogueadoData.nombre : "Atleta";
    document.getElementById('titulo-hola-alumno').innerText = `¡Hola, ${nombre}!`;

    // 2. Nos aseguramos de que el menú del profesor esté oculto
    const menuProfe = document.getElementById('menu-inferior-global');
    if (menuProfe) menuProfe.style.display = 'none';

    // 3. Mostramos las nuevas pantallas y le agregamos la clase de animación
    pantallaDashboard.style.display = 'block';
    pantallaDashboard.classList.add('animacion-deslizar-arriba');
    
    menuInferior.style.display = 'flex';
    menuInferior.classList.add('animacion-deslizar-arriba');

    // 4. Ocultamos la pantalla "Empezar" por debajo una vez que la animación termina
    setTimeout(() => {
        pantallaEmpezar.style.display = 'none';
        pantallaDashboard.classList.remove('animacion-deslizar-arriba');
        menuInferior.classList.remove('animacion-deslizar-arriba');
    }, 500);
}

export function cerrarSesionAlumno() {
    pedirConfirmacion("Cerrar Sesión", "¿Querés salir de tu cuenta de alumno?", "Salir", () => {
        AppState.alumnoLogueadoId = null;
        AppState.alumnoLogueadoData = null;
        localStorage.removeItem('sesionAlumnoDNI');
        document.getElementById("login-dni-alumno").value = "";
        navegarA('pantalla-inicio', 'flex');
    });
}

// Función de auto-login para no pedirle el DNI de nuevo si ya entró antes
export async function autoLoginAlumno(dni) {
    try {
        const { data: alumno, error } = await clienteSupabase
            .from('alumnos')
            .select('*')
            .eq('dni', dni)
            .single();

        if (error || !alumno) {
            localStorage.removeItem('sesionAlumnoDNI');
            document.getElementById("pantalla-inicio").style.display = "flex";
            return;
        }

        AppState.alumnoLogueadoId = alumno.id;
        AppState.alumnoLogueadoData = alumno;

        // Va directo a la Pantalla 3 siempre
        prepararPantallaEmpezar(alumno.nombre, alumno.tipo_rutina || "Con rutina");
        navegarA('pantalla-empezar-alumno', 'flex');

    } catch (e) {
        console.error(e);
        document.getElementById("pantalla-inicio").style.display = "flex";
    }
}

window.iniciarSesionAlumno = iniciarSesionAlumno;
window.seleccionarModalidadAlumno = seleccionarModalidadAlumno;
window.empezarEntrenamientoAlumno = empezarEntrenamientoAlumno;
window.cerrarSesionAlumno = cerrarSesionAlumno;
window.autoLoginAlumno = autoLoginAlumno;