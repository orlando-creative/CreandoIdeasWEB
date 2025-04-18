    // Variables globales
    let pdfGenerado = false;
    const { jsPDF } = window.jspdf;

    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
    // Configurar año actual en el footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Configurar eventos
    setupEventListeners();
    
    // Establecer fecha por defecto (hoy + 7 días)
    setDefaultDate();
    
    // Configurar carga de logo
    setupLogoUpload();
    });

    // Configurar todos los event listeners
    function setupEventListeners() {
    // Datos del cliente
    const nombreInput = document.getElementById('nombre');
    const eventoSelect = document.getElementById('evento');
    const fechaInput = document.getElementById('fecha');
    const telefonoInput = document.getElementById('telefono');
    const notasTextarea = document.getElementById('notas');
    
    if (nombreInput) nombreInput.addEventListener('input', updatePreview);
    if (eventoSelect) eventoSelect.addEventListener('change', updatePreview);
    if (fechaInput) fechaInput.addEventListener('change', updateDatePreview);
    if (telefonoInput) telefonoInput.addEventListener('input', updatePreview);
    if (notasTextarea) notasTextarea.addEventListener('input', updatePreview);
    
    // Checkboxes y precios
    document.querySelectorAll('.seleccionar').forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });
    
    document.querySelectorAll('.precio').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });
    
    // Selects de tamaño
    document.querySelectorAll('.tamano, .Color').forEach(select => {
        select.addEventListener('change', calculateTotal);
    });
    
    // Anticipo
    const anticipoInput = document.getElementById('anticipo');
    if (anticipoInput) anticipoInput.addEventListener('input', calculateTotal);
    
    // Botones
    const actualizarBtn = document.getElementById('actualizar-btn');
    const verPreviewBtn = document.getElementById('ver-preview-btn');
    const exportarBtn = document.getElementById('exportar-btn');
    
    if (actualizarBtn) actualizarBtn.addEventListener('click', updateContractPreview);
    if (verPreviewBtn) verPreviewBtn.addEventListener('click', showPreview);
    if (exportarBtn) exportarBtn.addEventListener('click', promptPdfName);
    
    // Modal
    const closeBtn = document.querySelector('.close-btn');
    const previewModal = document.getElementById('previewModal');
    
    if (closeBtn) closeBtn.addEventListener('click', closePreview);
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closePreview();
        }
        });
    }
    }

    // Establecer fecha por defecto
    function setDefaultDate() {
    const fechaInput = document.getElementById('fecha');
    if (!fechaInput) return;
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const formattedDate = nextWeek.toISOString().split('T')[0];
    fechaInput.value = formattedDate;
    updateDatePreview();
    }

    // Actualizar previsualización de fecha
    function updateDatePreview() {
    const fechaInput = document.getElementById('fecha');
    const previewFecha = document.getElementById('preview-fecha');
    
    if (!fechaInput || !previewFecha) return;
    
    const fechaValue = fechaInput.value;
    if (fechaValue) {
        const [year, month, day] = fechaValue.split('-');
        previewFecha.textContent = `${day}/${month}/${year}`;
    }
    }

    // Actualizar previsualización de datos del cliente
    function updatePreview() {
    const nombre = document.getElementById('nombre');
    const evento = document.getElementById('evento');
    const telefono = document.getElementById('telefono');
    const notas = document.getElementById('notas');
    const previewNombre = document.getElementById('preview-nombre');
    const previewEvento = document.getElementById('preview-evento');
    const previewTelefono = document.getElementById('preview-telefono');
    const previewNotas = document.getElementById('preview-notas');
    
    if (previewNombre && nombre) {
        previewNombre.textContent = nombre.value || "No especificado";
    }
    
    if (previewEvento && evento) {
        previewEvento.textContent = evento.options[evento.selectedIndex].text;
    }
    
    if (previewTelefono && telefono) {
        previewTelefono.textContent = telefono.value || "No proporcionado";
    }
    
    if (previewNotas && notas) {
        previewNotas.textContent = notas.value || "Sin notas adicionales";
    }
    }

    // Calcular totales
    function calculateTotal() {
    let total = 0;
    
    // Sumar productos seleccionados
    document.querySelectorAll('#murales-table tbody tr, #extras-table tbody tr').forEach(row => {
        const checkbox = row.querySelector('.seleccionar');
        const precioInput = row.querySelector('.precio');
        
        if (checkbox && checkbox.checked && precioInput) {
        const precio = parseFloat(precioInput.value) || 0;
        total += precio;
        }
    });
    
    // Actualizar totales
    const totalAlquiler = document.getElementById('total-alquiler');
    const saldo = document.getElementById('saldo');
    const anticipoInput = document.getElementById('anticipo');
    
    if (totalAlquiler) {
        totalAlquiler.textContent = total.toFixed(2);
    }
    
    if (anticipoInput && saldo) {
        const anticipo = parseFloat(anticipoInput.value) || 0;
        const saldoCalculado = Math.max(0, total - anticipo);
        saldo.textContent = saldoCalculado.toFixed(2);
    }
    }

    // Mostrar vista previa
    function showPreview() {
    updateContractPreview();
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    }

    // Cerrar vista previa
    function closePreview() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    }

    // Actualizar previsualización del contrato
    function updateContractPreview() {
    updatePreview();
    
    // Obtener contenedor de previsualización
    const previewContainer = document.getElementById('contract-preview');
    if (!previewContainer) return;
    
    // Generar HTML del contrato
    previewContainer.innerHTML = `
        <h1>SEGALES MOBILIARIOS</h1>
        <h2>Contrato de Alquiler</h2>
        
        <h3>Datos del Cliente</h3>
        <p><strong>Nombre:</strong> <span id="preview-nombre">${document.getElementById('nombre')?.value || "No especificado"}</span></p>
        <p><strong>Evento:</strong> <span id="preview-evento">${document.getElementById('evento')?.options[document.getElementById('evento')?.selectedIndex]?.text || ""}</span></p>
        <p><strong>Fecha:</strong> <span id="preview-fecha">${document.getElementById('preview-fecha')?.textContent || ""}</span></p>
        <p><strong>Teléfono:</strong> <span id="preview-telefono">${document.getElementById('telefono')?.value || "No proporcionado"}</span></p>
        <p><strong>Notas:</strong> <span id="preview-notas">${document.getElementById('notas')?.value || "Sin notas adicionales"}</span></p>
        
        <hr>
        
        <h3>Productos Seleccionados</h3>
        ${generatePreviewTable('murales-table', 'Paneles')}
        
        <h3>Accesorios Adicionales</h3>
        ${generatePreviewTable('extras-table', 'Accesorios')}
        
        <div class="total-section">
        <p><strong>Total del Pedido: </strong><span id="preview-total">${document.getElementById('total-alquiler')?.textContent || "0.00"}</span> Bs.</p>
        <p><strong>Anticipo: </strong><span id="preview-anticipo">${parseFloat(document.getElementById('anticipo')?.value || 0).toFixed(2)}</span> Bs.</p>
        <p><strong>Saldo Pendiente: </strong><span id="preview-saldo">${document.getElementById('saldo')?.textContent || "0.00"}</span> Bs.</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
        <strong>¡Gracias por elegir Segales Mobiliarios!</strong><br>
        Ubicación: Plan3000 - Barrio 7 de Julio - Calle: las Rosas # 9 | Cel: +591 74628781
        </p>
    `;
    }

    // Generar tabla para previsualización
    function generatePreviewTable(tableId, title) {
    const table = document.getElementById(tableId);
    if (!table) return '';
    
    let html = `
        <div class="table-responsive">
        <table>
            <thead>
            <tr>
                <th>Producto</th>
                <th>Especificaciones</th>
                <th>Precio</th>
            </tr>
            </thead>
            <tbody>
    `;
    
    table.querySelectorAll('tbody tr').forEach(row => {
        const checkbox = row.querySelector('.seleccionar');
        if (!checkbox || !checkbox.checked) return;
        
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        
        const select = row.querySelector('select');
        const selectedOption = select ? select.options[select.selectedIndex].text : '';
        const precioInput = cells[2].querySelector('.precio');
        const precio = precioInput ? parseFloat(precioInput.value || 0).toFixed(2) : '0.00';
        
        html += `
        <tr class="highlight">
            <td>${cells[0].textContent}</td>
            <td>${selectedOption || cells[1].textContent}</td>
            <td>${precio} Bs.</td>
        </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        </div>
    `;
    
    return html;
    }

    // Mostrar modal para nombre de PDF
    function promptPdfName() {
    if (pdfGenerado) {
        alert('Por favor espera unos segundos antes de generar otro PDF.');
        return;
    }
    
    // Generar nombre sugerido
    const nombreCliente = document.getElementById('nombre')?.value.trim().replace(/\s+/g, '_') || 'Cliente';
    const fechaEvento = document.getElementById('fecha')?.value.split('-').reverse().join('') || '';
    const nombreSugerido = `Contrato_${nombreCliente}_${fechaEvento}`;
    
    const fileName = prompt('Ingrese el nombre para el archivo PDF:', nombreSugerido);
    
    if (fileName) {
        pdfGenerado = true;
        const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        exportToPDF(finalFileName);
        
        // Resetear después de 5 segundos
        setTimeout(() => {
        pdfGenerado = false;
        }, 5000);
    }
    }

        function exportToPDF(fileName) {
            updateContractPreview();
            const element = document.getElementById('contract-preview');
            if (!element) {
            alert('No se encontró el elemento de contrato para generar PDF.');
            pdfGenerado = false;
            return;
            }
        
            // Opciones para html2pdf
            const opt = {
            margin:       [0.5, 0.5],
            filename:     fileName,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 2, useCORS: true, allowTaint: true, logging: false, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
        
            // Generar y guardar PDF
            html2pdf().set(opt).from(element).save().then(() => {
            pdfGenerado = false;
            }).catch(err => {
            console.error('Error al generar PDF con html2pdf:', err);
            alert('Ocurrió un error al generar el PDF. Por favor intenta nuevamente.');
            pdfGenerado = false;
            });
        }
        