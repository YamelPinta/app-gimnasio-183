let datosAdminActualParaExcel = null;
let porcentajeEditando = { tipo: null, id: null, nombre: null };


function abrirPantallaInforme() {

    navegarA('pantalla-admin', 'flex');
    actualizarMenuInferior('informe');
    

    setTimeout(() => {
        cambiarVistaAdmin('actual');
        cargarPanelAdmin();
    }, 50);
}


async function cargarPanelAdmin() {
    const contenedor = document.getElementById("contenedor-admin-columnas");
    
    contenedor.style.display = "block"; 
    contenedor.style.overflowY = "auto";
    contenedor.classList.add("ocultar-scrollbar");
    
    contenedor.innerHTML = `<p class='text-center w-100 pt-20 text-muted'>Calculando finanzas de forma segura...</p>`;
    
    try {
        const { data: informe, error } = await clienteSupabase.rpc('obtener_informe_gym');
        if (error) throw error;

        datosAdminActualParaExcel = informe;
        contenedor.innerHTML = ""; 

        if (!informe.profesores || informe.profesores.length === 0) {
            contenedor.innerHTML = "<p class='text-center w-100 text-muted'>No hay profesores registrados.</p>";
            return;
        }

        const tmplProfe = document.getElementById('tmpl-admin-profe');
        const tmplAlumnoRow = document.getElementById('tmpl-admin-alumno-row');

        informe.profesores.forEach(profe => {
            let conteoCat = {};
            let totalBrutoProfesor = 0;
            
            const cloneProfe = tmplProfe.content.cloneNode(true);
            const tbodyAlumnos = cloneProfe.querySelector('.tmpl-tbody');

            if (profe.alumnos.length === 0) {
                tbodyAlumnos.innerHTML = "<tr><td colspan='3' class='text-center p-15 fs-80'>Sin alumnos asignados</td></tr>";
            } else {
                profe.alumnos.forEach(a => {
                    conteoCat[a.actividad] = (conteoCat[a.actividad] || 0) + 1;
                    totalBrutoProfesor += (a.cuota || 0);
                    
                    const cloneAlum = tmplAlumnoRow.content.cloneNode(true);
                    
                    cloneAlum.querySelector('.tmpl-al-nombre').textContent = `${a.nombre} ${a.apellido}`;
                    cloneAlum.querySelector('.tmpl-al-act').textContent = a.actividad;
                    


                    cloneAlum.querySelector('.tmpl-al-cuota-full').textContent = `$${(a.cuota || 0).toLocaleString('es-AR')}`;
                    cloneAlum.querySelector('.tmpl-al-porc').textContent = `(${a.porcentaje_aplicado}%)`;
                    cloneAlum.querySelector('.tmpl-al-aporte').textContent = `$${a.aporte_gym.toLocaleString('es-AR')}`;

                    cloneAlum.querySelector('.tmpl-al-btn-porc').onclick = (e) => {
                        e.stopPropagation();
                        abrirModalPorcentaje('alumno', a.id, a.nombre, a.porcentaje_excepcion !== null ? a.porcentaje_excepcion : null);
                    };
                    
                    tbodyAlumnos.appendChild(cloneAlum);
                });
            }

            let strCategorias = Object.entries(conteoCat).map(([c, v]) => `${c}: ${v}`).join(' | ');
            cloneProfe.querySelector('.tmpl-nombre').textContent = `${profe.nombre} ${profe.apellido}`;
            cloneProfe.querySelector('.tmpl-stats').textContent = `${profe.alumnos.length} alumnos | ${strCategorias || "Sin alumnos"}`;
            

            cloneProfe.querySelector('.tmpl-total').innerHTML = `<span style="font-size:0.75rem; color:#888;">Gym:</span> $${profe.total_gym_profe.toLocaleString('es-AR')}`;
            cloneProfe.querySelector('.tmpl-total-profe').innerHTML = `<span style="color:#888;">Total Profe:</span> $${totalBrutoProfesor.toLocaleString('es-AR')}`;

            cloneProfe.querySelector('.tmpl-porc-texto').textContent = profe.porcentaje_base;

            const header = cloneProfe.querySelector('.tmpl-header');
            const tabla = cloneProfe.querySelector('.tmpl-tabla-contenedor');
            const flecha = cloneProfe.querySelector('.tmpl-flecha');
            
            header.onclick = () => {
                if (tabla.style.display === "none" || tabla.style.display === "") {
                    tabla.style.display = "block";
                    flecha.style.transform = "rotate(180deg)"; 
                } else {
                    tabla.style.display = "none";
                    flecha.style.transform = "rotate(0deg)"; 
                }
            };

            cloneProfe.querySelector('.tmpl-btn-porc').onclick = (e) => {
                e.stopPropagation();
                abrirModalPorcentaje('profe', profe.id, profe.nombre, profe.porcentaje_base);
            };

            cloneProfe.querySelector('.tmpl-btn-borrar').onclick = (e) => {
                e.stopPropagation();
                darDeBajaProfe(profe.id);
            };

            contenedor.appendChild(cloneProfe);
        });
        

        const cajaGranTotal = document.getElementById("monto-gran-total").parentElement;
        cajaGranTotal.removeAttribute("style"); 
        cajaGranTotal.className = "caja-gran-total-dinamica"; 
        
        const tituloTotal = cajaGranTotal.querySelector("h3");
        tituloTotal.removeAttribute("style"); 
        tituloTotal.innerText = "Recaudación Total (Gym)";
        
        const monto = document.getElementById("monto-gran-total");
        monto.removeAttribute("style");
        monto.innerText = `$${informe.gran_total.toLocaleString('es-AR')}`;
        
    } catch (e) {
        console.error("Error de seguridad o de red:", e);
        contenedor.innerHTML = "<p class='text-danger text-center'>Error al calcular las finanzas. Permisos insuficientes.</p>";
    }
}

