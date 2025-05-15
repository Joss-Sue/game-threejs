const socket = io();

// Función para cargar las salas
async function cargarSalas() {
  try {
    // Obtener las salas desde el servidor
    const response = await fetch('/rooms');
    const salas = await response.json();

    // Obtener el ID del usuario desde la sesión
    const usuarioResponse = await fetch('/session');
    const usuario = await usuarioResponse.json();

    // Mostrar el nombre del usuario en la bienvenida
    document.getElementById('bienvenida').textContent = `Bienvenido, ${usuario.nombre}`;

    // Filtrar la sala del usuario, si existe
    const userRoom = salas.find(room => room.userId === usuario._id);
    const salasPublicas = salas.filter(room => room.userId !== usuario._id);

    // Mostrar la sala del usuario si existe
    if (userRoom) {
      document.getElementById('bienvenida').textContent += `, tu sala: ${userRoom.name}`;
      document.getElementById('crear-sala').textContent = 'Unirse a tu sala';
      document.getElementById('crear-sala').onclick = () => unirseASala(userRoom.name);
    } else {
      document.getElementById('crear-sala').textContent = 'Crear Sala';
      document.getElementById('crear-sala').onclick = () => crearSala();
    }

    // Renderizar las salas públicas disponibles
    const listaSalas = document.getElementById('lista-salas');
    listaSalas.innerHTML = '';

    if (salasPublicas.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No hay salas públicas disponibles';
      listaSalas.appendChild(li);
    } else {
      salasPublicas.forEach(sala => {
        const li = document.createElement('li');
        li.textContent = sala.name;
        li.onclick = () => unirseASala(sala.name);
        listaSalas.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Error al cargar las salas:', error);
  }
}

// Función para crear una sala
async function crearSala() {
  const nombreSala = document.getElementById('nueva-sala').value;

  if (!nombreSala) {
    alert('Por favor, ingresa un nombre de sala');
    return;
  }

  socket.emit('createRoom', nombreSala);
  document.getElementById('nueva-sala').value = ''; // Limpiar el campo
}

// Función para unirse a una sala
function unirseASala(nombreSala) {
  socket.emit('joinRoom', nombreSala);
}

// Escuchar mensajes del socket
socket.on('mensaje', (mensaje) => {
  const mensajesDiv = document.getElementById('mensajes');
  const p = document.createElement('p');
  p.textContent = mensaje;
  mensajesDiv.appendChild(p);
});

// Cargar las salas al cargar la página
window.onload = cargarSalas;
