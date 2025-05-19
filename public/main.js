const socket = io();
let musicaFondo;

function iniciarMusica(camera) {
  // Crear un listener y añadirlo a la cámara
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // Crear el objeto de audio
  musicaFondo = new THREE.Audio(listener);

  // Cargar el archivo de audio
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('/game/audio/planckx27s-constant-la-constante-de-planck-127554.mp3', function(buffer) {
    musicaFondo.setBuffer(buffer);
    musicaFondo.setLoop(true);
    musicaFondo.setVolume(0.5);
    
    // Reproducir al primer clic en el documento
    document.body.addEventListener('click', function reproducir() {
      musicaFondo.play();
      console.log('🎵 Música iniciada');
      document.body.removeEventListener('click', reproducir); // Eliminar después de un clic
    });
  });
}




// Función para cargar las salas
async function cargarSalas() {
  try {
    // Obtener las salas desde el servidor
    const response = await fetch('/rooms');
    const salas = await response.json();

    // Obtener el ID del usuario desde la sesión
    const usuarioResponse = await fetch('/session');
    if (!usuarioResponse.ok) {
      window.location.href = '/login.html'; // Redirigir al login si no está autenticado
      return;
    }
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
        li.className="list-group-item";
        li.onclick = () => unirseASala(sala.name);
        listaSalas.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Error al cargar las salas:', error);
  }

  window.onload = () => {
  configurarMusicaFondo(); // Configura el audio
  reproducirMusicaFondo(); // Inicia la música
  cargarSalas(); // Cargar las salas al cargar la página
  }
}

// Función para crear una sala
async function crearSala() {
  const nombreSala = document.getElementById('nueva-sala').value.trim();

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

socket.on('iniciar-juego', (nombreSala) => {
  console.log(`Iniciando juego en sala: ${nombreSala}`);
  // Redirigir a la pantalla del juego
  window.location.href = `/pantallajuego.html?sala=${encodeURIComponent(nombreSala)}`;
});

socket.on('roomCreated', (nombreSala) => {
  alert(`Sala creada: ${nombreSala}`);
  cargarSalas(); // Refrescar lista
});

// Después de unirse a una sala
socket.on('roomJoined', (nombreSala) => {
  console.log(`Te has unido a la sala: ${nombreSala}`);
  cargarSalas(); // Refrescar lista
});

// Cuando otro usuario crea o se une a una sala
socket.on('salasActualizadas', () => {
  console.log('Las salas han cambiado. Actualizando...');
  cargarSalas();
});


// Cargar las salas al cargar la página
window.onload = cargarSalas;