function abrirModalPorcentaje(tipo, id, nombre, porcentajeActual) {
    porcentajeEditando = { tipo, id, nombre };
    
    document.getElementById("titulo-modal-porcentaje").innerText = tipo === 'profe' ? "Porcentaje del Profesor" : "Porcentaje del Alumno";
    
    let texto = tipo === 'profe' 
        ? `Porcentaje base para los alumnos de ${nombre}.` 
        : `Excepción para ${nombre}.\n(Dejá la caja vacía para que use el porcentaje base de su profesor).`;
    document.getElementById("texto-modal-porcentaje").innerText = texto;
    
    document.getElementById("input-modal-porcentaje").value = porcentajeActual !== null && porcentajeActual !== undefined ? porcentajeActual : "";
    
    document.getElementById("modal-porcentaje").style.display = "flex";
}

async function guardarPorcentajeBD() {
    const inputVal = document.getElementById("input-modal-porcentaje").value.trim();
    let valorAEscribir = null;

    if (inputVal !== "") {
        const valorFijo = parseInt(inputVal);
        if (!isNaN(valorFijo) && valorFijo >= 0 && valorFijo <= 100) {
            valorAEscribir = valorFijo;
        } else {
            mostrarAlerta("Atención", "Ingresá un número válido entre 0 y 100.");
            return;
        }
    } else if (porcentajeEditando.tipo === 'profe') {
        mostrarAlerta("Atención", "El profesor debe tener un porcentaje base asignado (ej: 30).");
        return;
    }

    try {
        const tabla = porcentajeEditando.tipo === 'profe' ? 'profesores' : 'alumnos';
        
        const nombreGuardado = porcentajeEditando.nombre;
        
        const { error } = await clienteSupabase
            .from(tabla)
            .update({ porcentaje_gym: valorAEscribir })
            .eq('id', porcentajeEditando.id);
            
        if (error) throw error;
        
        toggleModal('modal-porcentaje', false); 
        cargarPanelAdmin(); 
        
        if (valorAEscribir !== null) {
            mostrarAlerta("¡Éxito!", `El porcentaje para ${nombreGuardado} ahora es del ${valorAEscribir}%.`);
        } else {
            mostrarAlerta("¡Éxito!", `El alumno ${nombreGuardado} volvió a usar la base del profesor.`);
        }
        
    } catch (e) {
        mostrarAlerta("Error", "No se pudo cambiar el porcentaje.");
    }
}


