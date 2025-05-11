import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { texturaDron } from '../Modelos/PER_PRIN/PP_1/scriptTXT_PP1.js';
import { texturaDron2 } from '../Modelos/PER_PRIN/PP_2/scriptTXT_PP2.js';
import { texturaESC1 } from '../Modelos/ESCENARIOS/ESC1/scriptTXT_ESC1.js';
import { texturaGALAXY } from '../Modelos/ESCENARIOS/SKYBOX/scriptTXT_SKY.js';
import { texturaEnemy1 } from '../Modelos/ENEMIGOS/ENEMY_1/scriptTXT_EN1.js';
import { texturaENEM2 } from '../Modelos/ENEMIGOS/ENEMY_2/scriptTXT_EN2.js';
import { texturasatelite } from '../Modelos/ambientacion/satelite/scriptTXT_satelite.js';
import { texturagalileo } from '../Modelos/ambientacion/galileo/scriptTXT.galileo.js';
import { MTLLoader } from '../node_modules/three/examples/jsm/loaders/MTLLoader.js';
import { texturaBaseMilitar } from '../Modelos/ambientacion/baseMilitar/texturaBaseMilitar.js';
import { texturaEdificio } from '../Modelos/ambientacion/edificio/texturaEdificio.js';
import { texturaNave } from '../Modelos/ambientacion/nave/texturaNave.js';
import { texturaPuertoEspcial } from '../Modelos/ambientacion/puertoEspacial/texturaPuertoEspacial.js';




const loader = new THREE.TextureLoader();

// Se crea la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 8000);
camera.position.z = 114;
camera.position.x = -7;
camera.position.y = 1.5;
const clock1 = new THREE.Clock();
const clock2 = new THREE.Clock();
const clockEN1 = new THREE.Clock();
const clockEN2 = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles orbitales
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// Se añade luz ambiental
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Se añade luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Cargar texturas
const texturaDronCom = texturaDron;
const texturaDron2Com = texturaDron2;
const texturaEscen1 = texturaDron2;
const texturaSkybix = texturaGALAXY;
const texturasatelite2 = texturasatelite;

// // Cargar el archivo MTL
// const mtlLoader = new MTLLoader();
// mtlLoader.load('./Modelos/ambientacion/estacion/ScifiStation_obj.mtl', function (materials) {
//     materials.preload();
//     const objLoader = new OBJLoader();
//     objLoader.setMaterials(materials);
//     objLoader.load('./Modelos/ambientacion/estacion/ScifiStation_obj.obj', function (object) {
//         object.position.set(-800, 0, 700);
//         object.scale.set(2, 2, 2);
//         scene.add(object);
//     }, undefined, function (error) {
//         console.error('Error al cargar el modelo OBJ:', error);
//     });
// }, undefined, function (error) {
//     console.error('Error al cargar el archivo MTL:', error);
// });

// // Cargar el modelo galileo
// const ModeloGalileo = new GLTFLoader();
// ModeloGalileo.load('./Modelos/ambientacion/galileo/scene.gltf', function (object) {
//     const loadedObject = object.scene || object;

//     if (loadedObject instanceof THREE.Object3D) {
//         loadedObject.traverse(function (child) {

//         });
//         loadedObject.position.set(400, 0, -30);
//         loadedObject.scale.set(10, 10, 10);
//         scene.add(loadedObject);
//     } else {
//         console.error('Error: El objeto cargado no es válido para agregar a la escena.');
//     }
// }, undefined, function (error) {
//     console.error('Error al cargar el modelo GLTF:', error);
// });

// // Cargar el modelo base militar
// const ModeloBaseMilitar = new OBJLoader();
// ModeloBaseMilitar.load('./Modelos/ambientacion/baseMilitar/baseMilitar.obj', function (object) {
//     if (object instanceof THREE.Object3D) {
//         object.traverse(function (child) {
//             if (child.isMesh) {
//                 child.material = texturaBaseMilitar;
//             }
//         });
//         object.position.set(-500, -10, -500);
//         object.scale.set(80, 80, 80);
//         scene.add(object);
//     } else {
//         console.error('Error: El objeto cargado no es válido para agregar a la escena.');
//     }
// }
//     , undefined, function (error) {
//         console.error('Error al cargar el modelo base militar:', error);
//     }
// );

