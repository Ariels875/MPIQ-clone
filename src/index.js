import Phaser from 'phaser';
import MPIQScene from './scenes/MPIQScene';

const config = {
  type: Phaser.AUTO,
  width: 642,
  height: 482,
  backgroundColor: '#87ceeb',
  scene: MPIQScene
};

const game = new Phaser.Game(config);