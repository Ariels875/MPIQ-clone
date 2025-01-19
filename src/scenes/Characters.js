import { AnimationMixer } from 'three'

export default class Characters {
  constructor (scene) {
    this.scene = scene
    this.characters = ['mario', 'luigi', 'dk', 'daisy']
    this.models = {}
    this.mixers = {}
    this.animations = {}
    this.scales = {
      mario: 0.2,
      luigi: 0.24,
      dk: 0.24,
      daisy: 0.23
    }
    this.isLoaded = false
    this.loader = null
  }

  reset () {
    // Limpiar todas las referencias y estado
    this.cleanup()
    this.models = {}
    this.mixers = {}
    this.animations = {}
    this.isLoaded = false
  }

  ensureVisibility () {
    Object.values(this.models).forEach(model => {
      if (model) {
        model.visible = true
        // Asegurar que todos los child meshes también sean visibles
        model.traverse(child => {
          if (child.isMesh) {
            child.visible = true
          }
        })
      }
    })
  }

  setCharacterScale (character, scale) {
    if (Object.prototype.hasOwnProperty.call(this.scales, character)) {
      this.scales[character] = scale
      if (this.models[character]) {
        this.models[character].scale.set(scale, scale, scale)
      }
    } else {
      console.warn(`Character ${character} not found`)
    }
  }

  async loadCharacters () {
    if (this.isLoaded) {
      this.ensureVisibility()
      return
    }

    this.reset()
    const positions = [
      { x: -4.75, y: 1, z: 0 },
      { x: -1.5, y: 1, z: 0 },
      { x: 1.75, y: 0.9, z: 0 },
      { x: 5, y: 1, z: 0 }
    ]

    try {
      const promises = this.characters.map((char, index) =>
        this.loadCharacter(char, positions[index].x, positions[index].y, positions[index].z)
      )

      await Promise.all(promises)
      this.isLoaded = true
    } catch (error) {
      console.error('Failed to load all characters:', error)
      this.isLoaded = false
      throw error // Asegurarse de que isLoaded sea false si hay un error
      // Opcional: reintentar la carga o manejar el error de otra manera
    }
  }

  async loadCharacter (name, x, y, z) {
    try {
      // Verificar que this.scene.third está disponible
      if (!this.scene || !this.scene.third) {
        throw new Error(`Three.js not initialized when loading ${name}`)
      }

      // Intentar cargar el modelo
      const modelPath = `assets/images/${name}.glb`

      // Ensure the path is properly formatted
      const formattedPath = modelPath.replace(/\\/g, '/')

      // Add cache busting to prevent stale cache issues
      const cacheBuster = `?t=${Date.now()}`

      // Load the model with cache busting
      const gltf = await this.scene.third.load.gltf(formattedPath + cacheBuster)

      if (!gltf || !gltf.scene) {
        throw new Error(`Failed to load model for ${name}`)
      }
      const model = gltf.scene
      model.traverse(child => {
        child.visible = true
        if (child.isMesh) {
          child.frustumCulled = false // Esto evita que Three.js oculte el modelo si está fuera de la vista
        }
      })
      model.scale.set(this.scales[name], this.scales[name], this.scales[name])
      model.position.set(x, y, z)
      model.rotation.y = Math.PI
      model.visible = true

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
    } catch (error) {
      console.error(`Error loading character ${name}:`, error)
      throw error
    }
  }

  playAnimation (character, animationName) {
    if (this.animations[character] && this.animations[character][animationName]) {
      Object.values(this.animations[character]).forEach(action => action.stop())
      this.animations[character][animationName].play()
    }
  }

  update (delta) {
    Object.values(this.mixers).forEach(mixer => mixer.update(delta * 0.001))
  }

  cleanup () {
    // Detener todas las animaciones
    Object.values(this.animations).forEach(characterAnimations => {
      Object.values(characterAnimations).forEach(action => {
        if (action && action.stop) {
          action.stop()
        }
      })
    })

    // Limpiar mixers
    Object.values(this.mixers).forEach(mixer => {
      mixer.stopAllAction()
      mixer.uncacheRoot(mixer.getRoot())
    })

    // Eliminar modelos de la escena y limpiar recursos
    Object.values(this.models).forEach(model => {
      if (model) {
        if (this.scene && this.scene.third && this.scene.third.scene) {
          this.scene.third.scene.remove(model)
        }

        // Limpiar recursos de manera más exhaustiva
        model.traverse(child => {
          if (child.geometry) {
            child.geometry.dispose()
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                if (material.map) material.map.dispose()
                material.dispose()
              })
            } else {
              if (child.material.map) child.material.map.dispose()
              child.material.dispose()
            }
          }
        })
      }
    })

    // Limpiar referencias
    this.models = {}
    this.mixers = {}
    this.animations = {}
    this.isLoaded = false

    // Asegurarse de que el loader también se reinicie
    this.loader = null
  }
}
