// Datos y estado
let csvData = [];
let currentEditIndex = -1;
const headers = ["Apellido", "Nombre", "Tipo Doc", "Número Doc", "Sexo", "Menor", "Nacionalidad"];
const documentNumbers = new Set();
const nationalities = [
  "Argentina", "Brasil", "Chile", "Colombia", "México", "Perú", 
  "España", "Estados Unidos", "Francia", "Italia", "Alemania"
].sort();

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('csvFile').addEventListener('change', handleFileUpload);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  populateNationalities();
});

function populateNationalities() {
  const select = document.getElementById('nationality');
  nationalities.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
}

// Manejo de archivos
function handleFileUpload(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const content = e.target.result;
    csvData = parseCSV(content);
    updateDocumentNumbers();
    renderTable();
  };
  
  reader.readAsText(file);
}

function parseCSV(text) {
  const rows = text.trim().split('\n').map(row => row.split(';'));
  // Asegurar que todas las filas tengan la misma longitud
  const maxCols = Math.max(...rows.map(row => row.length));
  return rows.map(row => {
    while (row.length < maxCols) row.push('');
    return row;
  });
}

function updateDocumentNumbers() {
  documentNumbers.clear();
  const docIndex = headers.indexOf("Número Doc");
  csvData.forEach(row => {
    if (row[docIndex]) documentNumbers.add(row[docIndex]);
  });
}

