// Variables globales
let tableData = [];
let editingIndex = null;
let documentNumbersMap = new Map();
let currentSortColumn = null;
let sortDirection = 1;

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
  nacionalidad: [
    "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Anguilla", "Antártida", 
    "Antigua y Barbuda", "Antillas Holandesas", "Arabia Saudí", "Argelia", "Argentina", 
    "Armenia", "Aruba", "ARY Macedonia", "Australia", "Austria", "Azerbaiyán", "Bahamas", 
    "Bahréin", "Bangladesh", "Barbados", "Bélgica", "Belice", "Benin", "Bermudas", "Bhután", 
    "Bielorrusia", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", 
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Camboya", "Camerún", "Canadá", 
    "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", 
    "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", 
    "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", 
    "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", 
    "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", 
    "Gibraltar", "Granada", "Grecia", "Groenlandia", "Guadalupe", "Guam", "Guatemala", 
    "Guayana Francesa", "Guinea", "Guinea Ecuatorial", "Guinea-Bissau", "Guyana", "Haití", 
    "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irán", "Iraq", "Irlanda", 
    "Isla Bouvet", "Isla de Navidad", "Isla Norfolk", "Islandia", "Islas Caimán", "Islas Cocos", 
    "Islas Cook", "Islas Feroe", "Islas Georgias del Sur y Sandwich del Sur", "Islas Gland", 
    "Islas Heard y McDonald", "Islas Malvinas", "Islas Marianas del Norte", "Islas Marshall", 
    "Islas Pitcairn", "Islas Salomón", "Islas Turcas y Caicos", "Islas ultramarinas de Estados Unidos", 
    "Islas Vírgenes Británicas", "Islas Vírgenes de los Estados Unidos", "Israel", "Italia", 
    "Jamaica", "Japón", "Jordania", "Kazajstán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", 
    "Laos", "Lesotho", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", 
    "Luxemburgo", "Macao", "Madagascar", "Malasia", "Malawi", "Maldivas", "Malí", "Malta", 
    "Marruecos", "Martinica", "Mauricio", "Mauritania", "Mayotte", "México", "Micronesia", 
    "Moldavia", "Mónaco", "Mongolia", "Montserrat", "Mozambique", "Myanmar", "Namibia", 
    "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Niue", "Noruega", "Nueva Caledonia", 
    "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palau", "Palestina", "Panamá", 
    "Papúa Nueva Guinea", "Paraguay", "Perú", "Polinesia Francesa", "Polonia", "Portugal", 
    "Puerto Rico", "Qatar", "Reino Unido", "República Centroafricana", "República Checa", 
    "República Democrática del Congo", "República Dominicana", "Reunión", "Ruanda", "Rumania", 
    "Rusia", "Sahara Occidental", "Samoa", "Samoa Americana", "San Cristóbal y Nevis", 
    "San Marino", "San Pedro y Miquelón", "San Vicente y las Granadinas", "Santa Helena", 
    "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia y Montenegro", "Seychelles", 
    "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", 
    "Sudán", "Suecia", "Suiza", "Surinam", "Svalbard y Jan Mayen", "Tailandia", "Taiwán", 
    "Tanzania", "Tayikistán", "Territorio Británico del Océano Índico", 
    "Territorios Australes Franceses", "Timor Oriental", "Togo", "Tokelau", "Tonga", 
    "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", 
    "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Wallis y Futuna", "Yemen", 
    "Yibuti", "Zambia", "Zimbabue"
  ].sort((a, b) => a.localeCompare(b)),
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
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar tabla vacía
  if (tableData.length === 0) {
    tableData = [defaultHeader];
  }
  
  // Configurar nacionalidades
  populateNationalities();
  
  // Configurar eventos
  setupEventListeners();
  
  // Configurar validación en tiempo real
  setupRealTimeValidation();
  
  // Configurar vista inicial
  detectMobileView();
  renderView();
  
  // Configurar radio buttons
  setupRadioButtons();
});

// Configurar event listeners
function setupEventListeners() {
  document.getElementById('csvFile').addEventListener('change', handleFileUpload);
  window.addEventListener('resize', detectMobileView);
}

// Configurar radio buttons para sexo
function setupRadioButtons() {
  const sexoInputs = document.querySelectorAll('input[name="sexo"]');
  sexoInputs.forEach(input => {
    input.addEventListener('change', function() {
      document.getElementById('sexo').value = this.value;
    });
  });
  
  // Establecer valor inicial
  document.querySelector('input[name="sexo"][value="F"]').checked = true;
  document.getElementById('sexo').value = 'F';
}

