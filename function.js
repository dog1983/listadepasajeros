// ==================== function.js ====================
// Versión corregida para móvil (mantiene el mismo comportamiento en PC)
// Solo se mejora la lectura del CSV para que funcione en cualquier dispositivo.

let pasajeros = [];        // Array de objetos con los datos (incluye id interno)
let editIndex = null;
let nextId = 1;

// Columnas que forman parte del CSV (exactamente en ese orden, sin el id)
const CSV_HEADERS = [
    "apellido", "nombre", "tipo_documento", "descripcion_documento", "numero_documento",
    "sexo", "menor", "nacionalidad", "tripulante", "ocupa_butaca", "observaciones"
];

// Lista de nacionalidades (la misma que usabas)
const nacionalidadesList = [
    "ARGENTINA", "BOLIVIA", "BRASIL", "CHILE", "COLOMBIA", "COSTA RICA", "CUBA", "ECUADOR",
    "EL SALVADOR", "ESPAÑA", "ESTADOS UNIDOS", "GUATEMALA", "HONDURAS", "MÉXICO", "NICARAGUA",
    "PANAMÁ", "PARAGUAY", "PERÚ", "PUERTO RICO", "REPÚBLICA DOMINICANA", "URUGUAY", "VENEZUELA",
    "ALEMANIA", "FRANCIA", "ITALIA", "JAPÓN", "CANADÁ", "CHINA", "OTRO"
];

// ---------- Funciones auxiliares ----------
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function cargarNacionalidades() {
    const select = document.getElementById('nacionalidad');
    if (!select) return;
    select.innerHTML = '';
    nacionalidadesList.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais;
        option.textContent = pais;
        select.appendChild(option);
    });
    select.value = "ARGENTINA";
}

function handleTipoDocumentoChange() {
    const tipo = document.getElementById('tipo_documento').value;
    const descGroup = document.getElementById('descripcion_documento_group');
    if (tipo === "OTROS") {
        descGroup.style.display = "flex";
    } else {
        descGroup.style.display = "none";
        document.getElementById('descripcion_documento').value = "";
    }
}

// ---------- Renderizado de la tabla (igual que el original, pero siempre muestra encabezados) ----------
function renderTable() {
    const container = document.getElementById('tableContainer');
    if (!container) return;

    // Construir la tabla completa
    let html = `<table><thead>运转
        <th style="width:30px"><input type="checkbox" id="selectAllCheckbox"></th>
        <th>ID</th>
        <th>Apellido</th>
        <th>Nombre</th>
        <th>Tipo Doc</th>
        <th>N° Documento</th>
        <th>Desc. Doc</th>
        <th>Sexo</th>
        <th>Menor</th>
        <th>Nacionalidad</th>
        <th>Tripulante</th>
        <th>Ocupa Butaca</th>
        <th>Observaciones</th>
    </thead><tbody>`;

    if (pasajeros.length === 0) {
        html += `<tr><td colspan="13" style="text-align:center;">No hay pasajeros cargados. Agregue uno o cargue un CSV.</td></tr>`;
    } else {
        for (let i = 0; i < pasajeros.length; i++) {
            const p = pasajeros[i];
            const menorText = p.menor == 1 ? "Sí" : "No";
            const tripulanteText = p.tripulante == 1 ? "Sí" : "No";
            const ocupaText = p.ocupa_butaca == 1 ? "Sí" : "No";
            html += `<tr ondblclick="editPassenger(${i})" style="cursor:pointer;">
                <td><input type="checkbox" class="row-checkbox" data-idx="${i}"></td>
                <td>${escapeHtml(p.id)}</td>
                <td>${escapeHtml(p.apellido || '')}</td>
                <td>${escapeHtml(p.nombre || '')}</td>
                <td>${escapeHtml(p.tipo_documento || '')}</td>
                <td>${escapeHtml(p.numero_documento || '')}</td>
                <td>${escapeHtml(p.descripcion_documento || '')}</td>
                <td>${escapeHtml(p.sexo || '')}</td>
                <td>${menorText}</td>
                <td>${escapeHtml(p.nacionalidad || '')}</td>
                <td>${tripulanteText}</td>
                <td>${ocupaText}</td>
                <td>${escapeHtml(p.observaciones || '')}</td>
            </tr>`;
        }
    }
    html += `</tbody>有些人`;
    container.innerHTML = html;

    // Evento "seleccionar todos"
    const selectAll = document.getElementById('selectAllCheckbox');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = e.target.checked);
            toggleDeleteButton();
        });
    }
    document.querySelectorAll('.row-checkbox').forEach(cb => {
        cb.addEventListener('change', toggleDeleteButton);
    });
    toggleDeleteButton();
}

function toggleDeleteButton() {
    const anyChecked = document.querySelectorAll('.row-checkbox:checked').length > 0;
    const delBtn = document.getElementById('deleteBtn');
    if (delBtn) delBtn.disabled = !anyChecked;
}

