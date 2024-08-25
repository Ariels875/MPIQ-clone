import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super('MenuScene')
    this.selectedLevel = 1
  }

  preload () {
    // Cargar recursos necesarios para el menú
    this.load.image('background', 'assets/images/background.png')
    this.load.image('startButton', 'assets/images/startbtn.png')
  }

  create () {
    // Agregar fondo
    this.add.image(0, 0, 'background').setOrigin(0).setScale(1.05)

    // Agregar título
    this.add.text(390, 50, 'MPIQ', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5)

    // Agregar selector de nivel
    this.add.text(390, 150, 'Nivel: ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5)
    const levelText = this.add.text(450, 150, this.selectedLevel, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5)

    // Botones para cambiar el nivel
    this.add.text(340, 175, '<-', { fontSize: '32px', fill: '#fff' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.selectedLevel > 1) {
          this.selectedLevel--
          levelText.setText(this.selectedLevel)
        }
      })

    this.add.text(400, 175, '->', { fontSize: '32px', fill: '#fff' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.selectedLevel < 4) { // cantidad de niveles
          this.selectedLevel++
          levelText.setText(this.selectedLevel)
        }
      })

    // Botón de inicio
    this.add.image(392, 425, 'startButton')
      .setScale(0.75)
      .setInteractive()
      .on('pointerdown', () => this.startGame())
  }

  startGame () {
    // Iniciar el juego con el nivel seleccionado
    this.scene.start('GameScene', { level: this.selectedLevel })
  }
}
