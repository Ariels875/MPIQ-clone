import Phaser from 'phaser';

export default class CharacterAnimations {
    constructor(scene) {
        this.scene = scene;
    }

    preload() {
        // Cargar spritesheet para los personajes
        this.scene.load.spritesheet('characters', 'assets/images/characters.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        // Crear animaciones para los personajes
        this.scene.anims.create({
            key: 'characterA',
            frames: this.scene.anims.generateFrameNumbers('characters', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'characterB',
            frames: this.scene.anims.generateFrameNumbers('characters', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'characterZ',
            frames: this.scene.anims.generateFrameNumbers('characters', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        // Crear sprites para los personajes
        this.characterA = this.scene.add.sprite(100, 500, 'characters').setScale(2);
        this.characterB = this.scene.add.sprite(400, 500, 'characters').setScale(2);
        this.characterZ = this.scene.add.sprite(700, 500, 'characters').setScale(2);
    }

    playAnimation(character) {
        switch(character) {
            case 'A':
                this.characterA.play('characterA');
                break;
            case 'B':
                this.characterB.play('characterB');
                break;
            case 'Z':
                this.characterZ.play('characterZ');
                break;
        }

        // Detener la animación después de 1 segundo
        this.scene.time.delayedCall(1000, () => {
            this.characterA.stop();
            this.characterB.stop();
            this.characterZ.stop();
        });
    }
}