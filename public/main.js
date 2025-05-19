const socket = io();

// Variables globales para la sala seleccionada
let nombreSala = '';
let mundo = '';
let nivel = '';
let modo = '';
document.getElementById('crear-sala').addEventListener('click', crearSala);

// Función para cargar las salas
async function cargarSalas() {
  try {
    const usuarioResponse = await fetch('/session');
    const text = await usuarioResponse.text();
    let usuario;

    try {
      usuario = JSON.parse(text);
    } catch (e) {
      window.location.href = '/login.html';
      return;
    }

    const response = await fetch('/rooms');
    const salas = await response.json();

    document.getElementById('bienvenida').textContent = `Únete o crea tu sala, ${usuario.nombre}`;

    const salasUsuario = salas.filter(room => room.creator === usuario.nombre);
    const salasPublicas = salas.filter(room => room.creator !== usuario.nombre);

    const listaSalasPublicas = document.getElementById('lista-salas-publicas');
    const listaSalasUsuario = document.getElementById('lista-salas-usuario');

    listaSalasPublicas.innerHTML = '';
    listaSalasUsuario.innerHTML = '';

    // Salas Públicas
    if (salasPublicas.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Aún no hay salas públicas disponibles.';
      li.className = 'list-group-item';
      listaSalasPublicas.appendChild(li);
    } else {
      salasPublicas.forEach(sala => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
          <strong>${sala.name}</strong><br>
          Mundo: ${sala.world} | Nivel: ${sala.level} | Modo: ${sala.mode} | Creador: ${sala.creator}
        `;
        li.onclick = () => unirseASala(sala, true);
        listaSalasPublicas.appendChild(li);
      });
    }

    // Salas del usuario
    if (salasUsuario.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Aún no has creado ninguna sala.';
      li.className = 'list-group-item';
      listaSalasUsuario.appendChild(li);
    } else {
      salasUsuario.forEach(sala => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-start';
        li.innerHTML = `
          <div class="ms-2 me-auto">
            <div class="fw-bold">${sala.name}</div>
            Mundo: ${sala.world} | Nivel: ${sala.level} | Modo: ${sala.mode}
          </div>
          <button class="btn btn-danger btn-sm eliminar-sala" data-name="${sala.name}" data-creator="${sala.creator}">
            Eliminar
          </button>
        `;

         li.onclick = () => unirseASala(sala, true);

        // Asignar evento al botón de eliminar
        li.querySelector('.eliminar-sala').onclick = (e) => {
          e.stopPropagation(); // Evita que se dispare el onClick del LI
          eliminarSala(sala.name, sala.creator);
        };

        listaSalasUsuario.appendChild(li);
      });
    }

  } catch (error) {
    console.error('Error al cargar las salas:', error);
  }
}


// Función para crear una sala (sin guardar globales)
async function crearSala() {
  let usuario;
  const usuarioResponse = await fetch('/session');
  const text = await usuarioResponse.text();
  try {
    usuario = JSON.parse(text);
  } catch (e) {
    window.location.href = '/login.html';
    return;
  }
  console.log('Usuario:', usuario);

  const nombreSalaInput = document.getElementById('nueva-sala').value.trim();
  const mundoInput = document.getElementById('mundo').value;
  const nivelInput = document.getElementById('nivel').value;
  const modoInput = document.getElementById('modo').value;

  if (!nombreSalaInput) {
    alert('Por favor, ingresa un nombre de sala');
    return;
  }

  const roomData = {
    name: nombreSalaInput,
    mundo: mundoInput,
    nivel: nivelInput,
    modo: modoInput,
    user: usuario.nombre
  };
  console.log('Creando sala:', roomData);
  socket.emit('createRoom', roomData);
}

// Función para unirse a una sala
function unirseASala(sala, guardarDatos) {
  if (guardarDatos) {
    nombreSala = sala.name;
    mundo = sala.world;
    nivel = sala.level;
    modo = sala.mode;
  }

  socket.emit('joinRoom', sala.name);
}

// Escuchar mensajes del socket
socket.on('mensaje', (mensaje) => {
  const mensajesDiv = document.getElementById('mensajes');
  const p = document.createElement('p');
  p.textContent = mensaje;
  mensajesDiv.appendChild(p);
});

// Iniciar el juego con los datos guardados
socket.on('iniciar-juego', () => {
  console.log(`Iniciando juego en sala: ${nombreSala}`);
  window.location.href = `/pantallajuego.html?sala=${encodeURIComponent(nombreSala)}&mundo=${encodeURIComponent(mundo)}&nivel=${encodeURIComponent(nivel)}&modo=${encodeURIComponent(modo)}`;
});

socket.on('roomCreated', (nombreSala) => {
  alert(`Sala creada: ${nombreSala}`);
  cargarSalas();
});

socket.on('roomJoined', (nombreSala) => {
  console.log(`Te has unido a la sala: ${nombreSala}`);
  cargarSalas();
});

socket.on('salasActualizadas', () => {
  console.log('Las salas han cambiado. Actualizando...');
  cargarSalas();
});

window.onload = cargarSalas;
