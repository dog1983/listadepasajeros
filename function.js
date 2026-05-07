// Variables globales
let tableData = [];
let editingIndex = null;
let documentNumbersMap = new Map();
let currentSortColumn = null;
let sortDirection = 1; // 1 para ascendente, -1 para descendente

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

// Columnas que se mostrarán en la tabla principal
const visibleColumns = ["apellido", "nombre", "numero_documento", "observaciones"];

// Mapeo de nombres de columnas para mostrar en la tabla
const columnDisplayNames = {
  "numero_documento": "N°",
  "observaciones": "Obs."
};

// Headers requeridos para validación al cargar CSV
const requiredHeaders = [
  "apellido",
  "nombre", 
  "tipo_documento",
  "descripcion_documento",
  "numero_documento",
  "sexo",
  "menor",
  "nacionalidad",
  "tripulante",
  "ocupa_butaca"
];

const validValues = {
  tipo_documento: ["DNI", "Pasaporte", "OTROS"],
  sexo: ["F", "M"],
  menor: ["0", "1"],
  nacionalidad: ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Anguilla", "Antártida", "Antigua y Barbuda", "Antillas Holandesas", "Arabia Saudí", "Argelia", "Argentina", "Armenia", "Aruba", "ARY Macedonia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bahréin", "Bangladesh", "Barbados", "Bélgica", "Belice", "Benin", "Bermudas", "Bhután", "Bielorrusia", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticana", "Colombia", "Comoras", "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Gibraltar", "Granada", "Grecia", "Groenlandia", "Guadalupe", "Guam", "Guatemala", "Guayana Francesa", "Guinea", "Guinea Ecuatorial", "Guinea-Bissau", "Guyana", "Haití", "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irán", "Iraq", "Irlanda", "Isla Bouvet", "Isla de Navidad", "Isla Norfolk", "Islandia", "Islas Caimán", "Islas Cocos", "Islas Cook", "Islas Feroe", "Islas Georgias del Sur y Sandwich del Sur", "Islas Gland", "Islas Heard y McDonald", "Islas Malvinas", "Islas Marianas del Norte", "Islas Marshall", "Islas Pitcairn", "Islas Salomón", "Islas Turcas y Caicos", "Islas ultramarinas de Estados Unidos", "Islas Vírgenes Británicas", "Islas Vírgenes de los Estados Unidos", "Israel", "Italia", "Jamaica", "Japán", "Jordania", "Kazajstán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesotho", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macao", "Madagascar", "Malasia", "Malawi", "Maldivas", "Malí", "Malta", "Marruecos", "Martinica", "Mauricio", "Mauritania", "Mayotte", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montserrat", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Niue", "Noruega", "Nueva Caledonia", "Nueva Zelenda", "Omán", "Países Bajos", "Pakistán", "Palau", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polinesia Francesa", "Polonia", "Portugal", "Puerto Rico", "Qatar", "Reino Unido", "República Centroafricana", "República Checa", "República Democrática del Congo", "República Dominicana", "Reunión", "Ruanda", "Rumania", "Rusia", "Sahara Occidental", "Samoa", "Samoa Americana", "San Cristóbal y Nevis", "San Marino", "San Pedro y Miquelón", "San Vicente y las Granadinas", "Santa Helena", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia y Montenegro", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Suecia", "Suiza", "Surinam", "Svalbard y Jan Mayen", "Tailandia", "Taiwán", "Tanzania", "Tayikistán", "Territorio Británico del Océano Índico", "Territorios Australes Franceses", "Timor Oriental", "Togo", "Tokelau", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Wallis y Futuna", "Yemen", "Yibuti", "Zambia", "Zimbabue"].sort((a, b) => a.localeCompare(b)),
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

// ==================== INICIALIZACIÓN Y CARGA DE CSV CORREGIDA ====================
window.onload = function() {
  if (tableData.length === 0) {
    tableData = [defaultHeader];
    renderTable();
  }
  
  populateNationalities();
  document.getElementById('tipo_documento').addEventListener('change', handleTipoDocumentoChange);
  
  document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Por favor, seleccione un archivo CSV');
      this.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        let text = event.target.result;
        // ----- CORRECCIONES PARA MÓVIL (eliminar BOM y normalizar saltos de línea) -----
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        text = text.replace(/\r\n?/g, '\n');
        text = text.replace(/^[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]+/, ''); // eliminar caracteres de control
        // -----------------------------------------------------------------------
        const parsedData = parseCSV(text);
        if (parsedData.length === 1 && parsedData[0] === defaultHeader) {
          e.target.value = '';
          return;
        }
        tableData = parsedData;
        renderTable();
      } catch (error) {
        console.error(error);
        alert('Error al procesar el archivo CSV. Verifique el formato.');
        e.target.value = '';
      }
    };
    reader.onerror = () => alert('Error al leer el archivo');
    reader.readAsText(file, 'UTF-8');
  });
};

