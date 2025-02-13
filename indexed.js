// Variables globales
const boton_anadir = document.querySelectorAll('.boton-anadir');
const boton_deseos = document.querySelectorAll('.boton-deseos');
const seccion_carrito = document.getElementById("productos-carrito");
const seccion_deseos = document.getElementById("productos-deseos");
const modal_compra = document.getElementById("modal-compra");
const formulario_compra = document.getElementById("formulario-compra");
const boton_finalizar = document.getElementById("boton-finalizar");
const boton_restablecer = document.getElementById("boton-restablecer");
const tbody_historico = document.getElementById("historico-compras");

let productos = [];
let productos_deseos = [];
let db;

// Inicializar IndexedDB
const initDB = () => {
    const request = indexedDB.open("TiendaDB", 1);

    request.onerror = (event) => {
        console.error("Error al abrir DB:", event.target.error);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains("compras")) {
            db.createObjectStore("compras", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        cargarHistorico();
    };
};

// Cargar datos iniciales
window.addEventListener("DOMContentLoaded", function () {
    initDB();
    
    // Cargar carrito
    const carrito = localStorage.getItem('productos');
    if (carrito) {
        productos = JSON.parse(carrito);
        actualizarCarrito();
    }

    // Cargar lista de deseos
    const deseos = sessionStorage.getItem('deseos');
    if (deseos) {
        productos_deseos = JSON.parse(deseos);
        actualizarListaDeseos();
    }
});

// Gestión de la lista de deseos
boton_deseos.forEach(boton => {
    boton.addEventListener("click", function() {
        const producto = boton.parentElement;
        const nombre_producto = producto.querySelector('.nombre_producto').textContent;
        const precio_producto = parseFloat(producto.querySelector('.precio_producto').textContent);

        if (!productos_deseos.some(p => p.nombre === nombre_producto)) {
            productos_deseos.push({ nombre: nombre_producto, precio: precio_producto });
            sessionStorage.setItem('deseos', JSON.stringify(productos_deseos));
            actualizarListaDeseos();
        }
    });
});

function actualizarListaDeseos() {
    seccion_deseos.innerHTML = "";
    productos_deseos.forEach(producto => {
        const div = document.createElement("div");
        div.textContent = `${producto.nombre} - ${producto.precio}€`;
        seccion_deseos.appendChild(div);
    });
}

// Modificar la función de añadir al carrito para verificar lista de deseos
boton_anadir.forEach(boton => {
    boton.addEventListener("click", function() {
        const producto = boton.parentElement;
        const nombre_producto = producto.querySelector('.nombre_producto').textContent;
        const precio_producto = parseFloat(producto.querySelector('.precio_producto').textContent);

        if (productos_deseos.some(p => p.nombre === nombre_producto)) {
            alert("Este producto está en tu lista de deseos");
        }

        const producto_existente = productos.find(p => p.nombre === nombre_producto);
        if (producto_existente) {
            producto_existente.cantidad += 1;
        } else {
            productos.push({ nombre: nombre_producto, precio: precio_producto, cantidad: 1 });
        }

        localStorage.setItem('productos', JSON.stringify(productos));
        actualizarCarrito();
    });
});

// Gestión del formulario de compra
boton_finalizar.addEventListener("click", () => {
    modal_compra.style.display = "block";
});

formulario_compra.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos_cliente = {
        nombre: e.target[0].value,
        direccion: e.target[1].value,
        telefono: e.target[2].value,
        metodo_pago: e.target[3].value
    };

    const compra = {
        fecha: new Date(),
        cliente: datos_cliente,
        productos: productos,
        total: productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0)
    };

    guardarCompra(compra);
    
    // Limpiar carrito
    productos = [];
    localStorage.setItem('productos', JSON.stringify(productos));
    actualizarCarrito();
    
    modal_compra.style.display = "none";
    formulario_compra.reset();
});

// Funciones de IndexedDB
function guardarCompra(compra) {
    const transaction = db.transaction(["compras"], "readwrite");
    const objectStore = transaction.objectStore("compras");
    
    const request = objectStore.add(compra);
    
    request.onsuccess = () => {
        cargarHistorico();
    };
}

function cargarHistorico() {
    const transaction = db.transaction(["compras"], "readonly");
    const objectStore = transaction.objectStore("compras");
    const request = objectStore.getAll();

    request.onsuccess = () => {
        const compras = request.result;
        tbody_historico.innerHTML = "";
        
        compras.forEach(compra => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${new Date(compra.fecha).toLocaleDateString()}</td>
                <td>${compra.cliente.nombre}</td>
                <td>${compra.productos.map(p => `${p.nombre} x${p.cantidad}`).join(", ")}</td>
                <td>${compra.total}€</td>
            `;
            tbody_historico.appendChild(tr);
        });
    };
}

// Función para restablecer todos los datos
boton_restablecer.addEventListener("click", () => {
    // Limpiar LocalStorage
    localStorage.clear();
    productos = [];
    actualizarCarrito();

    // Limpiar SessionStorage
    sessionStorage.clear();
    productos_deseos = [];
    actualizarListaDeseos();

    // Limpiar IndexedDB
    const transaction = db.transaction(["compras"], "readwrite");
    const objectStore = transaction.objectStore("compras");
    const request = objectStore.clear();

    request.onsuccess = () => {
        cargarHistorico();
        alert("Todos los datos han sido restablecidos");
    };
});