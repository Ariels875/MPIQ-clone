import { Scene3D } from '@enable3d/phaser-extension'
import { AnimationMixer } from 'three'

export default class Animations extends Scene3D {
  constructor () {
    super('Animations')
  }

  init (data) {
    this.level = data.level
    this.accessThirdDimension()
  }

  preload () {}

  create () {
    // Crear la escena 3D básica
    this.third.warpSpeed()

    // Cargar y añadir el modelo de Mario a la escena usando third.load.gltf
    this.third.load.gltf('assets/images/mario/mario.glb').then(gltf => {
      const mario = gltf.scene
      mario.scale.set(1, 1, 1) // Escalar el modelo si es necesario
      mario.position.set(0, 0, 0) // Posicionar el modelo en la escena
      this.third.add.existing(mario) // Añadir el modelo a la escena

      // Configurar el AnimationMixer para Mario
      this.mixer = new AnimationMixer(mario)

      // Acceder a las animaciones
      this.animations = {
        idle: this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'idle')),
        idlee: this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'idlee')),
        jump: this.mixer.clipAction(gltf.animations.find(clip => clip.name === 'jump'))
      }

      // Iniciar la animación 'idle' por defecto
      this.playAnimation('idle')
    })
  }

  playAnimation (name) {
    // Detener todas las animaciones actuales
    Object.values(this.animations).forEach(action => action.stop())

    // Reproducir la animación solicitada
    this.animations[name].play()
  }

  update (time, delta) {
    // Actualizar el AnimationMixer en cada frame
    if (this.mixer) {
      this.mixer.update(delta * 0.001) // delta en segundos
    }

    // Lógica adicional para cambiar animaciones según el estado del juego
    // Por ejemplo, para cambiar a la animación de salto:
    // if (conditionToJump) {
    //   this.playAnimation('jump')
    // }
  }
}