function darDeBajaProfe(idAEliminar) {
    pedirConfirmacion(
        "Eliminar Profesor",
        "Se borrará permanentemente este profesor. Sus alumnos quedarán libres (sin profesor asignado) para ser reasignados en el futuro.",
        "Eliminar definitivamente",
        async () => {
            try {

                const { error } = await clienteSupabase.from('profesores').delete().eq('id', idAEliminar);
                if (error) throw error;
               
                cargarPanelAdmin();
                cargarProfesores(); 
                
            } catch (e) { mostrarAlerta("Error al dar de baja: " + e.message); }
        }
    );
}

function descargarExcelAdmin() {
    if (!datosAdminActualParaExcel || datosAdminActualParaExcel.profesores.length === 0) {
        mostrarAlerta("Sin datos", "No hay información para generar el reporte.");
        return;
    }


    setTimeout(() => {
        const fechaEmision = new Date().toLocaleDateString('es-AR');
        const horaEmision = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        let matrizExcel = [];
        matrizExcel.push(["INFORME GLOBAL DE PROFESORES Y GIMNASIO"]);
        matrizExcel.push(["Fecha de emisión:", fechaEmision, "Hora:", horaEmision]);
        matrizExcel.push([]);
        matrizExcel.push(["RECAUDACIÓN TOTAL DEL GIMNASIO:", `$${datosAdminActualParaExcel.gran_total.toLocaleString('es-AR')}`]);
        matrizExcel.push([]);

        datosAdminActualParaExcel.profesores.forEach(profe => {
            let conteoCat = {};
            profe.alumnos.forEach(a => conteoCat[a.actividad] = (conteoCat[a.actividad] || 0) + 1);
            let strCategorias = Object.entries(conteoCat).map(([c, v]) => `${c}: ${v}`).join(' | ');

            matrizExcel.push(["PROFESOR:", profe.nombre]);
            matrizExcel.push(["Total Alumnos:", profe.alumnos.length, `Recaudación Gym (Base ${profe.porcentaje_base}%):`, `$${profe.total_gym_profe.toLocaleString('es-AR')}`]);
            matrizExcel.push(["Desglose por Categoría:", strCategorias]);
            matrizExcel.push([]); 
            
            matrizExcel.push(["Nombre Alumno", "Categoría", "Cuota Total", `Aporte al Gym`]);
            
            profe.alumnos.forEach(a => {
                matrizExcel.push([
                    `${a.nombre} ${a.apellido}`,
                    a.actividad,
                    `$${a.cuota.toLocaleString('es-AR')}`,
                    `$${a.aporte_gym.toLocaleString('es-AR')} (${a.porcentaje_aplicado}%)` 
                ]);
            });
            
            matrizExcel.push([]); 
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
    }, 50);
}

function abrirModalInformeProfe() {

    document.getElementById("modal-informe-profe").style.display = "flex";
    

    setTimeout(() => {
        cambiarVistaInforme('actual'); 
        cargarDatosParaInforme();
    }, 50);
}

let timeoutVistaInforme = null;

function cambiarVistaInforme(vista) {
    const track = document.getElementById("track-informe");
    const btnActual = document.getElementById("tab-informe-actual");
    const btnHistorial = document.getElementById("tab-informe-historial");
    const filtroOrden = document.getElementById("contenedor-filtros-informe"); 
    
    const vistas = track.querySelectorAll('.vista-slider');
    const vistaActual = vistas[0];
    const vistaHistorial = vistas[1];
 
    clearTimeout(timeoutVistaInforme);
 
    if (vista === 'actual') {

        vistaActual.style.setProperty('height', '100%', 'important');
        vistaActual.style.setProperty('overflow-y', 'auto', 'important');
        
        track.style.transform = 'translateX(0%)';
        btnActual.classList.add("activo");
        btnHistorial.classList.remove("activo");
        if (filtroOrden) filtroOrden.style.display = "flex"; 
        
        timeoutVistaInforme = setTimeout(() => {
            vistaHistorial.style.setProperty('height', '0px', 'important');
            vistaHistorial.style.setProperty('overflow', 'hidden', 'important');
        }, 350);
    } else {

        vistaHistorial.style.setProperty('height', '100%', 'important');
        vistaHistorial.style.setProperty('overflow-y', 'auto', 'important');
        
        track.style.transform = 'translateX(-50%)';
        btnHistorial.classList.add("activo");
        btnActual.classList.remove("activo");
        if (filtroOrden) filtroOrden.style.display = "none"; 
        dibujarHistorialInformes(); 
        
        timeoutVistaInforme = setTimeout(() => {
            vistaActual.style.setProperty('height', '0px', 'important');
            vistaActual.style.setProperty('overflow', 'hidden', 'important');
        }, 350);
    }
}


function cambiarVistaAdmin(vista) {
    const track = document.getElementById("track-admin");
    const btnActual = document.getElementById("tab-admin-actual");
    const btnHistorial = document.getElementById("tab-admin-historial");
    
    const vistas = track.querySelectorAll('.vista-slider');
    const vistaActual = vistas[0];
    const vistaHistorial = vistas[1];

    if (vista === 'actual') {
        vistaActual.style.setProperty('height', '100%', 'important');
        vistaActual.style.setProperty('overflow-y', 'auto', 'important');
        
        track.style.transform = 'translateX(0%)';
        btnActual.classList.add("activo");
        btnHistorial.classList.remove("activo");
        
        setTimeout(() => {
            vistaHistorial.style.setProperty('height', '0px', 'important');
            vistaHistorial.style.setProperty('overflow', 'hidden', 'important');
        }, 350);
    } else {
        vistaHistorial.style.setProperty('height', '100%', 'important');
        vistaHistorial.style.setProperty('overflow-y', 'auto', 'important');
        
        track.style.transform = 'translateX(-50%)';
        btnHistorial.classList.add("activo");
        btnActual.classList.remove("activo");
        dibujarHistorialAdmin(); 
        
        setTimeout(() => {
            vistaActual.style.setProperty('height', '0px', 'important');
            vistaActual.style.setProperty('overflow', 'hidden', 'important');
        }, 350);
    }
}

async function cargarDatosParaInforme() {
    const tabla = document.getElementById("tabla-informe-alumnos");
    const kpis = document.getElementById("resumen-informe-kpis");
    const ordenElegido = document.getElementById("select-orden-informe").value; 
    
    tabla.innerHTML = "<tr><td class='text-center'>Cargando datos de la base...</td></tr>";

    try {

        const { data: informe, error } = await clienteSupabase.rpc('obtener_informe_profe');
        if (error) throw error;

        let alumnos = informe.alumnos || [];


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
                const fechaA = new Date(a.creado_en || 0);
                const fechaB = new Date(b.creado_en || 0);
                return fechaA - fechaB; 
            });
        }


        alumnosParaInformeActual = alumnos; 

        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Modalidad</th>
                    <th>Actividad</th>
                    <th>Vencimiento</th>
                    <th>Día de Pago</th>
                    <th>Cuota</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody id="tbody-informe-alumnos"></tbody>
        `;
        
        const tbody = document.getElementById("tbody-informe-alumnos");

        if (alumnos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay alumnos.</td></tr>`;
        } else {
            let actividadActual = "";
            const hoy = new Date();
            hoy.setHours(0,0,0,0);

            const tmplAlumno = document.getElementById('tmpl-informe-alumno-row');
            const tmplSeparador = document.getElementById('tmpl-informe-separador-row');

            alumnos.forEach(a => {
                if (ordenElegido === 'actividad') {
                    const actividadAlumno = a.actividad || "Sin Categoría";
                    if (actividadAlumno !== actividadActual) {
                        const cloneSep = tmplSeparador.content.cloneNode(true);
                        cloneSep.querySelector('.tmpl-inf-separador-texto').textContent = actividadAlumno.toUpperCase();
                        tbody.appendChild(cloneSep);
                        actividadActual = actividadAlumno;
                    }
                }

                let estado = "Al día";
                let colorEstado = "#888"; 
                let fechaArg = "-";

                if (a.vencimiento_cuota) {
                    const fechaVencimiento = new Date(a.vencimiento_cuota + 'T00:00:00');
                    const diferenciaDias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
                    fechaArg = formatearFechaSegura(a.vencimiento_cuota);
                    
                    if (diferenciaDias <= 0) {
                        estado = "Vencida"; colorEstado = "#d32f2f"; 
                    } else if (diferenciaDias <= 5) {
                        estado = "Pronto a vencer"; colorEstado = "#f39c12"; 
                    }
                }

                let fechaPagoArg = a.fecha_ultimo_pago ? formatearFechaSegura(a.fecha_ultimo_pago) : "-";
                const cuotaMonto = a.cuota ? `$${a.cuota.toLocaleString('es-AR')}` : "$0";
                const modalidad = a.tipo_rutina || "Con rutina"; 

                const cloneAlum = tmplAlumno.content.cloneNode(true);
                cloneAlum.querySelector('.tmpl-inf-nombre').textContent = `${a.nombre} ${a.apellido}`;
                cloneAlum.querySelector('.tmpl-inf-modalidad').textContent = modalidad;
                cloneAlum.querySelector('.tmpl-inf-actividad').textContent = a.actividad || "Sin Categoría";
                cloneAlum.querySelector('.tmpl-inf-vencimiento').textContent = fechaArg;
                cloneAlum.querySelector('.tmpl-inf-pago').textContent = fechaPagoArg;
                cloneAlum.querySelector('.tmpl-inf-cuota').textContent = cuotaMonto;
                
                const estadoTd = cloneAlum.querySelector('.tmpl-inf-estado');
                estadoTd.textContent = estado;
                estadoTd.style.color = colorEstado; 

                tbody.appendChild(cloneAlum);
            });
        }


        const totalDinero = informe.total_dinero;
        const parteGym = informe.parte_gym;
        const parteProfesor = totalDinero - parteGym;

        let conteoActividades = {};
        alumnos.forEach(a => {
            const act = a.actividad || "Sin Categoría";
            conteoActividades[act] = (conteoActividades[act] || 0) + 1;
        });

        let desgloseCategorias = "";
        for (const [cat, cantidad] of Object.entries(conteoActividades)) {
            desgloseCategorias += `${cat}: ${cantidad} | `;
        }

        const fechaEmision = new Date().toLocaleDateString('es-AR');

        kpis.innerHTML = `
            <div class="kpi-item">
                <span>Total Alumnos</span>
                <strong class="fs-120">${alumnos.length}</strong>
            </div>
            <div class="kpi-item d-flex flex-column">
                <span>Recaudación Total</span>
                <strong class="fs-120">$${totalDinero.toLocaleString('es-AR')}</strong>
                <span class="fs-75 mt-5 text-transform-none">
                    Parte Gimnasio: -$${parteGym.toLocaleString('es-AR')}
                </span>
                <span class="fs-75 mt-2 text-transform-none">
                    Tu parte neta: $${parteProfesor.toLocaleString('es-AR')}
                </span>
            </div>
            <div class="kpi-item col-span-2">
                <span>Desglose</span>
                <strong class="fs-80 fw-500">${desgloseCategorias || "Sin datos"}</strong>
            </div>
            <div class="kpi-item col-span-2 text-center mt-5">
                <span>Fecha de emisión: ${fechaEmision}</span>
            </div>
        `;

    } catch (e) {
        tabla.innerHTML = `<tr><td class="text-danger text-center">Error al cargar: ${e.message}</td></tr>`;
    }
}

