import { AnimationMixer } from 'three'

export default class Characters {
  constructor (scene) {
    this.scene = scene
    this.characters = ['mario', 'luigi', 'dk', 'daisy']
    this.models = {}
    this.mixers = {}
    this.animations = {}
  }

  async loadCharacters () {
    const promises = this.characters.map((char, index) =>
      this.loadCharacter(char, index * 200, 0, 0)
    )
    await Promise.all(promises)
  }

  async loadCharacter (name, x, y, z) {
    const gltf = await this.scene.third.load.gltf(`assets/images/${name}.glb`)
    const model = gltf.scene
    model.scale.set(1, 1, 1)
    model.position.set(x, y, z)
    this.scene.third.add.existing(model)

    this.models[name] = model
    this.mixers[name] = new AnimationMixer(model)

    this.animations[name] = {
      idle: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'idle')),
      answer: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'answer')),
      stunned: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'stunned')),
      recover: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'recover')),
      winner: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'winner')),
      jump: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'jump'))
    }

    this.playAnimation(name, 'idle')
  }

  playAnimation (character, animationName) {
    Object.values(this.animations[character]).forEach(action => action.stop())
    this.animations[character][animationName].play()
  }

  update (delta) {
    Object.values(this.mixers).forEach(mixer => mixer.update(delta * 0.001))
  }
}

/*
this.characters = new Characters(this)
await this.characters.loadCharacters()

this.third.load.gltf('assets/images/Mario/mario.glb').then(gltf => {
  const mario = gltf.scene
  mario.scale.set(1, 1, 1)
  mario.position.set(0, 0, 0)
  this.third.add.existing(mario)

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

  playAnimation (name) {
    // Detener todas las animaciones actuales
    Object.values(this.animations).forEach(action => action.stop())

    // Reproducir la animación solicitada
    this.animations[name].play()
  }
  */
