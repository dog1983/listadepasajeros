// Datos y estado
let csvData = [];
let currentEditIndex = -1;
const headers = ["Apellido", "Nombre", "Tipo Doc", "Número Doc", "Sexo", "Menor"];

// Inicialización
document.getElementById('csvFile').addEventListener('change', handleFileUpload);

// Manejo de archivos
function handleFileUpload(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const content = e.target.result;
    csvData = parseCSV(content);
    renderTable();
  };
  
  reader.readAsText(file);
}

function parseCSV(text) {
  return text.split('\n').map(row => row.split(';'));
}

// Renderizado de tabla
function renderTable() {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';
  
  if (csvData.length === 0) return;
  
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
  csvData.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="checkbox" class="rowCheckbox" data-index="${index}"></td>`;
    
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
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
    document.querySelectorAll('.rowCheckbox').forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  };
}

// Ordenación
function sortTable(header) {
  const headerIndex = headers.indexOf(header);
  if (headerIndex === -1) return;
  
  csvData.sort((a, b) => {
    const valA = a[headerIndex] || '';
    const valB = b[headerIndex] || '';
    return valA.localeCompare(valB);
  });
  
  renderTable();
}

// Funciones de modales
function openAddPassengerModal() {
  currentEditIndex = -1;
  document.getElementById('modalTitle').textContent = 'Agregar Pasajero';
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
  
  document.getElementById('passengerModal').style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function savePassenger() {
  const newRow = [
    document.getElementById('lastName').value,
    document.getElementById('firstName').value,
    document.getElementById('docType').value,
    document.getElementById('docNumber').value,
    document.getElementById('gender').value,
    document.getElementById('minor').value
  ];
  
  if (currentEditIndex === -1) {
    csvData.push(newRow);
  } else {
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
  
  // Eliminar en orden descendente
  indexes.sort((a, b) => b - a).forEach(i => csvData.splice(i, 1));
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
  document.getElementById('saveModal').style.display = 'flex';
}

function downloadCSV() {
  const fileName = document.getElementById('fileNameInput').value || 'datos';
  const content = csvData.map(row => row.join(';')).join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.csv`;
  a.click();
  
  closeModal('saveModal');
}