async function guardarHistorialAdmin(fechaString, contenidoDelExcel) {
    try {
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        
        await clienteSupabase.from('historial_informes').insert([{
            profesor_id: AppState.profeActivoId,
            tipo: 'global',
            fecha: fechaString,
            hora: hora,
            datos: contenidoDelExcel
        }]);
        
        dibujarHistorialAdmin(); 
    } catch (e) { console.error("Error al guardar historial admin en nube:", e); }
}

async function dibujarHistorialAdmin() {
    const contenedor = document.getElementById("lista-historial-admin");
    contenedor.innerHTML = "<p class='text-center text-dark-muted'>Cargando historial de la nube...</p>";

    try {
        const { data: historial, error } = await clienteSupabase
            .from('historial_informes')
            .select('id, fecha, hora')
            .eq('tipo', 'global')
            .order('id', { ascending: false })
            .limit(15);

        if (error) throw error;

        if (!historial || historial.length === 0) {
            contenedor.innerHTML = "<p class='text-center text-dark-muted fs-90 mt-20'>Aún no hay planillas globales descargadas.</p>";
            return;
        }


        contenedor.innerHTML = ""; 
        const template = document.getElementById('tmpl-tarjeta-historial');

        historial.forEach((registro) => {

            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.tmpl-historial-titulo').textContent = "Planilla Global (Gimnasio)";
            clone.querySelector('.tmpl-historial-fecha').textContent = `Descargado el ${registro.fecha} a las ${registro.hora}`;
            

            clone.querySelector('.tmpl-btn-redescarga').onclick = () => volverADescargarExcelDeNube(registro.id, 'global');

            contenedor.appendChild(clone);
        });

    } catch (e) { contenedor.innerHTML = "<p class='text-center text-danger'>Error al cargar el historial.</p>"; }
}