// // Cargar el modelo edificio
// const ModeloEdificio = new OBJLoader();
// ModeloEdificio.load('./Modelos/ambientacion/edificio/edificio.obj', function (object) {
//     if (object instanceof THREE.Object3D) {
//         object.traverse(function (child) {
//             if (child.isMesh) {
//                 child.material = texturaEdificio;
//             }
//         });
//         object.position.set(800, -10, -300);
//         object.scale.set(80, 80, 80);
//         scene.add(object);
//     } else {
//         console.error('Error: El objeto cargado no es válido para agregar a la escena.');
//     }
// }
//     , undefined, function (error) {
//         console.error('Error al cargar el modelo edificio:', error);
//     }
// );

// //Cargar el modelo nave
// const ModeloNave = new OBJLoader();
// ModeloNave.load('./Modelos/ambientacion/nave/nave.obj', function (object) {
//     if (object instanceof THREE.Object3D) {
//         object.traverse(function (child) {
//             if (child.isMesh) {
//                 child.material = texturaNave;
//             }
//         });
//         object.position.set(200, 30, -400);
//         object.scale.set(10, 10, 10);
//         scene.add(object);
//     } else {
//         console.error('Error: El objeto nave cargado no es válido para agregar a la escena.');
//     }
// }
//     , undefined, function (error) {
//         console.error('Error al cargar el modelo nave:', error);
//     }
// );

// // Cargar el modelo puerto espacial
// let ModeloPuertoEspacial = new OBJLoader();
// ModeloPuertoEspacial.load('./Modelos/ambientacion/puertoEspacial/puertoEspacial.obj', function (object) {
//     if (object instanceof THREE.Object3D) {
//         object.traverse(function (child) {
//             if (child.isMesh) {
//                 child.material = texturaPuertoEspcial;
//             }
//         });
//         object.position.set(980, -200, 300);
//         object.scale.set(50, 50, 50);
//         object.rotation.y = 3 * Math.PI / 2;; // Rotar el objeto 90 grados en el eje Y
//         //object.rotation.x = Math.PI; // Rotar el objeto 90 grados en el eje X
//         //object.rotation.z = Math.PI; // Rotar el objeto 90 grados en el eje Z
//         scene.add(object);
//     } else {
//         console.error('Error: El objeto cargado no es válido para agregar a la escena.');
//     }
// }
//     , undefined, function (error) {
//         console.error('Error al cargar el modelo puerto espacial:', error);
//     }
// );

// // Cargar el modelo satelite
// const ModeloSatelite = new OBJLoader();
// ModeloSatelite.load('./Modelos/ambientacion/satelite/SatelliteSubstancePainter.obj', function (object) {
//     if (object instanceof THREE.Object3D) {
//         object.traverse(function (child) {
//             if (child.isMesh) {
//                 child.material = texturasatelite2;
//             }
//         });
//         object.position.set(250, 0, -50);
//         object.scale.set(10, 10, 10);
//         scene.add(object);
//     } else {
//         console.error('Error: El objeto cargado no es válido para agregar a la escena.');
//     }
// }, undefined, function (error) {
//     console.error('Error al cargar el modelo FBX:', error);
// });


// Cargar el modelo FBX
let personajePrincipal;
const velocidad = 300;
const teclasPresionadas = {
    w: false,
    a: false,
    s: false,
    d: false,
};

const mouse = new THREE.Vector2();

