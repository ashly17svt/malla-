/* ==========================================================
 * Malla Interactiva de Cursos
 * ==========================================================
 * Lógica general:
 * - Se declara un arreglo con todos los cursos, su código, nombre, cuatrimestre y
 *   la lista de cursos que "abre" (sus dependientes directos).
 * - A partir de eso se calcula automáticamente la lista de prerrequisitos para cada curso.
 * - Estados: locked (faltan prerrequisitos), available (todos los prerrequisitos completos, aún no cursado), completed (aprobado).
 * - Click en un curso disponible => pasa a completed.
 * - Click en un curso completed => se desmarca (incomplete) y se bloquean recursivamente los cursos que dependían de él.
 * - Persistencia en localStorage.
 * - Vista compacta opcional.
 */

(function(){
  // ----- Datos de cursos ---------------------------------------------------
  // Nota: los nombres se han normalizado un poco (acentos, abreviaturas).
  // Usa exactamente los códigos como ID únicos.
  const courses = [
    // 1er Cuatrimestre
    {code:"ELEC-01", name:"Historia del Arte", term:1, unlocks:[]},
    {code:"AN-304", name:"Met. Investigación", term:1, unlocks:[]},

    // 2do Cuatrimestre
    {code:"CEM-101", name:"Dibujo Técnico", term:2, unlocks:[]},
    {code:"MA-1101", name:"Intro. Cálculo", term:2, unlocks:["MA-102","MA-104","FI-201L","FI-201","II-240"]},
    {code:"CEM-102", name:"Intro. Ingeniería", term:2, unlocks:["CEM-203"]},

    // 3er Cuatrimestre
    {code:"MA-102", name:"Cálculo I", term:3, unlocks:["MA-105","CEM-302","FI-203","FI-305"]},
    {code:"FI-201", name:"Física I", term:3, unlocks:["FI-203","CEM-302"]},
    {code:"FI-201L", name:"Lab. Física I", term:3, unlocks:["FI-203L"]},

    // 4to Cuatrimestre
    {code:"II-240", name:"Probabilidad", term:4, unlocks:[]},
    {code:"MA-104", name:"Álgebra Lineal", term:4, unlocks:["CEM-402"]},
    {code:"QU-201", name:"Química", term:4, unlocks:["CEM-103"]},
    {code:"QU-201L", name:"Lab. Química", term:4, unlocks:[]},

    // 5to Cuatrimestre
    {code:"CEM-103", name:"Intro. Materiales", term:5, unlocks:[]},
    {code:"MA-105", name:"Cálculo II", term:5, unlocks:["MA-106","CEM-405"]},
    {code:"CEM-302", name:"Mecánica I", term:5, unlocks:[]},
    {code:"CEM-504", name:"Progra. Básica", term:5, unlocks:["CEM-606"]},

    // 6to Cuatrimestre
    {code:"CEM-606", name:"Progra. Eléctrica", term:6, unlocks:[]},
    {code:"FI-203", name:"Física II", term:6, unlocks:["CEM-403","FI-305"]},
    {code:"FI-203L", name:"Lab. Física II", term:6, unlocks:["FI-305L"]},
    {code:"CEM-203", name:"Habilidades Profesionales", term:6, unlocks:["CEM-303"]},

    // 7mo Cuatrimestre
    {code:"FI-305", name:"Física III", term:7, unlocks:[]},
    {code:"FI-305L", name:"Lab. Física III", term:7, unlocks:[]},
    {code:"CEM-403", name:"Mecánica II", term:7, unlocks:["CEM-600"]},
    {code:"MA-106", name:"Cálculo III", term:7, unlocks:["MA-107"]},
    {code:"CEM-402", name:"Circuitos Eléc. I", term:7, unlocks:["CEM-502"]},

    // 8vo Cuatrimestre
    {code:"CEM-502", name:"Sis. Eléctricos I", term:8, unlocks:["CEM-603","CEM-604"]},
    {code:"CEM-303", name:"Ética Ing.", term:8, unlocks:[]},
    {code:"CEM-405", name:"T. Electromagnética", term:8, unlocks:[]},
    {code:"MA-107", name:"Ecuaciones Dif.", term:8, unlocks:["CEM-600"]},

    // 9no Cuatrimestre
    {code:"CEM-604", name:"Sis. Digitales I", term:9, unlocks:["CEM-702"]},
    {code:"CEM-501", name:"Circuitos Eléc. II", term:9, unlocks:["CEM-600","CEM-609","CEM-609L","CEM-706"]},
    {code:"CEM-501L", name:"Lab. Circuitos II", term:9, unlocks:[]},
    {code:"CEM-603", name:"Sis. Eléctricos II", term:9, unlocks:[]},
    {code:"CEM-603L", name:"Lab. Sis. Eléc. II", term:9, unlocks:[]},

    // 10mo Cuatrimestre
    {code:"CEM-609", name:"Maq. Eléctricas I", term:10, unlocks:["CEM-707","CEM-806"]},
    {code:"CEM-609L", name:"Lab. Maq. Eléctricas I", term:10, unlocks:["CEM-707"]},
    {code:"CEM-702", name:"Sis. Digitales II", term:10, unlocks:["CEM-802"]},
    {code:"CEM-600", name:"Modelado Sis. Dinám.", term:10, unlocks:["CEM-701"]},
    {code:"CEM-706", name:"Sis. Iluminación", term:10, unlocks:[]},

    // 11vo Cuatrimestre
    {code:"CEM-701", name:"Ing. Control", term:11, unlocks:["CEM-801"]},
    {code:"CEM-802", name:"Micro. Control", term:11, unlocks:[]},
    {code:"CEM-806", name:"Diseño Sis. Eléc.", term:11, unlocks:[]},
    {code:"CEM-707", name:"Maq. Eléctricas II", term:11, unlocks:["CEM-807","CEM-808"]},
    {code:"CEM-707L", name:"Lab. Maq. Eléctricas II", term:11, unlocks:[]},

    // 12vo Cuatrimestre
    {code:"CEM-807", name:"Sis. Potencia", term:12, unlocks:[]},
    {code:"CEM-808", name:"Sis. Energía", term:12, unlocks:[]},
    {code:"CEM-801", name:"Automatización", term:12, unlocks:[]},
  ];

  // ----- Construir mapa por código ----------------------------------------
  const byCode = Object.create(null);
  courses.forEach(c => { byCode[c.code] = c; c.prereqs = []; });

  // ----- Construir lista de prerrequisitos (reversa de unlocks) ------------
  courses.forEach(c => {
    c.unlocks.forEach(targetCode => {
      const target = byCode[targetCode];
      if (target) {
        target.prereqs.push(c.code);
      } else {
        console.warn(`Curso destino no encontrado: ${targetCode} (desbloqueado por ${c.code})`);
      }
    });
  });

  // ----- Persistencia ------------------------------------------------------
  const STORAGE_KEY = 'malla-aprobados-v1';
  function loadCompletedSet(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return new Set();
      const arr = JSON.parse(raw);
      if(!Array.isArray(arr)) return new Set();
      return new Set(arr);
    } catch(err){
      console.error('Error leyendo localStorage', err);
      return new Set();
    }
  }
  function saveCompletedSet(set){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch(err){
      console.error('Error guardando localStorage', err);
    }
  }

  let completed = loadCompletedSet();

  // ----- Construir DOM -----------------------------------------------------
  const mallaEl = document.getElementById('malla');
  const tpl = document.getElementById('courseTemplate');

  // Agrupar por cuatrimestre
  const terms = {};
  courses.forEach(c => {
    if(!terms[c.term]) terms[c.term] = [];
    terms[c.term].push(c);
  });

  // Ordenar cursos dentro de cada término por nombre (estable) para limpieza
  Object.values(terms).forEach(arr => arr.sort((a,b)=>a.name.localeCompare(b.name, 'es')));

  // Nombres legibles de cuatrimestres
  const termNames = {
    1:"Primer Cuatrimestre",
    2:"Segundo Cuatrimestre",
    3:"Tercer Cuatrimestre",
    4:"Cuarto Cuatrimestre",
    5:"Quinto Cuatrimestre",
    6:"Sexto Cuatrimestre",
    7:"Séptimo Cuatrimestre",
    8:"Octavo Cuatrimestre",
    9:"Noveno Cuatrimestre",
    10:"Décimo Cuatrimestre",
    11:"Undécimo Cuatrimestre",
    12:"Duodécimo Cuatrimestre"
  };

  // Crear columnas
  Object.keys(terms).sort((a,b)=>a-b).forEach(termNum => {
    const termCourses = terms[termNum];
    const col = document.createElement('section');
    col.className = 'term-column';
    col.dataset.term = termNum;

    const h2 = document.createElement('h2');
    h2.textContent = termNames[termNum] || `Cuatrimestre ${termNum}`;
    col.appendChild(h2);

    const list = document.createElement('div');
    list.className = 'term-courses';
    col.appendChild(list);

    termCourses.forEach(course => {
      const btn = tpl.content.firstElementChild.cloneNode(true);
      btn.dataset.code = course.code;
      btn.setAttribute('aria-pressed','false');
      btn.querySelector('.course-code').textContent = course.code;
      btn.querySelector('.course-name').textContent = course.name;
      list.appendChild(btn);
      course.el = btn; // referencia DOM
    });

    mallaEl.appendChild(col);
  });

  // ----- Estado visual -----------------------------------------------------
  function updateCourseState(course){
    const el = course.el;
    const prereqs = course.prereqs;
    const metCount = prereqs.filter(p => completed.has(p)).length;
    const allMet = metCount === prereqs.length;
    const isCompleted = completed.has(course.code);

    // Reset classes
    el.classList.remove('locked','available','completed');

    if(isCompleted){
      el.classList.add('completed');
      el.disabled = false;
      el.setAttribute('aria-pressed','true');
      el.setAttribute('aria-label', `${course.code} aprobado. Haz clic para desmarcar.`);
      el.querySelector('.course-status-text').textContent = 'Aprobado';
      el.querySelector('.course-reqs').textContent = '';
      return;
    }

    if(!allMet){
      el.classList.add('locked');
      el.disabled = true;
      el.setAttribute('aria-pressed','false');
      const remaining = prereqs.length - metCount;
      el.setAttribute('aria-label', `${course.code}. Bloqueado. Faltan ${remaining} prerrequisito(s).`);
      el.querySelector('.course-status-text').textContent = 'Bloqueado';
      el.querySelector('.course-reqs').textContent = prereqs.length ? `Faltan ${remaining}/${prereqs.length}` : '';
    } else {
      el.classList.add('available');
      el.disabled = false;
      el.setAttribute('aria-pressed','false');
      el.setAttribute('aria-label', `${course.code} disponible. Haz clic para aprobar.`);
      el.querySelector('.course-status-text').textContent = 'Disponible';
      el.querySelector('.course-reqs').textContent = '';
    }
  }

  function updateAllStates(){
    courses.forEach(updateCourseState);
  }

  // ----- Propagación al desmarcar -----------------------------------------
  // Cuando se desaprueba un curso, cualquier curso (directo o indirecto) que lo necesite
  // debe bloquearse y quedar desmarcado.
  function cascadeUncomplete(fromCode, visited=new Set()){
    if(visited.has(fromCode)) return; // ev. ciclos (no debería haber)
    visited.add(fromCode);

    // Encuentra cursos que lo tienen de prerrequisito
    courses.forEach(c => {
      if(c.prereqs.includes(fromCode)){
        if(completed.has(c.code)){
          completed.delete(c.code);
          cascadeUncomplete(c.code, visited);
        }
      }
    });
  }

  // ----- Click handler -----------------------------------------------------
  function onCourseClick(e){
    const btn = e.currentTarget;
    const code = btn.dataset.code;
    const course = byCode[code];
    if(!course) return;

    if(completed.has(code)){
      // Desmarcar
      completed.delete(code);
      cascadeUncomplete(code);
    } else {
      // Marcar (solo si disponible; pero el botón estaría disabled si no lo está)
      completed.add(code);
    }
    saveCompletedSet(completed);
    updateAllStates();
  }

  // Attach listeners
  courses.forEach(c => {
    c.el.addEventListener('click', onCourseClick);
  });

  // ----- Vista compacta ----------------------------------------------------
  const compactToggle = document.getElementById('compactToggle');
  compactToggle.addEventListener('change', () => {
    document.body.classList.toggle('compact', compactToggle.checked);
  });

  // ----- Reset -------------------------------------------------------------
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    if(confirm('¿Seguro que quieres reiniciar la malla? Esto desmarcará todos los cursos.')){
      completed = new Set();
      saveCompletedSet(completed);
      updateAllStates();
    }
  });

  // ----- Inicializar -------------------------------------------------------
  updateAllStates();

})();
