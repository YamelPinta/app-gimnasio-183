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
        "Piernas y Glúteos": [
            // --- Sentadillas ---
            "Sentadilla", "Back Squat", "Sentadilla High Bar", "Sentadilla Low Bar", 
            "Sentadilla Frontal", "Goblet Squat", "Sentadilla Overhead", "Box Squat", 
            "Sentadilla con Pausa", "Sentadilla Tempo", "Zercher Squat", 
            "Sentadilla Hack en Máquina", "Sentadilla Hack con Barra", "Sentadilla Multipower", 
            "Sentadilla Sumo", "Sentadilla Talones Elevados", "Sentadilla Sissy", "Sentadilla con Salto",
            
            // --- Estocadas y Split Squats ---
            "Estocada Adelante", "Estocada Atrás", "Estocada Back Rack", "Estocada con Barra Frontal", 
            "Estocada con Mancuernas", "Estocada con Peso y Rotación", "Estocada Overhead", 
            "Estocada hacia Atrás con Banda", "Estocada hacia Atrás con Rotación", "Estocada en Déficit", 
            "Estocada Lateral", "Estocada Cruzada", "Estocada con Salto", 
            "Split Squat Estático", "Estocada Búlgara", "Split Squat Pie Delantero Elevado", 
            "Split Squat Búlgaro en Déficit", "Goblet Split Squat", "Split Squat con Barra", 
            "Split Squat Multipower", "Split Squat con Barra entre las Piernas",
            
            // --- Step Ups y Step Downs ---
            "Step Up Frontal", "Step Up con Mancuerna", "Step Up con Pesa Rusa", "Step Up con Barra", 
            "Step Up Lateral", "Step Up Peterson", "Step Down Frontal", "Step Down Lateral",
            
            // --- Prensa y Aislamiento ---
            "Prensa Unilateral", "Prensa 45 Grados", "Prensa Horizontal", "Prensa Vertical",
            "Extensión de Cuádriceps", "Extensión de Cuádriceps Unilateral", 
            "Extensión de Cuádriceps Alternada", "Extensión de Cuádriceps Isométrica", 
            
            // --- Otros ---
            "Spanish Squat Dinámica", "Spanish Squat Isométrica", "Spanish Squat con Carga", 
            "Wall Ball",
            
            // Cadera / Glúteos
            "Peso muerto Convencional", "Peso muerto Sumo", "Peso muerto Rumano", "Peso muerto Piernas rígidas", "Peso muerto Trap Bar", "Peso muerto Snatch Grip", "Peso muerto En déficit", "Rack Pull", "Block Pull", "Peso muerto Con pausa", "Peso muerto Tempo", "Peso muerto A una pierna", "Peso muerto Con mancuernas", "Peso muerto Con kettlebell", "Peso muerto Multipower",
            "Good Morning Con barra", "Good Morning Sentado", "Good Morning Safety Bar", "Good Morning Con banda", "Good Morning Zercher",
            "Hip Thrust Con barra", "Hip Thrust Con mancuerna", "Hip Thrust En máquina", "Hip Thrust Multipower", "Hip Thrust A una pierna", "Hip Thrust escalonado", "Hip Thrust B-Stance", "Kas Glute Bridge",
            "Puente de glúteos Peso corporal", "Puente de glúteos Con peso", "Puente de glúteos A una pierna", "Frog Pump", "Puente de glúteos Con banda", "Puente de glúteos Pies elevados",
            "Pull-Through De pie", "Pull-Through Arrodillado", "Pull-Through A una pierna",
            "Patada de glúteo En polea", "Patada de glúteo Diagonal", "Patada de glúteo En máquina",
            "Extensión en cuadrupedia Rodilla flexionada", "Extensión en cuadrupedia Pierna extendida",
            "Reverse Hyper", "GHD Hip Extension",
            "Swing Dos manos", "Swing A una mano",
            "Abducción sentada En máquina", "Abducción de pie En polea baja", "Abducción de pie Diagonal en polea", "Abducción de pie Con banda", "Abducción de pie Sin carga", "Abducción sentada Con minibanda", "Abducción acostada Elevación lateral", "Plancha lateral Con abducción",
            "Clamshell Sin banda", "Clamshell Con banda",
            "Fire Hydrant Sin banda", "Fire Hydrant Con banda",
            "Plancha lateral Clamshell",
            "Caminata con banda Lateral", "Monster Walk", "Hip Hike"
        ],
        "Pecho": ["Press banca", "Press con mancuernas", "Press inclinado", "Press inclinado mancuernas", "Press declinado", "Press de pecho", "Flexiones", "Flexiones asistidas", "Flexiones inclinadas", "Flexiones declinadas", "Aperturas", "Peck deck", "Cruce de poleas", "Fondos de pecho", "Press con banda"],
        "Espalda": ["Dominadas", "Dominadas asistidas", "Chin-ups", "Jalón al pecho", "Jalón cerrado", "Remo con barra", "Remo con mancuerna", "Remo en polea", "Remo en máquina", "Remo apoyado", "Remo invertido", "Pullover en polea", "Pullover", "Peso muerto", "Peso muerto rumano", "Hiperextensiones", "Buenos días", "Face pull", "Clean", "Snatch", "Muscle-up"],
        "Hombros": ["Press militar", "Press de hombros", "Press Arnold", "Press en máquina", "Elevaciones laterales", "Elevaciones frontales", "Pájaros con mancuernas", "Posteriores en máquina", "Face pull", "Remo al mentón", "Encogimientos", "Parada de manos", "Flexión vertical", "Pike push-up"],
        "Brazos": ["Curl con barra", "Curl barra EZ", "Curl con mancuernas", "Curl alternado", "Curl martillo", "Curl concentrado", "Curl predicador", "Curl inclinado", "Curl en polea", "Curl con banda", "Chin-ups", "Triceps en polea", "Tríceps con cuerda", "Press francés", "Extensión sobre cabeza", "Patada de tríceps", "Press cerrado", "Fondos", "Fondos en banco", "Flexiones diamante", "Tríceps unilateral"],
        "Core y Abdomen": ["Plancha", "Plancha lateral", "Toques de hombro", "Crunch", "Crunch en máquina", "Elevación de piernas", "Rodillas colgado", "Piernas colgado", "Rueda abdominal", "Dead bug", "Bird dog", "Hollow hold", "Arch hold", "Superman", "Mountain climbers", "Giro ruso", "Crunch bicicleta", "Pallof press", "Leñador en polea", "L-sit", "Front lever", "Back lever"],
        "Cuerpo Completo / Cardio": ["Burpee", "Burpee con salto", "Thruster", "Thruster mancuernas", "Devil press", "Clean", "Power clean", "Clean and jerk", "Snatch", "Snatch mancuerna", "Peso muerto y remo", "Kettlebell swing", "Swing ruso", "Swing americano", "Turkish get-up", "Sentadilla y press", "Man maker", "Caminata de oso", "Caminata del granjero", "Arrastre de trineo", "Empuje de trineo", "Correr", "Sprint", "Bicicleta", "Air bike", "Remo", "Ski erg", "Soga", "Box jump", "Battle ropes", "Shuttle run", "Saltos laterales"]
    }
};