async function guardarEnHistorial(fechaString, contenidoDelExcel) {
    try {
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        
        await clienteSupabase.from('historial_informes').insert([{
            profesor_id: AppState.profeActivoId,
            tipo: 'individual',
            fecha: fechaString,
            hora: hora,
            datos: contenidoDelExcel
        }]);
        
        dibujarHistorialInformes();
    } catch (e) { console.error("Error al guardar historial individual:", e); }
}

async function dibujarHistorialInformes() {
    const contenedor = document.getElementById("lista-historial-informes");
    contenedor.innerHTML = "<p class='text-center text-dark-muted'>Cargando historial de la nube...</p>";

    try {
        const { data: historial, error } = await clienteSupabase
            .from('historial_informes')
            .select('id, fecha, hora')
            .eq('profesor_id', AppState.profeActivoId)
            .eq('tipo', 'individual')
            .order('id', { ascending: false })
            .limit(15);

        if (error) throw error;

        if (!historial || historial.length === 0) {
            contenedor.innerHTML = "<p class='text-center text-dark-muted fs-90 mt-20'>Aún no hay planillas individuales descargadas.</p>";
            return;
        }


        contenedor.innerHTML = ""; 
        const template = document.getElementById('tmpl-tarjeta-historial');

        historial.forEach((registro) => {

            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.tmpl-historial-titulo').textContent = "Planilla de Alumnos";
            clone.querySelector('.tmpl-historial-fecha').textContent = `Descargado el ${registro.fecha} a las ${registro.hora}`;
            

            clone.querySelector('.tmpl-btn-redescarga').onclick = () => volverADescargarExcelDeNube(registro.id, 'individual');

            contenedor.appendChild(clone);
        });

    } catch (e) { contenedor.innerHTML = "<p class='text-center text-danger'>Error al cargar el historial.</p>"; }
}