// ==================== VALIDACIÓN Y PARSEO DE CSV (CORREGIDO) ====================
function validateCSVHeaders(headers) {
  const lowerHeaders = headers.map(h => h.trim().toLowerCase());
  const missingHeaders = [];
  requiredHeaders.forEach(requiredHeader => {
    const lowerRequired = requiredHeader.toLowerCase();
    if (!lowerHeaders.includes(lowerRequired)) {
      missingHeaders.push(requiredHeader);
    }
  });
  return {
    isValid: missingHeaders.length === 0,
    errors: missingHeaders.length ? [`Columnas faltantes: ${missingHeaders.join(', ')}`] : [],
    missingHeaders: missingHeaders
  };
}

function parseCSV(text) {
  let lines = text.trim().split('\n');
  if (lines.length === 0) {
    alert('El archivo está vacío');
    return [defaultHeader];
  }
  
  // Limpiar la primera línea de cualquier carácter raro
  let firstLine = lines[0];
  firstLine = firstLine.replace(/^"+|"+$/g, '');          // quitar comillas dobles al inicio/fin
  firstLine = firstLine.replace(/[\x00-\x1F\x7F]/g, ''); // quitar no imprimibles
  lines[0] = firstLine;
  
  const rows = lines.map(row => row.split(';').map(cell => cell.trim()));
  let header = rows[0];
  let body = rows.slice(1);
  
  const validation = validateCSVHeaders(header);
  if (!validation.isValid) {
    const errorMessage = `El listado que intenta abrir tiene un formato incorrecto!\nNo coinciden las columnas.\n\nErrores:\n- ${validation.errors.join('\n- ')}\n\nColumnas requeridas (en orden):\n1. apellido\n2. nombre\n3. tipo_documento\n4. descripcion_documento\n5. numero_documento\n6. sexo\n7. menor\n8. nacionalidad\n9. tripulante\n10. ocupa_butaca\n\nColumnas opcionales:\n11. observaciones\n\nColumnas encontradas:\n${header.map((h, i) => `${i+1}. ${h}`).join('\n')}`;
    alert(errorMessage);
    return [defaultHeader];
  }
  
  const lowerCaseHeader = header.map(h => h.toLowerCase());
  const hasObservaciones = lowerCaseHeader.includes('observaciones');
  if (!hasObservaciones) {
    header.push('observaciones');
    body.forEach(row => row.push(''));
  }
  
  const expectedLength = header.length;
  body = body.map(row => {
    if (row.length < expectedLength) return [...row, ...Array(expectedLength - row.length).fill('')];
    if (row.length > expectedLength) return row.slice(0, expectedLength);
    return row;
  });
  
  return [header, ...body];
}

// ==================== FUNCIONES DE INTERFAZ Y RENDERIZADO (SIN CAMBIOS) ====================
function populateNationalities() {
  const select = document.getElementById('nacionalidad');
  if (!select) return;
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = defaults.nacionalidad;
  defaultOption.textContent = defaults.nacionalidad;
  defaultOption.selected = true;
  select.appendChild(defaultOption);
  validValues.nacionalidad.forEach(country => {
    if (country !== defaults.nacionalidad) {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      select.appendChild(option);
    }
  });
}

