/* ===============================
   Datos de la Malla
   =============================== */
const TERMS = [
  {
    name: "Primer Cuatrimestre",
    courses: [
      { code:"ELEC-01", name:"Historia del Arte", prereqs:[] },
      { code:"AN-304", name:"Met. Investigación", prereqs:[] },
    ]
  },
  {
    name: "Segundo Cuatrimestre",
    courses: [
      { code:"CEM-101", name:"Dibujo Técnico", prereqs:[] },
      { code:"MA-1101", name:"Intro. Cálculo", prereqs:[] },
      { code:"CEM-102", name:"Intro. Ingeniería", prereqs:[] },
    ]
  },
  {
    name: "Tercer Cuatrimestre",
    courses: [
      { code:"MA-102", name:"Cálculo I", prereqs:["MA-1101"] },
      { code:"FI-201", name:"Física I", prereqs:["MA-1101"] },
      { code:"FI-201L", name:"Lab Física I", prereqs:["MA-1101"] },
    ]
  },
  {
    name: "Cuarto Cuatrimestre",
    courses: [
      { code:"II-240", name:"Probabilidad", prereqs:["MA-1101"] },
      { code:"MA-104", name:"Álgebra Lineal", prereqs:["MA-1101"] },
      { code:"QU-201", name:"Química", prereqs:[] },
      { code:"QU-201L", name:"Lab Química", prereqs:[] },
    ]
  },
  {
    name: "Quinto Cuatrimestre",
    courses: [
      { code:"CEM-103", name:"Intro. Materiales", prereqs:["QU-201"] },
      { code:"MA-105", name:"Cálculo II", prereqs:["MA-102"] },
      { code:"CEM-302", name:"Mecánica I", prereqs:["FI-201","MA-102"] },
      { code:"CEM-504", name:"Progra Básica", prereqs:[] },
    ]
  },
  {
    name: "Sexto Cuatrimestre",
    courses: [
      { code:"CEM-606", name:"Progra Eléctrica", prereqs:["CEM-504"] },
      { code:"FI-203", name:"Física II", prereqs:["FI-201","MA-102"] },
      { code:"FI-203L", name:"Lab Física II", prereqs:["FI-201L"] },
      { code:"CEM-203", name:"Habilidades", prereqs:["CEM-102"] },
    ]
  },
  {
    name: "Séptimo Cuatrimestre",
    courses: [
      { code:"FI-305", name:"Física III", prereqs:["FI-203"] },
      { code:"FI-305L", name:"Lab Física III", prereqs:["FI-203L"] },
      { code:"CEM-403", name:"Mecánica II", prereqs:["FI-203"] },
      { code:"MA-106", name:"Cálculo III", prereqs:["MA-105"] },
      { code:"CEM-402", name:"Circuitos Eléc.", prereqs:["MA-104"] },
    ]
  },
  {
    name: "Octavo Cuatrimestre",
    courses: [
      { code:"CEM-502", name:"Sis. Eléctricos I", prereqs:["CEM-402"] },
      { code:"CEM-303", name:"Ética Ing.", prereqs:["CEM-203"] },
      { code:"CEM-405", name:"T. Electromagnética", prereqs:["MA-105"] },
      { code:"MA-107", name:"Ecuaciones Dif.", prereqs:["MA-106"] },
    ]
  },
  {
    name: "Noveno Cuatrimestre",
    courses: [
      { code:"CEM-604", name:"Sis. Digitales I", prereqs:["CEM-502"] },
      { code:"CEM-501", name:"Circuitos II", prereqs:["CEM-402"] },
      { code:"CEM-501L", name:"Lab Circuitos II", prereqs:["CEM-402"] },
      { code:"CEM-603", name:"Sis. Eléctricos II", prereqs:["CEM-502"] },
      { code:"CEM-603L", name:"Lab. Sis. Eléctricos II", prereqs:["CEM-502"] },
    ]
  },
  {
    name: "Décimo Cuatrimestre",
    courses: [
      { code:"CEM-609", name:"Maq. Eléctricas I", prereqs:["CEM-501","CEM-501L"] },
      { code:"CEM-609L", name:"Lab. Maq. Eléctricas I", prereqs:["CEM-501","CEM-501L"] },
      { code:"CEM-702", name:"Sis. Digitales II", prereqs:["CEM-604"] },
      { code:"CEM-600", name:"Modelado Sis. Dina.", prereqs:["CEM-403","MA-107"] },
      { code:"CEM-706", name:"Sis. Iluminación", prereqs:["CEM-501"] },
    ]
  },
  {
    name: "Undécimo Cuatrimestre",
    courses: [
      { code:"CEM-701", name:"Ing. Control", prereqs:["CEM-600"] },
      { code:"CEM-802", name:"Micro. Control", prereqs:["CEM-702"] },
      { code:"CEM-806", name:"Diseño Sis. Eléctricos", prereqs:["CEM-609","CEM-609L"] },
      { code:"CEM-707", name:"Maq. Eléctricas II", prereqs:["CEM-609","CEM-609L"] },
      { code:"CEM-707L", name:"Lab. Maq. Eléctricas II", prereqs:["CEM-609","CEM-609L"] },
    ]
  },
  {
    name: "Duodécimo Cuatrimestre",
    courses: [
      { code:"CEM-807", name:"Sis. Potencia", prereqs:["CEM-707"] },
      { code:"CEM-808", name:"Sis. Energía", prereqs:["CEM-707"] },
      { code:"CEM-801", name:"Automatización", prereqs:["CEM-701"] },
    ]
  },
];