// Configurar validación en tiempo real
function setupRealTimeValidation() {
  const docNumberInput = document.getElementById('numero_documento');
  const docTypeSelect = document.getElementById('tipo_documento');
  const lastNameInput = document.getElementById('apellido');
  const firstNameInput = document.getElementById('nombre');
  
  // Validar número de documento
  function validateDocumentNumber() {
    const tipo = docTypeSelect.value;
    const numero = docNumberInput.value.trim();
    const errorElement = document.getElementById('numeroDocumentoError');
    
    // Limpiar error
    docNumberInput.classList.remove('invalid');
    errorElement.textContent = '';
    
    if (!numero) {
      errorElement.textContent = 'El número de documento es requerido';
      docNumberInput.classList.add('invalid');
      return false;
    }
    
    if (tipo === 'DNI') {
      if (!/^\d{7,8}$/.test(numero)) {
        errorElement.textContent = 'El DNI debe tener 7 u 8 dígitos';
        docNumberInput.classList.add('invalid');
        return false;
      }
    } else {
      if (numero.length < 5 || numero.length > 100) {
        errorElement.textContent = 'Debe tener entre 5 y 100 caracteres';
        docNumberInput.classList.add('invalid');
        return false;
      }
    }
    
    return true;
  }
  
  // Validar apellido
  function validateLastName() {
    const valor = lastNameInput.value.trim();
    const errorElement = document.getElementById('apellidoError');
    
    lastNameInput.classList.remove('invalid');
    errorElement.textContent = '';
    
    if (!valor) {
      errorElement.textContent = 'El apellido es requerido';
      lastNameInput.classList.add('invalid');
      return false;
    }
    
    if (valor.length > 100) {
      errorElement.textContent = 'Máximo 100 caracteres';
      lastNameInput.classList.add('invalid');
      return false;
    }
    
    return true;
  }
  
  // Validar nombre
  function validateFirstName() {
    const valor = firstNameInput.value.trim();
    const errorElement = document.getElementById('nombreError');
    
    firstNameInput.classList.remove('invalid');
    errorElement.textContent = '';
    
    if (!valor) {
      errorElement.textContent = 'El nombre es requerido';
      firstNameInput.classList.add('invalid');
      return false;
    }
    
    if (valor.length > 100) {
      errorElement.textContent = 'Máximo 100 caracteres';
      firstNameInput.classList.add('invalid');
      return false;
    }
    
    return true;
  }
  
  // Asignar eventos
  docNumberInput.addEventListener('input', validateDocumentNumber);
  docTypeSelect.addEventListener('change', validateDocumentNumber);
  lastNameInput.addEventListener('input', validateLastName);
  firstNameInput.addEventListener('input', validateFirstName);
}

// Detectar si es móvil y ajustar vista
function detectMobileView() {
  const isMobile = window.innerWidth <= 768;
  const passengersList = document.querySelector('.passengers-list');
  const tableSection = document.querySelector('.table-section');
  
  if (isMobile) {
    passengersList.style.display = 'block';
    tableSection.style.display = 'none';
  } else {
    passengersList.style.display = 'none';
    tableSection.style.display = 'block';
  }
}

// Renderizar la vista apropiada
function renderView() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    renderMobileList();
  } else {
    renderTable();
  }
  updateStats();
}

// Actualizar estadísticas
function updateStats() {
  const total = Math.max(0, tableData.length - 1);
  const errorCount = calculateErrorCount();
  
  document.getElementById('rowCount').textContent = `${total} pasajero${total !== 1 ? 's' : ''}`;
  document.getElementById('errorCount').textContent = `${errorCount} error${errorCount !== 1 ? 'es' : ''}`;
  document.getElementById('saveBtn').disabled = errorCount > 0;
}

// Calcular errores
function calculateErrorCount() {
  let errorCount = 0;
  const body = tableData.slice(1);
  
  if (body.length === 0) return 0;
  
  body.forEach((row, rowIndex) => {
    // Validar campos obligatorios
    if (!row[0]?.trim() || !row[1]?.trim() || !row[4]?.trim()) {
      errorCount++;
    }
    
    // Validar formato DNI
    const tipoDoc = row[2] || 'DNI';
    const numDoc = row[4] || '';
    if (tipoDoc === 'DNI' && !/^\d{7,8}$/.test(numDoc)) {
      errorCount++;
    }
    
    // Validar documentos duplicados
    const docIndex = tableData[0] ? tableData[0].indexOf('numero_documento') : -1;
    if (docIndex !== -1) {
      const duplicates = body.filter((r, i) => i !== rowIndex && r[docIndex] === row[docIndex]);
      if (duplicates.length > 0) {
        errorCount++;
      }
    }
  });
  
  return errorCount;
}

