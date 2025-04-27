function saveAndSort() {
  if (tableData.length <= 1) return;

  const header = tableData[0];
  const body = tableData.slice(1);

  // Actualizar datos de inputs a tableData
  const inputs = document.querySelectorAll('tbody input');
  let inputIndex = 0;

  for (let i = 0; i < body.length; i++) {
    for (let j = 0; j < body[i].length; j++) {
      body[i][j] = inputs[inputIndex].value.trim();
      inputIndex++;
    }
  }

  // Ordenar por apellido
  body.sort((a, b) => {
    const apellidoA = a[0]?.toLowerCase() || '';
    const apellidoB = b[0]?.toLowerCase() || '';
    return apellidoA.localeCompare(apellidoB);
  });

  tableData = [header, ...body];
  renderTable();
}

