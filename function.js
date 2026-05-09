let tableData = [];
let editingIndex = null;

const defaultHeader = [
  "apellido",
  "nombre",
  "tipo_documento",
  "descripcion_documento",
  "numero_documento",
  "sexo",
  "menor",
  "nacionalidad",
  "tripulante",
  "ocupa_butaca",
  "observaciones"
];

const defaults = {
  tipo_documento: "DNI",
  sexo: "F",
  menor: "0",
  nacionalidad: "Argentina",
  tripulante: "0",
  ocupa_butaca: "1",
  observaciones: ""
};

const validValues = {
  sexo: ["F", "M"],
  menor: ["0", "1"],
  tripulante: ["0", "1"],
  ocupa_butaca: ["0", "1"]
};


// =========================
// INIT
// =========================

document.addEventListener('DOMContentLoaded', function () {

  if (tableData.length === 0) {
    tableData = [defaultHeader];
  }

  renderTable();
  populateNationalities();

  const tipoDocumento = document.getElementById('tipo_documento');

  if (tipoDocumento) {
    tipoDocumento.addEventListener(
      'change',
      handleTipoDocumentoChange
    );
  }

  const csvInput = document.getElementById('csvFile');

  if (csvInput) {

    csvInput.addEventListener('change', function (e) {

      const file = e.target.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = function (event) {

        try {

          const text = event.target.result;
          tableData = parseCSV(text);
    document.getElementById('tipo_documento').va
