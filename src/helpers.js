
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatearMiles(input) {
    let valorStr = input.value.replace(/\D/g, "");
    if (valorStr !== "") {
        input.value = parseInt(valorStr).toLocaleString('es-AR');
    } else {
        input.value = "";
    }
}

function parsearTiempoAsegundos(texto) {
    if (!texto) return 0;
    texto = texto.toString().trim();
    if (texto === "") return 0;
    if (texto.includes(':')) {
        let partes = texto.split(':').map(Number);
        if (partes.length === 2) return (isNaN(partes[0]) ? 0 : partes[0] * 60) + (isNaN(partes[1]) ? 0 : partes[1]);
        else if (partes.length === 3) return (isNaN(partes[0]) ? 0 : partes[0] * 3600) + (isNaN(partes[1]) ? 0 : partes[1] * 60) + (isNaN(partes[2]) ? 0 : partes[2]);
    }
    let num = parseFloat(texto);
    return isNaN(num) ? 0 : num * 60;
}

function formatearTiempo(segundosTotales) {
    const h = Math.floor(segundosTotales / 3600);
    const m = Math.floor((segundosTotales % 3600) / 60).toString().padStart(2, '0');
    const s = (Math.floor(segundosTotales) % 60).toString().padStart(2, '0');
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
}




function formatearDescansoVisual(descansoStr) {
    if (!descansoStr || descansoStr === 'null' || descansoStr === 'undefined') return "-";
    

    if (!descansoStr.includes('_SEG:')) return descansoStr;

    let prep = 0, entreno = 0, desc = 0;

    const partes = descansoStr.split('|');
    partes.forEach(p => {
        if (p.startsWith('PREP_SEG:')) prep = parseInt(p.split(':')[1]) || 0;
        

        if (p.startsWith('EMOM_SEG:') || p.startsWith('AMRAP_SEG:') || p.startsWith('TABATA_SEG:') || p.startsWith('TIMECAP_SEG:')) {
            entreno = parseInt(p.split(':')[1]) || 0;
        }
        
        if (p.startsWith('DESC_SEG:')) desc = parseInt(p.split(':')[1]) || 0;
    });


    const fTime = (segs) => {
        const m = Math.floor(segs / 60).toString().padStart(2, '0');
        const s = (segs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return `Prep: ${fTime(prep)} | Entreno: ${fTime(entreno)} | Desc: ${fTime(desc)}`;
}

function obtenerAliasPipe(nombreOficial) {
    if (!nombreOficial) return "";
    const oficialNorm = normalizarTexto(nombreOficial.trim());
    const nombreCanonico = aliasEjercicios[oficialNorm] || oficialNorm;
    
    let aliasesEncontrados = [];
    if (nombreCanonico !== oficialNorm) aliasesEncontrados.push(nombreCanonico);
    
    for (const [alias, canonico] of Object.entries(aliasEjercicios)) {
        if (canonico === nombreCanonico && alias !== oficialNorm && alias !== nombreCanonico) {
            aliasesEncontrados.push(alias);
        }
    }
    
    if (aliasesEncontrados.length === 0) return "";
    return aliasesEncontrados.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(" | ");
}

function obtenerAnimacionHTML(nombreEj) {
    if (!nombreEj) return `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
    
    const clave = normalizarTexto(nombreEj.trim());
    const nombreOficial = aliasEjercicios[clave] || clave;
    const frames = mapaAnimaciones[nombreOficial];

    if (frames) {
        // Vite nos da la ruta base exacta ('/app-gimnasio-183/')
        const base = import.meta.env.BASE_URL;
        
        // Limpiamos los puntitos iniciales y le pegamos la base de Vite
        const img1 = base + frames[0].replace(/^\.\/?/, '');
        const img2 = base + frames[1].replace(/^\.\/?/, '');
        
        return `<div class="anim-dinamica" style="--img-1: url('${img1}'); --img-2: url('${img2}'); cursor: zoom-in;" onclick="abrirImagenFullscreenDirecto(this, event)"></div>`;
    }

    return `<div style="width: 40px; height: 40px; background: #f0f0f0; border-radius: 8px; flex-shrink: 0;"></div>`;
}

function obtenerListaAliasString(nombreOficial) {
    if (!nombreOficial) return "";
    const oficialNorm = normalizarTexto(nombreOficial.trim());
    
    const nombreCanonico = aliasEjercicios[oficialNorm] || oficialNorm;
    
    let nombresRelacionados = [];

    if (nombreCanonico !== oficialNorm) {
        nombresRelacionados.push(nombreCanonico);
    }

    for (const [alias, canonico] of Object.entries(aliasEjercicios)) {
        if (canonico === nombreCanonico && alias !== oficialNorm && alias !== nombreCanonico) {
            nombresRelacionados.push(alias);
        }
    }

    nombresRelacionados = nombresRelacionados.map(nombre => 
        nombre.charAt(0).toUpperCase() + nombre.slice(1)
    );

    return nombresRelacionados.length > 0 
        ? "También conocido como: " + nombresRelacionados.join(", ") 
        : "Sin alias adicionales registrados.";
}


function formatearFechaSegura(fechaIn) {

    if (!fechaIn) return '--/--/----';

    try {

        const fechaValida = fechaIn.includes('T') ? fechaIn : `${fechaIn}T00:00:00`;
        const dateObj = new Date(fechaValida);


        if (isNaN(dateObj.getTime())) return '--/--/----';


        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);

    } catch (error) {

        console.warn("Dato de fecha inesperado:", fechaIn);
        return '--/--/----';
    }
}


function escaparHTML(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



window.normalizarTexto = normalizarTexto;
window.formatearMiles = formatearMiles;
window.parsearTiempoAsegundos = parsearTiempoAsegundos;
window.formatearTiempo = formatearTiempo;
window.formatearDescansoVisual = formatearDescansoVisual;
window.obtenerAliasPipe = obtenerAliasPipe;
window.obtenerAnimacionHTML = obtenerAnimacionHTML;
window.obtenerListaAliasString = obtenerListaAliasString;
window.formatearFechaSegura = formatearFechaSegura;
window.escaparHTML = escaparHTML;