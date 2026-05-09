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

          renderTable();

        } catch (error) {

          console.error(error);
          alert('Error al leer CSV');

        }
      };

      reader.readAsText(file);
    });
  }

});


// =========================
// CSV
// =========================

function parseCSV(text) {

  const rows = text
    .trim()
    .split('\n')
    .map(row => row.split(';'));

  return rows;
}


// =========================
// NACIONALIDADES
// =========================

function populateNationalities() {

  const select = document.getElementById('nacionalidad');

  if (!select) return;

  const countries = [
    'Argentina',
    'Brasil',
    'Chile',
    'Uruguay',
    'Paraguay'
  ];

  select.innerHTML = '';

  countries.forEach(country => {

    const option = document.createElement('option');

    option.value = country;
    option.textContent = country;

    if (country === 'Argentina') {
      option.selected = true;
    }

    select.appendChild(option);
  });
}


// =========================
// MODAL
// =========================

function openAddPassengerModal() {

  editingIndex = null;

  document.getElementById('formTitle').textContent =
    'Agregar Nuevo Pasajero';

  document.getElementById('savePassengerBtn').textContent =
    'Agregar Pasajero';

  document.getElementById('apellido').value = '';
  document.getElementById('nombre').value = '';
  document.getElementById('tipo_documento').value = defaults.tipo_documento;
  document.getElementById('numero_documento').value = '';
  document.getElementById('sexo').value = defaults.sexo;
  document.getElementById('menor').value = defaults.menor;
  document.getElementById('nacionalidad').value = defaults.nacionalidad;
  document.getElementById('tripulante').value = defaults.tripulante;
  document.getElementById('ocupa_butaca').value = defaults.ocupa_butaca;
  document.getElementById('observaciones').value = '';

  document.getElementById(
    'addPassengerModal'
  ).style.display = 'block';

  setTimeout(() => {

    const apellido = document.getElementById('apellido');

    if (apellido) {
      apellido.focus();
    }

  }, 150);
}


function closeAddPassengerModal() {

  document.getElementById(
    'addPassengerModal'
  ).style.display = 'none';
}


function openSaveModal() {

  document.getElementById(
    'saveModal'
  ).style.display = 'flex';

  setTimeout(() => {

    const input = document.getElementById(
      'fileNameInputModal'
    );

    if (input) {
      input.focus();
    }

  }, 150);
}


function closeSaveModal() {

  document.getElementById(
    'saveModal'
  ).style.display = 'none';
}


// =========================
// TIPO DOCUMENTO
// =========================

function handleTipoDocumentoChange() {

  const tipo = document.getElementById(
    'tipo_documento'
  ).value;

  const group = document.getElementById(
    'descripcion_documento_group'
  );

  if (tipo === 'OTROS') {

    group.style.display = 'block';

  } else {

    group.style.display = 'none';

    document.getElementById(
      'descripcion_documento'
    ).value = '';
  }
}


// =========================
// GUARDAR PASAJERO
// =========================

function savePassenger() {

  const newRow = [
    document.getElementById('apellido').value,
    document.getElementById('nombre').value,
    document.getElementById('tipo_documento').value,
    document.getElementById('descripcion_documento').value,
    document.getElementById('numero_documento').value,
    document.getElementById('sexo').value,
    document.getElementById('menor').value,
    document.getElementById('nacionalidad').value,
    document.getElementById('tripulante').value,
    document.getElementById('ocupa_butaca').value,
    document.getElementById('observaciones').value
  ];

  if (
    !newRow[0] ||
    !newRow[1] ||
    !newRow[4]
  ) {

    alert('Complete los campos obligatorios');
    return;
  }

  if (editingIndex !== null) {

    tableData[editingIndex] = newRow;

  } else {

    tableData.push(newRow);
  }

  renderTable();
  closeAddPassengerModal();
}


// =========================
// TABLA
// =========================

function renderTable() {

  const container = document.getElementById(
    'tableContainer'
  );

  if (!container) return;

  container.innerHTML = '';

  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headerRow = document.createElement('tr');

  defaultHeader.forEach(col => {

    const th = document.createElement('th');
    th.textContent = col;

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);

  const body = tableData.slice(1);

  body.forEach((row, rowIndex) => {

    const tr = document.createElement('tr');

    // MOBILE FRIENDLY
    tr.addEventListener('click', function () {

      editRow(rowIndex + 1);
    });

    row.forEach(cell => {

      const td = document.createElement('td');
      td.textContent = cell;

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  container.appendChild(table);
}


// =========================
// EDITAR
// =========================

function editRow(index) {

  editingIndex = index;

  const row = tableData[index];

  document.getElementById('apellido').value = row[0];
  document.getElementById('nombre').value = row[1];
  document.getElementById('tipo_documento').value = row[2];
  document.getElementById('descripcion_documento').value = row[3];
  document.getElementById('numero_documento').value = row[4];
  document.getElementById('sexo').value = row[5];
  document.getElementById('menor').value = row[6];
  document.getElementById('nacionalidad').value = row[7];
  document.getElementById('tripulante').value = row[8];
  document.getElementById('ocupa_butaca').value = row[9];
  document.getElementById('observaciones').value = row[10];

  handleTipoDocumentoChange();

  document.getElementById(
    'addPassengerModal'
  ).style.display = 'block';

  setTimeout(() => {

    const apellido = document.getElementById('apellido');

    if (apellido) {
      apellido.focus();
    }

  }, 150);
}


// =========================
// ELIMINAR
// =========================

function removeSelectedRows() {

  alert(
    'Versión simplificada: elimine editando tableData'
  );
}


// =========================
// DESCARGA CSV
// =========================

function confirmDownload() {

  const fileName =
    document.getElementById(
      'fileNameInputModal'
    ).value || 'lista_pasajeros';

  const csvContent = tableData
    .map(row => row.join(';'))
    .join('\n');

  const BOM = '\uFEFF';

  const blob = new Blob(
    [BOM + csvContent],
    {
      type: 'text/csv;charset=utf-8;'
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = fileName + '.csv';

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);

  closeSaveModal();
}
