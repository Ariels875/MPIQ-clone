import Phaser from 'phaser';
import MPIQScene from './scenes/MPIQScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  scene: MPIQScene
};

const game = new Phaser.Game(config);