async function volverADescargarExcelDeNube(idRegistro, tipo) {
    try {
        const { data: registro, error } = await clienteSupabase
            .from('historial_informes')
            .select('fecha, datos')
            .eq('id', idRegistro)
            .single();

        if (error || !registro || !registro.datos) {
            mostrarAlerta("Error", "No se pudo recuperar el informe.");
            return;
        }

        const matrizRecuperada = JSON.parse(registro.datos);
        const libroExcel = XLSX.utils.book_new();
        const hojaExcel = XLSX.utils.aoa_to_sheet(matrizRecuperada);
        
        if (tipo === 'global') {
            hojaExcel['!cols'] = [{wch: 30}, {wch: 20}, {wch: 25}, {wch: 25}];
            XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Copia Global");
            XLSX.writeFile(libroExcel, `Copia_GLOBAL_${registro.fecha}.xlsx`);
        } else {
            hojaExcel['!cols'] = [
                {wch: 15}, {wch: 15}, {wch: 12}, {wch: 15}, {wch: 15}, 
                {wch: 8}, {wch: 22}, {wch: 22}, {wch: 12}, {wch: 12}, {wch: 14}
            ];
            XLSX.utils.book_append_sheet(libroExcel, hojaExcel, "Copia Planilla");
            XLSX.writeFile(libroExcel, `Copia_Informe_${registro.fecha}.xlsx`);
        }
        
        mostrarAlerta("¡Re-descarga Exitosa!", "El informe se descargó correctamente desde la nube.");

    } catch (e) {
        console.error(e);
        mostrarAlerta("Error", "El archivo era demasiado antiguo o está corrupto.");
    }
}

