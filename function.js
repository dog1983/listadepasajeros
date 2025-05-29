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

const validValues = {
  tipo_documento: ["DNI", "Pasaporte", "OTROS"],
  sexo: ["F", "M"],
  menor: ["0", "1"],
  nacionalidad: ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Anguilla", "Antártida", "Antigua y Barbuda", "Antillas Holandesas", "Arabia Saudí", "Argelia", "Argentina", "Armenia", "Aruba", "ARY Macedonia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bahréin", "Bangladesh", "Barbados", "Bélgica", "Belice", "Benin", "Bermudas", "Bhután", "Bielorrusia", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Gibraltar", "Granada", "Grecia", "Groenlandia", "Guadalupe", "Guam", "Guatemala", "Guayana Francesa", "Guinea", "Guinea Ecuatorial", "Guinea-Bissau", "Guyana", "Haití", "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irán", "Iraq", "Irlanda", "Isla Bouvet", "Isla de Navidad", "Isla Norfolk", "Islandia", "Islas Caimán", "Islas Cocos", "Islas Cook", "Islas Feroe", "Islas Georgias del Sur y Sandwich del Sur", "Islas Gland", "Islas Heard y McDonald", "Islas Malvinas", "Islas Marianas del Norte", "Islas Marshall", "Islas Pitcairn", "Islas Salomón", "Islas Turcas y Caicos", "Islas ultramarinas de Estados Unidos", "Islas Vírgenes Británicas", "Islas Vírgenes de los Estados Unidos", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajstán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesotho", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macao", "Madagascar", "Malasia", "Malawi", "Maldivas", "Malí", "Malta", "Marruecos", "Martinica", "Mauricio", "Mauritania", "Mayotte", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montserrat", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Niue", "Noruega", "Nueva Caledonia", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palau", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polinesia Francesa", "Polonia", "Portugal", "Puerto Rico", "Qatar", "Reino Unido", "República Centroafricana", "República Checa", "República Democrática del Congo", "República Dominicana", "Reunión", "Ruanda", "Rumania", "Rusia", "Sahara Occidental", "Samoa", "Samoa Americana", "San Cristóbal y Nevis", "San Marino", "San Pedro y Miquelón", "San Vicente y las Granadinas", "Santa Helena", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia y Montenegro", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Suecia", "Suiza", "Surinam", "Svalbard y Jan Mayen", "Tailandia", "Taiwán", "Tanzania", "Tayikistán", "Territorio Británico del Océano Índico", "Territorios Australes Franceses", "Timor Oriental", "Togo", "Tokelau", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Wallis y Futuna", "Yemen", "Yibuti", "Zambia", "Zimbabue"].sort((a, b) => a.localeCompare(b)),
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

// Inicialización
window.onload = function() {
  if (tableData.length === 0) {
    tableData = [defaultHeader];
    renderTable();
  }
  populateNationalities();
  
  // Configurar evento para el input de archivo
  document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const text = event.target.result;
      tableData = parseCSV(text);
      renderTable();
    };
    reader.readAsText(file);
  });
};

function populateNationalities() {
  const select = document.getElementById('nacionalidad');
  select.innerHTML = '';
  validValues.nacionalidad.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    if (country === defaults.nacionalidad) option.selected = true;
    select.appendChild(option);
  });
}

// Funciones para el modal de agregar/editar pasajero
function openAddPassengerModal() {
  editingIndex = null;
  document.getElementById('formTitle').textContent = 'Agregar Nuevo Pasajero';
  document.getElementById('savePassengerBtn').textContent = 'Agregar Pasajero';
  document.getElementById('passengerForm').reset();
  document.getElementById('nacionalidad').value = defaults.nacionalidad;
  document.getElementById('addPassengerModal').style.display = 'block';
  document.getElementById('apellido').focus();
}

