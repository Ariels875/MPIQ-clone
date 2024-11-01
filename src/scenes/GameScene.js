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
    this.questionTimer = null
    this.answerTimer = null
    this.penaltyActive = false
    this.characters = null
    this.cameraTarget = new THREE.Vector3(0, 5, 0)
  }

  init (data) {
    this.accessThirdDimension({
      enableXR: false,
      ground: { createFloor: false }
    })
    this.level = data.level
  }

  preload () {
    this.load.image('abutton', 'assets/images/abutton.png')
    this.load.image('acomment', 'assets/images/acomment.png')
    this.load.image('bbutton', 'assets/images/bbutton.png')
    this.load.image('bcomment', 'assets/images/bcomment.png')
    this.load.image('board', 'assets/images/board.png')
    this.load.image('correctsign', 'assets/images/correctsign.png')
    this.load.image('mushroom', 'assets/images/mushroom.png')
    this.load.image('pipe', 'assets/images/pipe.png')
    this.load.image('question-box', 'assets/images/question-box.png')
    this.load.image('square-cloud', 'assets/images/square-cloud.png')
    this.load.image('star', 'assets/images/star.png')
    this.load.image('startbtn', 'assets/images/startbtn.png')
    this.load.image('wrongsign', 'assets/images/wrongsign.png')
    this.load.image('zbutton', 'assets/images/zbutton.png')
    this.load.image('zcomment', 'assets/images/zcomment.png')
    this.load.json('questions', 'assets/data/questions.json')

    this.audioManager = new AudioManager(this)
    this.audioManager.preload()
  }

  async create () {
    this.audioManager.create()

    // Eliminar la llamada a warpSpeed y configurar manualmente lo necesario
    this.third.renderer.setPixelRatio(1)
    this.third.renderer.setSize(window.innerWidth, window.innerHeight)

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

    this.add.image(60, 330, 'question-box').setOrigin(0).setScale(0.32)
    this.add.image(265, 330, 'question-box').setOrigin(0).setScale(0.32)
    this.add.image(475, 330, 'question-box').setOrigin(0).setScale(0.32)
    this.add.image(680, 330, 'question-box').setOrigin(0).setScale(0.32)

    this.add.image(70, 295, 'mushroom').setOrigin(0).setScale(0.2)
    this.add.image(275, 295, 'mushroom').setOrigin(0).setScale(0.2)
    this.add.image(485, 295, 'mushroom').setOrigin(0).setScale(0.2)
    this.add.image(690, 295, 'mushroom').setOrigin(0).setScale(0.2)

    const allQuestions = this.cache.json.get('questions')
    this.questions = allQuestions[`level${this.level}`]

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
      }
    })

    // Crear botones táctiles solo si es un dispositivo móvil/tablet
    if (!this.sys.game.device.os.desktop) {
      this.createTouchButtons()
    }

    this.input.keyboard.on('keydown-A', () => this.handleAnswer(0))
    this.input.keyboard.on('keydown-B', () => this.handleAnswer(1))
    this.input.keyboard.on('keydown-Z', () => this.handleAnswer(2))

    // Texto para la puntuación
    this.scoreText = this.add.text(600, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#fe0404',
      align: 'center',
      wordWrap: { width: 450 }
    })

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
    const buttonScale = 0.4
    const buttonY = this.scale.height - 100 // Posición Y para todos los botones

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
    const question = this.questions[this.currentQuestionIndex]
    this.questionText.setText(question.question)
    this.canAnswer = false

    if (this.penaltyActive) {
      this.penaltyText.setText('Penalización activada')
    } else {
      this.penaltyText.setText('')
    }
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
      if (index === question.correctAnswer) {
        this.handleCorrectAnswer()
      } else {
        this.handleWrongAnswer()
      }
      this.currentQuestionIndex++
      this.time.delayedCall(1000, () => {
        this.startNextQuestion()
      })
    }
  }

  handleCorrectAnswer () {
    this.score++
    this.scoreText.setText(`Score: ${this.score}`)
    console.log('Respuesta correcta')
  }

  handleWrongAnswer () {
    console.log('Respuesta incorrecta')
    this.penaltyActive = true
    this.characters.playAnimation('mario', 'stunned')
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
    this.clearTimers()
    this.clearAnswers()
    this.clearTouchButtons()
    this.questionText.setText('')
    this.penaltyText.setText('')
    this.add
      .text(400, 300, `Juego terminado. Puntuación: ${this.score}`, {
        fontSize: '32px',
        fill: '#fe0404'
      })
      .setOrigin(0.5)
  }

  update (time, delta) {
    if (this.characters) {
      this.characters.update(delta)
    }
  }
}
