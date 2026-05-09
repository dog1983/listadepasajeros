// ========== VERSIÓN MÍNIMA PARA DIAGNÓSTICO ==========
let tableData = [];

// Panel de depuración
let debugDiv = null;
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
    debugDiv.style.maxHeight = '150px';
    debugDiv.style.overflowY = 'auto';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.borderTop = '2px solid #0f0';
    document.body.appendChild(debugDiv);
  }
  let p = document.createElement('div');
  p.textContent = new Date().toLocaleTimeString() + ': ' + msg;
  debugDiv.appendChild(p);
  debugDiv.scrollTop = debugDiv.scrollHeight;
  console.log(msg);
}

function renderSimpleTable() {
  const container = document.getElementById('tableContainer');
  if (!container) return;
  container.innerHTML = '';
  if (!tableData.length) {
    container.innerHTML = '<div>Sin datos</div>';
    return;
  }
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';
  // encabezados
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  for (let i = 0; i < tableData[0].length; i++) {
    let th = document.createElement('th');
    th.textContent = tableData[0][i];
    th.style.border = '1px solid #ccc';
    th.style.padding = '8px';
    headerRow.appendChild(th);
  }
  // datos
  const tbody = table.createTBody();
  for (let i = 1; i < tableData.length; i++) {
    const row = tbody.insertRow();
    for (let j = 0; j < tableData[i].length; j++) {
      let cell = row.insertCell();
      cell.textContent = tableData[i][j];
      cell.style.border = '1px solid #ccc';
      cell.style.padding = '8px';
    }
  }
  container.appendChild(table);
}

function cargarCSV(file) {
  log('Archivo: ' + file.name + ', tamaño: ' + file.size);
  if (file.size === 0) { log('Archivo vacío'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    let text = e.target.result;
    log('Texto leído, longitud: ' + text.length);
    log('Primeros 50 caracteres: ' + text.substring(0, 50));
    // Mostrar códigos
    let codes = '';
    for (let i = 0; i < Math.min(20, text.length); i++) {
      codes += text.charCodeAt(i) + ' ';
    }
    log('Códigos ASCII primeros 20: ' + codes);
    
    // Normalizar saltos de línea
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\r/g, '\n');
    const lines = text.split('\n');
    log('Líneas detectadas: ' + lines.length);
    if (lines.length < 2) {
      log('Menos de 2 líneas, error');
      alert('Menos de 2 líneas');
      return;
    }
    // Procesar CSV simple
    const data = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const cols = lines[i].split(';');
      data.push(cols.map(c => c.trim()));
    }
    log('Filas procesadas (incluyendo header): ' + data.length);
    if (data.length === 0) return;
    tableData = data;
    renderSimpleTable();
    log('Tabla actualizada');
  };
  reader.onerror = function(err) {
    log('Error lectura: ' + err);
  };
  reader.readAsText(file, 'UTF-8');
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
  log('Página cargada');
  const fileInput = document.getElementById('csvFile');
  if (fileInput) {
    fileInput.addEventListener('change', function(ev) {
      log('Evento change');
      if (ev.target.files && ev.target.files[0]) {
        cargarCSV(ev.target.files[0]);
      } else {
        log('No hay archivo');
      }
      ev.target.value = '';
    });
  } else {
    log('No se encontró input file');
  }
  // Datos de ejemplo para probar
  tableData = [['apellido','nombre','documento'],['Perez','Juan','12345678']];
  renderSimpleTable();
  log('Datos de ejemplo mostrados');
});
