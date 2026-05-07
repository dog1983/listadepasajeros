// function.js - Versión corregida para carga de CSV en móvil
// Conserva todas tus funcionalidades originales

let pasajeros = [];        // Array de objetos con los datos (incluye id interno)
let editIndex = null;
let nextId = 1;

// Columnas del CSV (sin id)
const CSV_HEADERS = [
    "apellido", "nombre", "tipo_documento", "descripcion_documento", "numero_documento",
    "sexo", "menor", "nacionalidad", "tripulante", "ocupa_butaca", "observaciones"
];

// Nacionalidades (lista completa)
const nacionalidadesList = ["Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Anguilla", "Antártida", "Antigua y Barbuda", "Antillas Holandesas", "Arabia Saudí", "Argelia", "Argentina", "Armenia", "Aruba", "ARY Macedonia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bahréin", "Bangladesh", "Barbados", "Bélgica", "Belice", "Benin", "Bermudas", "Bhután", "Bielorrusia", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticana", "Colombia", "Comoras", "Congo", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Gibraltar", "Granada", "Grecia", "Groenlandia", "Guadalupe", "Guam", "Guatemala", "Guayana Francesa", "Guinea", "Guinea Ecuatorial", "Guinea-Bissau", "Guyana", "Haití", "Honduras", "Hong Kong", "Hungría", "India", "Indonesia", "Irán", "Iraq", "Irlanda", "Isla Bouvet", "Isla de Navidad", "Isla Norfolk", "Islandia", "Islas Caimán", "Islas Cocos", "Islas Cook", "Islas Feroe", "Islas Georgias del Sur y Sandwich del Sur", "Islas Gland", "Islas Heard y McDonald", "Islas Malvinas", "Islas Marianas del Norte", "Islas Marshall", "Islas Pitcairn", "Islas Salomón", "Islas Turcas y Caicos", "Islas ultramarinas de Estados Unidos", "Islas Vírgenes Británicas", "Islas Vírgenes de los Estados Unidos", "Israel", "Italia", "Jamaica", "Japán", "Jordania", "Kazajstán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesotho", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macao", "Madagascar", "Malasia", "Malawi", "Maldivas", "Malí", "Malta", "Marruecos", "Martinica", "Mauricio", "Mauritania", "Mayotte", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montserrat", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Niue", "Noruega", "Nueva Caledonia", "Nueva Zelenda", "Omán", "Países Bajos", "Pakistán", "Palau", "Palestina", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polinesia Francesa", "Polonia", "Portugal", "Puerto Rico", "Qatar", "Reino Unido", "República Centroafricana", "República Checa", "República Democrática del Congo", "República Dominicana", "Reunión", "Ruanda", "Rumania", "Rusia", "Sahara Occidental", "Samoa", "Samoa Americana", "San Cristóbal y Nevis", "San Marino", "San Pedro y Miquelón", "San Vicente y las Granadinas", "Santa Helena", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia y Montenegro", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Suecia", "Suiza", "Surinam", "Svalbard y Jan Mayen", "Tailandia", "Taiwán", "Tanzania", "Tayikistán", "Territorio Británico del Océano Índico", "Territorios Australes Franceses", "Timor Oriental", "Togo", "Tokelau", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Wallis y Futuna", "Yemen", "Yibuti", "Zambia", "Zimbabue"];

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

// ---------- Renderizado de la tabla ----------
function renderTable() {
    const container = document.getElementById('tableContainer');
    if (!container) return;
    if (pasajeros.length === 0) {
        container.innerHTML = `<div style="padding: 20px; text-align: center;">No hay pasajeros cargados.</div>`;
        document.getElementById('deleteBtn').disabled = true;
        return;
    }

    let html = `<table><thead><tr>
        <th style="width:30px"><input type="checkbox" id="selectAllCheckbox"></th>
        <th>ID</th><th>Apellido</th><th>Nombre</th><th>Tipo Doc</th><th>N° Documento</th>
        <th>Desc. Doc</th><th>Sexo</th><th>Menor</th><th>Nacionalidad</th>
        <th>Tripulante</th><th>Ocupa Butaca</th><th>Observaciones</th>
    </tr></thead><tbody>`;

    pasajeros.forEach((p, idx) => {
        const menorText = p.menor == 1 ? "Sí" : "No";
        const tripulanteText = p.tripulante == 1 ? "Sí" : "No";
        const ocupaText = p.ocupa_butaca == 1 ? "Sí" : "No";
        html += `<tr ondblclick="editPassenger(${idx})" style="cursor:pointer;">
            <td><input type="checkbox" class="row-checkbox" data-idx="${idx}"></td>
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
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    // Evento seleccionar todos
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
    document.getElementById('deleteBtn').disabled = !anyChecked;
}

// ---------- Eliminar ----------
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
    document.getElementById('menor').value = p.menor != undefined ? p.menor : 0;
    document.getElementById('nacionalidad').value = p.nacionalidad || 'ARGENTINA';
    document.getElementById('tripulante').value = p.tripulante != undefined ? p.tripulante : 0;
    document.getElementById('ocupa_butaca').value = p.ocupa_butaca != undefined ? p.ocupa_butaca : 0;
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

        // 1. Eliminar BOM (carácter invisible al inicio)
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        // 2. Normalizar saltos de línea: unificar a \n (importante para móvil)
        text = text.replace(/\r\n?/g, '\n');
        text = text.trim();

        const lines = text.split('\n');
        if (lines.length < 2) {
            alert("Archivo vacío o sin datos.");
            return;
        }

        // Leer cabeceras separadas por punto y coma
        let headers = lines[0].split(';').map(h => h.replace(/^[\s"']+|[\s"']+$/g, '').toLowerCase());
        // Validar que las cabeceras coinciden con las esperadas (sin el ID)
        const expected = CSV_HEADERS.map(h => h.toLowerCase());
        let valid = headers.length === expected.length;
        if (valid) {
            for (let i = 0; i < expected.length; i++) {
                if (headers[i] !== expected[i]) { valid = false; break; }
            }
        }
        if (!valid) {
            alert(`El archivo no tiene el formato esperado.\nColumnas requeridas: ${CSV_HEADERS.join("; ")}`);
            return;
        }

        const nuevos = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;

            // Dividir por punto y coma (respetando posibles comillas)
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

            // Si el número de valores no coincide, usar split simple como respaldo
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
            // Convertir campos numéricos
            obj.menor = (obj.menor == "1" || obj.menor === 1) ? 1 : 0;
            obj.tripulante = (obj.tripulante == "1" || obj.tripulante === 1) ? 1 : 0;
            obj.ocupa_butaca = (obj.ocupa_butaca == "1" || obj.ocupa_butaca === 1) ? 1 : 0;

            if (obj.apellido || obj.nombre || obj.numero_documento) {
                nuevos.push(obj);
            }
        }

        if (nuevos.length === 0) {
            alert("No se encontraron datos válidos en el CSV.");
            return;
        }

        // Asignar IDs internos
        nuevos.forEach((p, idx) => p.id = idx + 1);
        pasajeros = nuevos;
        nextId = pasajeros.length + 1;
        renderTable();
        alert(`✅ Se cargaron ${nuevos.length} pasajeros correctamente.`);
    };
    reader.onerror = () => alert("Error al leer el archivo.");
    reader.readAsText(file, "UTF-8");
    e.target.value = '';
});

// ---------- GUARDAR CSV (sin columna ID) ----------
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
            if (typeof val === "string" && (val.includes(';') || val.includes('"'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(";");
    });
    const content = [headerLine, ...rows].join("\n");
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

// Inicialización
function init() {
    cargarNacionalidades();
    // Datos de ejemplo (opcional)
    if (pasajeros.length === 0) {
        pasajeros = [
            { id:1, apellido:"García", nombre:"Ana", tipo_documento:"DNI", descripcion_documento:"", numero_documento:"12345678", sexo:"F", menor:0, nacionalidad:"ARGENTINA", tripulante:0, ocupa_butaca:1, observaciones:"Ejemplo" },
            { id:2, apellido:"Pérez", nombre:"Luis", tipo_documento:"Pasaporte", descripcion_documento:"", numero_documento:"AB123456", sexo:"M", menor:0, nacionalidad:"URUGUAY", tripulante:1, ocupa_butaca:0, observaciones:"Tripulante" }
        ];
        nextId = 3;
        renderTable();
    }
}
init();