function descargarExcelProfe() {
    if (!alumnosParaInformeActual || alumnosParaInformeActual.length === 0) {
        mostrarAlerta("Sin datos", "No hay alumnos para generar el informe.");
        return;
    }


    setTimeout(() => {
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
        let parteGym = 0;
        let conteoActividades = {};

        alumnosParaInformeActual.forEach(a => {
            const fechaBase = a.creado_en || a.created_at; 
            let fechaIngreso = (fechaBase && fechaBase !== "null") ? formatearFechaSegura(fechaBase) : "-";
            let vencimiento = a.vencimiento_cuota ? formatearFechaSegura(a.vencimiento_cuota) : "-";
            let diaDePago = a.fecha_ultimo_pago ? formatearFechaSegura(a.fecha_ultimo_pago) : "-";
        
            let cuota = a.cuota || 0;
            totalDinero += cuota;
        
            let porc = a.porcentaje_gym !== undefined && a.porcentaje_gym !== null ? a.porcentaje_gym : porcentajeGymActualParaInforme;
            parteGym += cuota * (porc / 100);

            const act = a.actividad || "Sin Categoría";
            conteoActividades[act] = (conteoActividades[act] || 0) + 1;

            matrizExcel.push([
                a.nombre || "", a.apellido || "", a.dni || "-", fechaIngreso,
                a.tipo_rutina || "Con rutina", act, a.edad || "-", a.condicion_medica || "-",
                a.objetivo || "-", vencimiento, diaDePago, cuota
            ]);
        });
        const parteProfesor = totalDinero - parteGym;

        matrizExcel.push([]); matrizExcel.push([]); 
        const categoriasArr = Object.entries(conteoActividades);
        matrizExcel.push(["", "RESUMEN GENERAL", "", "", "", "ALUMNOS POR CATEGORÍA", "", ""]);

        let cat1 = categoriasArr[0] || ["", ""];
        matrizExcel.push(["", "Total Alumnos:", "", alumnosParaInformeActual.length, "", cat1[0] ? cat1[0]+":" : "", "", cat1[1]]);
        let cat2 = categoriasArr[1] || ["", ""];
        matrizExcel.push(["", "Total Recaudado:", "", totalDinero ? `$${totalDinero.toLocaleString('es-AR')}` : "$0", "", cat2[0] ? cat2[0]+":" : "", "", cat2[1]]);
        let cat3 = categoriasArr[2] || ["", ""];
        matrizExcel.push(["", `Parte Gimnasio:`, "", parteGym ? `-$${parteGym.toLocaleString('es-AR')}` : "$0", "", cat3[0] ? cat3[0]+":" : "", "", cat3[1]]);
        let cat4 = categoriasArr[3] || ["", ""];
        matrizExcel.push(["", `Tu parte neta:`, "", parteProfesor ? `$${parteProfesor.toLocaleString('es-AR')}` : "$0", "", cat4[0] ? cat4[0]+":" : "", "", cat4[1]]);

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
        mostrarAlerta("¡Descarga Exitosa!", "El informe se descargó correctamente con los porcentajes reales.");
    }, 50);
}




window.abrirPantallaInforme = abrirPantallaInforme;
window.cargarPanelAdmin = cargarPanelAdmin;
window.abrirModalPorcentaje = abrirModalPorcentaje;
window.guardarPorcentajeBD = guardarPorcentajeBD;
window.darDeBajaProfe = darDeBajaProfe;
window.descargarExcelAdmin = descargarExcelAdmin;
window.abrirModalInformeProfe = abrirModalInformeProfe;
window.cambiarVistaInforme = cambiarVistaInforme;
window.cambiarVistaAdmin = cambiarVistaAdmin;
window.cargarDatosParaInforme = cargarDatosParaInforme;
window.guardarHistorialAdmin = guardarHistorialAdmin;
window.dibujarHistorialAdmin = dibujarHistorialAdmin;
window.guardarEnHistorial = guardarEnHistorial;
window.dibujarHistorialInformes = dibujarHistorialInformes;
window.volverADescargarExcelDeNube = volverADescargarExcelDeNube;
window.descargarExcelProfe = descargarExcelProfe;