function openAddPassengerModal() {
  editingIndex = null;
  document.getElementById('formTitle').textContent = 'Agregar Nuevo Pasajero';
  document.getElementById('savePassengerBtn').textContent = 'Agregar Pasajero';
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
  document.getElementById('apellido').focus();
}

function editRow(rowIndex) {
  document.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));
  updateDeleteButtonState();
  editingIndex = rowIndex;
  const rowData = tableData[rowIndex];
  document.getElementById('formTitle').textContent = 'Editar Pasajero';
  document.getElementById('savePassengerBtn').textContent = 'Guardar Cambios';
  document.getElementById('apellido').value = rowData[0] || '';
  document.getElementById('nombre').value = rowData[1] || '';
  document.getElementById('tipo_documento').value = rowData[2] || defaults.tipo_documento;
  document.getElementById('descripcion_documento').value = rowData[3] || '';
  document.getElementById('numero_documento').value = rowData[4] || '';
  document.getElementById('sexo').value = rowData[5] || defaults.sexo;
  document.getElementById('menor').value = rowData[6] || defaults.menor;
  document.getElementById('nacionalidad').value = rowData[7] || defaults.nacionalidad;
  document.getElementById('tripulante').value = rowData[8] || defaults.tripulante;
  document.getElementById('ocupa_butaca').value = rowData[9] || defaults.ocupa_butaca;
  document.getElementById('observaciones').value = rowData[10] || defaults.observaciones;
  const tipoDoc = rowData[2] || defaults.tipo_documento;
  document.getElementById('descripcion_documento_group').style.display = tipoDoc === 'OTROS' ? 'block' : 'none';
  document.getElementById('addPassengerModal').style.display = 'block';
  document.getElementById('apellido').focus();
}

function closeAddPassengerModal() {
  document.getElementById('addPassengerModal').style.display = 'none';
  editingIndex = null;
}

function handleTipoDocumentoChange() {
  const tipoDocumento = document.getElementById('tipo_documento').value;
  const descripcionGroup = document.getElementById('descripcion_documento_group');
  if (tipoDocumento === 'OTROS') {
    descripcionGroup.style.display = 'block';
    setTimeout(() => document.getElementById('descripcion_documento').focus(), 100);
  } else {
    descripcionGroup.style.display = 'none';
    document.getElementById('descripcion_documento').value = '';
  }
}

function savePassenger() {
  const tipoDocumento = document.getElementById('tipo_documento').value;
  const descripcionDocumento = document.getElementById('descripcion_documento').value.trim();
  const newRow = [
    document.getElementById('apellido').value.trim(),
    document.getElementById('nombre').value.trim(),
    tipoDocumento,
    tipoDocumento === 'OTROS' ? descripcionDocumento : '',
    document.getElementById('numero_documento').value.trim(),
    document.getElementById('sexo').value || defaults.sexo,
    document.getElementById('menor').value || defaults.menor,
    document.getElementById('nacionalidad').value || defaults.nacionalidad,
    document.getElementById('tripulante').value || defaults.tripulante,
    document.getElementById('ocupa_butaca').value || defaults.ocupa_butaca,
    document.getElementById('observaciones').value.trim() || defaults.observaciones
  ];
  if (!newRow[0] || !newRow[1] || !newRow[4]) {
    alert('Por favor complete los campos obligatorios (Apellido, Nombre y Número de Documento)');
    return;
  }
  if (tableData.length === 0) tableData = [defaultHeader];
  if (editingIndex !== null) {
    tableData[editingIndex] = newRow;
  } else {
    tableData.push(newRow);
  }
  renderTable();
  closeAddPassengerModal();
}

function openSaveModal() {
  document.getElementById('saveModal').style.display = 'flex';
  document.getElementById('fileNameInputModal').focus();
}

function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
}

function getColumnIndex(columnName) {
  const header = tableData[0];
  return header.indexOf(columnName);
}

