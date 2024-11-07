import { Scene3D, THREE } from '@enable3d/phaser-extension'
import Characters from './Characters'
import AudioManager from './AudioManager'

export default class GameScene extends Scene3D {
  constructor () {
    super('GameScene')
    this.audioManager = null
    this.questions = []
    this.currentQuestionIndex = 0
    this.score = 0
    this.canAnswer = false
    this.buttonImages = []
    this.mushroomImage = null
    this.commentImage = null
    this.hasJumpedAnimation = false
    this.questionTimer = null
    this.answerTimer = null
    this.penaltyActive = false
    this.characters = null
    this.cameraTarget = new THREE.Vector3(0, 5, 0)
    this.resizeHandler = this.handleResize.bind(this)
  }

  init (data) {
    this.currentQuestionIndex = 0
    this.score = 0
    this.canAnswer = false
    this.buttonImages = []
    this.hasJumpedAnimation = false
    this.penaltyActive = false
    this.questions = []
    if (this.characters) {
      this.characters.cleanup()
      this.characters = null
    }
    if (this.third) {
      while (this.third.scene && this.third.scene.children.length > 0) {
        const object = this.third.scene.children[0]
        this.third.scene.remove(object)
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      }
    }
    this.accessThirdDimension({
      enableXR: false,
      ground: { createFloor: false },
      width: 800,
      height: 600
    })
    this.characters = new Characters(this)
    this.level = data.level
    window.addEventListener('resize', this.resizeHandler)
  }

  handleResize () {
    if (!this.third || !this.third.renderer) return

    // Get the game canvas
    const gameCanvas = this.game.canvas
    const width = gameCanvas.clientWidth
    const height = gameCanvas.clientHeight

    // Update Phaser's internal size
    this.scale.resize(width, height)

    // Update Three.js canvas size to match Phaser's canvas
    this.third.renderer.setSize(width, height)
    this.third.renderer.domElement.style.width = `${width}px`
    this.third.renderer.domElement.style.height = `${height}px`

    // Update camera aspect ratio
    if (this.third.camera) {
      this.third.camera.aspect = width / height
      this.third.camera.updateProjectionMatrix()
    }

    // Force a single render to update the view
    if (this.third.scene) {
      this.third.renderer.render(this.third.scene, this.third.camera)
    }
  }

  preload () {
    this.load.image('abutton', 'assets/images/abutton.png')
    this.load.image('acomment', 'assets/images/acomment.png')
    this.load.image('bbutton', 'assets/images/bbutton.png')
    this.load.image('bcomment', 'assets/images/bcomment.png')
    this.load.image('board', 'assets/images/board.png')
    this.load.image('correctsign', 'assets/images/correctsign.png')
    this.load.image('wrongsign', 'assets/images/wrongsign.png')
    this.load.image('mushroom', 'assets/images/mushroom.png')
    this.load.image('pipe', 'assets/images/pipe.png')
    this.load.image('question-box', 'assets/images/question-box.png')
    this.load.image('square-cloud', 'assets/images/square-cloud.png')
    this.load.image('star', 'assets/images/star.png')
    this.load.image('startbtn', 'assets/images/startbtn.png')
    this.load.image('zbutton', 'assets/images/zbutton.png')
    this.load.image('zcomment', 'assets/images/zcomment.png')
    this.load.json('questions', 'assets/data/questions.json')

    this.audioManager = new AudioManager(this)
    this.audioManager.preload()
  }

