
let fotoEditProfeElegida = ""; 
let archivoEditFotoProfeBlob = null; 
let fotoProfeElegida = "imagenes/PERFIL1.webp";
let archivoFotoProfeBlob = null;


async function iniciarSesion() {
    const passIngresada = document.getElementById("login-password").value.trim();
    const confirmarPass = document.getElementById("login-confirmar-password").value.trim();
    const checkboxTyC = document.getElementById("checkbox-tyc").checked; 

    if (!checkboxTyC) {
        mostrarAlerta("Atención", "Debés aceptar los Términos y Condiciones."); return;
    }
    if (!passIngresada) {
        mostrarAlerta("Atención", "Ingresá una contraseña."); return;
    }

    if (AppState.esProfeNuevoLogin) {

        if (passIngresada !== confirmarPass) {
            mostrarAlerta("Atención", "Las contraseñas no coinciden. Revisalas."); return;
        }
    }

    const btnIniciar = document.getElementById("btn-iniciar-sesion");
    if (btnIniciar.disabled) return;
    const textoOriginal = btnIniciar.innerText;
    btnIniciar.disabled = true;
    btnIniciar.innerText = "Conectando...";

    try {
        if (AppState.esProfeNuevoLogin) {
            const { error: errorSignUp } = await clienteSupabase.auth.signUp({
                email: AppState.emailProfePendiente,
                password: passIngresada,
            });

            if (errorSignUp) {
                btnIniciar.disabled = false;
                btnIniciar.innerText = textoOriginal;
                

                let mensajeError = errorSignUp.message;
                if (mensajeError.includes("least 6 characters")) mensajeError = "La contraseña es muy débil. El servidor exige al menos 6 caracteres.";
                mostrarAlerta("Error en la contraseña", mensajeError);
                return;
            }

            await clienteSupabase.from('profesores')
                .update({ email_auth: AppState.emailProfePendiente })
                .eq('id', AppState.idProfePendiente);

        } else {
            const { error } = await clienteSupabase.auth.signInWithPassword({
                email: AppState.emailProfePendiente,
                password: passIngresada,
            });

            if (error) {
                btnIniciar.disabled = false;
                btnIniciar.innerText = textoOriginal;
                document.getElementById("modal-error-login").style.display = "flex";
                return;
            }
        }
        
        AppState.profeActivoId = AppState.idProfePendiente;
        document.getElementById("nombre-profe-activo").innerText = "Profe " + AppState.nombreProfePendiente;

        const { data: datosProfe } = await clienteSupabase
            .from('profesores')
            .select('es_admin')
            .eq('id', AppState.profeActivoId)
            .single();
        
        AppState.esAdminActual = datosProfe ? datosProfe.es_admin : false;

        document.querySelectorAll('.nav-admin-only').forEach(btn => {
            btn.style.display = AppState.esAdminActual ? 'flex' : 'none';
        });

        localStorage.setItem('sesionGimnasioID', AppState.profeActivoId);
        localStorage.setItem('sesionGimnasioNombre', AppState.nombreProfePendiente);
        localStorage.setItem('sesionGimnasioApellido', AppState.apellidoProfePendiente);

        navegarA('pantalla-dashboard', 'block');
       
        document.getElementById("login-password").value = ""; 
        document.getElementById("login-confirmar-password").value = ""; 
        btnIniciar.disabled = false;
        btnIniciar.innerText = textoOriginal;

        cargarAlumnos(); 
        cargarChips();
        actualizarMenuInferior('alumnos');

        if (AppState.esProfeNuevoLogin) {
            setTimeout(() => {
                mostrarAlerta("¡Creación Exitosa!", "Tu contraseña fue guardada con éxito. ¡Bienvenido a tu panel!");
            }, 500);
        }

    } catch (err) {
        console.error(err);
        btnIniciar.disabled = false;
        btnIniciar.innerText = textoOriginal;
        document.getElementById("modal-error-login").style.display = "flex";
    }
}

async function cerrarSesion() {
    await clienteSupabase.auth.signOut(); 
    
    localStorage.removeItem('sesionGimnasioID');
    localStorage.removeItem('sesionGimnasioNombre');
    localStorage.removeItem('sesionGimnasioApellido');
    localStorage.removeItem('sesionGimnasio'); 
    
    AppState.profeActivoId = null;
    navegarA('pantalla-perfiles', 'flex');

    cargarProfesores();
}


