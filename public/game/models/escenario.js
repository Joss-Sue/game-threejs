import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { texturaESC1 } from '/game/source/Modelos/ESCENARIOS/ESC1/scriptTXT_ESC1.js';
import { texturaGALAXY,texturaGALAXY2,texturaGALAXY3 } from '/game/source/Modelos/ESCENARIOS/SKYBOX/scriptTXT_SKY.js';
import { texturaBaseMilitar } from '/game/source/Modelos/ambientacion/baseMilitar/texturaBaseMilitar.js';
import { texturaEdificio } from '/game/source/Modelos/ambientacion/edificio/texturaEdificio.js';
import { texturaNave } from '/game/source/Modelos/ambientacion/nave/texturaNave.js';
import { texturaPuertoEspcial } from '/game/source/Modelos/ambientacion/puertoEspacial/texturaPuertoEspacial.js';
import { texturasatelite } from '/game/source/Modelos/ambientacion/satelite/scriptTXT_satelite.js';
import { texturagalileo } from '/game/source/Modelos/ambientacion/galileo/scriptTXT.galileo.js';
import { texturaorbe } from '/game/source/Modelos/ambientacion/orbe/scriptTXT_orbe.js';

// Funciones para cargar cada modelo fijo (sin parámetros dinámicos)
async function cargarEstacion(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('/game/source/Modelos/ambientacion/estacion/ScifiStation_obj.mtl', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('/game/source/Modelos/ambientacion/estacion/ScifiStation_obj.obj', (object) => {
        if (position) object.position.set(...position);
        if (scale) object.scale.set(...scale);
        if (rotation) object.rotation.set(...rotation);
        resolve(object);
      }, undefined, reject);
    }, undefined, reject);
  });
}