// ---------- Eliminar seleccionados ----------
function removeSelectedRows() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    if (checkboxes.length === 0) return;
    if (!confirm(`¿Eliminar ${checkboxes.length} pasajero(s) seleccionado(s)?`)) return;
    const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.idx)).sort((a,b)=>b-a);
    for (let idx of indices) {
        pasajeros.splice(idx, 1);
    }
    // Reasignar IDs internos
    pasajeros.forEach((p, i) => p.id = i + 1);
    nextId = pasajeros.length + 1;
    renderTable();
}

// ---------- Agregar / Editar ----------
function openAddPassengerModal() {
    editIndex = null;
    document.getElementById('formTitle').innerText = "Agregar Nuevo Pasajero";
    document.getElementById('savePassengerBtn').innerText = "Agregar Pasajero";
    limpiarFormulario();
    document.getElementById('addPassengerModal').style.display = "flex";
    handleTipoDocumentoChange();
}

function editPassenger(index) {
    const p = pasajeros[index];
    if (!p) return;
    editIndex = index;
    document.getElementById('formTitle').innerText = "Editar Pasajero";
    document.getElementById('savePassengerBtn').innerText = "Actualizar Pasajero";
    document.getElementById('apellido').value = p.apellido || '';
    document.getElementById('nombre').value = p.nombre || '';
    document.getElementById('tipo_documento').value = p.tipo_documento || 'DNI';
    document.getElementById('numero_documento').value = p.numero_documento || '';
    document.getElementById('descripcion_documento').value = p.descripcion_documento || '';
    document.getElementById('sexo').value = p.sexo || 'F';
    document.getElementById('menor').value = p.menor !== undefined ? p.menor : 0;
    document.getElementById('nacionalidad').value = p.nacionalidad || 'ARGENTINA';
    document.getElementById('tripulante').value = p.tripulante !== undefined ? p.tripulante : 0;
    document.getElementById('ocupa_butaca').value = p.ocupa_butaca !== undefined ? p.ocupa_butaca : 0;
    document.getElementById('observaciones').value = p.observaciones || '';
    handleTipoDocumentoChange();
    document.getElementById('addPassengerModal').style.display = "flex";
}

function limpiarFormulario() {
    document.getElementById('apellido').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('tipo_documento').value = 'DNI';
    document.getElementById('numero_documento').value = '';
    document.getElementById('descripcion_documento').value = '';
    document.getElementById('sexo').value = 'F';
    document.getElementById('menor').value = '0';
    document.getElementById('nacionalidad').value = 'ARGENTINA';
    document.getElementById('tripulante').value = '0';
    document.getElementById('ocupa_butaca').value = '0';
    document.getElementById('observaciones').value = '';
    handleTipoDocumentoChange();
}

function closeAddPassengerModal() {
    document.getElementById('addPassengerModal').style.display = "none";
    editIndex = null;
}

function savePassenger() {
    const apellido = document.getElementById('apellido').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const tipo = document.getElementById('tipo_documento').value;
    const numero = document.getElementById('numero_documento').value.trim();

    if (!apellido) { alert("El apellido es obligatorio."); return; }
    if (!nombre) { alert("El nombre es obligatorio."); return; }
    if (!numero) { alert("El número de documento es obligatorio."); return; }
    if (tipo === "OTROS") {
        const desc = document.getElementById('descripcion_documento').value.trim();
        if (!desc) { alert("Debe indicar una descripción del documento."); return; }
    }

    let descDoc = document.getElementById('descripcion_documento').value.trim();
    if (tipo !== "OTROS") descDoc = "";

    const nuevo = {
        id: editIndex !== null ? pasajeros[editIndex].id : nextId++,
        apellido: apellido,
        nombre: nombre,
        tipo_documento: tipo,
        numero_documento: numero,
        descripcion_documento: descDoc,
        sexo: document.getElementById('sexo').value,
        menor: parseInt(document.getElementById('menor').value),
        nacionalidad: document.getElementById('nacionalidad').value,
        tripulante: parseInt(document.getElementById('tripulante').value),
        ocupa_butaca: parseInt(document.getElementById('ocupa_butaca').value),
        observaciones: document.getElementById('observaciones').value.trim()
    };

    if (editIndex !== null) {
        pasajeros[editIndex] = nuevo;
    } else {
        pasajeros.push(nuevo);
    }
    renderTable();
    closeAddPassengerModal();
}