const mapaAnimaciones = {
    // Piernas - gluteos
    "zercher squat": ["./ejercicios/Piernas/zerchersquat1.webp", "./ejercicios/Piernas/zerchersquat2.webp"],
    "sentadilla": ["./ejercicios/Piernas/sentadilla1.webp", "./ejercicios/Piernas/sentadilla2.webp"],
    "back squat": ["./ejercicios/Piernas/backsquat1.webp", "./ejercicios/Piernas/backsquat2.webp"],
    "sentadilla high bar": ["./ejercicios/Piernas/sentadilla1.webp", "./ejercicios/Piernas/sentadilla2.webp"],
    "sentadilla low bar": ["./ejercicios/Piernas/sentadilla1.webp", "./ejercicios/Piernas/sentadilla2.webp"],
    "sentadilla frontal": ["./ejercicios/Piernas/frontsquat1.webp", "./ejercicios/Piernas/frontsquat2.webp"],
    "goblet squat": ["./ejercicios/Piernas/gobletsquat1.webp", "./ejercicios/Piernas/gobletsquat2.webp"],
    "sentadilla overhead": ["./ejercicios/Piernas/sentadillaoverhead1.webp", "./ejercicios/Piernas/sentadillaoverhead2.webp"],
    "box squat": ["./ejercicios/Piernas/boxsquat1.webp", "./ejercicios/Piernas/boxsquat2.webp"],
    "sentadilla con pausa": ["./ejercicios/Piernas/sentadilla1.webp", "./ejercicios/Piernas/sentadilla2.webp"],
    "sentadilla tempo": ["./ejercicios/Piernas/sentadilla1.webp", "./ejercicios/Piernas/sentadilla2.webp"],
    "sentadilla hack en maquina": ["./ejercicios/Piernas/sentadillahack1.webp", "./ejercicios/Piernas/sentadillahack2.webp"],
    "sentadilla hack con barra": ["./ejercicios/Piernas/sentadillahackconbarra1.webp", "./ejercicios/Piernas/sentadillahackconbarra2.webp"],
    "sentadilla multipower": ["./ejercicios/Piernas/sentadillamultipower1.webp", "./ejercicios/Piernas/sentadillamultipower2.webp"],
    "sentadilla sumo": ["./ejercicios/Piernas/sentadillasumo1.webp", "./ejercicios/Piernas/sentadillasumo2.webp"],
    "sentadilla talones elevados": ["./ejercicios/Piernas/sentadillataloneselevados1.webp", "./ejercicios/Piernas/sentadillataloneselevados2.webp"],
    "sentadilla sissy": ["./ejercicios/Piernas/sentadillasissy1.webp", "./ejercicios/Piernas/sentadillasissy2.webp"],
    "sentadilla con salto": ["./ejercicios/Piernas/sentadillaconsalto1.webp", "./ejercicios/Piernas/sentadillaconsalto2.webp"],
    "estocada adelante": ["./ejercicios/Piernas/estocadahaciaadelante1.webp", "./ejercicios/Piernas/estocadahaciaadelante2.webp"],
    "estocada atras": ["./ejercicios/Piernas/estocadahaciaatras1.webp", "./ejercicios/Piernas/estocadahaciaatras2.webp"],
    "estocada back rack": ["./ejercicios/Piernas/estocadabackrack1.webp", "./ejercicios/Piernas/estocadabackrack2.webp"],
    "estocada con barra frontal": ["./ejercicios/Piernas/estocadaconbarrafrontal1.webp", "./ejercicios/Piernas/estocadaconbarrafrontal2.webp"],
    "estocada con mancuernas": ["./ejercicios/Piernas/estocadaconmancuerna1.webp", "./ejercicios/Piernas/estocadaconmancuerna2.webp"],
    "estocada con peso y rotacion": ["./ejercicios/Piernas/estocadaconpesoyrotacion1.webp", "./ejercicios/Piernas/estocadaconpesoyrotacion2.webp"],
    "estocada overhead": ["./ejercicios/Piernas/estocadaoverhead1.webp", "./ejercicios/Piernas/estocadaoverhead2.webp"],
    "estocada hacia atras con banda": ["./ejercicios/Piernas/estocadahaciaatrasconbanda1.webp", "./ejercicios/Piernas/estocadahaciaatrasconbanda2.webp"],
    "estocada hacia atras con rotacion": ["./ejercicios/Piernas/estocadahaciaatrasconrotacion1.webp", "./ejercicios/Piernas/estocadahaciaatrasconrotacion2.webp"],  
    "estocada en deficit": ["./ejercicios/Piernas/estocadadeficit1.webp", "./ejercicios/Piernas/estocadadeficit2.webp"],
    "estocada lateral": ["./ejercicios/Piernas/estocadalateral1.webp", "./ejercicios/Piernas/estocadalateral2.webp"],
    "estocada cruzada": ["./ejercicios/Piernas/estocadacruzada1.webp", "./ejercicios/Piernas/estocadacruzada2.webp"],
    "estocada con salto": ["./ejercicios/Piernas/estocadaconsalto1.webp", "./ejercicios/Piernas/estocadaconsalto2.webp"],
    "split squat estatico": ["./ejercicios/Piernas/splitsquat1.webp", "./ejercicios/Piernas/splitsquat2.webp"],
    "estocada bulgara": ["./ejercicios/Piernas/estocadabulgara1.webp", "./ejercicios/Piernas/estocadabulgara2.webp"],
    "split squat pie delantero elevado": ["./ejercicios/Piernas/splitsquatpiedelanteroelevado1.webp", "./ejercicios/Piernas/splitsquatpiedelanteroelevado2.webp"],
    "split squat bulgaro en deficit": ["./ejercicios/Piernas/splitsquatbulgaroendeficit1.webp", "./ejercicios/Piernas/splitsquatbulgaroendeficit2.webp"],
    "goblet split squat": ["./ejercicios/Piernas/gobletsplitsquat1.webp", "./ejercicios/Piernas/gobletsplitsquat2.webp"],
    "split squat con barra": ["./ejercicios/Piernas/barbellsplitsquat1.webp", "./ejercicios/Piernas/barbellsplitsquat2.webp"],
    "split squat multipower": ["./ejercicios/Piernas/splitsquatsmithmachine1.webp", "./ejercicios/Piernas/splitsquatsmithmachine2.webp"],
    "split squat con barra entre las piernas": ["./ejercicios/Piernas/splitsquatconbarraentrelaspiernas1.webp", "./ejercicios/Piernas/splitsquatconbarraentrelaspiernas2.webp"],
    "step up frontal": ["./ejercicios/Piernas/stepupfrontal1.webp", "./ejercicios/Piernas/stepupfrontal2.webp"],
    "step up con mancuernas": ["./ejercicios/Piernas/stepupconmancuernas1.webp", "./ejercicios/Piernas/stepupconmancuernas2.webp"],
    "step up con pesa rusa": ["./ejercicios/Piernas/stepupconpesarusa1.webp", "./ejercicios/Piernas/stepupconpesarusa2.webp"],
    "step up con barra": ["./ejercicios/Piernas/stepupconbarra1.webp", "./ejercicios/Piernas/stepupconbarra2.webp"],
    "step up lateral": ["./ejercicios/Piernas/stepuplateral1.webp", "./ejercicios/Piernas/stepuplateral2.webp"],
    "step up peterson": ["./ejercicios/Piernas/stepuppeterson1.webp", "./ejercicios/Piernas/stepuppeterson2.webp","./ejercicios/Piernas/stepuppeterson3.webp"],
    "step down frontal": ["./ejercicios/Piernas/stepdownfrontal1.webp", "./ejercicios/Piernas/stepdownfrontal2.webp"],
    "step down lateral": ["./ejercicios/Piernas/stepdownlateral1.webp", "./ejercicios/Piernas/stepdownlateral2.webp"],
    "prensa unilateral": ["./ejercicios/Piernas/prensaunilateral1.webp", "./ejercicios/Piernas/prensaunilateral2.webp"],
    "prensa 45 grados": ["./ejercicios/Piernas/prensa45grados1.webp", "./ejercicios/Piernas/prensa45grados2.webp"],
    "prensa horizontal": ["./ejercicios/Piernas/prensahorizontal1.webp", "./ejercicios/Piernas/prensahorizontal2.webp"],
    "prensa vertical": ["./ejercicios/Piernas/prensavertical1.webp", "./ejercicios/Piernas/prensavertical2.webp"],
    "extension de cuadriceps": ["./ejercicios/Piernas/extensiondecuadricepsbilateral1.webp", "./ejercicios/Piernas/extensiondecuadricepsbilateral2.webp"],
    "extension de cuadriceps unilateral": ["./ejercicios/Piernas/extensiondecuadricepsunilateral1.webp", "./ejercicios/Piernas/extensiondecuadricepsunilateral2.webp"],
    "extension de cuadriceps alternada": ["./ejercicios/Piernas/extensiondecuadricepsunilateral1.webp", "./ejercicios/Piernas/extensiondecuadricepsunilateral2.webp"],
    "extension de cuadriceps isometrica": ["./ejercicios/Piernas/extensiondecuadricepsunilateral1.webp", "./ejercicios/Piernas/extensiondecuadricepsunilateral2.webp"], 
    "spanish squat dinamica": ["./ejercicios/Piernas/spanishsquat1.webp", "./ejercicios/Piernas/spanishsquat2.webp"],
    "spanish squat isometrica": ["./ejercicios/Piernas/spanishsquat1.webp", "./ejercicios/Piernas/spanishsquat2.webp"],
    "spanish squat con carga": ["./ejercicios/Piernas/spanishsquat1.webp", "./ejercicios/Piernas/spanishsquat2.webp"],
    "wall ball": ["./ejercicios/Piernas/wallball1.webp", "./ejercicios/Piernas/wallball2.webp"],

    //Gluteo
    "peso muerto": ["./ejercicios/Gluteo/pesomuerto1.webp", "./ejercicios/Gluteo/pesomuerto2.webp"],
    "peso muerto sumo": ["./ejercicios/Gluteo/pesomuertosumo1.webp", "./ejercicios/Gluteo/pesomuertosumo2.webp"],
    "peso muerto rumano": ["./ejercicios/Gluteo/pesomuertorumano1.webp", "./ejercicios/Gluteo/pesomuertorumano2.webp"],
    "peso muerto pienas rigidas": ["./ejercicios/Gluteo/pesomuertopiernasrigidas1.webp", "./ejercicios/Gluteo/pesomuertopiernasrigidas2.webp"],
    "peso muerto trap bar": ["./ejercicios/Gluteo/pesomuerto1.webp", "./ejercicios/Gluteo/pesomuerto2.webp"], 
    "peso muerto snatch grip" : ["./ejercicios/Gluteo/pesomuertosnatchgrip1.webp", "./ejercicios/Gluteo/pesomuertosnatchgrip2.webp"],
    "peso muerto en deficit": ["./ejercicios/Gluteo/pesomuertoendeficit1.webp", "./ejercicios/Gluteo/pesomuertoendeficit2.webp"], 
    "peso muerto rack pull": ["./ejercicios/Gluteo/pesomuertorackpull1.webp", "./ejercicios/Gluteo/pesomuertorackpull2.webp"], 
    "peso muerto block pull": ["./ejercicios/Gluteo/pesomuertoblockpull1.webp", "./ejercicios/Gluteo/pesomuertoblockpull2.webp"], 
    "peso muerto con pausa": ["./ejercicios/Gluteo/pesomuerto1.webp", "./ejercicios/Gluteo/pesomuerto2.webp"], 
    "peso muerto con tempo": ["./ejercicios/Gluteo/pesomuerto1.webp", "./ejercicios/Gluteo/pesomuerto2.webp"], 
    "peso muerto unilateral": ["./ejercicios/Gluteo/pesomuertounilateral1.webp", "./ejercicios/Gluteo/pesomuertounilateral2.webp"],
    "peso muerto con mancuernas": ["./ejercicios/Gluteo/pesomuertoconmancuernas1.webp", "./ejercicios/Gluteo/pesomuertoconmancuernas2.webp"], 
    "peso muerto con kettlebell": ["./ejercicios/Gluteo/pesomuertoconpesarusa1.webp", "./ejercicios/Gluteo/pesomuertoconpesarusa2.webp"], 
    "peso muerto multipower": ["./ejercicios/Gluteo/pesomuertoensmith1.webp", "./ejercicios/Gluteo/pesomuertoensmith2.webp"],
    "good morning con barra": ["./ejercicios/Gluteo/goodmorningconbarra1.webp", "./ejercicios/Gluteo/goodmorningconbarra2.webp"],
    "good morning sentado": ["./ejercicios/Gluteo/goodmorningsentado1.webp", "./ejercicios/Gluteo/goodmorningsentado2.webp"],
    "good morning safety bar": ["./ejercicios/Gluteo/goodmorningsafetybar1.webp", "./ejercicios/Gluteo/goodmorningsafetybar2.webp"],
    "good morning con banda": ["./ejercicios/Gluteo/goodmorningconbanda1.webp", "./ejercicios/Gluteo/goodmorningconbanda2.webp"],
    "good morning zercher": ["./ejercicios/Gluteo/goodmorningzercher1.webp", "./ejercicios/Gluteo/goodmorningzercher2.webp"],
    "hip thrust con barra": ["./ejercicios/Gluteo/hipthrustconbarra1.webp", "./ejercicios/Gluteo/hipthrustconbarra2.webp"],
//    "hip thrust con mancuerna": ["./ejercicios/Gluteo/hipthrustconmancuerna1.webp", "./ejercicios/Gluteo/hipthrustconmancuerna2.webp"],
    "hip thrust en maquina": ["./ejercicios/Gluteo/hipthrustenmaquina1.webp", "./ejercicios/Gluteo/hipthrustenmaquina2.webp"],
    "hip thrust en smith": ["./ejercicios/Gluteo/hipthrustsmith1.webp", "./ejercicios/Gluteo/hipthrustsmith2.webp"],
    "hip thrust a una pierna": ["./ejercicios/Gluteo/hipthrustunilateral1.webp", "./ejercicios/Gluteo/hipthrustunilateral2.webp"],
    "hip thrust escalonado": ["./ejercicios/Gluteo/hipthrustb-stance1.webp", "./ejercicios/Gluteo/hipthrustb-stance2.webp"],
    "hip thrust kas bridge": ["./ejercicios/Gluteo/hipthrustkas1.webp", "./ejercicios/Gluteo/hipthrustkas2.webp"],
//  "puente de gluteos con peso corporal": ["./ejercicios/Gluteo/puentedegluteos1.webp", "./ejercicios/Gluteo/puentedegluteos2.webp"],


    //Pecho
//    "press banca con barra": ["./ejercicios/Pecho/pressdebancaconbarra1.webp", "./ejercicios/Pecho/pressdebancaconbarra2.webp"],
//    "press banca con mancuerna" : ["./ejercicios/Pecho/pressdebancaconmancuerna1.webp", "./ejercicios/Pecho/pressdebancaconmancuerna2.webp"],
//    "press banca cerrado": ["./ejercicios/Pecho/pressdebancacerrado1.webp", "./ejercicios/Pecho/pressdebancacerrado2.webp"],

    // Tren Superior
//    "vuelos laterales": ["./ejercicios/lateralesx500.webp", "./ejercicios/laterales2x500.webp"],
};