async function cargarProfesores() {
    const contenedor = document.getElementById("grilla-profesores");
    contenedor.innerHTML = "<p>Cargando...</p>"; 

    try {
        const { data: profesores, error } = await clienteSupabase
            .from('profesores') 
            .select('*')
            .order('creado_en', { ascending: true }); 

        if (error) throw error;
        
        let htmlFinal = ""; 
        
        profesores.forEach(profe => {
            const foto = profe.foto_url || "imagenes/PERFIL2.webp"; 
            const emailAuth = profe.email_auth || ""; 
            

            const nombreSeguro = escaparHTML(profe.nombre);
            const apellidoSeguro = escaparHTML(profe.apellido);
            const idSeguro = escaparHTML(profe.id);
            
            htmlFinal += `
                <div class="tarjeta-perfil-moderna" onclick="entrarPerfil('${idSeguro}', '${nombreSeguro}', '${apellidoSeguro}', '${emailAuth}')">
                    <img src="${foto}" class="avatar-profe" onerror="this.src='imagenes/PERFIL1.webp'">
                    <p>${nombreSeguro} ${apellidoSeguro}</p>
                </div>
            `;
        });
        
        contenedor.innerHTML = htmlFinal;

    } catch (error) {
        console.error("Error al cargar profesores:", error.message);
    }
}

function abrirModalProfe() {
    document.getElementById("modal-profe").style.display = "flex";
    
    document.getElementById("input-profe-nombre").value = "";
    document.getElementById("select-profe-avatar").value = "imagenes/PERFIL1.webp";
    document.getElementById("input-foto-profe").value = ""; 
    
    fotoProfeElegida = "imagenes/PERFIL1.webp";
    document.getElementById("img-preview-profe").src = fotoProfeElegida;
}

function cambiarPreviewAvatar() {
    fotoProfeElegida = document.getElementById("select-profe-avatar").value;
    document.getElementById("img-preview-profe").src = fotoProfeElegida;
    document.getElementById("input-foto-profe").value = "";  
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
            
            canvas.toBlob((blob) => {
                archivoFotoProfeBlob = blob; 
                
                fotoProfeElegida = URL.createObjectURL(blob); 
                document.getElementById("img-preview-profe").src = fotoProfeElegida;
                document.getElementById("select-profe-avatar").value = ""; 
            }, "image/jpeg", 0.7);
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

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
        let urlFinalParaBaseDeDatos = fotoProfeElegida; 

        if (archivoFotoProfeBlob) {
            const nombreArchivo = `profe_${Date.now()}.jpg`;
            
            const { error: errStorage } = await clienteSupabase.storage
                .from('avatares')
                .upload(nombreArchivo, archivoFotoProfeBlob, { contentType: 'image/jpeg' });

            if (errStorage) throw errStorage;

            const { data: publicUrlData } = clienteSupabase.storage
                .from('avatares')
                .getPublicUrl(nombreArchivo);
                
            urlFinalParaBaseDeDatos = publicUrlData.publicUrl; 
        }

        const { error } = await clienteSupabase.from('profesores').insert([{ 
            nombre: nombre, 
            apellido: apellido, 
            foto_url: urlFinalParaBaseDeDatos 
        }]); 
        
        if (error) throw error;

        archivoFotoProfeBlob = null; 
        
        toggleModal('modal-profe', false);
        cargarProfesores(); 
        mostrarAlerta("¡Registro Exitoso!", "El perfil del profesor se creó correctamente.");

    } catch (error) {
        mostrarAlerta("Error al guardar el profesor", error.message);
    }
}

function entrarPerfil(id, nombre, apellido, emailAuth) {
    AppState.idProfePendiente = id;
    AppState.nombreProfePendiente = nombre;
    AppState.apellidoProfePendiente = apellido;

    if (!emailAuth || emailAuth === "null" || emailAuth === "") {
        AppState.esProfeNuevoLogin = true;
        AppState.emailProfePendiente = id + "@gym.com"; 
    } else {
        AppState.esProfeNuevoLogin = false;
        AppState.emailProfePendiente = emailAuth;
    }

    navegarA('pantalla-login', 'flex');

    document.getElementById("login-password").value = "";
    document.getElementById("login-confirmar-password").value = "";
    document.getElementById("checkbox-tyc").checked = false;

    const tituloMain = document.getElementById("titulo-principal");
    const saludo = document.getElementById("saludo-dinamico");
    const subtitulo = document.getElementById("subtitulo-dinamico");
    const cajaConfirmar = document.getElementById("caja-confirmar-pass");
    const btnIniciar = document.getElementById("btn-iniciar-sesion");

    if (saludo) saludo.innerText = "Hola, " + nombre;

    if (AppState.esProfeNuevoLogin) {
        if (tituloMain) tituloMain.innerText = "¿SOS NUEVO?";
        if (subtitulo) subtitulo.innerText = "Creá una contraseña para tu cuenta.";
        
        cajaConfirmar.style.display = "flex"; 
        btnIniciar.innerText = "Crear cuenta y Entrar";
    } else {
        if (tituloMain) tituloMain.innerText = "APP PARA PROFESORES";
        if (subtitulo) subtitulo.innerText = "Ingresá tu contraseña para continuar.";
        
        cajaConfirmar.style.display = "none"; 
        btnIniciar.innerText = "Iniciar sesión";
    }

}


