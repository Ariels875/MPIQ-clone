// AudioManager.js
export default class AudioManager {
  constructor (scene) {
    this.scene = scene
    this.sounds = {}
  }

  preload () {
    // Efectos de sonido para el menú
    this.scene.load.audio('menuSelect', 'assets/audio/menuSelect.mp3')

    // Efectos de sonido para el juego
    this.scene.load.audio('correctAnswer', 'assets/audio/correctAnswer.mp3')
    this.scene.load.audio('wrongAnswer', 'assets/audio/wrongAnswer.mp3')
    this.scene.load.audio('gameStart', 'assets/audio/startSong.mp3')
    this.scene.load.audio('loseSong', 'assets/audio/loseSong.mp3')
    this.scene.load.audio('winSong', 'assets/audio/winSong.mp3')
    this.scene.load.audio('hitboxSong', 'assets/audio/hitboxSong.mp3')
    this.scene.load.audio('fallingCloud', 'assets/audio/fallingCloud.mp3')

    // Música de fondo
    this.scene.load.audio('gameMusic', 'assets/audio/gameMusic.mp3')
  }

  create () {
    // Efectos de sonido del menú
    this.sounds.menuSelect = this.scene.sound.add('menuSelect')
    this.sounds.gameStart = this.scene.sound.add('gameStart')

    // Efectos de sonido del juego
    this.sounds.correctAnswer = this.scene.sound.add('correctAnswer')
    this.sounds.wrongAnswer = this.scene.sound.add('wrongAnswer')
    this.sounds.loseSong = this.scene.sound.add('loseSong')
    this.sounds.winSong = this.scene.sound.add('winSong')
    this.sounds.hitboxSong = this.scene.sound.add('hitboxSong')
    this.sounds.fallingCloud = this.scene.sound.add('fallingCloud')

    // Música de fondo
    this.sounds.gameMusic = this.scene.sound.add('gameMusic', { loop: true })
  }

  playSound (key, config = {}) {
    if (this.sounds[key]) {
      this.sounds[key].play(config)
    }
  }

  stopSound (key) {
    if (this.sounds[key]) {
      this.sounds[key].stop()
    }
  }

  stopAll () {
    Object.values(this.sounds).forEach(sound => sound.stop())
  }

  playMusic (key, fadeIn = true) {
    // Detener cualquier música que esté sonando
    Object.keys(this.sounds).forEach(soundKey => {
      if (soundKey.includes('Music') && this.sounds[soundKey].isPlaying) {
        if (fadeIn) {
          this.scene.tweens.add({
            targets: this.sounds[soundKey],
            volume: 0,
            duration: 1000,
            onComplete: () => {
              this.sounds[soundKey].stop()
              this.playNewMusic(key, fadeIn)
            }
          })
        } else {
          this.sounds[soundKey].stop()
          this.playNewMusic(key, fadeIn)
        }
      }
    })

    if (!Object.keys(this.sounds).some(soundKey =>
      soundKey.includes('Music') && this.sounds[soundKey].isPlaying)) {
      this.playNewMusic(key, fadeIn)
    }
  }

  playNewMusic (key, fadeIn) {
    if (this.sounds[key]) {
      if (fadeIn) {
        this.sounds[key].volume = 0
        this.sounds[key].play()
        this.scene.tweens.add({
          targets: this.sounds[key],
          volume: 1,
          duration: 1000
        })
      } else {
        this.sounds[key].play()
      }
    }
  }
}
