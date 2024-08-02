import Phaser from 'phaser';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export default class MPIQScene extends Phaser.Scene {
  constructor() {
    super('MPIQScene');
  }

  preload() {
    this.load.image('mpiq', 'assets/images/mpiq-background.png'
    );
    this.load.image('pipe', 'assets/images/pipe.png');

    this.load.text('marioObj', 'assets/models/mario.obj');
    this.load.text('luigiObj', 'assets/models/luigi.obj');
    this.load.text('daisyObj', 'assets/models/daisy.obj');
    this.load.text('dkObj', 'assets/models/dk.obj');
  }

  create() {
    this.add.image(164, 96, 'mpiq', null).setCrop(0, 0, 328, 192);
    this.add.image(35, 400, 'pipe').setOrigin(0).setScale(0.5);
    this.add.image(185, 400, 'pipe').setOrigin(0).setScale(0.5);
    this.add.image(335, 400, 'pipe').setOrigin(0).setScale(0.5);
    this.add.image(485, 400, 'pipe').setOrigin(0).setScale(0.5);

    this.loadCharacterModels();
  }

  loadCharacterModels() {
    const loader = new THREE.OBJLoader();
  
    const characters = ['mario', 'luigi', 'peach', 'yoshi'];
    this.characterModels = {};
  
    characters.forEach(character => {
      const objData = this.cache.text.get(`${character}Obj`);
      const object = loader.parse(objData);
      
      // Ajustar la escala y posición del modelo si es necesario
      object.scale.set(0.1, 0.1, 0.1);
      object.position.set(0, 0, 0);
  
      this.characterModels[character] = object;
    });
  }

  update() {
    // Implementar la lógica de actualización aquí
  }
}