const ModeloPP = new FBXLoader();
ModeloPP.load('./Modelos/PER_PRIN/PP_1/DRONE.fbx', function (object) {
    if (object instanceof THREE.Object3D) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = texturaDronCom;
            }
        });

        object.position.set(0, -35, -50);
        object.scale.set(0.3, 0.3, 0.3);
        scene.add(object);

        const mixer = new THREE.AnimationMixer(object);

        if (object.animations && object.animations.length) {
            const clips = object.animations;

            function update() {
                const delta = clock1.getDelta();
                mixer.update(delta);
            }

            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
                update();
            }

            animate();

            const clip = THREE.AnimationClip.findByName(clips, 'Take001');
            if (clip) {
                const action = mixer.clipAction(clip);
                action.play();
            }

            clips.forEach(function (clip) {
                mixer.clipAction(clip).play();
            });

        } else {
            console.error('El modelo no tiene animaciones.');
        }
        personajePrincipal=object;
    } else {
        console.error('Error: El objeto cargado no es válido para agregar a la escena.');
    }
}, undefined, function (error) {
    console.error('Error al cargar el modelo FBX:', error);
});

document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in teclasPresionadas) teclasPresionadas[key] = true;
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in teclasPresionadas) teclasPresionadas[key] = false;
});

document.addEventListener('mousemove', (event) => {
    // Coordenadas normalizadas del mouse (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function actualizarPersonaje(delta) {
    if (!personajePrincipal) return;

    // Movimiento
    // Input vector en 2D (sin rotación todavía)
    const input = new THREE.Vector3(
        (teclasPresionadas.a ? 1 : 0) - (teclasPresionadas.d ? 1 : 0),
        0,
        (teclasPresionadas.w ? 1 : 0) - (teclasPresionadas.s ? 1 : 0)
    );

    if (input.lengthSq() > 0) {
        input.normalize();

        // Aplicamos la rotación del personaje al input
        const direccionMovimiento = input.applyQuaternion(personajePrincipal.quaternion);

        // Movemos al personaje en esa dirección
        direccionMovimiento.multiplyScalar(velocidad * delta);
        personajePrincipal.position.add(direccionMovimiento);
    }

    

    // Rotación hacia el mouse
    const vectorMouse = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vectorMouse.unproject(camera);

    const direccion = vectorMouse.sub(camera.position).normalize();
    const distancia = (personajePrincipal.position.y - camera.position.y) / direccion.y;
    const puntoEnPlano = camera.position.clone().add(direccion.multiplyScalar(distancia));

    const direccionPersonaje = puntoEnPlano.clone().sub(personajePrincipal.position);
    direccionPersonaje.y = 0;
    direccionPersonaje.normalize();

    const rotacionY = Math.atan2(direccionPersonaje.x, direccionPersonaje.z);
    const quaternionObjetivo = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), rotacionY
    );
    personajePrincipal.quaternion.slerp(quaternionObjetivo, 0.1);

}


function actualizarCamara() {
    if (!personajePrincipal) return;

    const camOffset = new THREE.Vector3(0, 300, -200); 
    const offsetRotado = camOffset.clone().applyQuaternion(personajePrincipal.quaternion);
    const nuevaPosCamara = personajePrincipal.position.clone().add(offsetRotado);
    
    camera.position.lerp(nuevaPosCamara, 0.1);
    camera.lookAt(personajePrincipal.position.clone().add(new THREE.Vector3(0, 50, 0)));

}



// Cargar otro modelo FBX para el segundo personaje
const ModeloPP2 = new FBXLoader();
ModeloPP2.load('./Modelos/PER_PRIN/PP_1/DRONE.fbx', function (object) {
    if (object instanceof THREE.Object3D) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = texturaDron2Com;
            }
        });
        object.position.set(60, -35, -50);
        object.scale.set(0.3, 0.3, 0.3);
        scene.add(object);
        const mixer = new THREE.AnimationMixer(object);
        if (object.animations && object.animations.length) {
            const clips = object.animations;
            function update() {
                const delta = clock2.getDelta();
                mixer.update(delta);
            }
            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
                update();
            }
            animate();
            const clip = THREE.AnimationClip.findByName(clips, 'Take001');
            if (clip) {
                const action = mixer.clipAction(clip);
                action.play();
            }
            clips.forEach(function (clip) {
                mixer.clipAction(clip).play();
            });

        } else {
            console.error('El modelo no tiene animaciones.');
        }
    } else {
        console.error('Error: El objeto cargado no es válido para agregar a la escena.');
    }
}, undefined, function (error) {
    console.error('Error al cargar el modelo FBX:', error);
});