// ---------- CARGA DE CSV (MEJORADA PARA MÓVIL) ----------
document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        let text = evt.target.result;

        // 1. Eliminar BOM (Byte Order Mark) que algunos móviles añaden
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }
        // 2. Unificar saltos de línea a \n (crucial para móvil)
        text = text.replace(/\r\n?/g, '\n');
        text = text.trim();

        const lines = text.split('\n');
        if (lines.length < 2) {
            alert("Archivo vacío o sin datos.");
            return;
        }

        // Leer cabeceras (separador punto y coma)
        let headers = lines[0].split(';').map(h => h.replace(/^[\s"']+|[\s"']+$/g, '').toLowerCase());
        // Validar que coincidan exactamente con CSV_HEADERS
        const expected = CSV_HEADERS.map(h => h.toLowerCase());
        let ok = (headers.length === expected.length);
        if (ok) {
            for (let i = 0; i < expected.length; i++) {
                if (headers[i] !== expected[i]) { ok = false; break; }
            }
        }
        if (!ok) {
            alert(`Error: El archivo no tiene el formato esperado.\nLas columnas deben ser:\n${CSV_HEADERS.join("; ")}`);
            return;
        }

        const nuevos = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;

            // Parseo manual para respetar comillas (si las hubiera)
            let valores = [];
            let enComillas = false;
            let campo = "";
            for (let ch of line) {
                if (ch === '"') {
                    enComillas = !enComillas;
                } else if (ch === ';' && !enComillas) {
                    valores.push(campo.trim());
                    campo = "";
                } else {
                    campo += ch;
                }
            }
            valores.push(campo.trim());

            // Fallback: si no coincide la cantidad, usar split simple
            if (valores.length !== headers.length) {
                valores = line.split(';').map(v => v.replace(/^"|"$/g, '').trim());
            }
            if (valores.length < headers.length) continue;

            let obj = {};
            headers.forEach((h, idx) => {
                let val = valores[idx] || "";
                val = val.replace(/^"|"$/g, '');
                obj[h] = val;
            });
            // Convertir campos numéricos (menor, tripulante, ocupa_butaca)
            obj.menor = (obj.menor == "1" || obj.menor === 1) ? 1 : 0;
            obj.tripulante = (obj.tripulante == "1" || obj.tripulante === 1) ? 1 : 0;
            obj.ocupa_butaca = (obj.ocupa_butaca == "1" || obj.ocupa_butaca === 1) ? 1 : 0;

            // Solo agregar si tiene al menos algún dato relevante
            if (obj.apellido || obj.nombre || obj.numero_documento) {
                nuevos.push(obj);
            }
        }

        if (nuevos.length === 0) {
            alert("No se encontraron datos válidos en el archivo CSV.");
            return;
        }

        // Asignar IDs internos correlativos
        nuevos.forEach((p, idx) => p.id = idx + 1);
        pasajeros = nuevos;
        nextId = pasajeros.length + 1;
        renderTable();
        alert(`✅ Se cargaron ${nuevos.length} pasajeros correctamente.`);
    };
    reader.onerror = () => alert("Error al leer el archivo.");
    // Forzar lectura como UTF-8 (elimina problemas de codificación)
    reader.readAsText(file, "UTF-8");
    e.target.value = '';  // Permite cargar el mismo archivo de nuevo
});

// ---------- GUARDAR CSV (sin incluir la columna ID) ----------
function openSaveModal() {
    document.getElementById('saveModal').style.display = "flex";
}

function closeSaveModal() {
    document.getElementById('saveModal').style.display = "none";
}

function confirmDownload() {
    let fileName = document.getElementById('fileNameInputModal').value.trim();
    if (!fileName) fileName = "lista_pasajeros";
    if (!fileName.endsWith(".csv")) fileName += ".csv";

    const headerLine = CSV_HEADERS.join(";");
    const rows = pasajeros.map(p => {
        return CSV_HEADERS.map(col => {
            let val = p[col] !== undefined ? p[col] : "";
            // Escapar comillas y punto y coma si es necesario
            if (typeof val === "string" && (val.includes(';') || val.includes('"'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(";");
    });
    const content = [headerLine, ...rows].join("\n");
    // Añadir BOM para compatibilidad con Excel (opcional pero útil)
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeSaveModal();
}

// ---------- Inicialización (carga nacionalidades y datos de ejemplo opcionales) ----------
function init() {
    cargarNacionalidades();
    // Si quieres iniciar con datos de ejemplo, descomenta el bloque siguiente.
    // En una situación real, tal vez prefieras empezar vacío.
    if (pasajeros.length === 0) {
        // Ejemplo mínimo (puedes eliminarlo si no lo deseas)
        pasajeros = [
            { id:1, apellido:"García", nombre:"Ana", tipo_documento:"DNI", descripcion_documento:"", numero_documento:"12345678", sexo:"F", menor:0, nacionalidad:"ARGENTINA", tripulante:0, ocupa_butaca:1, observaciones:"Ejemplo" }
        ];
        nextId = 2;
    }
    renderTable();
}

// Exponer funciones globalmente para que el HTML las encuentre
window.openAddPassengerModal = openAddPassengerModal;
window.closeAddPassengerModal = closeAddPassengerModal;
window.savePassenger = savePassenger;
window.editPassenger = editPassenger;
window.removeSelectedRows = removeSelectedRows;
window.openSaveModal = openSaveModal;
window.closeSaveModal = closeSaveModal;
window.confirmDownload = confirmDownload;
window.handleTipoDocumentoChange = handleTipoDocumentoChange;

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