async function editarProfe() {
    try {
        const { data: profe, error } = await clienteSupabase
            .from('profesores')
            .select('nombre, apellido, foto_url') 
            .eq('id', AppState.profeActivoId)
            .single();
        
        if (error) throw error;

        document.getElementById("input-edit-nombre").value = profe.nombre || "";
        document.getElementById("input-edit-apellido").value = profe.apellido || ""; 
        
        fotoEditProfeElegida = profe.foto_url || "imagenes/PERFIL1.webp";
        document.getElementById("img-preview-edit-profe").src = fotoEditProfeElegida;
        
        document.getElementById("select-edit-profe-avatar").value = "";
        document.getElementById("input-foto-edit-profe").value = "";

        document.getElementById("modal-editar-profe").style.display = "flex";
        
    } catch (error) {
        mostrarAlerta("Error al cargar los datos del perfil: " + error.message);
    }
}

function cambiarPreviewEditAvatar() {
    const avatarElegido = document.getElementById("select-edit-profe-avatar").value;
    if (avatarElegido) {
        fotoEditProfeElegida = avatarElegido;
        document.getElementById("img-preview-edit-profe").src = fotoEditProfeElegida;
        document.getElementById("input-foto-edit-profe").value = "";
    }
}

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
            .eq('id', AppState.profeActivoId);
        
        if (error) throw error;

        archivoEditFotoProfeBlob = null; 

        toggleModal('modal-editar-profe', false);
        document.getElementById("nombre-profe-activo").innerText = "Profe " + nuevoNombre;
        
        cargarProfesores(); 

    } catch (e) { 
        mostrarAlerta("Error al actualizar", e.message); 
        console.error(e);
    }
}

function abrirModalCambiarPassword() {
    document.getElementById("modal-editar-profe").style.display = "none";
    
    document.getElementById("input-nueva-pass").value = "";
    document.getElementById("input-confirmar-pass").value = "";
    
    document.getElementById("modal-cambiar-password").style.display = "flex";
}

async function guardarNuevaPassword() {
    const nuevaPass = document.getElementById("input-nueva-pass").value.trim();
    const confirmarPass = document.getElementById("input-confirmar-pass").value.trim();

    if (!nuevaPass || !confirmarPass) {
        mostrarAlerta("Atención", "Por favor, completá ambas cajas.");
        return;
    }

    if (nuevaPass !== confirmarPass) {
        mostrarAlerta("Atención", "Las contraseñas no coinciden. Verificalas.");
        return;
    }

    const btn = document.getElementById("btn-guardar-pass");
    const textoOriginal = btn.innerText;
    btn.innerText = "Guardando...";

    try {
        const { data, error } = await clienteSupabase.auth.updateUser({
            password: nuevaPass
        });

        btn.innerText = textoOriginal;


        if (error) throw error;

        toggleModal('modal-cambiar-password', false);
        mostrarAlerta("¡Éxito!", "Tu contraseña fue actualizada correctamente. Ya podés usarla la próxima vez que entres.");

    } catch (e) {
        btn.innerText = textoOriginal;
        console.error(e);
        
        let mensajeError = e.message;
        if (mensajeError.includes("least 6 characters")) mensajeError = "El servidor exige que tenga al menos 6 caracteres.";
        if (mensajeError.includes("same as the old")) mensajeError = "La nueva contraseña debe ser diferente a la actual.";
        
        mostrarAlerta("Error al actualizar", mensajeError);
    }
}

function alternarPassword() {
    const inputPass = document.getElementById("login-password");
    
    if (inputPass.type === "password") {
        inputPass.type = "text"; 
    } else {
        inputPass.type = "password"; 
    }
}

function alternarVisibilidadPass(idInput) {
    const input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text"; 
    } else {
        input.type = "password"; 
    }
}




window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.cargarProfesores = cargarProfesores;
window.abrirModalProfe = abrirModalProfe;
window.cambiarPreviewAvatar = cambiarPreviewAvatar;
window.procesarFotoSubida = procesarFotoSubida;
window.guardarProfeEnBD = guardarProfeEnBD;
window.entrarPerfil = entrarPerfil;
window.editarProfe = editarProfe;
window.cambiarPreviewEditAvatar = cambiarPreviewEditAvatar;
window.procesarFotoEditSubida = procesarFotoEditSubida;
window.guardarEdicionProfe = guardarEdicionProfe;
window.abrirModalCambiarPassword = abrirModalCambiarPassword;
window.guardarNuevaPassword = guardarNuevaPassword;
window.alternarPassword = alternarPassword;
window.alternarVisibilidadPass = alternarVisibilidadPass;