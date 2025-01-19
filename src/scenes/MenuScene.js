import Phaser from 'phaser'
import AudioManager from './AudioManager'

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super('MenuScene')
    this.selectedLevel = 1
    this.dialogState = {
      isActive: false,
      text: null,
      currentPart: 0,
      dialogParts: []
    }
    this.menuElements = []
    this.dialogElements = []
  }

  cleanup () {
    // Limpiar elementos del menú
    this.menuElements.forEach(element => {
      if (element) element.destroy()
    })
    this.menuElements = []

    // Limpiar elementos del diálogo
    this.dialogElements.forEach(element => {
      if (element) element.destroy()
    })
    this.dialogElements = []

    // Resetear estado del diálogo
    this.dialogState = {
      isActive: false,
      text: null,
      currentPart: 0,
      dialogParts: []
    }
  }

  preload () {
    this.load.image('background', 'assets/images/background.png')
    this.load.image('startButton', 'assets/images/startbtn.png')
    this.load.json('questions', 'assets/data/questions.json')
    this.audioManager = new AudioManager(this)
    this.audioManager.preload()
  }

  createInitialMenu () {
    this.cleanup()

    // Título
    const title = this.add.text(390, 50, 'Métodos Anticonceptivos', {
      fontSize: '64px',
      fill: '#fff'
    }).setOrigin(0.5)

    // Selector de nivel
    const levelLabel = this.add.text(390, 150, 'Nivel: ', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5)

    const levelText = this.add.text(450, 150, this.selectedLevel, {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5)

    // Botones de nivel
    const prevButton = this.add.text(340, 175, '<-', {
      fontSize: '32px',
      fill: '#fe0404'
    })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.selectedLevel > 1) {
          this.selectedLevel--
          this.audioManager.playSound('menuSelect')
          levelText.setText(this.selectedLevel)
        }
      })

    const nextButton = this.add.text(400, 175, '->', {
      fontSize: '32px',
      fill: '#fe0404'
    })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.selectedLevel < 4) {
          this.selectedLevel++
          this.audioManager.playSound('menuSelect')
          levelText.setText(this.selectedLevel)
        }
      })

    // Botón de inicio
    const startButton = this.add.image(392, 425, 'startButton')
      .setScale(0.75)
      .setInteractive()
      .on('pointerdown', () => {
        this.audioManager.playSound('menuSelect')
        this.startDialog()
      })

    // Store all elements in menuElements array for cleanup
    this.menuElements.push(
      title,
      levelLabel,
      levelText,
      prevButton,
      nextButton,
      startButton
    )
  }

  create () {
    // Background
    this.background = this.add.image(0, 0, 'background')
      .setOrigin(0)
      .setScale(1.05)

    this.audioManager.create()
    this.createInitialMenu()
  }

  clearInitialMenu () {
    // Limpiar todos los elementos del menú inicial
    this.title.destroy()
    this.levelLabel.destroy()
    this.levelText.destroy()
    this.prevButton.destroy()
    this.nextButton.destroy()
    this.startButton.destroy()
  }

  startDialog () {
    this.cleanup()

    // Crear fondo semitransparente para el diálogo
    const dialogBg = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000, 0.7)
      .setOrigin(0)
    this.dialogElements.push(dialogBg)

    // Preparar el texto del diálogo desde questions.json
    const questions = this.cache.json.get('questions')
    if (!questions || !questions.dialogs) {
      console.error('Error: No se encontraron los diálogos en questions.json')
      return this.scene.start('MenuScene') // Volver al menú si hay error
    }

    const story = this.prepareStoryText(questions)
    if (!story) {
      console.error('Error: No se pudo preparar el texto de la historia')
      return this.scene.start('MenuScene')
    }

    this.dialogState.dialogParts = this.splitTextIntoParts(story, 350)

    // Crear el texto del diálogo
    const dialogText = this.add.text(50, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      wordWrap: { width: 700 },
      lineSpacing: 10
    })
    this.dialogState.text = dialogText
    this.dialogElements.push(dialogText)

    // Mostrar la primera parte del diálogo
    this.showNextDialogPart()

    // Crear botón de avanzar
    this.createAdvanceButton()
  }

  prepareStoryText (questions) {
    try {
      const levelKey = `level${this.selectedLevel}`
      if (!questions.dialogs || !questions.dialogs[levelKey]) {
        console.error(`No se encontraron diálogos para el nivel ${this.selectedLevel}`)
        return null
      }
      return questions.dialogs[levelKey].join('\n\n')
    } catch (error) {
      console.error('Error al preparar el texto de la historia:', error)
      return null
    }
  }

  splitTextIntoParts (text, maxLength) {
    if (!text) return []
    const words = text.split(' ')
    const parts = []
    let currentPart = ''

    for (const word of words) {
      if ((currentPart + word).length > maxLength) {
        parts.push(currentPart.trim())
        currentPart = ''
      }
      currentPart += word + ' '
    }
    if (currentPart) {
      parts.push(currentPart.trim())
    }
    return parts
  }

  showNextDialogPart () {
    if (this.dialogState.currentPart < this.dialogState.dialogParts.length) {
      this.dialogState.text.setText(this.dialogState.dialogParts[this.dialogState.currentPart])
      this.dialogState.currentPart++
    } else {
      // Si no hay más texto, mostrar el botón para ir a GameScene
      if (this.advanceButton) {
        this.advanceButton.destroy()
      }
      this.createStartGameButton()
    }
  }

  createAdvanceButton () {
    if (this.startGameButton) this.startGameButton.destroy()
    if (this.advanceButton) this.advanceButton.destroy()
    this.advanceButton = this.add.text(400, 500, 'Avanzar', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#fe0404',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => this.advanceButton.setStyle({ fill: '#fe0404', backgroundColor: '#ffffff' }))
      .on('pointerout', () => this.advanceButton.setStyle({ fill: '#ffffff', backgroundColor: '#fe0404' }))
      .on('pointerdown', () => {
        this.audioManager.playSound('menuSelect')
        this.showNextDialogPart()
      })
    this.dialogElements.push(this.advanceButton)
  }

  createStartGameButton () {
    const startGameButton = this.add.text(400, 500, 'Comenzar Juego', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#fe0404',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => startGameButton.setStyle({ fill: '#fe0404', backgroundColor: '#ffffff' }))
      .on('pointerout', () => startGameButton.setStyle({ fill: '#ffffff', backgroundColor: '#fe0404' }))
      .on('pointerdown', () => {
        this.audioManager.playSound('gameStart')
        this.scene.start('GameScene', { level: this.selectedLevel })
      })
  }
}
