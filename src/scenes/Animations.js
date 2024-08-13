import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

export class Animations {
  constructor (scene) {
    this.scene = scene
    this.character = null
    this.mixer = null
    this.dizzyAnimation = null
    this.clock = new THREE.Clock()

    this.loadCharacter()
  }

  loadCharacter () {
    const loader = new OBJLoader()
    loader.load(
      'assets/images/Mario/mario.obj',
      (object) => {
        this.character = object
        this.scene.add(this.character)
        this.setupAnimation()
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.error('An error happened', error)
      }
    )
  }

  setupAnimation () {
    this.mixer = new THREE.AnimationMixer(this.character)

    // Create a simple head-bobbing animation
    const headBone = this.character.getObjectByName('Head') // Adjust this to match your model's bone structure
    if (headBone) {
      const rotationKF = new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 0.5, 1],
        [0, 0, 0, 1, 0.1, 0, 0, 1, 0, 0, 0, 1]
      )

      this.dizzyAnimation = new THREE.AnimationClip('dizzy', 1, [rotationKF])
    }
  }

  startDizzyAnimation () {
    if (this.mixer && this.dizzyAnimation) {
      const action = this.mixer.clipAction(this.dizzyAnimation)
      action.setLoop(THREE.LoopRepeat)
      action.play()
    }
  }

  stopDizzyAnimation () {
    if (this.mixer) {
      this.mixer.stopAllAction()
    }
  }

  update () {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta())
    }
  }
}
