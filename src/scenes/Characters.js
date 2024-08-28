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
    const positions = [
      { x: -8, y: 3, z: 0 }, // Posición para Mario
      { x: -3, y: 3, z: 0 }, // Posición para Luigi
      { x: 2, y: 3, z: 0 }, // Posición para DK
      { x: 7, y: 3, z: 0 } // Posición para Daisy
    ]
    const promises = this.characters.map((char, index) =>
      this.loadCharacter(char, positions[index].x, positions[index].y, positions[index].z)
    )
    await Promise.all(promises)
  }

  async loadCharacter (name, x, y, z) {
    const gltf = await this.scene.third.load.gltf(`assets/images/${name}.glb`)
    const model = gltf.scene
    model.scale.set(0.5, 0.5, 0.5)
    model.position.set(x, y, z)
    this.scene.third.add.existing(model)

    this.models[name] = model
    this.mixers[name] = new AnimationMixer(model)

    this.animations[name] = {
      idle: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'idle')),
      Answer: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'Answer')),
      jump: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'jump')),
      stunned: this.mixers[name].clipAction(gltf.animations.find(clip => clip.name === 'stunned'))
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