function editRow(rowIndex) {
  editingIndex = rowIndex;
  const rowData = tableData[rowIndex];
  
  document.getElementById('formTitle').textContent = 'Editar Pasajero';
  document.getElementById('savePassengerBtn').textContent = 'Guardar Cambios';
  
  document.getElementById('apellido').value = rowData[0] || '';
  document.getElementById('nombre').value = rowData[1] || '';
  document.getElementById('tipo_documento').value = rowData[2] || defaults.tipo_documento;
  document.getElementById('numero_documento').value = rowData[4] || '';
  document.getElementById('sexo').value = rowData[5] || defaults.sexo;
  document.getElementById('menor').value = rowData[6] || defaults.menor;
  document.getElementById('nacionalidad').value = rowData[7] || defaults.nacionalidad;
  document.getElementById('tripulante').value = rowData[8] || defaults.tripulante;
  document.getElementById('ocupa_butaca').value = rowData[9] || defaults.ocupa_butaca;
  document.getElementById('observaciones').value = rowData[10] || defaults.observaciones;
  
  document.getElementById('addPassengerModal').style.display = 'block';
  document.getElementById('apellido').focus();
}

function closeAddPassengerModal() {
  document.getElementById('addPassengerModal').style.display = 'none';
  editingIndex = null;
}

function savePassenger() {
  const newRow = [
    document.getElementById('apellido').value.trim(),
    document.getElementById('nombre').value.trim(),
    document.getElementById('tipo_documento').value,
    '', // descripcion_documento
    document.getElementById('numero_documento').value.trim(),
    document.getElementById('sexo').value || defaults.sexo,
    document.getElementById('menor').value || defaults.menor,
    document.getElementById('nacionalidad').value || defaults.nacionalidad,
    document.getElementById('tripulante').value || defaults.tripulante,
    document.getElementById('ocupa_butaca').value || defaults.ocupa_butaca,
    document.getElementById('observaciones').value.trim() || defaults.observaciones
  ];

  // Validación básica (solo campos obligatorios)
  if (!newRow[0] || !newRow[1] || !newRow[4]) {
    alert('Por favor complete los campos obligatorios (Apellido, Nombre y Número de Documento)');
    return;
  }

  if (tableData.length === 0) tableData = [defaultHeader];
  
  if (editingIndex !== null) {
    // Modo edición
    tableData[editingIndex] = newRow;
  } else {
    // Modo creación
    tableData.push(newRow);
  }
  
  renderTable();
  closeAddPassengerModal();
}

// Funciones para el modal de guardar
function openSaveModal() {
  document.getElementById('saveModal').style.display = 'flex';
  document.getElementById('fileNameInputModal').focus();
}

function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
}

function parseCSV(text) {
  const rows = text.trim().split('\n').map(row => row.split(';'));
  let header = rows[0];
  const body = rows.slice(1);

  const requiredColumns = [
    { name: 'ocupa_butaca', defaultValue: '1' },
    { name: 'observaciones', defaultValue: '' }
  ];

  requiredColumns.forEach(col => {
    if (!header.includes(col.name)) {
      header.push(col.name);
      body.forEach(row => row.push(col.defaultValue));
    }
  });

  return [header, ...body];
}

