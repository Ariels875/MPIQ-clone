import Phaser from 'phaser'
import { enable3d, Canvas } from '@enable3d/phaser-extension'
import MenuScene from './scenes/MenuScene'
import Characters from './scenes/Characters'
import GameScene from './scenes/GameScene'

const config = {
  type: Phaser.WEBGL,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  scene: [MenuScene, GameScene, Characters],
  ...Canvas()
}

window.addEventListener('load', () => {
  enable3d(() => new Phaser.Game(config)).withPhysics('/assets/ammo')
})
