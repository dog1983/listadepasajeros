// ==================== EDITOR DE PASAJEROS - CORRECCIÓN DEFINITIVA PARA MÓVIL ====================
(function() {
  // Panel de depuración
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

  // Variables globales
  var tableData = [];
  var editingIndex = null;
  var documentNumbersMap = new Map();
  var currentSortColumn = null;
  var sortDirection = 1;

  var defaultHeader = [
    "apellido", "nombre", "tipo_documento", "descripcion_documento", "numero_documento",
    "sexo", "menor", "nacionalidad", "tripulante", "ocupa_butaca", "observaciones"
  ];

  var visibleColumns = ["apellido", "nombre", "numero_documento", "observaciones"];
  var columnDisplayNames = { "numero_documento": "N°", "observaciones": "Obs." };
  var requiredHeaders = [
    "apellido", "nombre", "tipo_documento", "descripcion_documento", "numero_documento",
    "sexo", "menor", "nacionalidad", "tripulante", "ocupa_butaca"
  ];

  var validValues = {
    tipo_documento: ["DNI", "Pasaporte", "OTROS"],
    sexo: ["F", "M"],
    menor: ["0", "1"],
    nacionalidad: [],
    tripulante: ["0", "1"],
    ocupa_butaca: ["0", "1"]
  };

  var defaults = {
    tipo_documento: "DNI",
    sexo: "F",
    menor: "0",
    nacionalidad: "Argentina",
    tripulante: "0",
    ocupa_butaca: "1",
    observaciones: ""
  };

  var nacionalidadesList = [
    "Afganistán", "Albania", "Alemania", "Argentina", "Bolivia", "Brasil", "Chile", "Colombia",
    "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos", "Guatemala",
    "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Uruguay", "Venezuela"
  ].sort();

  validValues.nacionalidad = nacionalidadesList;

  function getColumnIndex(columnName) {
    if (!tableData.length) return -1;
    var header = tableData[0];
    for (var i = 0; i < header.length; i++) if (header[i] === columnName) return i;
    return -1;
  }

  function populateNationalities() {
    var select = document.getElementById('nacionalidad');
    if (!select) return;
    select.innerHTML = '';
    var defaultOption = document.createElement('option');
    defaultOption.value = defaults.nacionalidad;
    defaultOption.textContent = defaults.nacionalidad;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
    nacionalidadesList.forEach(function(country) {
      if (country !== defaults.nacionalidad) {
        var option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
      }
    });
  }

  function handleTipoDocumentoChange() {
    var tipo = document.getElementById('tipo_documento').value;
    var descGroup = document.getElementById('descripcion_documento_group');
    if (tipo === 'OTROS') descGroup.style.display = 'block';
    else {
      descGroup.style.display = 'none';
      document.getElementById('descripcion_documento').value = '';
    }
  }

  function updateDeleteButtonState() {
    var selected = document.querySelectorAll('.selected-row').length;
    var btn = document.getElementById('deleteBtn');
    if (btn) btn.disabled = (selected === 0);
  }

  function renderTable() {
    var container = document.getElementById('tableContainer');
    if (!container) return;
    container.innerHTML = '';
    if (tableData.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;">No hay datos.</div>';
      return;
    }
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    var thNum = document.createElement('th');
    thNum.textContent = '#';
    thNum.style.textAlign = 'center';
    headRow.appendChild(thNum);
    for (var v = 0; v < visibleColumns.length; v++) {
      var colName = visibleColumns[v];
      var idx = getColumnIndex(colName);
      if (idx === -1) continue;
      var th = document.createElement('th');
      th.textContent = columnDisplayNames[colName] || colName;
      th.setAttribute('data-column-index', idx);
      th.addEventListener('click', (function(colIdx) { return function() { sortTableByColumn(colIdx); }; })(idx));
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    documentNumbersMap.clear();
    var invalidCount = 0;
    for (var i = 0; i < tableData.slice(1).length; i++) {
      var row = tableData[i+1];
      var tr = document.createElement('tr');
      tr.className = 'editable-row';
      tr.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        this.classList.toggle('selected-row');
        updateDeleteButtonState();
      });
      tr.addEventListener('dblclick', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        var rowIdx = parseInt(this.getAttribute('data-row-index'));
        editRow(rowIdx);
      });
      tr.setAttribute('data-row-index', i+1);
      var tdNum = document.createElement('td');
      tdNum.textContent = i+1;
      tdNum.style.textAlign = 'center';
      tdNum.style.fontWeight = 'bold';
      tr.appendChild(tdNum);
      for (var v2 = 0; v2 < visibleColumns.length; v2++) {
        var colName2 = visibleColumns[v2];
        var colIdx2 = getColumnIndex(colName2);
        if (colIdx2 === -1) continue;
        var td = document.createElement('td');
        var cellValue = row[colIdx2] || '';
        if (colName2 === 'numero_documento') {
          var docNum = cellValue.toString().trim();
          if (documentNumbersMap.has(docNum)) documentNumbersMap.get(docNum).push(i+1);
          else documentNumbersMap.set(docNum, [i+1]);
        }
        var cellContent = document.createElement('div');
        cellContent.style.display = 'flex';
        cellContent.style.flexDirection = 'column';
        if (validValues[colName2]) {
          var select = document.createElement('select');
          validValues[colName2].forEach(function(optVal) {
            var option = document.createElement('option');
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
          var input = document.createElement('input');
          input.type = 'text';
          input.value = cellValue;
          input.addEventListener('input', (function(r, cIdx) { return function(e) { tableData[r][cIdx] = e.target.value.trim(); }; })(i+1, colIdx2));
          input.addEventListener('blur', function() { renderTable(); });
          input.addEventListener('click', function(e) { e.stopPropagation(); });
          cellContent.appendChild(input);
        }
        var tipoDocIdx = getColumnIndex('tipo_documento');
        var tipoDocVal = row[tipoDocIdx] || '';
        var errMsg = validateCell(colName2, cellValue, tipoDocVal);
        if (errMsg) {
          td.classList.add('invalid-cell');
          var errSpan = document.createElement('span');
          errSpan.className = 'error-message';
          errSpan.textContent = errMsg;
          cellContent.appendChild(errSpan);
          invalidCount++;
        }
        if (colName2 === 'numero_documento' && documentNumbersMap.get(cellValue) && documentNumbersMap.get(cellValue).length > 1) {
          td.classList.add('invalid-cell');
          var dupSpan = document.createElement('span');
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
    var saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.disabled = (invalidCount > 0);
    updateDeleteButtonState();
  }

  function validateCell(columnName, value, tipoDoc) {
    var val = (value || "").trim();
    var tipo = (tipoDoc || "").trim().toUpperCase();
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
    var header = tableData[0];
    var body = tableData.slice(1);
    body.sort(function(a, b) {
      var valA = (a[columnIndex] || "").toString().toLowerCase();
      var valB = (b[columnIndex] || "").toString().toLowerCase();
      if (valA < valB) return -1 * sortDirection;
      if (valA > valB) return 1 * sortDirection;
      return 0;
    });
    tableData = [header].concat(body);
    renderTable();
  }

  function editRow(rowIndex) {
    var row = tableData[rowIndex];
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
    var tipoDoc = row[2] || defaults.tipo_documento;
    var descGroup = document.getElementById('descripcion_documento_group');
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
    var apellido = document.getElementById('apellido').value.trim();
    var nombre = document.getElementById('nombre').value.trim();
    var tipoDoc = document.getElementById('tipo_documento').value;
    var numDoc = document.getElementById('numero_documento').value.trim();
    var descDoc = document.getElementById('descripcion_documento').value.trim();
    if (!apellido || !nombre || !numDoc) {
      alert('Apellido, Nombre y Número de Documento son obligatorios');
      return;
    }
    if (tipoDoc === 'OTROS' && !descDoc) {
      alert('Debe indicar una descripción del documento');
      return;
    }
    var newRow = [
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
    var selected = document.querySelectorAll('.selected-row');
    if (selected.length === 0) return;
    if (!confirm('¿Eliminar ' + selected.length + ' fila(s)?')) return;
    var indices = [];
    for (var i = 0; i < selected.length; i++) {
      indices.push(parseInt(selected[i].getAttribute('data-row-index')));
    }
    indices.sort(function(a,b){return b-a;});
    for (var j=0; j<indices.length; j++) tableData.splice(indices[j],1);
    renderTable();
  }

  function openSaveModal() { document.getElementById('saveModal').style.display = 'flex'; }
  function closeSaveModal() { document.getElementById('saveModal').style.display = 'none'; }
  function confirmDownload() {
    if (document.getElementById('saveBtn').disabled) {
      alert('Hay errores en los datos, no se puede guardar');
      return;
    }
    var fileName = document.getElementById('fileNameInputModal').value.trim();
    if (!fileName) fileName = 'lista_pasajeros';
    if (!fileName.endsWith('.csv')) fileName += '.csv';
    var lines = [];
    for (var i=0; i<tableData.length; i++) lines.push(tableData[i].join(';'));
    var content = lines.join('\n');
    var blob = new Blob(['\uFEFF' + content], {type: 'text/csv;charset=utf-8;'});
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeSaveModal();
  }

  // CARGA DE CSV CORREGIDA (usando ArrayBuffer para forzar UTF-8 y mejor normalización)
  function cargarCSV(file) {
    log('Archivo seleccionado: ' + file.name + ', tamaño: ' + file.size + ' bytes');
    var reader = new FileReader();
    reader.onload = function(e) {
      log('Archivo leído como ArrayBuffer. Longitud: ' + e.target.result.byteLength);
      // Decodificar manualmente a UTF-8 (compatibilidad máxima)
      var uint8Array = new Uint8Array(e.target.result);
      var decoder = new TextDecoder('utf-8');
      var text = decoder.decode(uint8Array);
      log('Texto decodificado (primeros 200 chars): ' + text.substring(0,200));
      try {
        // Normalización EXTREMA de saltos de línea (cualquier combinación de \r y \n)
        text = text.replace(/\r\n/g, '\n');  // Windows
        text = text.replace(/\r/g, '\n');    // Mac clásico
        // Eliminar BOM
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        // Eliminar caracteres de control no deseados
        text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        var lines = text.split('\n');
        log('Líneas después de split: ' + lines.length);
        // Mostrar primeras líneas
        for (var k=0; k<Math.min(lines.length, 5); k++) {
          log('Línea ' + k + ': "' + lines[k].substring(0,80) + '"');
        }
        if (lines.length < 2) {
          log('ERROR: Solo ' + lines.length + ' línea(s). Contenido completo del archivo: ' + text);
          alert('El archivo parece tener solo una línea. Verifica que tenga saltos de línea. Contenido: ' + text.substring(0,200));
          return;
        }
        var headersLine = lines[0].trim();
        if (headersLine === "") {
          log('La primera línea está vacía, saltando...');
          headersLine = lines[1].trim();
          lines = lines.slice(1);
        }
        var headers = headersLine.split(';').map(function(h) { return h.trim().toLowerCase(); });
        log('Headers: ' + headers.join(', '));
        // Validar headers requeridos
        var missing = [];
        for (var r=0; r<requiredHeaders.length; r++) {
          if (headers.indexOf(requiredHeaders[r]) === -1) missing.push(requiredHeaders[r]);
        }
        if (missing.length > 0) {
          var msg = 'Columnas faltantes: ' + missing.join(', ');
          log(msg);
          alert(msg);
          return;
        }
        var data = [headers];
        for (var l=1; l<lines.length; l++) {
          var line = lines[l].trim();
          if (line === "") continue;
          var cols = line.split(';');
          while (cols.length < headers.length) cols.push('');
          data.push(cols);
        }
        if (data.length === 1) {
          log('No se encontraron filas de datos');
          alert('El archivo no contiene datos (solo cabeceras)');
          return;
        }
        tableData = data;
        renderTable();
        log('CSV cargado exitosamente. Registros: ' + (tableData.length-1));
        alert('CSV cargado. ' + (tableData.length-1) + ' registros.');
      } catch (err) {
        log('ERROR al procesar: ' + err.message);
        alert('Error al procesar CSV: ' + err.message);
      }
    };
    reader.onerror = function() {
      log('ERROR de lectura del archivo');
      alert('Error al leer el archivo');
    };
    reader.readAsArrayBuffer(file);  // Leer como ArrayBuffer para mejor control de codificación
  }

  // Exponer funciones
  window.openAddPassengerModal = openAddPassengerModal;
  window.closeAddPassengerModal = closeAddPassengerModal;
  window.savePassenger = savePassenger;
  window.editRow = editRow;
  window.removeSelectedRows = removeSelectedRows;
  window.openSaveModal = openSaveModal;
  window.closeSaveModal = closeSaveModal;
  window.confirmDownload = confirmDownload;
  window.handleTipoDocumentoChange = handleTipoDocumentoChange;

  // Inicialización
  document.addEventListener('DOMContentLoaded', function() {
    log('Editor iniciado en móvil');
    try {
      populateNationalities();
      if (tableData.length === 0) {
        tableData = [defaultHeader.slice(), ['García','Ana','DNI','','12345678','F','0','Argentina','0','1','']];
        log('Datos de ejemplo cargados');
      }
      renderTable();
      var fileInput = document.getElementById('csvFile');
      if (fileInput) {
        fileInput.addEventListener('change', function(ev) {
          log('Evento change disparado');
          if (ev.target.files && ev.target.files[0]) {
            log('Archivo detectado: ' + ev.target.files[0].name);
            cargarCSV(ev.target.files[0]);
          } else {
            log('No se seleccionó ningún archivo');
          }
          ev.target.value = '';
        });
      } else {
        log('ERROR: No se encontró el input #csvFile');
      }
    } catch (err) {
      log('Error fatal en init: ' + err.message);
    }
  });
})();
