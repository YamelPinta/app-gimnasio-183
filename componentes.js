

function UI_TarjetaEjercicio(ej) {
    const esEspecial = (ej.descanso && ej.descanso.includes('EMOM_SEG:')) || 
                       (ej.ejercicio_nombre && ej.ejercicio_nombre.toUpperCase().startsWith('EMOM')) || 
                       (ej.ejercicio_nombre && ej.ejercicio_nombre.toUpperCase().startsWith('AMRAP'));

    const descansoText = esEspecial 
        ? `<span>${formatearDescansoVisual(ej.descanso)}</span>` 
        : `<span>Descanso: ${formatearDescansoVisual(ej.descanso)}</span>`;

    let htmlNotas = '';
    if (ej.notas && ej.notas !== 'undefined' && ej.notas !== 'null')  {
        htmlNotas = `
        <div class="w-100 border-top-dashed mt-6 pt-6" onclick="event.stopPropagation();">
            <div onclick="toggleNotasEjercicio('notas-${ej.id}', this)" class="d-flex justify-between align-center cursor-pointer py-4">
                <span class="fs-75 text-muted fw-600 d-flex align-center gap-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Notas del profe
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="transition-300 text-muted"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div id="notas-${ej.id}" style="display: none;" class="pt-6 fs-80 text-muted lh-1-4 word-break">
                ${ej.notas.replace(/\n/g, '<br>')}
            </div>
        </div>
        `;
    }

    return `
        <div class="card-ejercicio" data-id="${ej.id}" style="flex-wrap: wrap; cursor: pointer;" onclick="abrirBottomSheetEjercicio('${ej.id}')">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                <svg class="icono-arrastre" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                ${obtenerAnimacionHTML(ej.ejercicio_nombre)}
                <div class="info-ejercicio" style="flex: 1; min-width: 0;">
                    <h4 style="white-space: normal; overflow-wrap: anywhere; word-break: break-word; line-height: 1.2; margin-bottom: 4px;">${ej.ejercicio_nombre}</h4>
                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                        <div style="display: flex; align-items: flex-start; gap: 6px; line-height: 1.3; font-size: 0.75rem;">
                            <div class="punto-ama" style="margin-top: 5px; flex-shrink: 0;"></div>
                            ${generarHtmlSeries(ej.series_reps, 'ej-' + ej.id)}
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 0.70rem; opacity: 0.7; margin-left: 12px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${descansoText}
                        </div>
                    </div>
                </div>
                <div class="acciones-ejercicio">
                    <svg onclick="event.stopPropagation(); abrirModalEditarPorId('${ej.id}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>                        
                    <svg onclick="event.stopPropagation(); borrarEjercicio('${ej.id}')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
            </div>
            ${htmlNotas}
        </div>
    `;
}

function UI_Subbloque(idAcordeon, nombreSub, cantidadEjercicios, htmlEjercicios) {
    return `
        <div class="tarjeta-subbloque">
            <div class="header-subbloque" onclick="toggleSubbloque('${idAcordeon}', this)">
                <div class="d-flex align-center gap-8 min-w-0 flex-1 mr-10">
                    <svg class="flecha-subbloque transition-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" style="transform: rotate(180deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    <h4 class="m-0 white-space-normal overflow-any word-break lh-1-2">${nombreSub}</h4>
                </div>
                <span class="badge-subbloque flex-shrink-0">${cantidadEjercicios} ej</span>
            </div>
            <div class="cuerpo-subbloque subbloque-contenedor d-flex" id="${idAcordeon}" data-sub="${nombreSub}">
                ${htmlEjercicios}
            </div>
        </div>
    `;
}


function UI_TarjetaEjercicioPack(ej) {
    const esEspecial = (ej.descanso && ej.descanso.includes('EMOM_SEG:')) || 
                       (ej.nombre && ej.nombre.toUpperCase().startsWith('EMOM')) || 
                       (ej.nombre && ej.nombre.toUpperCase().startsWith('AMRAP'));

    const descansoText = esEspecial 
        ? `<span>${formatearDescansoVisual(ej.descanso)}</span>` 
        : `<span>Descanso: ${formatearDescansoVisual(ej.descanso)}</span>`;

    let htmlNotas = '';
    if (ej.notas && ej.notas !== 'undefined' && ej.notas !== 'null')  {
        htmlNotas = `
        <div class="w-100 border-top-dashed mt-6 pt-6">
            <div onclick="toggleNotasEjercicio('notas-pack-${ej.originalIndex}', this)" class="d-flex justify-between align-center cursor-pointer py-4">
                <span class="fs-75 text-muted fw-600 d-flex align-center gap-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Notas del profe
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" class="transition-300 text-muted"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div id="notas-pack-${ej.originalIndex}" style="display: none;" class="pt-6 fs-80 text-muted lh-1-4 word-break">
                ${ej.notas.replace(/\n/g, '<br>')}
            </div>
        </div>`;
    }

    return `
        <div class="card-ejercicio" data-index="${ej.originalIndex}" style="flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                <svg class="icono-arrastre" viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                ${obtenerAnimacionHTML(ej.nombre)}
                <div class="info-ejercicio" style="flex: 1; min-width: 0;">
                    <h4 style="white-space: normal; overflow-wrap: anywhere; word-break: break-word; line-height: 1.2; margin-bottom: 4px;">${ej.nombre}</h4>
                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
                        <div style="display: flex; align-items: flex-start; gap: 6px; line-height: 1.3; font-size: 0.75rem;">
                            <div class="punto-ama" style="margin-top: 5px; flex-shrink: 0;"></div>
                            <span style="word-break: break-word;">${generarHtmlSeries(ej.series, 'pack-' + ej.originalIndex)}</span>
                        </div>
                        <div class="detalle-ejercicio">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${descansoText}
                        </div>
                    </div>
                </div>
                <div class="acciones-ejercicio">
                    <svg onclick="abrirModalEditarEjercicioPack(${ej.originalIndex})" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    <svg onclick="borrarEjercicioDePack(${ej.originalIndex})" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
            </div>
            ${htmlNotas}
        </div>`;
}

function UI_TarjetaCategoria(cat, cantidad, iconoHTML) {
    return `
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
}



window.UI_TarjetaEjercicio = UI_TarjetaEjercicio;
window.UI_Subbloque = UI_Subbloque;
window.UI_TarjetaEjercicioPack = UI_TarjetaEjercicioPack;
window.UI_TarjetaCategoria = UI_TarjetaCategoria;