function renderTable() {
  const container = document.getElementById('tableContainer');
  const table = document.createElement('table');
  container.innerHTML = '';
  if (tableData.length === 0) return;
  const header = tableData[0];
  const body = tableData.slice(1);
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const thNum = document.createElement('th');
  thNum.textContent = '#';
  thNum.style.textAlign = 'center';
  headRow.appendChild(thNum);
  visibleColumns.forEach(columnName => {
    const columnIndex = getColumnIndex(columnName);
    if (columnIndex === -1) return;
    const th = document.createElement('th');
    th.textContent = columnDisplayNames[columnName] || columnName;
    th.title = getHeaderTooltip(columnName);
    th.dataset.columnIndex = columnIndex;
    th.addEventListener('click', () => sortTableByColumn(columnIndex));
    if (currentSortColumn === columnIndex) {
      th.style.backgroundColor = '#d4e6f1';
      th.innerHTML += sortDirection === 1 ? ' ↑' : ' ↓';
    }
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  documentNumbersMap.clear();
  let invalidCellsCount = 0;
  body.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.classList.add('editable-row');
    if (editingIndex === rowIndex + 1) tr.classList.add('editing');
    tr.addEventListener('click', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      tr.classList.toggle('selected-row');
      updateDeleteButtonState();
    });
    tr.addEventListener('dblclick', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      editRow(rowIndex + 1);
    });
    const tdNum = document.createElement('td');
    tdNum.textContent = rowIndex + 1;
    tdNum.style.textAlign = 'center';
    tdNum.style.fontWeight = 'bold';
    tr.appendChild(tdNum);
    let tabIndexCounter = (rowIndex * 100) + 1;
    visibleColumns.forEach(columnName => {
      const columnIndex = getColumnIndex(columnName);
      if (columnIndex === -1) return;
      const td = document.createElement('td');
      const cellValue = row[columnIndex]?.trim() || '';
      if (columnName === 'numero_documento') {
        if (documentNumbersMap.has(cellValue)) documentNumbersMap.get(cellValue).push(rowIndex + 1);
        else documentNumbersMap.set(cellValue, [rowIndex + 1]);
      }
      const cellContent = document.createElement('div');
      cellContent.style.display = 'flex';
      cellContent.style.flexDirection = 'column';
      cellContent.style.width = '100%';
      if (validValues[columnName]) {
        const select = document.createElement('select');
        select.setAttribute('tabindex', tabIndexCounter++);
        select.style.width = '100%';
        select.style.minWidth = '60px';
        const options = validValues[columnName];
        options.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          if (columnName === 'sexo') option.textContent = value === 'F' ? 'F' : 'M';
          else if (columnName === 'menor') option.textContent = value === '1' ? 'Sí' : 'No';
          else if (["tripulante", "ocupa_butaca"].includes(columnName)) option.textContent = value === "1" ? "Sí" : "No";
          else option.textContent = value;
          if (cellValue.toUpperCase() === value.toUpperCase()) option.selected = true;
          select.appendChild(option);
        });
        select.addEventListener('change', e => {
          tableData[rowIndex + 1][columnIndex] = e.target.value;
          renderTable();
        });
        select.addEventListener('click', e => e.stopPropagation());
        cellContent.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('tabindex', tabIndexCounter++);
        input.value = cellValue;
        input.style.width = '100%';
        input.style.minWidth = '60px';
        input.addEventListener('input', e => tableData[rowIndex + 1][columnIndex] = e.target.value.trim());
        input.addEventListener('blur', () => renderTable());
        input.addEventListener('click', e => e.stopPropagation());
        cellContent.appendChild(input);
      }
      const tipoDocIndex = getColumnIndex('tipo_documento');
      const validationError = validateCell(columnName, row[columnIndex], row[tipoDocIndex]);
      if (validationError) {
        td.classList.add('invalid-cell');
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = validationError;
        cellContent.appendChild(errorSpan);
        invalidCellsCount++;
      }
      if (columnName === 'numero_documento' && documentNumbersMap.get(cellValue)?.length > 1) {
        td.classList.add('invalid-cell');
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = "Error: Número de documento duplicado";
        cellContent.appendChild(errorSpan);
        invalidCellsCount++;
      }
      td.appendChild(cellContent);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  document.getElementById('saveBtn').disabled = invalidCellsCount > 0;
  table.appendChild(tbody);
  container.appendChild(table);
  updateDeleteButtonState();
}