// Renderizado de tabla
function renderTable(data = csvData) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';
  
  if (data.length === 0) {
    container.innerHTML = '<p>No hay datos para mostrar</p>';
    return;
  }
  
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  
  // Cabecera
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th><input type="checkbox" id="selectAll"></th>';
  
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.onclick = () => sortTable(header);
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Filas
  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="checkbox" class="rowCheckbox" data-index="${index}"></td>`;
    
    row.forEach((cell, colIndex) => {
      const td = document.createElement('td');
      
      if (headers[colIndex] === "Sexo" || headers[colIndex] === "Menor") {
        const select = document.createElement('select');
        const options = headers[colIndex] === "Sexo" ? ["F", "M"] : ["0", "1"];
        
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = headers[colIndex] === "Sexo" 
            ? (opt === "F" ? "Femenino" : "Masculino")
            : (opt === "1" ? "Sí" : "No");
          if (cell === opt) option.selected = true;
          select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
          csvData[index][colIndex] = e.target.value;
        });
        
        td.appendChild(select);
      } else {
        td.textContent = cell;
      }
      
      // Validar celdas
      validateCell(td, headers[colIndex], cell, index);
      tr.appendChild(td);
    });
    
    tr.onclick = () => editRow(index);
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  // Evento para seleccionar todos
  document.getElementById('selectAll').onclick = function(e) {
    e.stopPropagation();
    const checkboxes = document.querySelectorAll('.rowCheckbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  };
}

function validateCell(td, header, value, rowIndex) {
  const docIndex = headers.indexOf("Número Doc");
  
  if (header === "Apellido" || header === "Nombre") {
    if (!value || value.trim() === '') {
      td.classList.add('invalid-cell');
      td.title = "Campo obligatorio";
    }
  }
  
  if (header === "Número Doc") {
    const docTypeIndex = headers.indexOf("Tipo Doc");
    const docType = csvData[rowIndex][docTypeIndex];
    
    if (!value || value.trim() === '') {
      td.classList.add('invalid-cell');
      td.title = "Campo obligatorio";
    } else if (docType === "DNI" && !/^\d{7,8}$/.test(value)) {
      td.classList.add('invalid-cell');
      td.title = "DNI debe tener 7 u 8 dígitos";
    } else if ((docType === "Pasaporte" || docType === "OTROS") && value.length < 5) {
      td.classList.add('invalid-cell');
      td.title = "Mínimo 5 caracteres";
    }
    
    // Validar duplicados
    const duplicates = csvData.filter((row, i) => i !== rowIndex && row[docIndex] === value);
    if (duplicates.length > 0) {
      td.classList.add('invalid-cell');
      td.title = "Número de documento duplicado";
    }
  }
}

// Ordenación
function sortTable(header) {
  const headerIndex = headers.indexOf(header);
  if (headerIndex === -1) return;
  
  csvData.sort((a, b) => {
    const valA = a[headerIndex] || '';
    const valB = b[headerIndex] || '';
    return valA.toString().localeCompare(valB.toString());
  });
  
  renderTable();
}

// Búsqueda
function handleSearch(e) {
  const term = e.target.value.toLowerCase();
  if (!term) {
    renderTable();
    return;
  }
  
  const filtered = csvData.filter(row => 
    row.some(cell => cell.toLowerCase().includes(term))
  );
  
  renderTable(filtered);
}

// Funciones de modales
function openAddPassengerModal() {
  currentEditIndex = -1;
  document.getElementById('modalTitle').textContent = 'Agregar Pasajero';
  clearErrors();
  resetForm();
  document.getElementById('passengerModal').style.display = 'flex';
}

function editRow(index) {
  currentEditIndex = index;
  const passenger = csvData[index];
  
  document.getElementById('modalTitle').textContent = 'Editar Pasajero';
  document.getElementById('lastName').value = passenger[0] || '';
  document.getElementById('firstName').value = passenger[1] || '';
  document.getElementById('docType').value = passenger[2] || 'DNI';
  document.getElementById('docNumber').value = passenger[3] || '';
  document.getElementById('gender').value = passenger[4] || 'F';
  document.getElementById('minor').value = passenger[5] || '0';
  document.getElementById('nationality').value = passenger[6] || 'Argentina';
  
  clearErrors();
  document.getElementById('passengerModal').style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });
}

function resetForm() {
  document.getElementById('lastName').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('docType').value = 'DNI';
  document.getElementById('docNumber').value = '';
  document.getElementById('gender').value = 'F';
  document.getElementById('minor').value = '0';
  document.getElementById('nationality').value = 'Argentina';
}

// Validación y guardado
function validateAndSave() {
  const lastName = document.getElementById('lastName').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const docNumber = document.getElementById('docNumber').value.trim();
  const docType = document.getElementById('docType').value;
  
  let isValid = true;
  clearErrors();
  
  if (!lastName) {
    document.getElementById('lastNameError').textContent = 'Apellido es requerido';
    isValid = false;
  }
  
  if (!firstName) {
    document.getElementById('firstNameError').textContent = 'Nombre es requerido';
    isValid = false;
  }
  
  if (!docNumber) {
    document.getElementById('docNumberError').textContent = 'Número de documento es requerido';
    isValid = false;
  } else if (docType === "DNI" && !/^\d{7,8}$/.test(docNumber)) {
    document.getElementById('docNumberError').textContent = 'DNI debe tener 7 u 8 dígitos';
    isValid = false;
  } else if ((docType === "Pasaporte" || docType === "OTROS") && docNumber.length < 5) {
    document.getElementById('docNumberError').textContent = 'Mínimo 5 caracteres';
    isValid = false;
  } else if (isDocNumberDuplicate(docNumber)) {
    document.getElementById('docNumberError').textContent = 'Número de documento ya existe';
    isValid = false;
  }
  
  if (isValid) {
    savePassenger();
  }
}

function isDocNumberDuplicate(docNumber) {
  if (currentEditIndex >= 0) {
    const currentDoc = csvData[currentEditIndex][3];
    if (currentDoc === docNumber) return false;
  }
  return documentNumbers.has(docNumber);
}

function savePassenger() {
  const newRow = [
    document.getElementById('lastName').value.trim(),
    document.getElementById('firstName').value.trim(),
    document.getElementById('docType').value,
    document.getElementById('docNumber').value.trim(),
    document.getElementById('gender').value,
    document.getElementById('minor').value,
    document.getElementById('nationality').value
  ];
  
  if (currentEditIndex === -1) {
    csvData.push(newRow);
    documentNumbers.add(newRow[3]);
  } else {
    // Actualizar el conjunto de números de documento si cambió
    if (csvData[currentEditIndex][3] !== newRow[3]) {
      documentNumbers.delete(csvData[currentEditIndex][3]);
      documentNumbers.add(newRow[3]);
    }
    csvData[currentEditIndex] = newRow;
  }
  
  renderTable();
  closeModal('passengerModal');
}

// Acciones
function removeSelectedRows() {
  const checkboxes = document.querySelectorAll('.rowCheckbox:checked');
  const indexes = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
  
  if (indexes.length === 0) {
    alert('Seleccione al menos una fila');
    return;
  }
  
  // Eliminar en orden descendente y actualizar números de documento
  indexes.sort((a, b) => b - a).forEach(i => {
    documentNumbers.delete(csvData[i][3]);
    csvData.splice(i, 1);
  });
  
  renderTable();
}

function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  selectAll.checked = !selectAll.checked;
  document.querySelectorAll('.rowCheckbox').forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
}

function openSaveModal() {
  // Validar que no haya celdas inválidas antes de guardar
  const invalidCells = document.querySelectorAll('.invalid-cell');
  if (invalidCells.length > 0) {
    alert('Corrija los errores resaltados en rojo antes de guardar');
    return;
  }
  
  document.getElementById('fileNameInput').value = '';
  document.getElementById('saveModal').style.display = 'flex';
}

function downloadCSV() {
  const fileName = document.getElementById('fileNameInput').value.trim() || 'pasajeros';
  const content = csvData.map(row => row.join(';')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.csv`;
  a.click();
  
  closeModal('saveModal');
}