// 2. Diccionario de Alias (CLAVE en minúscula -> VALOR igual a la clave de mapaAnimaciones)
const aliasEjercicios = {
    //Piernas
    "sentadilla libre": "sentadilla",
    "air squat": "sentadilla", 
    "bodyweight squat": "sentadilla",
    "sentadilla": "sentadilla",
    
    "sentadilla trasera": "back squat",
    "sentadilla back squat": "back squat",
    "back squat": "back squat",
    
    "sentadilla high bar": "sentadilla high bar",
    "high-bar back squat": "sentadilla high bar",
    "sentadilla barra alta": "sentadilla high bar",
    
    "sentadilla low bar": "sentadilla low bar",
    "low-bar back squat": "sentadilla low bar",
    "sentadilla barra baja": "sentadilla low bar",
    
    "sentadilla frontal": "sentadilla frontal",
    "front squat": "sentadilla frontal",
    
    "sentadilla goblet": "goblet squat",
    "goblet squat": "goblet squat",
    "sentadilla copa": "goblet squat",
    
    "sentadilla overhead": "sentadilla overhead",
    "sentadilla carga sobre cabeza": "sentadilla overhead",
    "ohs": "sentadilla overhead",
    "overhead squat": "sentadilla overhead",
    
    "sentadilla box": "box squat",
    "box squat": "box squat",
    "sentadilla en caja": "box squat",
    "sentadilla a cajon": "box squat",
    
    "sentadilla con pausa": "sentadilla con pausa",
    "pause squat": "sentadilla con pausa",
    "sentadilla pausada": "sentadilla con pausa",
    
    "sentadilla tempo": "sentadilla tempo",
    "tempo squat": "sentadilla tempo",
    "sentadilla con tempo": "sentadilla tempo",

    "sentadilla zercher": "zercher squat",
    "zercher squat": "zercher squat",
    
    "sentadilla hack en maquina": "sentadilla hack en maquina",
    "hack squat machine": "sentadilla hack en maquina",
    "sentadilla hack": "sentadilla hack en maquina",
    
    "sentadilla hack con barra": "sentadilla hack con barra",
    "barbell hack squat": "sentadilla hack con barra",
    "hack squat con barra": "sentadilla hack con barra",
    
    "sentadilla multipower": "sentadilla multipower",
    "smith machine squat": "sentadilla multipower",
    "sentadilla en smith": "sentadilla multipower",
    "multipower": "sentadilla multipower",
    
    "sentadilla sumo": "sentadilla sumo",
    "sumo squat": "sentadilla sumo",
    
    "sentadilla talones elevados": "sentadilla talones elevados",
    "heel raises squat": "sentadilla talones elevados",
    "cyclist squat": "sentadilla talones elevados",
    "heel-elevated squat": "sentadilla talones elevados",
    "sentadilla ciclista": "sentadilla talones elevados",
    
    "sentadilla sissy": "sentadilla sissy",
    "sissy squat": "sentadilla sissy",
    
    "sentadilla con salto": "sentadilla con salto",
    "jump squat": "sentadilla con salto",
    "squat jump": "sentadilla con salto",

    "estocada hacia adelante": "estocada adelante",
    "estocada adelante": "estocada adelante",
    "estocada caminando": "estocada adelante",
    "forward lunge": "estocada adelante",
    "zancada adelante": "estocada adelante",

    "estocada hacia atras": "estocada atras",
    "estocada atras": "estocada atras",
    "zancada atras": "estocada atras",
    "reverse lunge": "estocada atras",

    "estocada con barra atras": "estocada back rack",
    "estocada back rack": "estocada back rack",
    "back-rack lunge": "estocada back rack",
    "barbell lunge": "estocada back rack",
    "estocada back-rack": "estocada back rack",

    "estocada con barra frontal": "estocada con barra frontal",
    "front rack lunge": "estocada con barra frontal",
    "front-rack lunge": "estocada con barra frontal",
    "estocada front-rack": "estocada con barra frontal",

    "estocada con peso": "estocada con mancuernas",
    "estocada con mancuernas": "estocada con mancuernas",
    "zancada con mancuernas": "estocada con mancuernas",
    "dumbbell lunge": "estocada con mancuernas",

    "estocada con peso y rotacion": "estocada con peso y rotacion",
    "kettlebell lunge": "estocada con peso y rotacion",
    "zancada con pesa rusa": "estocada con peso y rotacion",

    "estocada overhead": "estocada overhead",
    "estocada con overhead": "estocada overhead",
    "zancada sobre cabeza": "estocada overhead",
    "overhead lunge": "estocada overhead",

    "estocada con bandita": "estocada hacia atras con banda",
    "estocada hacia atras con banda": "estocada hacia atras con banda",
    "estocada con bandita hacia atras en equilibrio": "estocada hacia atras con banda",

    "estocada hacia atras con rotacion": "estocada hacia atras con rotacion",
    "estocada hacia atras con rotacion de torso": "estocada hacia atras con rotacion",

    "estocada en deficit": "estocada en deficit",
    "estocada deficit": "estocada en deficit",
    "deficit lunge": "estocada en deficit",
    "zancada en deficit": "estocada en deficit",

    "estocada lateral": "estocada lateral",
    "lateral lunge": "estocada lateral",
    "zancada lateral": "estocada lateral",
    "side lunge": "estocada lateral",

    "estocada curtsy": "estocada cruzada",
    "estocada cruzada": "estocada cruzada",
    "reverencia": "estocada cruzada",
    "zancada cruzada": "estocada cruzada",
    "curtsy lunge": "estocada cruzada",

    "estocada con salto": "estocada con salto",
    "jumping lunge": "estocada con salto",
    "zancada con salto": "estocada con salto",
    "split jump": "estocada con salto",

    "split squat estatico": "split squat estatico",
    "split squat": "split squat estatico",
    "sentadilla dividida": "split squat estatico",
    "zancada estatica": "split squat estatico",
    "estocada estatica": "split squat estatico",

    "split squat bulgaro": "estocada bulgara",
    "estocada bulgara": "estocada bulgara",
    "rfess / bulgaras": "estocada bulgara",
    "sentadilla bulgara": "estocada bulgara",
    "bulgarian split squat": "estocada bulgara",
    "bulgaras": "estocada bulgara",

    "split squat pie delantero elevado": "split squat pie delantero elevado",
    "ffess / split squat pie delantero elevado": "split squat pie delantero elevado",
    "front-foot elevated split squat": "split squat pie delantero elevado",
    
    "estocada bulgara en deficit": "split squat bulgaro en deficit",
    "deficit bulgarian split squat": "split squat bulgaro en deficit",
    "bulgara en deficit": "split squat bulgaro en deficit",
    "estocada bulgara en deficit": "split squat bulgaro en deficit",

    "split squat goblet": "goblet split squat",
    "goblet split squat": "goblet split squat",

    "split squat con barra": "split squat con barra",
    "barbell split squat": "split squat con barra",

    "split squat multipower": "split squat multipower",
    "split squat en smith": "split squat multipower",
    "smith machine split squat": "split squat multipower",

    "split squat con barra entre piernas": "split squat con barra entre las piernas",
    "split squat con barra entre las piernas": "split squat con barra entre las piernas",
    "jefferson split squat": "split squat con barra entre las piernas",

    "step up frontal": "step up frontal",
    "step-up": "step up frontal",
    "box step-up": "step up frontal",
    "subida al cajon": "step up frontal",
    "subida al banco": "step up frontal",

    "step up con mancuernas": "step up con mancuerna",
    "step up con mancuerna": "step up con mancuerna",
    "dumbbell step-up": "step up con mancuerna",
    "step-up con mancuernas": "step up con mancuerna",
    "step-up con peso": "step up con mancuerna",

    "step up con kettlebell": "step up con pesa rusa",
    "step up con pesa rusa": "step up con pesa rusa",
    "kettlebell step-up ": "step up con pesa rusa",

    "step up con barra": "step up con barra",
    "barbell step-up": "step up con barra",

    "step up lateral": "step up lateral",
    "lateral step-up": "step up lateral",
    "subida lateral": "step up lateral",

    "step up peterson": "step up peterson",
    "3 ways": "step up peterson",
    "peterson step / 3 ways": "step up peterson",
    "peterson step-up": "step up peterson",
    "peterson step": "step up peterson",

    "step down frontal": "step down frontal",
    "bajada controlada": "step down frontal",
    "forward step-down": "step down frontal",
    "step-down": "step down frontal",

    "step down lateral": "step down lateral",
    "lateral step-down": "step down lateral",
    "bajada lateral": "step down lateral",

    "prensa unilateral": "prensa unilateral",
    "prensa a una pierna": "prensa unilateral",
    "single-leg press": "prensa unilateral",

    "prensa 45 grados": "prensa 45 grados",
    "45 leg press": "prensa 45 grados",
    "prensa inclinada": "prensa 45 grados",
    "prensa 45": "prensa 45 grados",

    "prensa horizontal": "prensa horizontal",
    "horizontal leg press": "prensa horizontal",

    "prensa vertical": "prensa vertical",
    "vertical leg press": "prensa vertical",

    "extension de cuadriceps bilateral": "extension de cuadriceps",
    "extension de cuadriceps": "extension de cuadriceps",
    "leg extension": "extension de cuadriceps",
    "knee extension": "extension de cuadriceps",
    "extension de piernas": "extension de cuadriceps",
    "extension de rodilla": "extension de cuadriceps",
    "sillon de cuadriceps": "extension de cuadriceps",

    "extension de cuadriceps unilateral": "extension de cuadriceps unilateral",
    "single-leg extension": "extension de cuadriceps unilateral",
    "extension unilateral": "extension de cuadriceps unilateral",
    "sillon de cuadriceps a una pierna": "extension de cuadriceps unilateral",

    "extension de cuadriceps alternada": "extension de cuadriceps alternada",
    "extension alternada": "extension de cuadriceps alternada",
    "alternating leg extension": "extension de cuadriceps alternada",

    "extension de cuadriceps isometrica": "extension de cuadriceps isometrica",
    "isometric leg extension": "extension de cuadriceps isometrica",
    "isometric knee extension": "extension de cuadriceps isometrica",

    "spanish squat dinamico": "spanish squat dinamica",
    "spanish squat dinamica": "spanish squat dinamica",
    "sentadilla española": "spanish squat dinamica",
    "spanish squat": "spanish squat dinamica",

    "spanish squat isometrico": "spanish squat isometrica",
    "spanish squat isometrica": "spanish squat isometrica",
    "isometric spanish squat": "spanish squat isometrica",
    "sentadilla española isometrica": "spanish squat isometrica",
    "spanish squat hold": "spanish squat isometrica",

    "spanish squat con carga": "spanish squat con carga",
    "spanish squat lastrado": "spanish squat con carga",
    "loaded spanish squat": "spanish squat con carga",

    "wallball": "wall ball",
    "wall ball": "wall ball",
    "wall ball con peso": "wall ball",




    //Gluteo
    "peso muerto convencional": "peso muerto",
    "peso muerto": "peso muerto",
    "deadlift": "peso muerto",
    "conventional deadlift": "peso muerto",

    "peso muerto sumo": "peso muerto sumo",
    "sumo deadlift": "peso muerto sumo",

    "peso muerto rumano": "peso muerto rumano",
    "rdl": "peso muerto rumano",
    "romanian deadlift": "peso muerto rumano",

    "peso muerto": "peso muerto piernas rigidas",
    "peso muerto pienas rigidas": "peso muerto piernas rigidas",
    "stiff-leg deadlift": "peso muerto piernas rigidas",

    "peso muerto trap bar": "peso muerto trap bar", // Lo dejé listo para cuando subas la foto "SÍ Especial"
    "trap-bar deadlift": "peso muerto trap bar",
    "hex-bar deadlift": "peso muerto trap bar",

    "peso muerto snatch grip": "peso muerto snatch grip",
    "peso muerto agarre amplio": "peso muerto snatch grip",
    "snatch-grip deadlift": "peso muerto snatch grip",
    "peso muerto": "peso muerto snatch grip",

    "peso muerto en deficit": "peso muerto en deficit",
    "deficit deadlift": "peso muerto en deficit",

    "peso muerto rack pull": "peso muerto rack pull",
    "rack pull": "peso muerto rack pull",
    "tiron desde rack": "peso muerto rack pull",

    "peso muerto block pull": "peso muerto block pull",
    "block pull": "peso muerto block pull",
    "tiron desde bloques": "peso muerto block pull",

    "peso muerto con pausa": "peso muerto con pausa",
    "peso muerto pausado": "peso muerto con pausa",
    "pause deadlift": "peso muerto con pausa",

    "peso muerto tempo": "peso muerto con tempo",
    "tempo deadlift": "peso muerto con tempo",
    "peso muerto con tempo": "peso muerto con tempo",

    "peso muerto a una pierna": "peso muerto unilateral", // SÍ Especial
    "peso muerto unilateral": "peso muerto unilateral",
    "single-leg deadlift": "peso muerto unilateral",
    "deadlift a una pierna": "peso muerto unilateral",

    "peso muerto con mancuernas": "peso muerto con mancuernas",
    "dumbbell deadlift": "peso muerto con mancuernas",

    "peso muerto con kettlebell": "peso muerto con kettlebell",
    "peso muerto con pesa rusa": "peso muerto con pesa rusa",
    "kettlebell deadlift": "peso muerto con kettlebell",

    "peso muerto multipower": "peso muerto multipower",
    "peso muerto en smith": "peso muerto multipower",
    "smith machine deadlift": "peso muerto multipower",

    "good morning con barra": "good morning con barra",
    "good morning": "good morning con barra",
    "buenos dias con barra": "good morning con barra",
    "barbell good morning": "good morning con barra",

    "good morning sentado": "good morning sentado", // SÍ Especial
    "seated good morning": "good morning sentado",
    "buenos dias sentado": "good morning sentado",

    "good morning safety bar": "good morning safety bar",
    "safety-bar good morning": "good morning safety bar",
    "buenos dias con safety bar": "good morning safety bar",

    "good morning con banda": "good morning con banda",
    "banded good morning": "good morning con banda",
    "buenos dias con banda": "good morning con banda",

    "good morning zercher": "good morning zercher",
    "buenos dias zercher": "good morning zercher",
    "zercher good morning": "good morning zercher",

    "hip thrust con barra": "hip thrust con barra",
    "empuje de cadera con barra": "hip thrust con barra",
    "barbell hip thrust": "hip thrust con barra",

    "hip thrust con mancuerna": "hip thrust con mancuerna",
    "dumbbell hip thrust": "hip thrust con mancuerna",

    "hip thrust en maquina": "hip thrust en maquina", // SÍ Especial
    "machine hip thrust": "hip thrust en maquina",

    "hip thrust multipower": "hip thrust en smith",
    "hip thrust con barra": "hip thrust en smith",
    "smith hip thrust": "hip thrust en smith",

    "hip thrust a una pierna": "hip thrust a una pierna", // SÍ Especial
    "single-leg hip thrust": "hip thrust a una pierna",
    "hip thrust unilateral": "hip thrust a una pierna",

    "hip thrust b-stance": "hip thrust escalonado",
    "b-stance hip thrust": "hip thrust escalonado",
    "hip thrust con barra": "hip thrust escalonado",

    "kas glute bridge": "hip thrust kas bridge",
    "kas bridge": "hip thrust kas bridge",




   // Hasta aca hice con fotos 



    

    "puente de gluteos peso corporal": "puente de gluteos",
    "puente de gluteos": "puente de gluteos",
    "bodyweight glute bridge": "puente de gluteos",

    "puente de gluteos con peso": "puente de gluteos",
    "weighted glute bridge": "puente de gluteos",
    "puente con carga": "puente de gluteos",

    "puente de gluteos a una pierna": "puente de gluteos a una pierna", // SÍ Especial
    "single-leg glute bridge": "puente de gluteos a una pierna",
    "puente unilateral": "puente de gluteos a una pierna",

    "frog pump": "frog pump", // SÍ Especial
    "puente mariposa": "frog pump",

    "puente de gluteos con banda": "puente de gluteos",
    "banded glute bridge": "puente de gluteos",
    "puente con minibanda": "puente de gluteos",

    "puente de gluteos pies elevados": "puente de gluteos",
    "feet-elevated glute bridge": "puente de gluteos",
    "puente con pies elevados": "puente de gluteos",

    "pull-through de pie": "pull-through de pie", // NO Especial - necesita foto base
    "cable pull-through": "pull-through de pie",
    "pull-through en polea": "pull-through de pie",

    "pull-through arrodillado": "pull-through arrodillado", // SÍ Especial
    "kneeling pull-through": "pull-through arrodillado",
    "pull-through de rodillas": "pull-through arrodillado",

    "pull-through a una pierna": "pull-through a una pierna", // SÍ Especial
    "single-leg pull-through": "pull-through a una pierna",
    "pull-through unilateral": "pull-through a una pierna",

    "patada de gluteo en polea": "patada de gluteo en polea", // NO Especial - necesita foto base
    "cable glute kickback": "patada de gluteo en polea",
    "extension de cadera en polea baja": "patada de gluteo en polea",

    "patada de gluteo diagonal": "patada de gluteo diagonal", // SÍ Especial
    "diagonal cable kickback": "patada de gluteo diagonal",
    "extension + abduccion de cadera": "patada de gluteo diagonal",

    "patada de gluteo en maquina": "patada de gluteo en maquina", // SÍ Especial
    "machine glute kickback": "patada de gluteo en maquina",
    "patada en maquina": "patada de gluteo en maquina",

    "extension en cuadrupedia rodilla flexionada": "extension en cuadrupedia", // NO Especial
    "donkey kick": "extension en cuadrupedia",
    "patada de burro": "extension en cuadrupedia",

    "extension en cuadrupedia pierna extendida": "extension en cuadrupedia",
    "quadruped hip extension": "extension en cuadrupedia",
    "extension de cadera en cuatro apoyos": "extension en cuadrupedia",

    "reverse hyper": "reverse hyper", // SÍ Especial
    "reverse hyperextension": "reverse hyper",
    "hiperextension inversa": "reverse hyper",

    "ghd hip extension": "ghd hip extension", // SÍ Especial
    "extension de cadera en ghd": "ghd hip extension",

    "swing dos manos": "swing", // NO Especial - necesita foto base
    "kettlebell swing": "swing",
    "swing ruso": "swing",

    "swing a una mano": "swing",
    "one-arm swing": "swing",
    "swing unilateral": "swing",

    "abduccion sentada en maquina": "abduccion sentada", // NO Especial - necesita foto base
    "hip abduction machine": "abduccion sentada",
    "maquina de abductores": "abduccion sentada",
    "sillon de abductores": "abduccion sentada",

    "abduccion de pie en polea baja": "abduccion de pie", // NO Especial - necesita foto base
    "cable hip abduction": "abduccion de pie",
    "apertura lateral en polea": "abduccion de pie",

    "abduccion de pie diagonal en polea": "abduccion de pie diagonal", // SÍ Especial
    "diagonal cable abduction": "abduccion de pie diagonal",
    "abduccion diagonal": "abduccion de pie diagonal",

    "abduccion de pie con banda": "abduccion de pie",
    "standing band hip abduction": "abduccion de pie",
    "elevacion lateral con banda": "abduccion de pie",

    "abduccion de pie sin carga": "abduccion de pie",
    "standing hip abduction": "abduccion de pie",
    "elevacion lateral de pierna": "abduccion de pie",

    "abduccion sentada con minibanda": "abduccion sentada",
    "seated band abduction": "abduccion sentada",
    "apertura de rodillas con banda": "abduccion sentada",

    "abduccion acostada elevacion lateral": "abduccion acostada", // NO Especial - necesita foto base
    "side-lying hip abduction": "abduccion acostada",
    "elevacion lateral acostado": "abduccion acostada",

    "plancha lateral con abduccion": "plancha lateral con abduccion", // SÍ Especial
    "side plank hip abduction": "plancha lateral con abduccion",
    "plancha lateral con elevacion de pierna": "plancha lateral con abduccion",

    "clamshell sin banda": "clamshell", // NO Especial - necesita foto base
    "clamshell": "clamshell",
    "almeja": "clamshell",
    "apertura de cadera acostado": "clamshell",

    "clamshell con banda": "clamshell",
    "banded clamshell": "clamshell",
    "almeja con minibanda": "clamshell",

    "fire hydrant sin banda": "fire hydrant", // NO Especial - necesita foto base
    "fire hydrant": "fire hydrant",
    "hidrante": "fire hydrant",
    "abduccion en cuadrupedia": "fire hydrant",

    "fire hydrant con banda": "fire hydrant",
    "banded fire hydrant": "fire hydrant",
    "hidrante con banda": "fire hydrant",

    "plancha lateral clamshell": "plancha lateral clamshell", // SÍ Especial
    "side plank clamshell": "plancha lateral clamshell",
    "plancha lateral con apertura de rodilla": "plancha lateral clamshell",

    "caminata con banda lateral": "caminata lateral", // NO Especial - necesita foto base
    "banded lateral walk": "caminata lateral",
    "side steps": "caminata lateral",
    "crab walk": "caminata lateral",
    "caminata lateral": "caminata lateral",

    "monster walk": "monster walk", // SÍ Especial
    "caminata diagonal con banda": "monster walk",

    "hip hike": "hip hike", // NO Especial
    "elevacion pelvica lateral": "hip hike",
    "pelvic drop": "hip hike",












    // Pecho 
    "press de pecho": "press banca con barra",
    "press de banca": "press banca con barra",
    "press con barra": "press banca con barra",
    "bench press": "press banca con barra",
    "barbell bench press": "press banca con barra",

    "press plano con mancuernas": "press banca con mancuerna",
    "dumbbell bench press": "press banca con mancuerna",

    "close-grip bench press": "press banca cerrado",
    "press banca agarre cerrado": "press banca cerrado",




    // Tren superior
    "banca plana": "press banca",
    "elevaciones laterales": "vuelos laterales",
    
};




window.catalogoGlobal = catalogoGlobal;
window.mapaAnimaciones = mapaAnimaciones;
window.aliasEjercicios = aliasEjercicios;