/* ===============================
   Estado persistente (LocalStorage)
   =============================== */
const STORAGE_KEY = "malla-cursos-aprobados";

function loadCompleted(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return new Set();
    const arr = JSON.parse(raw);
    if(Array.isArray(arr)) return new Set(arr);
  } catch(err){
    console.warn("Error leyendo progreso:",err);
  }
  return new Set();
}

function saveCompleted(set){
  const arr = Array.from(set);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

let completed = loadCompleted();

/* ===============================
   Construcción de la grilla
   =============================== */
const grid = document.getElementById("grid-container");
const courseIndex = new Map(); // code -> element
const courseInfo = new Map();  // code -> {prereqs:[], termName, ...}

function buildGrid(){
  grid.innerHTML = "";
  TERMS.forEach(term => {
    const col = document.createElement("section");
    col.className = "term-column";

    const h2 = document.createElement("h2");
    h2.className = "term-title";
    h2.textContent = term.name;
    col.appendChild(h2);

    term.courses.forEach(c => {
      const el = document.createElement("div");
      el.className = "course";
      el.dataset.code = c.code;
      el.dataset.status = "locked"; // se ajusta luego

      const codeSpan = document.createElement("span");
      codeSpan.className = "course-code";
      codeSpan.textContent = c.code;

      const nameSpan = document.createElement("span");
      nameSpan.className = "course-name";
      nameSpan.textContent = c.name;

      const reqSpan = document.createElement("span");
      reqSpan.className = "course-reqs";
      reqSpan.textContent = c.prereqs.length ? `Req: ${c.prereqs.join(', ')}` : "Sin prerrequisitos";

      // tooltip (código + nombre - redundante pero útil en móviles)
      const tooltip = document.createElement("span");
      tooltip.className = "tooltip";
      tooltip.textContent = `${c.code} – ${c.name}`;

      el.appendChild(codeSpan);
      el.appendChild(nameSpan);
      el.appendChild(reqSpan);
      el.appendChild(tooltip);

      el.addEventListener("click", () => handleCourseClick(c.code));

      col.appendChild(el);
      courseIndex.set(c.code, el);
      courseInfo.set(c.code, { ...c, term: term.name });
    });

    grid.appendChild(col);
  });
}

/* ===============================
   Lógica de estado habilitado / aprobado
   =============================== */
function updateStatuses(){
  courseInfo.forEach((info, code) => {
    const el = courseIndex.get(code);
    if(!el) return;

    if(completed.has(code)){
      setStatus(el, "completed");
      return;
    }

    const ready = info.prereqs.every(p => completed.has(p));
    setStatus(el, ready ? "available" : "locked");
  });
}

function setStatus(el,status){
  el.dataset.status = status;
}

function handleCourseClick(code){
  const el = courseIndex.get(code);
  if(!el) return;
  const status = el.dataset.status;
  if(status === "locked"){
    // no acción
    return;
  }
  if(status === "completed"){
    completed.delete(code);
  } else {
    completed.add(code);
  }
  saveCompleted(completed);
  updateStatuses(); // recalcula todo (para bloquear/desbloquear dependientes)
}

/* ===============================
   Exportar / Importar
   =============================== */
const btnClear = document.getElementById("btn-clear");
const btnExport = document.getElementById("btn-export");
const btnImport = document.getElementById("btn-import");
const importFile = document.getElementById("import-file");

btnClear.addEventListener("click", () => {
  if(confirm("¿Seguro que quieres borrar tu progreso?")){
    completed.clear();
    saveCompleted(completed);
    updateStatuses();
  }
});

btnExport.addEventListener("click", () => {
  const data = Array.from(completed);
  const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "malla-progreso.json";
  a.click();
  URL.revokeObjectURL(url);
});

btnImport.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", evt => {
  const file = evt.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const arr = JSON.parse(e.target.result);
      if(!Array.isArray(arr)) throw new Error("Formato inválido");
      completed = new Set(arr);
      saveCompleted(completed);
      updateStatuses();
      alert("Progreso importado.");
    }catch(err){
      alert("Error al importar: "+err.message);
    }
  };
  reader.readAsText(file);
});

/* ===============================
   Inicializar
   =============================== */
buildGrid();
updateStatuses();
