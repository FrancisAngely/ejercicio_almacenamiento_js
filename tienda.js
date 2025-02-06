const boton_anadir = document.querySelectorAll('.boton-anadir');
const seccion_carrito = document.getElementById("productos-carrito");

let productos = [];

window.addEventListener("DOMContentLoaded", function () {
    const carrito = localStorage.getItem('productos');
    if (carrito) {
        productos = JSON.parse(carrito);
        actualizarCarrito();

    }
});

boton_anadir.forEach(boton => {
    boton.addEventListener("click", function () {
        console.log("Se ha pulsado un boton");
        const producto = boton.parentElement;
        console.log(producto);

        const nombre_producto = producto.querySelector('.nombre_producto').textContent;
        console.log(nombre_producto);

        const precio_producto = parseFloat(producto.querySelector('.precio_producto').textContent)
        console.log(precio_producto);

        const producto_existente = productos.find(producto => producto.nombre === nombre_producto);
        if (producto_existente) {
            producto_existente.cantidad += 1;
            console.log(productos);
        } else {
            productos.push({ nombre: nombre_producto, precio: precio_producto, cantidad: 1 });
            console.log(productos);
        }

        localStorage.setItem('carrito', JSON.stringify(productos));

        actualizarCarrito();
    })
});

function actualizarCarrito() {
    seccion_carrito.innerHTML = "";

    productos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add('item-carrito');

        const nombreProducto = document.createElement("span");
        nombreProducto.textContent = `${producto.nombre}`;

        const cantidadProducto = document.createElement("span");
        cantidadProducto.textContent = `x ${producto.cantidad}`

        const precioProducto = document.createElement("span");
        precioProducto.textContent = `${producto.precio * producto.cantidad} €`;

        const boton_eliminar = document.createElement("button");
        boton_eliminar.textContent = 'Eliminar';
        boton_eliminar.classList.add('boton-eliminar');

        boton_eliminar.addEventListener("click", function () {
            productos = productos.filter(Elemento => Elemento.nombre !== producto.nombre);
            //console.log(productos); 
            localStorage.setItem('productos', JSON.stringify(productos));
            actualizarCarrito();
        });

        const boton_editar = document.createElement("button");
        boton_editar.textContent = 'Editar';
        boton_editar.classList.add('boton-editar');

        boton_editar.addEventListener("click", function () {
            if (producto.cantidad > 1) {
                producto.cantidad -= 1;
            } else {
                productos = productos.filter(Elemento => Elemento.nombre !== producto.nombre);
                //console.log(productos); 
            }

            localStorage.setItem('productos', JSON.stringify(productos));
            actualizarCarrito();
        });


        div.appendChild(nombreProducto);
        div.appendChild(cantidadProducto)
        div.appendChild(precioProducto);
        div.appendChild(boton_eliminar);
        div.appendChild(boton_editar);

        seccion_carrito.appendChild(div);

    });

}