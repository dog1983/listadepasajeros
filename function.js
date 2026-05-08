// ============================================================
// function.js - VERSIÓN DEFINITIVA PARA MÓVIL
// Corrige el error "Archivo con menos de 2 líneas".
// ============================================================

// Panel de depuración (opcional, puedes eliminarlo después de que todo funcione)
var debugDiv = null;
function log(msg) {
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '0';
    debugDiv.style.left = '0';
    debugDiv.style.right = '0';
    debugDiv.style.backgroundColor = '#333';
    debugDiv.style.color = '#0f0';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.fontSize = '12px';
    debugDiv.style.padding = '8px';
    debugDiv.style.maxHeight = '120px';
    debugDiv.style.overflowY = 'auto';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.borderTop = '2px solid #0f0';
    document.body.appendChild(debugDiv);
  }
  var p = document.createElement('div');
  p.textContent = new Date().toLocaleTimeString() + ': ' + msg;
  debugDiv.appendChild(p);
  debugDiv.scrollTop = debugDiv.scrollHeight;
  console.log(msg);
}

// Variables globales originales (sin cambios en la lógica)
let tableData = [];
let editingIndex = null;
let documentNumbersMap = new Map();
let currentSortColumn = null;
let sortDirection = 1;

const defaultHeader = [
  "apellido", "nombre", "tipo_documento", "descripcion_documento", "numero_documento",
  "sexo", "menor", "nacionalidad", "tripulante", "ocupa_butaca", "observaciones"
];

const visibleColumns = ["apellido", "nombre", "numero_documento", "observaciones"];
const columnDisplayNames = { "numero_documento": "N°", "observaciones": "Obs." };
const requiredHeaders = [
  "apellido", "nombre", "tipo_documento", "descripcion_documento", "numero_documento",
  "sexo", "menor", "nacionalidad", "tripulante", "ocupa_butaca"
];

const validValues = {
  tipo_documento: ["DNI", "Pasaporte", "OTROS"],
  sexo: ["F", "M"],
  menor: ["0", "1"],
  nacionalidad: [],
  tripulante: ["0", "1"],
  ocupa_butaca: ["0", "1"]
};

const defaults = {
  tipo_documento: "DNI",
  sexo: "F",
  menor: "0",
  nacionalidad: "Argentina",
  tripulante: "0",
  ocupa_butaca: "1",
  observaciones: ""
};

const nacionalidadesList = [
  "Afganistán", "Albania", "Alemania", "Andorra", "Argentina", "Bolivia", "Brasil", "Chile",
  "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos",
  "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Uruguay", "Venezuela"
].sort();
validValues.nacionalidad = nacionalidadesList;

// ------------------------------------------------------------
// FUNCIONES AUXILIARES (NO SE MODIFICAN, SOLO SE MANTIENEN)
// ------------------------------------------------------------
function getColumnIndex(columnName) {
  if (!tableData.length) return -1;
  var header = tableData[0];
  for (var i = 0; i < header.length; i++) if (header[i] === columnName) return i;
  return -1;
}

function populateNationalities() {
  const select = document.getElementById('nacionalidad');
  if (!select) return;
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = defaults.nacionalidad;
  defaultOption.textContent = defaults.nacionalidad;
  defaultOption.selected = true;
  select.appendChild(defaultOption);
  nacionalidadesList.forEach(country => {
    if (country !== defaults.nacionalidad) {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      select.appendChild(option);
    }
  });
}

function handleTipoDocumentoChange() {
  const tipo = document.getElementById('tipo_documento').value;
  const descGroup = document.getElementById('descripcion_documento_group');
  if (tipo === 'OTROS') descGroup.style.display = 'block';
  else {
    descGroup.style.display = 'none';
    document.getElementById('descripcion_documento').value = '';
  }
}

function updateDeleteButtonState() {
  const selected = document.querySelectorAll('.selected-row').length;
  const btn = document.getElementById('deleteBtn');
  if (btn) btn.disabled = (selected === 0);
}