// Renderizado de la tabla
function renderTable() {
  const container = document.getElementById('tableContainer');
  const table = document.createElement('table');
  container.innerHTML = '';

  if (tableData.length === 0) return;

  const header = tableData[0];
  const body = tableData.slice(1);

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');

  headRow.innerHTML = `<th>Sel</th><th>#</th>`;
  header.forEach((title, i) => {
    if (i === 3) return;
    const th = document.createElement('th');
    th.textContent = title.trim();
    th.title = getHeaderTooltip(title);
    th.dataset.columnIndex = i;
    th.addEventListener('click', () => sortTableByColumn(i));
    if (currentSortColumn === i) {
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
    
    tr.addEventListener('click', () => editRow(rowIndex + 1));

    tr.innerHTML += `<td><input type="checkbox" class="rowCheckbox" data-index="${rowIndex + 1}" tabindex="${(rowIndex * 100) + 0}" onclick="event.stopPropagation()"></td>`;
    tr.innerHTML += `<td>${rowIndex + 1}</td>`;

    let tabIndexCounter = (rowIndex * 100) + 1;

    row.forEach((cell, colIndex) => {
      if (colIndex === 3) return;

      const td = document.createElement('td');
      const columnName = header[colIndex];
      const cellValue = cell.trim();

      // Registrar número de documento para validar duplicados
      if (columnName === 'numero_documento') {
        if (documentNumbersMap.has(cellValue)) {
          documentNumbersMap.get(cellValue).push(rowIndex + 1);
        } else {
          documentNumbersMap.set(cellValue, [rowIndex + 1]);
        }
      }

      // Contenedor para el contenido de la celda
      const cellContent = document.createElement('div');
      cellContent.style.display = 'flex';
      cellContent.style.flexDirection = 'column';

      if (validValues[columnName]) {
        const select = document.createElement('select');
        select.setAttribute('tabindex', tabIndexCounter++);
        const options = validValues[columnName];

        options.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          
          if (columnName === 'sexo') {
            option.textContent = value === 'F' ? 'Femenino' : 'Masculino';
          } else if (columnName === 'menor') {
            option.textContent = value === '1' ? 'Sí (Menor)' : 'No (Adulto)';
          } else if (["tripulante", "ocupa_butaca"].includes(columnName)) {
            option.textContent = value === "1" ? "Sí" : "No";
          } else {
            option.textContent = value;
          }
          
          if (cellValue.toUpperCase() === value.toUpperCase()) option.selected = true;
          select.appendChild(option);
        });

        select.addEventListener('change', e => {
          tableData[rowIndex + 1][colIndex] = e.target.value;
          renderTable();
        });

        select.addEventListener('click', e => e.stopPropagation());

        cellContent.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('tabindex', tabIndexCounter++);
        input.value = cellValue;

        input.addEventListener('input', e => {
          tableData[rowIndex + 1][colIndex] = e.target.value.trim();
        });

        input.addEventListener('blur', () => renderTable());
        input.addEventListener('click', e => e.stopPropagation());

        cellContent.appendChild(input);
      }

      // Validación por celda
      const validationError = validateCell(columnName, row[colIndex], row[2]);
      if (validationError) {
        td.classList.add('invalid-cell');
        
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = validationError;
        
        cellContent.appendChild(errorSpan);
        invalidCellsCount++;
      }

      // Validación de documento duplicado
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

  // Bloquear guardado si hay errores (incluyendo duplicados)
  document.getElementById('saveBtn').disabled = invalidCellsCount > 0;
  table.appendChild(tbody);
  container.appendChild(table);
}

// Validación de celdas
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
      if ((tipoDoc === "PASAPORTE" || tipoDoc === "OTROS") && 
         (value.length < 5 || value.length > 100)) {
        return "Error: Documento debe tener entre 5 y 100 caracteres";
      }
      break;
    default:
      return "";
  }
  return "";
}

// Tooltips para headers
function getHeaderTooltip(headerName) {
  const tips = {
    numero_documento: "DNI: 7-8 dígitos | Pasaporte: 5-100 caracteres",
    menor: "0 = NO (Adulto), 1 = SI (Menor)",
    ocupa_butaca: "0 = NO, 1 = SI",
    tipo_documento: "Valores válidos: DNI, Pasaporte, OTROS",
    sexo: "F = Femenino, M = Masculino"
  };
  return tips[headerName] || "";
}

// Funciones de acciones
function removeSelectedRows() {
  const checkboxes = document.querySelectorAll('.rowCheckbox:checked');
  const indexesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
  if (indexesToRemove.length === 0) {
    alert('No hay filas seleccionadas para eliminar.');
    return;
  }
  indexesToRemove.sort((a, b) => b - a).forEach(index => tableData.splice(index, 1));
  renderTable();
}

function sortTableByColumn(columnIndex) {
  if (tableData.length <= 1) return;
  
  // Si es la misma columna, invertir la dirección
  if (currentSortColumn === columnIndex) {
    sortDirection *= -1;
  } else {
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

function sortTableByHeader() {
  if (tableData.length <= 1) return;
  
  const header = tableData[0];
  const columnNames = header.filter((_, i) => i !== 3); // Excluir descripcion_documento
  
  const columnToSort = prompt(`Ingrese el nombre de la columna para ordenar:\n${columnNames.join(', ')}`);
  if (!columnToSort) return;
  
  const columnIndex = header.findIndex(col => col.toLowerCase() === columnToSort.toLowerCase());
  if (columnIndex === -1 || columnIndex === 3) {
    alert('Columna no válida');
    return;
  }
  
  sortTableByColumn(columnIndex);
}

function confirmDownload() {
  // Verificar nuevamente antes de guardar (por si acaso)
  if (document.getElementById('saveBtn').disabled) {
    alert('No se puede guardar mientras existan errores en los datos');
    return;
  }

  const fileNameInput = document.getElementById('fileNameInputModal').value.trim();
  const fileName = fileNameInput ? fileNameInput + '.csv' : 'datos_editados.csv';
  const csvContent = tableData.map(row => row.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  closeSaveModal();
}