  async create () {
    const allQuestions = this.cache.json.get('questions')
    if (!allQuestions || !allQuestions[`level${this.level}`]) {
      console.error('No se pudieron cargar las preguntas para el nivel:', this.level)
      return this.scene.start('MenuScene') // Volver al menú si hay error
    }
    this.questions = allQuestions[`level${this.level}`]
    this.audioManager.create()

    if (!this.third.camera) {
      console.error('Camera not initialized')
      return
    }

    // Configurar la cámara
    this.third.camera.position.set(0, 8, 20)
    this.updateCameraRotation()

    this.updateCameraPosition(0, 5, 10)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
    this.third.scene.add(ambientLight)

    this.characters = new Characters(this)
    await this.characters.loadCharacters()

    this.addBackground()

    this.add.image(35, 555, 'pipe').setOrigin(0).setScale(0.5)
    this.add.image(240, 555, 'pipe').setOrigin(0).setScale(0.5)
    this.add.image(450, 555, 'pipe').setOrigin(0).setScale(0.5)
    this.add.image(650, 555, 'pipe').setOrigin(0).setScale(0.5)

    this.marioComment = [
      this.add.image(120, 460, 'acomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(120, 460, 'bcomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(120, 460, 'zcomment').setOrigin(0).setScale(0.5).setVisible(false)
    ]

    this.luigiComment = [
      this.add.image(315, 460, 'acomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(315, 460, 'bcomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(315, 460, 'zcomment').setOrigin(0).setScale(0.5).setVisible(false)
    ]

    this.dkComment = [
      this.add.image(525, 460, 'acomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(525, 460, 'bcomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(525, 460, 'zcomment').setOrigin(0).setScale(0.5).setVisible(false)
    ]

    this.daisyComment = [
      this.add.image(715, 460, 'acomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(715, 460, 'bcomment').setOrigin(0).setScale(0.5).setVisible(false),
      this.add.image(715, 460, 'zcomment').setOrigin(0).setScale(0.5).setVisible(false)
    ]

    const boardHeight = this.textures.get('board').getSourceImage().height
    const squareCloudHeight = this.textures
      .get('square-cloud')
      .getSourceImage().height

    const board = this.add
      .image(115, -boardHeight * 1.25, 'board')
      .setOrigin(0)
      .setScale(1.1)
      .setAlpha(0.9)
    const squareCloud = this.add
      .image(35, -squareCloudHeight, 'square-cloud')
      .setOrigin(0)
      .setScale(1.1)

    this.questionBoxes = [
      this.add.image(60, 330, 'question-box').setOrigin(0).setScale(0.32),
      this.add.image(265, 330, 'question-box').setOrigin(0).setScale(0.32),
      this.add.image(475, 330, 'question-box').setOrigin(0).setScale(0.32),
      this.add.image(680, 330, 'question-box').setOrigin(0).setScale(0.32)
    ]

    this.mushroomImage = this.add.image(70, 295, 'mushroom').setOrigin(0).setScale(0.2).setVisible(false)
    this.add.image(275, 295, 'mushroom').setOrigin(0).setScale(0.2).setVisible(false)
    this.add.image(485, 295, 'mushroom').setOrigin(0).setScale(0.2).setVisible(false)
    this.add.image(690, 295, 'mushroom').setOrigin(0).setScale(0.2).setVisible(false)

    this.audioManager.playSound('fallingCloud')
    this.tweens.add({
      targets: board,
      y: 65,
      ease: 'Bounce.easeOut',
      duration: 2000,
      delay: 500
    })
    this.tweens.add({
      targets: squareCloud,
      y: 0,
      ease: 'Bounce.easeOut',
      duration: 2000,
      delay: 500,
      onComplete: () => {
        this.startNextQuestion()
        this.audioManager.playMusic('gameMusic')
      }
    })

    // Crear botones táctiles solo si es un dispositivo móvil/tablet
    if (!this.sys.game.device.os.desktop) {
      this.createTouchButtons()
    }

    this.input.keyboard.on('keydown-A', () => this.handleAnswer(0))
    this.input.keyboard.on('keydown-B', () => this.handleAnswer(1))
    this.input.keyboard.on('keydown-Z', () => this.handleAnswer(2))

    // Texto para la pregunta y respuestas
    this.questionText = this.add
      .text(400, 150, '', {
        fontSize: '24px',
        fill: '#fff',
        align: 'center',
        wordWrap: { width: 450 }
      })
      .setOrigin(0.5)
    this.answerTexts = [
      this.add.text(230, 100, '', { fontSize: '24px', fill: '#fff' }),
      this.add.text(230, 130, '', { fontSize: '24px', fill: '#fff' }),
      this.add.text(230, 160, '', { fontSize: '24px', fill: '#fff' })
    ]
    this.penaltyText = this.add
      .text(400, 200, '', {
        fontSize: '20px',
        fill: '#ff0000',
        align: 'center'
      })
      .setOrigin(0.5)
    this.showQuestion()
  }

  createTouchButtons () {
    const buttonScale = 1.1
    const buttonY = this.scale.height - 550 // Posición Y para todos los botones

    // Crear botón A
    const aButton = this.add.image(100, buttonY, 'abutton')
      .setScale(buttonScale)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100)
      .setAlpha(0.8)

    // Crear botón B
    const bButton = this.add.image(this.scale.width / 2, buttonY, 'bbutton')
      .setScale(buttonScale)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100)
      .setAlpha(0.8)

    // Crear botón Z
    const zButton = this.add.image(this.scale.width - 100, buttonY, 'zbutton')
      .setScale(buttonScale)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(100)
      .setAlpha(0.8)

    // Agregar eventos táctiles
    aButton.on('pointerdown', () => {
      aButton.setAlpha(1)
      this.handleAnswer(0)
    })
    aButton.on('pointerup', () => aButton.setAlpha(0.8))
    aButton.on('pointerout', () => aButton.setAlpha(0.8))

    bButton.on('pointerdown', () => {
      bButton.setAlpha(1)
      this.handleAnswer(1)
    })
    bButton.on('pointerup', () => bButton.setAlpha(0.8))
    bButton.on('pointerout', () => bButton.setAlpha(0.8))

    zButton.on('pointerdown', () => {
      zButton.setAlpha(1)
      this.handleAnswer(2)
    })
    zButton.on('pointerup', () => zButton.setAlpha(0.8))
    zButton.on('pointerout', () => zButton.setAlpha(0.8))

    // Guardar referencia a los botones para poder destruirlos más tarde si es necesario
    this.touchButtons = { aButton, bButton, zButton }
  }

  clearTouchButtons () {
    if (this.touchButtons) {
      Object.values(this.touchButtons).forEach(button => button.destroy())
      this.touchButtons = null
    }
  }

  startNextQuestion () {
    this.clearTimers()
    this.clearAnswers()
    this.mushroomImage.setVisible(false)

    if (this.currentQuestionIndex < this.questions.length) {
      this.showQuestion()
      this.questionTimer = this.time.delayedCall(8000, () => {
        this.showAnswers()
      })
    } else {
      this.endGame()
    }
  }

  showQuestion () {
    if (!this.questions || !this.questions[this.currentQuestionIndex]) {
      console.error('No hay pregunta disponible en el índice:', this.currentQuestionIndex)
      return this.endGame() // Terminar el juego si no hay preguntas disponibles
    }

    const question = this.questions[this.currentQuestionIndex]
    this.questionText.setText(question.question)
    this.canAnswer = false
  }

  updateCameraRotation () {
    if (this.third && this.third.camera) {
      const camera = this.third.camera
      const direction = new THREE.Vector3()
      direction.subVectors(this.cameraTarget, camera.position).normalize()

      // Calcular la rotación en el eje vertical (y)
      camera.rotation.y = Math.atan2(-direction.x, -direction.z)

      // Calcular la rotación en el eje horizontal (x)
      const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z)
      camera.rotation.x = Math.atan2(direction.y, distance)
    } else {
      console.warn('Camera or third is not initialized')
    }
  }

  updateCameraPosition (x, y, z) {
    if (this.third && this.third.camera) {
      this.third.camera.position.set(x, y, z)
      this.updateCameraRotation()
    } else {
      console.warn('Camera or third is not initialized')
    }
  }

  addBackground () {
    const loader = new THREE.TextureLoader()
    const texture = loader.load('assets/images/background.png')

    // Create a custom shader material
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D map;
      uniform vec3 lightColor;
      uniform vec3 lightPosition;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vec4 texColor = texture2D(map, vUv);
        vec3 lightDir = normalize(lightPosition - vNormal);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 diffuse = diff * lightColor;
        gl_FragColor = vec4(texColor.rgb * (diffuse + 0.5), texColor.a);
      }
    `

    const customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        lightColor: { value: new THREE.Color(0xffffff) },
        lightPosition: { value: new THREE.Vector3(5, 5, 5) }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide
    })

    const geometry = new THREE.PlaneGeometry(40, 30)
    const plane = new THREE.Mesh(geometry, customMaterial)

    plane.position.set(0, 5, -22)
    this.third.scene.add(plane)

    // Add a point light specifically for the background
    const backgroundLight = new THREE.PointLight(0xffffff, 1, 100)
    backgroundLight.position.set(5, 5, 5)
    this.third.scene.add(backgroundLight)
  }

  showAnswers () {
    this.clearTimers()
    this.questionText.setText('')

    const question = this.questions[this.currentQuestionIndex]
    const buttons = ['abutton', 'bbutton', 'zbutton']

    question.answers.forEach((answer, index) => {
      const buttonImage = this.add
        .image(
          this.answerTexts[index].x - 30,
          this.answerTexts[index].y + 10,
          buttons[index]
        )
        .setOrigin(0.5)
        .setScale(0.5)
      this.buttonImages.push(buttonImage)
      this.answerTexts[index].setText(answer)
    })

    this.canAnswer = true
    this.answerTimer = this.time.delayedCall(5000, () => {
      this.handleNoAnswer()
    })
  }

  handleAnswer (index) {
    if (this.canAnswer) {
      this.canAnswer = false
      this.clearTimers()
      const question = this.questions[this.currentQuestionIndex]

      if (!this.hasJumpedAnimation) {
        this.characters.playAnimation('mario', 'jump')
        this.hasJumpedAnimation = true

        this.time.delayedCall(1000, () => {
          this.hasJumpedAnimation = false
          this.characters.animations.mario.jump.stop()
          this.mushroomImage.setVisible(true)
          this.audioManager.playSound('hitboxSong')
          this.tweens.add({
            targets: this.mushroomImage,
            alpha: 1,
            duration: 500,
            ease: 'Linear'
          })
        })

        this.time.delayedCall(1500, () => {
          this.characters.playAnimation('mario', 'Answer')
          if (index >= 0 && index < this.marioComment.length) {
            this.marioComment[index].setVisible(true)
          }
        })

        this.time.delayedCall(2700, () => {
          this.characters.animations.mario.Answer.stop()
          this.characters.playAnimation('mario', 'idle')
        })
      }

      this.time.delayedCall(3000, () => {
        if (index === question.correctAnswer) {
          this.handleCorrectAnswer(index)
        } else {
          this.handleWrongAnswer(index)
        }
      })
    }
  }

  handleCorrectAnswer (index) {
    this.score++
    this.audioManager.playSound('correctAnswer')

    // Limpiar la pantalla de opciones
    this.clearAnswers()

    // Ocultar el comentario
    if (index >= 0 && index < this.marioComment.length) {
      this.marioComment[index].setVisible(false)
    }

    // Mostrar imagen de correcto
    const correctSign = this.add.image(400, 200, 'correctsign')
      .setOrigin(0.5)
      .setScale(0.5)

    // Programar la eliminación de la imagen
    this.time.delayedCall(2000, () => {
      correctSign.destroy()
      this.currentQuestionIndex++
      this.startNextQuestion()
    })

    console.log('Respuesta correcta')
  }

  handleWrongAnswer (index) {
    console.log('Respuesta incorrecta')
    this.penaltyActive = true

    // Limpiar la pantalla de opciones
    this.clearAnswers()

    // Ocultar el comentario
    if (index >= 0 && index < this.marioComment.length) {
      this.marioComment[index].setVisible(false)
    }

    this.audioManager.playSound('wrongAnswer')

    // Guardar la posición original de la question-box
    const questionBox = this.questionBoxes[0]
    const originalY = questionBox.y
    const originalX = questionBox.x

    // Primer tween: mover la question-box hacia el personaje
    this.tweens.add({
      targets: questionBox,
      y: 450,
      x: 60,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        // Efecto de "empujón" al personaje
        if (this.characters.models.mario) {
          this.tweens.add({
            targets: this.characters.models.mario.position,
            x: '+=30',
            duration: 100,
            yoyo: true,
            ease: 'Power1'
          })
        }

        // Segundo tween: devolver la question-box a su posición original
        this.tweens.add({
          targets: questionBox,
          y: originalY,
          x: originalX,
          duration: 300,
          ease: 'Linear',
          onComplete: () => {
            // Iniciamos la animación stunned
            this.characters.playAnimation('mario', 'stunned')
          }
        })
      }
    })

    // Mostrar imagen de incorrecto después de la animación de golpe
    this.time.delayedCall(1500, () => {
      const wrongSign = this.add.image(400, 200, 'wrongsign')
        .setOrigin(0.5)
        .setScale(0.5)

      this.time.delayedCall(2000, () => {
        wrongSign.destroy()
        this.currentQuestionIndex++
        this.startNextQuestion()
      })
    })

    this.time.delayedCall(7000 + 2000, () => {
      this.penaltyActive = false
    })

    this.time.delayedCall(7000 + 6500, () => {
      this.characters.playAnimation('mario', 'idle')
    })
  }

  handleNoAnswer () {
    console.log('No se respondió a tiempo')
    this.canAnswer = false
    this.currentQuestionIndex++
    this.startNextQuestion()
  }

  clearTimers () {
    if (this.questionTimer) this.questionTimer.remove()
    if (this.answerTimer) this.answerTimer.remove()
  }

  clearAnswers () {
    this.buttonImages.forEach((image) => image.destroy())
    this.buttonImages = []
    this.answerTexts.forEach((text) => text.setText(''))
  }

  endGame () {
    // Limpiar elementos existentes
    this.clearTimers()
    this.clearAnswers()
    this.clearTouchButtons()
    this.questionText.setText('')
    this.penaltyText.setText('')

    // Detener todas las animaciones y limpiar personajes
    if (this.characters) {
      this.characters.cleanup()
    }

    // Detener todos los sonidos actuales
    this.audioManager.stopAll()

    // Reproducir sonido según la puntuación
    if (this.score > 5) {
      this.audioManager.playSound('winSong')
    } else {
      this.audioManager.playSound('loseSong')
    }

    // Mostrar puntuación
    this.add
      .text(400, 250, `Juego terminado. Puntuación: ${this.score}`, {
        fontSize: '32px',
        fill: '#fe0404'
      })
      .setOrigin(0.5)

    // Crear botón de menú
    const menuButton = this.add.text(400, 350, 'Menú', {
      fontSize: '28px',
      fill: '#fff',
      backgroundColor: '#fe0404',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuButton.setStyle({ fill: '#fe0404', backgroundColor: '#fff' }))
      .on('pointerout', () => menuButton.setStyle({ fill: '#fff', backgroundColor: '#fe0404' }))
      .on('pointerdown', () => {
      // Limpiar la escena 3D
        if (this.third) {
        // Limpiar la escena three.js
          while (this.third.scene.children.length > 0) {
            const object = this.third.scene.children[0]
            this.third.scene.remove(object)

            if (object.geometry) object.geometry.dispose()
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          }

          // Limpiar el renderer
          this.third.renderer.dispose()
        }

        // Remover el evento resize
        window.removeEventListener('resize', this.resizeHandler)

        // Destruir la escena actual y comenzar la escena del menú
        this.scene.stop()
        this.scene.start('MenuScene')
      })
  }

  update (time, delta) {
    if (this.characters) {
      this.characters.update(delta)
    }
  }
}
