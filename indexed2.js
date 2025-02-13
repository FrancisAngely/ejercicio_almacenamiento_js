/** @type {IDBDatabase} */

let db;

const boton_añadir = document.getElementById("añadir");
const tarea = document.getElementById("tarea");
const lista_tareas = document.getElementById("lista_tareas");

//1. crear o abrir la base de datos
const request = indexedDB.open("tareasBD", 1);

//2. control de 3 eventos
request.addEventListener("error", function (event) {
  console.log("Ha ocurrido un error al abrir la base de datos", event);
});

request.onsuccess = (event) => {
  console.log("Se ha abierto la base de datos bien");
  db = event.target.result; //esta es la base de datos
  añadirTareas();
};

//2.1.Cuando se actualiza o la primera vez que se abre la bd
request.onupgradeneeded = (event) => {
  db = event.target.result; //esta es la base de datos
  if (!db.objectStoreNames.contains("tarea")) {
    db.createObjectStore("tarea", { keyPath: "id", autoIncrement: true });
  }
};
//3. añadir valores a la base de datos
boton_añadir.addEventListener("click", function () {
  const tarea_txt = tarea.value;
  if (tarea_txt) {
    //3.1 crear transacción
    const trans = db.transaction("tarea", "readwrite");
    const almacen = trans.objectStore("tarea");
    almacen.add({ texto: tarea_txt });

    trans.oncomplete = () => {
      console.log("Se ha añadido correctamente");
      añadirTareas();
    };
  } else {
    alert("Debes introducir un valor");
  }
});

function añadirTareas() {
  lista_tareas.innerHTML = "";

  const trans = db.transaction("tarea", "readonly");
  const almacen = trans.objectStore("tarea");
  const datos = almacen.getAll();

  datos.onsuccess = () => {
    datos.result.forEach((elementos) => {
      const div = document.createElement("div");
      div.classList.add("tarea");
      div.id = `tarea-${elementos.id}`;

      const span_txt = document.createElement("span");
      span_txt.classList.add("texto-tarea");
      span_txt.textContent = elementos.texto;

      const boton_editar = document.createElement("button");
      boton_editar.classList.add("boton-editar");
      boton_editar.textContent = "Editar";
      boton_editar.addEventListener("click", editarTarea);

      const boton_eliminar = document.createElement("button");
      boton_eliminar.classList.add("boton-eliminar");
      boton_eliminar.textContent = "Eliminar";

      div.appendChild(span_txt);
      div.appendChild(boton_editar);
      div.appendChild(boton_eliminar);

      lista_tareas.appendChild(div);
    });
  };
}

function editarTarea(event) {
  const div = event.target.parentElement;
  console.log(div);
  const texto_span = div.querySelector(".texto-tarea");
  const idTarea = Number(div.id.replace("tarea-", ""));
  console.log(idTarea);

  if (!div.querySelector("input")) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = texto_span.textContent;

    const boton_guardar = document.createElement("button");
    boton_guardar.textContent = "Guardar";
    boton_guardar.classList.add("boton-guardar");

    boton_guardar.addEventListener("click", function () {
      const nuevo_valor = input.value;
      if (nuevo_valor) {
        console.log(nuevo_valor);
        const trans = db.transaction("tarea", "readwrite");
        const almacen = trans.objectStore("tarea");

        const request = almacen.get(idTarea);
        request.onsuccess = () => {
          console.log(request.result);
          //para verlo de forma visual
          texto_span.textContent = nuevo_valor;
          //actualizar valor en la solicitud
          request.result.texto = nuevo_valor;
          //añadirlo una vez que hemos actualizado el valor en la solicitud
          const tarea_actualizada = almacen.put(request.result);

          tarea_actualizada.onsuccess = () => {
            añadirTareas();
          };
        };
      } else {
        alert("debes introducir un valor");
      }
    });

    div.appendChild(input);
    div.appendChild(boton_guardar);
  }
}

function eliminarTarea(event) {
  const div = event.target.parentElement;
  const idTarea = Number(div.id.replace("tarea-", ""));
  const transaccion = db.transaction("tarea", "readwrite");
    const almacen = transaccion.objectStore("tarea");

    const request = almacen.delete(idTarea);

    request.onsuccess = () => {
      añadirTareas();
    };
}