function renderTable() {
  const container = document.getElementById('tableContainer');
  if (!container) return;
  container.innerHTML = '';
  if (tableData.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;">No hay datos.</div>';
    return;
  }
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const thNum = document.createElement('th');
  thNum.textContent = '#';
  thNum.style.textAlign = 'center';
  headRow.appendChild(thNum);
  for (let v = 0; v < visibleColumns.length; v++) {
    const colName = visibleColumns[v];
    const idx = getColumnIndex(colName);
    if (idx === -1) continue;
    const th = document.createElement('th');
    th.textContent = columnDisplayNames[colName] || colName;
    th.setAttribute('data-column-index', idx);
    th.addEventListener('click', (function(colIdx) { return function() { sortTableByColumn(colIdx); }; })(idx));
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  documentNumbersMap.clear();
  let invalidCount = 0;
  for (let i = 0; i < tableData.slice(1).length; i++) {
    const row = tableData[i+1];
    const tr = document.createElement('tr');
    tr.className = 'editable-row';
    tr.addEventListener('click', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      this.classList.toggle('selected-row');
      updateDeleteButtonState();
    });
    tr.addEventListener('dblclick', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      const rowIdx = parseInt(this.getAttribute('data-row-index'));
      editRow(rowIdx);
    });
    tr.setAttribute('data-row-index', i+1);
    const tdNum = document.createElement('td');
    tdNum.textContent = i+1;
    tdNum.style.textAlign = 'center';
    tdNum.style.fontWeight = 'bold';
    tr.appendChild(tdNum);
    for (let v2 = 0; v2 < visibleColumns.length; v2++) {
      const colName2 = visibleColumns[v2];
      const colIdx2 = getColumnIndex(colName2);
      if (colIdx2 === -1) continue;
      const td = document.createElement('td');
      let cellValue = row[colIdx2] || '';
      if (colName2 === 'numero_documento') {
        const docNum = cellValue.toString().trim();
        if (documentNumbersMap.has(docNum)) documentNumbersMap.get(docNum).push(i+1);
        else documentNumbersMap.set(docNum, [i+1]);
      }
      const cellContent = document.createElement('div');
      cellContent.style.display = 'flex';
      cellContent.style.flexDirection = 'column';
      if (validValues[colName2]) {
        const select = document.createElement('select');
        validValues[colName2].forEach(optVal => {
          const option = document.createElement('option');
          option.value = optVal;
          if (colName2 === 'sexo') option.textContent = optVal === 'F' ? 'F' : 'M';
          else if (colName2 === 'menor') option.textContent = optVal === '1' ? 'Sí' : 'No';
          else if (colName2 === 'tripulante' || colName2 === 'ocupa_butaca') option.textContent = optVal === '1' ? 'Sí' : 'No';
          else option.textContent = optVal;
          if (cellValue.toString().toUpperCase() === optVal.toUpperCase()) option.selected = true;
          select.appendChild(option);
        });
        select.addEventListener('change', (function(r, cIdx) { return function(e) { tableData[r][cIdx] = e.target.value; renderTable(); }; })(i+1, colIdx2));
        select.addEventListener('click', function(e) { e.stopPropagation(); });
        cellContent.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = cellValue;
        input.addEventListener('input', (function(r, cIdx) { return function(e) { tableData[r][cIdx] = e.target.value.trim(); }; })(i+1, colIdx2));
        input.addEventListener('blur', function() { renderTable(); });
        input.addEventListener('click', function(e) { e.stopPropagation(); });
        cellContent.appendChild(input);
      }
      const tipoDocIdx = getColumnIndex('tipo_documento');
      const tipoDocVal = row[tipoDocIdx] || '';
      const errMsg = validateCell(colName2, cellValue, tipoDocVal);
      if (errMsg) {
        td.classList.add('invalid-cell');
        const errSpan = document.createElement('span');
        errSpan.className = 'error-message';
        errSpan.textContent = errMsg;
        cellContent.appendChild(errSpan);
        invalidCount++;
      }
      if (colName2 === 'numero_documento' && documentNumbersMap.get(cellValue) && documentNumbersMap.get(cellValue).length > 1) {
        td.classList.add('invalid-cell');
        const dupSpan = document.createElement('span');
        dupSpan.className = 'error-message';
        dupSpan.textContent = 'Documento duplicado';
        cellContent.appendChild(dupSpan);
        invalidCount++;
      }
      td.appendChild(cellContent);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.disabled = (invalidCount > 0);
  updateDeleteButtonState();
}

function validateCell(columnName, value, tipoDoc) {
  const val = (value || "").trim();
  const tipo = (tipoDoc || "").trim().toUpperCase();
  if (columnName === 'apellido') {
    if (!val) return "Apellido requerido";
    if (val.length > 100) return "Máx 100 caracteres";
  } else if (columnName === 'nombre') {
    if (!val) return "Nombre requerido";
    if (val.length > 100) return "Máx 100 caracteres";
  } else if (columnName === 'numero_documento') {
    if (!val) return "N° documento requerido";
    if (tipo === "DNI" && !/^\d{7,8}$/.test(val)) return "DNI debe tener 7 u 8 dígitos";
    if ((tipo === "PASAPORTE" || tipo === "OTROS") && (val.length < 5 || val.length > 100)) return "Documento 5-100 caracteres";
  }
  return "";
}

function sortTableByColumn(columnIndex) {
  if (tableData.length <= 1) return;
  if (currentSortColumn === columnIndex) sortDirection *= -1;
  else { currentSortColumn = columnIndex; sortDirection = 1; }
  const header = tableData[0];
  const body = tableData.slice(1);
  body.sort((a, b) => {
    const valA = (a[columnIndex] || "").toString().toLowerCase();
    const valB = (b[columnIndex] || "").toString().toLowerCase();
    if (valA < valB) return -1 * sortDirection;
    if (valA > valB) return 1 * sortDirection;
    return 0;
  });
  tableData = [header].concat(body);
  renderTable();
}

function editRow(rowIndex) {
  const row = tableData[rowIndex];
  if (!row) return;
  editingIndex = rowIndex;
  document.getElementById('formTitle').innerText = 'Editar Pasajero';
  document.getElementById('savePassengerBtn').innerText = 'Guardar Cambios';
  document.getElementById('apellido').value = row[0] || '';
  document.getElementById('nombre').value = row[1] || '';
  document.getElementById('tipo_documento').value = row[2] || defaults.tipo_documento;
  document.getElementById('descripcion_documento').value = row[3] || '';
  document.getElementById('numero_documento').value = row[4] || '';
  document.getElementById('sexo').value = row[5] || defaults.sexo;
  document.getElementById('menor').value = row[6] || defaults.menor;
  document.getElementById('nacionalidad').value = row[7] || defaults.nacionalidad;
  document.getElementById('tripulante').value = row[8] || defaults.tripulante;
  document.getElementById('ocupa_butaca').value = row[9] || defaults.ocupa_butaca;
  document.getElementById('observaciones').value = row[10] || defaults.observaciones;
  const tipoDoc = row[2] || defaults.tipo_documento;
  const descGroup = document.getElementById('descripcion_documento_group');
  if (tipoDoc === 'OTROS') descGroup.style.display = 'block';
  else descGroup.style.display = 'none';
  document.getElementById('addPassengerModal').style.display = 'block';
}

function openAddPassengerModal() {
  editingIndex = null;
  document.getElementById('formTitle').innerText = 'Agregar Nuevo Pasajero';
  document.getElementById('savePassengerBtn').innerText = 'Agregar Pasajero';
  document.getElementById('apellido').value = '';
  document.getElementById('nombre').value = '';
  document.getElementById('tipo_documento').value = defaults.tipo_documento;
  document.getElementById('descripcion_documento').value = '';
  document.getElementById('numero_documento').value = '';
  document.getElementById('sexo').value = defaults.sexo;
  document.getElementById('menor').value = defaults.menor;
  document.getElementById('nacionalidad').value = defaults.nacionalidad;
  document.getElementById('tripulante').value = defaults.tripulante;
  document.getElementById('ocupa_butaca').value = defaults.ocupa_butaca;
  document.getElementById('observaciones').value = defaults.observaciones;
  document.getElementById('descripcion_documento_group').style.display = 'none';
  document.getElementById('addPassengerModal').style.display = 'block';
}

function closeAddPassengerModal() {
  document.getElementById('addPassengerModal').style.display = 'none';
  editingIndex = null;
}

function savePassenger() {
  const apellido = document.getElementById('apellido').value.trim();
  const nombre = document.getElementById('nombre').value.trim();
  const tipoDoc = document.getElementById('tipo_documento').value;
  const numDoc = document.getElementById('numero_documento').value.trim();
  const descDoc = document.getElementById('descripcion_documento').value.trim();
  if (!apellido || !nombre || !numDoc) {
    alert('Apellido, Nombre y Número de Documento son obligatorios');
    return;
  }
  if (tipoDoc === 'OTROS' && !descDoc) {
    alert('Debe indicar una descripción del documento');
    return;
  }
  const newRow = [
    apellido, nombre, tipoDoc,
    (tipoDoc === 'OTROS' ? descDoc : ''),
    numDoc,
    document.getElementById('sexo').value,
    document.getElementById('menor').value,
    document.getElementById('nacionalidad').value,
    document.getElementById('tripulante').value,
    document.getElementById('ocupa_butaca').value,
    document.getElementById('observaciones').value.trim()
  ];
  if (tableData.length === 0) tableData = [defaultHeader];
  if (editingIndex !== null) tableData[editingIndex] = newRow;
  else tableData.push(newRow);
  renderTable();
  closeAddPassengerModal();
}

function removeSelectedRows() {
  const selectedRows = document.querySelectorAll('.selected-row');
  if (selectedRows.length === 0) return;
  if (!confirm('¿Eliminar ' + selectedRows.length + ' fila(s)?')) return;
  const indices = [];
  for (let i = 0; i < selectedRows.length; i++) {
    indices.push(parseInt(selectedRows[i].getAttribute('data-row-index')));
  }
  indices.sort((a,b) => b - a);
  for (let j = 0; j < indices.length; j++) tableData.splice(indices[j], 1);
  renderTable();
}

function openSaveModal() { document.getElementById('saveModal').style.display = 'flex'; }
function closeSaveModal() { document.getElementById('saveModal').style.display = 'none'; }

function confirmDownload() {
  if (document.getElementById('saveBtn').disabled) {
    alert('Hay errores en los datos, no se puede guardar');
    return;
  }
  let fileName = document.getElementById('fileNameInputModal').value.trim();
  if (!fileName) fileName = 'lista_pasajeros';
  if (!fileName.endsWith('.csv')) fileName += '.csv';
  const lines = [];
  for (let i = 0; i < tableData.length; i++) lines.push(tableData[i].join(';'));
  const content = lines.join('\n');
  const blob = new Blob(['\uFEFF' + content], {type: 'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  closeSaveModal();
}

// ---------- PUNTO CRÍTICO: CARGA DE CSV CORREGIDA ----------
function cargarCSV(file) {
  log('📂 Archivo seleccionado: ' + file.name + ', tamaño: ' + file.size + ' bytes');
  const reader = new FileReader();
  reader.onload = function(e) {
    log('✅ Archivo leído correctamente (longitud: ' + e.target.result.length + ')');
    try {
      let text = e.target.result;
      
      // ---- NORMALIZACIÓN PROFUNDA DE SALTOS DE LÍNEA ----
      log('🔧 Normalizando saltos de línea...');
      // 1. Eliminar BOM si existe
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      // 2. Reemplazar TODAS las variantes de salto de línea por \n
      //    (Esto es lo que soluciona el error 'Archivo con menos de 2 líneas')
      text = text.replace(/\r\n/g, '\n'); // Windows CRLF
      text = text.replace(/\r/g, '\n');   // Mac antiguo CR
      // 3. Limpiar caracteres no imprimibles
      text = text.replace(/[\x00-\x1F\x7F]/g, '');
      // 4. Eliminar líneas vacías al inicio y final
      text = text.trim();
      
      log('📄 Texto después de normalizar (primeros 200 chars): ' + text.substring(0, 200));
      
      const lines = text.split('\n');
      log(`🔢 Líneas divididas por \\n: ${lines.length}`);
      if (lines.length < 2) throw new Error('Archivo con menos de 2 líneas incluso después de normalizar');
      
      const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
      log(`📑 Headers encontrados: ${headers.join(', ')}`);
      
      // Validar headers
      const missing = [];
      for (let i = 0; i < requiredHeaders.length; i++) {
        if (headers.indexOf(requiredHeaders[i]) === -1) missing.push(requiredHeaders[i]);
      }
      if (missing.length > 0) {
        alert('Error: Columnas faltantes en el CSV: ' + missing.join(', '));
        log(`❌ Columnas faltantes: ${missing.join(', ')}`);
        return;
      }
      
      // Procesar datos
      const data = [headers];
      let emptyLines = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") { emptyLines++; continue; }
        const cols = line.split(';');
        while (cols.length < headers.length) cols.push('');
        data.push(cols.map(cell => cell.trim()));
      }
      
      if (data.length <= 1) {
        alert('El archivo CSV no contiene datos de pasajeros.');
        log('⚠️ Sin filas de datos después del header.');
        return;
      }
      
      tableData = data;
      renderTable();
      log(`🎉 CSV cargado exitosamente. Registros: ${tableData.length - 1}, líneas vacías omitidas: ${emptyLines}`);
      alert(`✅ CSV cargado correctamente. Se importaron ${tableData.length - 1} pasajeros.`);
      
    } catch (err) {
      log('❌ ERROR FATAL al procesar: ' + err.message);
      alert('Error al procesar el archivo CSV: ' + err.message);
    }
  };
  reader.onerror = function() {
    log('💥 Error de lectura del archivo');
    alert('Error al leer el archivo seleccionado.');
  };
  reader.readAsText(file, 'UTF-8');
}
// ------------------------------------------------------------

// Exponer funciones globales para los botones del HTML
window.openAddPassengerModal = openAddPassengerModal;
window.closeAddPassengerModal = closeAddPassengerModal;
window.savePassenger = savePassenger;
window.editRow = editRow;
window.removeSelectedRows = removeSelectedRows;
window.openSaveModal = openSaveModal;
window.closeSaveModal = closeSaveModal;
window.confirmDownload = confirmDownload;
window.handleTipoDocumentoChange = handleTipoDocumentoChange;

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  log('Editor iniciado correctamente en modo móvil/PC');
  try {
    populateNationalities();
    if (tableData.length === 0) {
      // Datos de ejemplo iniciales
      tableData = [
        defaultHeader,
        ['García', 'Ana', 'DNI', '', '12345678', 'F', '0', 'Argentina', '0', '1', '']
      ];
      log('Datos de ejemplo cargados.');
    }
    renderTable();
    const fileInput = document.getElementById('csvFile');
    if (fileInput) {
      fileInput.addEventListener('change', function(ev) {
        log('🖱️ Evento change del input file disparado.');
        if (ev.target.files && ev.target.files[0]) {
          cargarCSV(ev.target.files[0]);
        } else {
          log('⚠️ No se seleccionó ningún archivo.');
        }
        ev.target.value = '';
      });
    } else {
      log('❌ Error: No se encontró el elemento con id "csvFile".');
    }
  } catch (err) {
    log('❌ Error fatal en la inicialización: ' + err.message);
  }
});
