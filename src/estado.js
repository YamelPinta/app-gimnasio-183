
const AppState = {

    profeActivoId: null,
    esAdminActual: false,
    emailProfePendiente: null,
    esProfeNuevoLogin: false,
    idProfePendiente: null,
    nombreProfePendiente: null,
    apellidoProfePendiente: null,


    alumnoSeleccionadoId: null,
    alumnoDataActual: null,
    checkinAlumnoId: null,
    alumnosCache: [],


    ejercicioEditandoId: null,
    semanaActiva: 1,
    diaActivo: 1,
    vistaSliderActual: 'categorias',
    categoriaSeleccionada: null,
    categoriaOpcionesActiva: null,
    ejerciciosActualesCache: [],
    

    packActivoId: null,
    packActivoEjercicios: [],
    ejercicioPackEditandoIndex: null,
    packAEditarId: null,


    intervaloReloj: null,
    tiempoTotalSegundos: 0,
    tiempoRestanteSegundos: 0,
    fasesEmomGlobal: [],
    indiceFaseEmom: 0,
    idEmomActivo: null,
    estadoRelojEmom: 'detenido',


    modoBorradoActivo: false,
    accionPendiente: null,
    esTemaOscuro: true,
    chipsActuales: [],
    modalPendienteDeCierre: null,
    estadoInicialFormulario: null,


    alumnoEditandoId: null,

    asistenciasDiasAlumno: [],
    asistenciasAlumnoMes: [],
    notificacionesGlobales: [],
};


window.AppState = AppState;