// Manejo de archivos CSV
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(event) {
    try {
      const text = event.target.result;
      tableData = parseCSV(text);
      renderView();
      showNotification('Archivo cargado exitosamente', 'success');
    } catch (error) {
      showNotification('Error al cargar el archivo CSV', 'error');
      console.error('Error loading CSV:', error);
    }
  };
  
  reader.onerror = function() {
    showNotification('Error al leer el archivo', 'error');
  };
  
  reader.readAsText(file);
}

// Parsear CSV
function parseCSV(text) {
  const rows = text.trim().split('\n').map(row => {
    // Manejar campos que puedan contener punto y coma
    return row.split(';').map(cell => cell.trim());
  });
  
  if (rows.length === 0) {
    return [defaultHeader];
  }
  
  let header = rows[0];
  const body = rows.slice(1);
  
  // Asegurar que todas las columnas requeridas estén presentes
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
  
  // Asegurar que todas las filas tengan la misma longitud
  const maxCols = Math.max(...rows.map(row => row.length));
  const processedRows = rows.map(row => {
    while (row.length < maxCols) row.push('');
    return row;
  });
  
  return processedRows;
}

// Poblar nacionalidades en el select
function populateNationalities() {
  const select = document.getElementById('nacionalidad');
  if (!select) return;
  
  select.innerHTML = '';
  validValues.nacionalidad.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    if (country === defaults.nacionalidad) option.selected = true;
    select.appendChild(option);
  });
}