// Cargar escenario 1
const Escenario1 = new FBXLoader();
Escenario1.load('./Modelos/ESCENARIOS/ESC1/ESC1.fbx', function (object) {
    if (object instanceof THREE.Object3D) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = texturaESC1;
            }
        });
        object.position.set(60, -35, -50);
        object.scale.set(1, 1, 1);
        scene.add(object);
    } else {
        console.error('Error: El objeto cargado no es válido para agregar a la escena.');
    }
}, undefined, function (error) {
    console.error('Error al cargar el escenario:', error);
});

// Cargar Skybox 
const Skybox = new FBXLoader();
Skybox.load('./Modelos/ESCENARIOS/SKYBOX/GALAXY_2.fbx', function (object) {
    if (object instanceof THREE.Object3D) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = texturaGALAXY;
            }
        });
        object.position.set(0, 0, 0);
        object.scale.set(7, 7, 7);
        scene.add(object);
    } else {
        console.error('Error: El objeto cargado no es válido para agregar a la escena.');
    }
}, undefined, function (error) {
    console.error('Error al cargar el escenario:', error);
});

//Cargar enemigos
const Enemy1 = new FBXLoader();
Enemy1.load('./Modelos/ENEMIGOS/ENEMY_1/ENEMY1.fbx', function (object) {
    if (object instanceof THREE.Object3D) {
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = texturaEnemy1;
            }
        });
        object.position.set(120, -35, -50);
        object.scale.set(0.2, 0.2, 0.2);
        scene.add(object);
        const mixer = new THREE.AnimationMixer(object);
        if (object.animations && object.animations.length) {
            const clips = object.animations;
            function update() {
                const delta = clockEN1.getDelta();
                mixer.update(delta);
            }
            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
                update();
            }
            animate();
            const clip = THREE.AnimationClip.findByName(clips, 'Flying');
            if (clip) {
                const action = mixer.clipAction(clip);
                action.play();
            }
            clips.forEach(function (clip) {
                mixer.clipAction(clip).play();
            });

        } else {
            console.error('El modelo no tiene animaciones.');
        }
    } else {
        console.error('Error: El objeto cargado no es válido para agregar a la escena.');
    }
}, undefined, function (error) {
    console.error('Error al cargar el modelo FBX:', error);
});

// Cargar otro modelo FBX para el segundo personaje
const Enemy2 = new FBXLoader();
Enemy2.load('./Modelos/ENEMIGOS/ENEMY_2/BUG.fbx', function (object) {
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material = texturaENEM2;
        }
    });

    object.position.set(-80, -35, -50);
    object.scale.set(0.3, 0.3, 0.3);
    scene.add(object);

    const mixer = new THREE.AnimationMixer(object);

    // 🔹 Ahora cargamos las animaciones desde otro archivo
    Enemy2.load('./Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', function (anim) {
        if (anim.animations.length > 0) {
            const clip = anim.animations[0]; // Toma la primera animación
            const action = mixer.clipAction(clip);
            action.play();
        } else {
            console.error("No se encontraron animaciones en el archivo.");
        }
    });

    // 🔹 Actualizar la animación en el loop de renderizado
    function update() {
        const delta = clockEN2.getDelta();
        mixer.update(delta);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        update();
    }
    animate();

}, undefined, function (error) {
    console.error('Error al cargar el modelo FBX:', error);
});

const clockPP = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clockPP.getDelta();

    actualizarPersonaje(delta);
    actualizarCamara();

    renderer.render(scene, camera);
}

animate(); // Iniciar animación

