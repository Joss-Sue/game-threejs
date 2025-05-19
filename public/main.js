const socket = io();

// Variables globales para la sala seleccionada
let nombreSala = '';
let mundo = '';
let nivel = '';
let modo = '';

// Función para cargar las salas
async function cargarSalas() {
  try {
    const response = await fetch('/rooms');
    const salas = await response.json();

    const usuarioResponse = await fetch('/session');
    if (!usuarioResponse.ok) {
      window.location.href = '/login.html';
      return;
    }
    const usuario = await usuarioResponse.json();

    document.getElementById('bienvenida').textContent = `Bienvenido, ${usuario.nombre}`;

    const userRoom = salas.find(room => room.userId === usuario._id);
    const salasPublicas = salas.filter(room => room.userId !== usuario._id);

    if (userRoom) {
      document.getElementById('bienvenida').textContent += `, tu sala: ${userRoom.name}`;
      document.getElementById('crear-sala').textContent = 'Unirse a tu sala';
      document.getElementById('crear-sala').onclick = () => unirseASala(userRoom, false);
    } else {
      document.getElementById('crear-sala').textContent = 'Crear Sala';
      document.getElementById('crear-sala').onclick = () => crearSala();
    }

    const listaSalas = document.getElementById('lista-salas');
    listaSalas.innerHTML = '';

    if (salasPublicas.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay salas públicas disponibles';
      listaSalas.appendChild(li);
    } else {
      salasPublicas.forEach(sala => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${sala.name}</strong><br>
          Mundo: ${sala.world} | Nivel: ${sala.level} | Modo: ${sala.mode}
        `;
        li.className = "list-group-item";
        li.onclick = () => unirseASala(sala, true); // Solo aquí se guardan los datos
        listaSalas.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Error al cargar las salas:', error);
  }
}

// Función para crear una sala (sin guardar globales)
async function crearSala() {
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
    modo: modoInput
  };

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