// Renderizar lista móvil
function renderMobileList() {
  const container = document.getElementById('passengersList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (tableData.length <= 1) {
    container.innerHTML = `
      <div class="empty-state">
        <p>📁 No hay pasajeros cargados</p>
        <p class="empty-hint">Sube un archivo CSV o agrega pasajeros manualmente</p>
      </div>
    `;
    return;
  }
  
  const body = tableData.slice(1);
  
  body.forEach((row, index) => {
    const passenger = {
      apellido: row[0] || '',
      nombre: row[1] || '',
      documento: row[4] || '',
      observaciones: row[10] || '',
      sexo: row[5] || 'F',
      menor: row[6] || '0',
      nacionalidad: row[7] || 'Argentina',
      tripulante: row[8] || '0',
      butaca: row[9] || '1'
    };
    
    const card = document.createElement('div');
    card.className = 'passenger-card';
    card.dataset.index = index + 1;
    
    // Detectar si hay errores
    const hasErrors = hasPassengerErrors(row, index);
    if (hasErrors) {
      card.style.borderLeftColor = 'var(--danger-color)';
    }
    
    card.innerHTML = `
      <div class="passenger-header">
        <div class="passenger-name">
          ${passenger.apellido}, ${passenger.nombre}
        </div>
        <div class="passenger-doc">${passenger.documento}</div>
      </div>
      
      <div class="passenger-info">
        <div class="passenger-info-item">
          <span class="passenger-info-label">Sexo:</span>
          ${passenger.sexo === 'F' ? '👩 Femenino' : '👨 Masculino'}
        </div>
        <div class="passenger-info-item">
          <span class="passenger-info-label">Menor:</span>
          ${passenger.menor === '1' ? '👦 Sí' : '👶 No'}
        </div>
        <div class="passenger-info-item">
          <span class="passenger-info-label">Nacionalidad:</span>
          ${passenger.nacionalidad}
        </div>
        <div class="passenger-info-item">
          <span class="passenger-info-label">Tipo:</span>
          ${passenger.tripulante === '1' ? '👨‍✈️ Tripulante' : '👤 Pasajero'}
        </div>
      </div>
      
      ${passenger.observaciones ? `
        <div class="passenger-notes">
          📝 ${passenger.observaciones}
        </div>
      ` : ''}
      
      ${hasErrors ? `
        <div class="error-badge">
          ⚠ Contiene errores
        </div>
      ` : ''}
      
      <div class="card-actions">
        <button class="card-btn edit" onclick="editRow(${index + 1})">
          ✏️ Editar
        </button>
        <button class="card-btn delete" onclick="deletePassenger(${index + 1})">
          🗑️ Eliminar
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Verificar si un pasajero tiene errores
function hasPassengerErrors(row, index) {
  // Validar campos obligatorios
  if (!row[0]?.trim() || !row[1]?.trim() || !row[4]?.trim()) {
    return true;
  }
  
  // Validar formato DNI
  const tipoDoc = row[2] || 'DNI';
  const numDoc = row[4] || '';
  if (tipoDoc === 'DNI' && !/^\d{7,8}$/.test(numDoc)) {
    return true;
  }
  
  // Validar documentos duplicados
  const docIndex = tableData[0] ? tableData[0].indexOf('numero_documento') : -1;
  if (docIndex !== -1) {
    const body = tableData.slice(1);
    const duplicates = body.filter((r, i) => i !== index && r[docIndex] === row[docIndex]);
    if (duplicates.length > 0) {
      return true;
    }
  }
  
  return false;
}

// Eliminar pasajero individual (móvil)
function deletePassenger(index) {
  if (!confirm('¿Estás seguro de eliminar este pasajero?')) {
    return;
  }
  
  tableData.splice(index, 1);
  renderView();
  showNotification('Pasajero eliminado', 'success');
}

// Renderizar tabla desktop
function renderTable() {
  const container = document.getElementById('tableContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (tableData.length === 0 || tableData.length === 1) {
    container.innerHTML = `
      <div class="empty-state">
        <p>📁 No hay pasajeros cargados</p>
        <p class="empty-hint">Sube un archivo CSV o agrega pasajeros manualmente</p>
      </div>
    `;
    return;
  }
  
  const header = tableData[0];
  const body = tableData.slice(1);
  
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  
  // Crear cabecera
  const headRow = document.createElement('tr');
  headRow.innerHTML = '<th><input type="checkbox" id="selectAll" title="Seleccionar todos"></th><th>#</th>';
  
  header.forEach((title, i) => {
    if (i === 3) return; // Omitir descripcion_documento
    
    const th = document.createElement('th');
    th.textContent = title.trim();
    th.title = getHeaderTooltip(title);
    th.dataset.columnIndex = i;
    th.className = 'sortable';
    th.addEventListener('click', () => sortTableByColumn(i));
    
    if (currentSortColumn === i) {
      th.style.backgroundColor = '#e9f4ff';
      th.innerHTML += sortDirection === 1 ? ' ↑' : ' ↓';
    }
    
    headRow.appendChild(th);
  });
  
  thead.appendChild(headRow);
  table.appendChild(thead);
  
  // Crear filas
  documentNumbersMap.clear();
  
  body.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.classList.add('editable-row');
    if (editingIndex === rowIndex + 1) tr.classList.add('editing');
    
    // Checkbox para selección
    tr.innerHTML += `<td><input type="checkbox" class="rowCheckbox" data-index="${rowIndex + 1}" onclick="event.stopPropagation()"></td>`;
    tr.innerHTML += `<td>${rowIndex + 1}</td>`;
    
    row.forEach((cell, colIndex) => {
      if (colIndex === 3) return; // Omitir descripcion_documento
      
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
      
      // Contenido de la celda
      if (validValues[columnName]) {
        const select = document.createElement('select');
        const options = validValues[columnName];
        
        options.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          
          // Texto amigable
          if (columnName === 'sexo') {
            option.textContent = value === 'F' ? 'Femenino' : 'Masculino';
          } else if (columnName === 'menor') {
            option.textContent = value === '1' ? 'Sí' : 'No';
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
        td.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = cellValue;
        input.placeholder = columnName === 'observaciones' ? 'Notas...' : '';
        
        input.addEventListener('input', e => {
          tableData[rowIndex + 1][colIndex] = e.target.value.trim();
        });
        
        input.addEventListener('blur', () => renderTable());
        input.addEventListener('click', e => e.stopPropagation());
        td.appendChild(input);
      }
      
      // Validar celda
      const validationError = validateCell(columnName, row[colIndex], row[2]);
      if (validationError) {
        td.classList.add('invalid');
        td.title = validationError;
      }
      
      // Validar documento duplicado
      if (columnName === 'numero_documento' && documentNumbersMap.get(cellValue)?.length > 1) {
        td.classList.add('invalid');
        td.title = "Número de documento duplicado";
      }
      
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  // Configurar selección múltiple
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('click', function(e) {
      e.stopPropagation();
      const checkboxes = document.querySelectorAll('.rowCheckbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
      });
    });
  }
}

// Validar celda
function validateCell(columnName, value, tipoDoc = "") {
  value = (value || "").trim();
  tipoDoc = (tipoDoc || "").trim().toUpperCase();
  
  switch(columnName) {
    case 'apellido':
      if (!value) return "Apellido es requerido";
      if (value.length > 100) return "Máximo 100 caracteres";
      break;
    case 'nombre':
      if (!value) return "Nombre es requerido";
      if (value.length > 100) return "Máximo 100 caracteres";
      break;
    case 'numero_documento':
      if (!value) return "Número de documento es requerido";
      if (tipoDoc === "DNI" && !/^\d{7,8}$/.test(value)) 
        return "DNI debe tener 7 u 8 dígitos";
      if ((tipoDoc === "PASAPORTE" || tipoDoc === "OTROS") && 
         (value.length < 5 || value.length > 100)) {
        return "Debe tener entre 5 y 100 caracteres";
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
    menor: "0 = No, 1 = Sí",
    ocupa_butaca: "0 = No, 1 = Sí",
    tipo_documento: "Valores válidos: DNI, Pasaporte, OTROS",
    sexo: "F = Femenino, M = Masculino"
  };
  return tips[headerName] || "";
}

// Ordenar tabla por columna
function sortTableByColumn(columnIndex) {
  if (tableData.length <= 1) return;
  
  // Si es la misma columna, invertir dirección
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

// Funciones para el modal de agregar/editar pasajero
function openAddPassengerModal() {
  editingIndex = null;
  document.getElementById('formTitle').textContent = '➕ Agregar Pasajero';
  document.getElementById('savePassengerBtn').textContent = '💾 Guardar Pasajero';
  
  // Resetear formulario
  document.getElementById('passengerForm').reset();
  document.getElementById('nacionalidad').value = defaults.nacionalidad;
  document.getElementById('tipo_documento').value = defaults.tipo_documento;
  document.getElementById('menor').value = defaults.menor;
  document.getElementById('tripulante').value = defaults.tripulante;
  document.getElementById('ocupa_butaca').value = defaults.ocupa_butaca;
  document.querySelector('input[name="sexo"][value="F"]').checked = true;
  document.getElementById('sexo').value = 'F';
  
  // Limpiar errores
  clearFormErrors();
  
  // Mostrar modal
  document.getElementById('addPassengerModal').style.display = 'flex';
  document.getElementById('apellido').focus();
}

function editRow(rowIndex) {
  editingIndex = rowIndex;
  const rowData = tableData[rowIndex];
  
  document.getElementById('formTitle').textContent = '✏️ Editar Pasajero';
  document.getElementById('savePassengerBtn').textContent = '💾 Guardar Cambios';
  
  // Rellenar formulario
  document.getElementById('apellido').value = rowData[0] || '';
  document.getElementById('nombre').value = rowData[1] || '';
  document.getElementById('tipo_documento').value = rowData[2] || defaults.tipo_documento;
  document.getElementById('numero_documento').value = rowData[4] || '';
  
  // Sexo (usando radio buttons)
  const sexoValue = rowData[5] || defaults.sexo;
  document.querySelector(`input[name="sexo"][value="${sexoValue}"]`).checked = true;
  document.getElementById('sexo').value = sexoValue;
  
  document.getElementById('menor').value = rowData[6] || defaults.menor;
  document.getElementById('nacionalidad').value = rowData[7] || defaults.nacionalidad;
  document.getElementById('tripulante').value = rowData[8] || defaults.tripulante;
  document.getElementById('ocupa_butaca').value = rowData[9] || defaults.ocupa_butaca;
  document.getElementById('observaciones').value = rowData[10] || defaults.observaciones;
  
  // Limpiar errores
  clearFormErrors();
  
  // Mostrar modal
  document.getElementById('addPassengerModal').style.display = 'flex';
  document.getElementById('apellido').focus();
}

function closeAddPassengerModal() {
  document.getElementById('addPassengerModal').style.display = 'none';
  editingIndex = null;
}

function clearFormErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => el.textContent = '');
  
  const invalidInputs = document.querySelectorAll('.invalid');
  invalidInputs.forEach(input => input.classList.remove('invalid'));
}

// Validar y guardar pasajero
function validateAndSavePassenger() {
  // Validar campos
  const isLastNameValid = validateLastName();
  const isFirstNameValid = validateFirstName();
  const isDocNumberValid = validateDocumentNumber();
  
  if (!isLastNameValid || !isFirstNameValid || !isDocNumberValid) {
    showNotification('Por favor corrija los errores en el formulario', 'error');
    return;
  }
  
  savePassenger();
}

function savePassenger() {
  const newRow = [
    document.getElementById('apellido').value.trim(),
    document.getElementById('nombre').value.trim(),
    document.getElementById('tipo_documento').value,
    '', // descripcion_documento
    document.getElementById('numero_documento').value.trim(),
    document.getElementById('sexo').value,
    document.getElementById('menor').value,
    document.getElementById('nacionalidad').value,
    document.getElementById('tripulante').value,
    document.getElementById('ocupa_butaca').value,
    document.getElementById('observaciones').value.trim()
  ];
  
  // Validar campos obligatorios
  if (!newRow[0] || !newRow[1] || !newRow[4]) {
    showNotification('Complete los campos obligatorios', 'error');
    return;
  }
  
  // Verificar duplicado en modo creación
  if (editingIndex === null) {
    const docIndex = tableData[0] ? tableData[0].indexOf('numero_documento') : -1;
    if (docIndex !== -1) {
      const existingDoc = tableData.slice(1).find(row => row[docIndex] === newRow[4]);
      if (existingDoc) {
        showNotification('Ya existe un pasajero con este número de documento', 'error');
        return;
      }
    }
  }
  
  if (tableData.length === 0) tableData = [defaultHeader];
  
  if (editingIndex !== null) {
    // Modo edición
    tableData[editingIndex] = newRow;
    showNotification('Pasajero actualizado exitosamente', 'success');
  } else {
    // Modo creación
    tableData.push(newRow);
    showNotification('Pasajero agregado exitosamente', 'success');
  }
  
  renderView();
  closeAddPassengerModal();
}

// Eliminar filas seleccionadas
function removeSelectedRows() {
  const checkboxes = document.querySelectorAll('.rowCheckbox:checked');
  const indexesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
  
  if (indexesToRemove.length === 0) {
    showNotification('Seleccione al menos una fila para eliminar', 'warning');
    return;
  }
  
  if (!confirm(`¿Está seguro de eliminar ${indexesToRemove.length} pasajero(s)?`)) {
    return;
  }
  
  // Eliminar en orden descendente
  indexesToRemove.sort((a, b) => b - a).forEach(index => tableData.splice(index, 1));
  
  renderView();
  showNotification(`${indexesToRemove.length} pasajero(s) eliminado(s)`, 'success');
}

// Funciones para el modal de guardar
function openSaveModal() {
  // Verificar que no haya errores
  const errorCount = calculateErrorCount();
  if (errorCount > 0) {
    showNotification(`Corrija los ${errorCount} error(es) antes de guardar`, 'error');
    return;
  }
  
  // Generar nombre por defecto
  const defaultName = `pasajeros_${new Date().toISOString().slice(0,10).replace(/-/g, '')}`;
  document.getElementById('fileNameInputModal').value = defaultName;
  document.getElementById('fileNamePreview').textContent = `${defaultName}.csv`;
  
  document.getElementById('saveModal').style.display = 'flex';
  document.getElementById('fileNameInputModal').focus();
}

function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
}

function confirmDownload() {
  const fileNameInput = document.getElementById('fileNameInputModal').value.trim();
  const fileName = fileNameInput ? fileNameInput + '.csv' : 'datos_editados.csv';
  
  // Crear contenido CSV
  const csvContent = tableData.map(row => 
    row.map(cell => 
      cell.includes(';') || cell.includes('\n') ? `"${cell}"` : cell
    ).join(';')
  ).join('\n');
  
  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  closeSaveModal();
  showNotification(`Archivo "${fileName}" descargado`, 'success');
}

// Mostrar notificación
function showNotification(message, type = 'info') {
  // Eliminar notificación existente
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Crear notificación
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Estilos
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: var(--radius);
    background: ${type === 'success' ? 'var(--secondary-color)' : 
                 type === 'error' ? 'var(--danger-color)' : 
                 type === 'warning' ? 'var(--warning-color)' : 
                 'var(--primary-color)'};
    color: white;
    font-weight: 500;
    box-shadow: var(--shadow);
    z-index: 3000;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
    word-break: break-word;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Estilos CSS para animaciones de notificación
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .error-badge {
    background: var(--danger-color);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-block;
    margin-bottom: 10px;
  }
`;
document.head.appendChild(style);