async function cargarGalileo(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('/game/source/Modelos/ambientacion/galileo/scene.gltf', (gltf) => {
      const object = gltf.scene;
      object.traverse(child => {
        if (child.isMesh) child.material = texturagalileo;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}
async function cargarOrbe(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load('/game/source/Modelos/ambientacion/orbe/Done_Orb_Fix.obj', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaorbe;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}


async function cargarBaseMilitar(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load('/game/source/Modelos/ambientacion/baseMilitar/baseMilitar.obj', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaBaseMilitar;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

async function cargarEdificio(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load('/game/source/Modelos/ambientacion/edificio/edificio.obj', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaEdificio;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

async function cargarNave(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load('/game/source/Modelos/ambientacion/nave/nave.obj', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaNave;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

async function cargarPuertoEspacial(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load('/game/source/Modelos/ambientacion/puertoEspacial/puertoEspacial.obj', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaPuertoEspcial;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

async function cargarSatelite(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load('/game/source/Modelos/ambientacion/satelite/SatelliteSubstancePainter.obj', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturasatelite;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

async function cargarEsc1FBX(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/ESCENARIOS/ESC1/ESC1.fbx', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaESC1;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

async function cargarSkybox(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/ESCENARIOS/SKYBOX/GALAXY_2.fbx', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaGALAXY;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}
async function cargarSkybox2(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/ESCENARIOS/SKYBOX/GALAXY_2.fbx', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaGALAXY2;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}
async function cargarSkybox3(position, scale, rotation) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/ESCENARIOS/SKYBOX/GALAXY_2.fbx', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaGALAXY3;
      });
      if (position) object.position.set(...position);
      if (scale) object.scale.set(...scale);
      if (rotation) object.rotation.set(...rotation);
      resolve(object);
    }, undefined, reject);
  });
}

// Arreglo con los métodos de carga en orden fijo
const modelosFijos = [
  cargarEstacion,
  cargarGalileo,
  cargarBaseMilitar,
  cargarEdificio,
  cargarNave,
  cargarPuertoEspacial,
  cargarSatelite,
  cargarEsc1FBX,
  cargarSkybox,
  cargarSkybox2,
  cargarSkybox3,
  cargarOrbe,
];

// Configuración por escenario solo con posición, escala y rotación para cada modelo
const configuracionesEscenarios = {
  esc1: [
    { position: [-800, 0, 700], scale: [2, 2, 2], rotation: null },
    { position: [400, 0, -30], scale: [10, 10, 10], rotation: null },
    { position: [-500, -10, -500], scale: [80, 80, 80], rotation: null },
    { position: [800, -10, -300], scale: [80, 80, 80], rotation: null },
    { position: [200, 30, -400], scale: [10, 10, 10], rotation: null },
    { position: [980, -200, 300], scale: [50, 50, 50], rotation: [0, 3 * Math.PI / 2, 0] },
    { position: [250, 0, -50], scale: [10, 10, 10], rotation: null },
    { position: [60, -35, -50], scale: [1, 1, 1], rotation: null },
    { position: [0, 0, 0], scale: [7, 7, 7], rotation: null },
    { position: [0, 0, 0], scale: [0, 0, 0], rotation: null },
    { position: [0, 0, 0], scale: [0, 0, 0], rotation: null },
   { position: [300, 0, -50], scale: [.05,.05,.05], rotation: null },
  ],
  esc2: [
         { position: [800, -10, -300], scale: [2, 2, 2], rotation: null },
    { position: [400, 0, 600], scale: [10, 10, 10], rotation: null },
    { position: [-500, -10, -800], scale: [80, 80, 80], rotation: null },
    { position: [-800, 0, 700], scale: [80, 80, 80], rotation: null },
    { position: [200, 30, 400], scale: [10, 10, 10], rotation: null },
    { position: [980, -200, 900], scale: [50, 50, 50], rotation: [0, 3 * Math.PI / 2, 0] },
    { position: [-250, 0, -50], scale: [10, 10, 10], rotation: null },
    { position: [60, -35, -50], scale: [1, 1, 1], rotation: null },
    { position: [0, 0, 0], scale: [0, 0, 0], rotation: null },
    { position: [0, 0, 0], scale: [7, 7, 7], rotation: null },
    { position: [0, 0, 0], scale: [0, 0, 0], rotation: null },
   { position: [300, 0, -50], scale: [.05,.05,.05], rotation: null },
  ],
  esc3: [
      { position: [800, -50, -300], scale: [2, 2, 2], rotation: null },
    { position: [400, 0, -600], scale: [10, 10, 10], rotation: null },
    { position: [-800, -50, 700], scale: [80, 80, 80], rotation: null },
    { position: [-700, -150, -800], scale: [80, 80, 80], rotation: null },
    { position: [200, -30, 400], scale: [10, 10, 10], rotation: null },
    { position: [980, -200, 900], scale: [50, 50, 50], rotation: [0, 3 * Math.PI / 2, 0] },
    { position: [-250, 0, -50], scale: [10, 10, 10], rotation: null },
    { position: [60, -35, -50], scale: [1, 1, 1], rotation: null },
    { position: [0, 0, 0], scale: [0, 0, 0], rotation: null },
    { position: [0, 0, 0], scale: [0, 0, 0], rotation: null },
    { position: [0, 0, 0], scale: [7, 7, 7], rotation: null },
   { position: [300, 0, -50], scale: [.05,.05,.05], rotation: null },

  ],
};

export async function cargarEscenario(scene, nombreEscenario = 'esc3') {
  const config = configuracionesEscenarios[nombreEscenario];
  if (!config) return;
  
  for (let i = 0; i < modelosFijos.length; i++) {
    const cargarModelo = modelosFijos[i];
    const transform = config[i] || { position: null, scale: null, rotation: null };
    try {
      const objeto = await cargarModelo(transform.position, transform.scale, transform.rotation);
      scene.add(objeto);
      // Esperar un pequeño tiempo para no saturar GPU
      await new Promise(resolve => setTimeout(resolve, 100)); 
      
    } catch (e) {
      //console.error(Error cargando modelo índice ${i}:, e);
    }
  }
  //console.log(Escenario ${nombreEscenario} cargado.);
  console.log('Configuraciones disponibles:', configuracionesEscenarios);
console.log('Nombre de escenario recibido:', nombreEscenario);


}