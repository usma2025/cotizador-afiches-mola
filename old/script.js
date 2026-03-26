const API_URL = "https://script.google.com/macros/s/AKfycbxFKGjD5nIWkqm-vktKowg5x1eEQ7Jq_-C6DL-Eu8-57_53RBdHSStPMvA2426mGKMq/exec";

let sistema = {
    papeles: {},
    formatos: {}
};

let tintaSeleccionada = 0;

/* FORMATO COP */
function formatoCOP(valor) {
    return valor.toLocaleString("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

/* ================= CARGAR DATOS ================= */

async function cargarDatos() {

    const res = await fetch(API_URL);
    const data = await res.json();

    sistema.papeles = {};
    sistema.formatos = {};

    data.papeles.forEach(p => {
        sistema.papeles[p.papel] = {
            precio70x100: Number(p.precio70x100)
        };
    });

    data.general.forEach(g => {
        sistema[g.clave] = Number(g.valor);
    });

    data.formatos.forEach(f => {
        sistema.formatos[f.formato] = {
            division: Number(f.division),
            tinta: Number(f.tinta),
            plancha: Number(f.plancha),
            label: f.label
        };
    });

    init();
}

cargarDatos();

/* ================= INIT ================= */

function init() {

    let papel = document.getElementById("papel");
    let tamano = document.getElementById("tamano");

    papel.innerHTML = "";
    tamano.innerHTML = "";

    for (let p in sistema.papeles) {
        papel.innerHTML += `<option>${p}</option>`;
    }

    for (let f in sistema.formatos) {
        tamano.innerHTML += `<option value="${f}">${sistema.formatos[f].label}</option>`;
    }
}

/* ================= TINTAS ================= */

function seleccionarTinta(valor, boton) {

    tintaSeleccionada = valor;

    document.querySelectorAll(".tintas button")
        .forEach(b => b.classList.remove("active"));

    boton.classList.add("active");
}

/* ================= COTIZAR ================= */

function cotizar() {

    if (!tintaSeleccionada) {
        alert("Selecciona tintas");
        return;
    }

    let cantidad = Number(document.getElementById("cantidad").value);

    if (cantidad < 100 || cantidad > 1000) {
        alert("Cantidad mínima 100 y máxima 1000");
        return;
    }

    let papel = document.getElementById("papel").value;
    let formato = sistema.formatos[document.getElementById("tamano").value];

    if (!formato) {
        alert("Error cargando formato");
        return;
    }

    let total = cantidad + sistema.sobrante_produccion;
    let pliegos = Math.ceil(total / formato.division);

    let precioPliego = sistema.papeles[papel].precio70x100;
    let costoPapel = pliegos * precioPliego;

    let costoPlanchas = tintaSeleccionada * formato.plancha;
    let costoTintas = tintaSeleccionada * formato.tinta;
    let costoImpresion = costoPlanchas + costoTintas;

    let costoProduccion =
        sistema.costo_arranque +
        costoPapel +
        costoImpresion +
        sistema.costo_corte +
        sistema.costos_adicionales;

    let precioFinal = costoProduccion * (1 + sistema.margen_ganancia);
    let precioUnidad = precioFinal / cantidad;

    document.getElementById("resultado").innerHTML = `
        <div class="result-grid">

            <div class="card-mini">
                <span>Producción</span>
                <strong>${formatoCOP(total)}</strong>
            </div>

            <div class="card-mini">
                <span>Pliegos</span>
                <strong>${formatoCOP(pliegos)}</strong>
            </div>

            <div class="card-mini">
                <span>Papel</span>
                <strong>$${formatoCOP(costoPapel)}</strong>
            </div>

            <div class="card-mini">
                <span>Planchas</span>
                <strong>$${formatoCOP(costoPlanchas)}</strong>
            </div>

            <div class="card-mini">
                <span>Tintas</span>
                <strong>$${formatoCOP(costoTintas)}</strong>
            </div>

            <div class="card-mini">
                <span>Logística</span>
                <strong>$${formatoCOP(sistema.costo_arranque)}</strong>
            </div>

            <div class="card-mini full">
                <span>Costo producción</span>
                <strong>$${formatoCOP(costoProduccion)}</strong>
            </div>

        </div>

        <div class="total-box">
            <div style="font-size:22px;">$${formatoCOP(precioFinal)}</div>
            <div>$${formatoCOP(precioUnidad)} / unidad</div>
        </div>
    `;

    let r = document.getElementById("resultado");
    r.classList.remove("hidden");
    r.classList.add("show");
}

/* ================= RESET ================= */

function resetCotizador() {

    document.getElementById("cantidad").value = 100;
    tintaSeleccionada = 0;

    document.querySelectorAll(".tintas button")
        .forEach(b => b.classList.remove("active"));

    let r = document.getElementById("resultado");
    r.classList.remove("show");
    r.classList.add("hidden");
    r.innerHTML = "";
}

/* ================= CONFIG ================= */

function toggleConfig() {

    let panel = document.getElementById("configPanel");
    panel.classList.toggle("show");

    if (panel.classList.contains("show")) {
        cargarConfigUI();
        cargarSelectorPapeles();
    }
}

function cargarConfigUI() {

    margen.value = sistema.margen_ganancia;
    arranque.value = sistema.costo_arranque;
    corte.value = sistema.costo_corte;
    adicionales.value = sistema.costos_adicionales;
    sobrante.value = sistema.sobrante_produccion;
}

function cargarSelectorPapeles() {

    let select = document.getElementById("papelSelector");
    select.innerHTML = "";

    for (let p in sistema.papeles) {
        select.innerHTML += `<option>${p}</option>`;
    }

    cargarPapelConfig();
}

function cargarPapelConfig() {

    let papel = papelSelector.value;
    let data = sistema.papeles[papel];

    editorPapel.innerHTML = `
        <label>70x100</label>
        <input id="edit70" value="${data.precio70x100}">
    `;
}

/* ================= GUARDAR (SIN CORS) ================= */

async function guardarConfig() {

    let papel = papelSelector.value;

    let urlPapel = `${API_URL}?tipo=papel&papel=${encodeURIComponent(papel)}&precio70x100=${edit70.value}`;

    let urlConfig = `${API_URL}?tipo=config&margen_ganancia=${margen.value}&costo_arranque=${arranque.value}&costo_corte=${corte.value}&costos_adicionales=${adicionales.value}&sobrante_produccion=${sobrante.value}`;

    await fetch(urlPapel);
    await fetch(urlConfig);

    alert("Guardado correctamente 🔥");

    toggleConfig();
}