function updateDeleteButtonState() {
  const deleteBtn = document.getElementById('deleteBtn');
  const hasSelectedRows = document.querySelectorAll('.selected-row').length > 0;
  deleteBtn.disabled = !hasSelectedRows;
}

function validateCell(columnName, value, tipoDoc = "") {
  value = (value || "").trim();
  tipoDoc = (tipoDoc || "").trim().toUpperCase();
  switch(columnName) {
    case 'apellido':
      if (!value) return "Error: Apellido es requerido";
      if (value.length > 100) return "Error: Máximo 100 caracteres";
      break;
    case 'nombre':
      if (!value) return "Error: Nombre es requerido";
      if (value.length > 100) return "Error: Máximo 100 caracteres";
      break;
    case 'numero_documento':
      if (!value) return "Error: Número de documento es requerido";
      if (tipoDoc === "DNI" && !/^\d{7,8}$/.test(value)) 
        return "Error: DNI debe tener 7 u 8 dígitos";
      if ((tipoDoc === "PASAPORTE" || tipoDoc === "OTROS") && (value.length < 5 || value.length > 100))
        return "Error: Documento debe tener entre 5 y 100 caracteres";
      break;
    default: return "";
  }
  return "";
}

function getHeaderTooltip(headerName) {
  const tips = {
    "numero_documento": "Número de Documento - DNI: 7-8 dígitos | Pasaporte: 5-100 caracteres",
    "N°": "Número de Documento - DNI: 7-8 dígitos | Pasaporte: 5-100 caracteres",
    "observaciones": "Notas adicionales sobre el pasajero",
    "Obs.": "Notas adicionales sobre el pasajero",
    "apellido": "Apellido del pasajero",
    "nombre": "Nombre del pasajero",
    "menor": "0 = NO, 1 = SI",
    "ocupa_butaca": "0 = NO, 1 = SI",
    "tipo_documento": "Valores válidos: DNI, Pasaporte, OTROS",
    "sexo": "F = Femenino, M = Masculino"
  };
  return tips[headerName] || "";
}

function removeSelectedRows() {
  const selectedRows = document.querySelectorAll('.selected-row');
  if (selectedRows.length === 0) {
    alert('No hay filas seleccionadas para eliminar.');
    return;
  }
  const indexesToRemove = Array.from(selectedRows).map(tr => parseInt(tr.querySelector('td:first-child').textContent));
  if (indexesToRemove.length === 0) return;
  indexesToRemove.sort((a, b) => b - a).forEach(index => tableData.splice(index, 1));
  renderTable();
}

function sortTableByColumn(columnIndex) {
  if (tableData.length <= 1) return;
  if (currentSortColumn === columnIndex) sortDirection *= -1;
  else {
    currentSortColumn = columnIndex;
    sortDirection = 1;
  }
  const header = tableData[0];
  const body = tableData.slice(1);
  body.sort((a, b) => {
    const valA = a[columnIndex]?.toString().toLowerCase() || '';
    const valB = b[columnIndex]?.toString().toLowerCase() || '';
    return valA.localeCompare(valB) * sortDirection;
  });
  tableData = [header, ...body];
  renderTable();
}

function confirmDownload() {
  if (document.getElementById('saveBtn').disabled) {
    alert('No se puede guardar mientras existan errores en los datos');
    return;
  }
  const fileNameInput = document.getElementById('fileNameInputModal').value.trim();
  const fileName = fileNameInput ? fileNameInput + '.csv' : 'datos_editados.csv';
  const csvContent = tableData.map(row => row.join(';')).join('\n');
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  closeSaveModal();
}
