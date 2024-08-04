import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.questions = [];
        this.currentQuestionIndex = 0;
    }

    init(data) {
        this.level = data.level;
    }

    preload() {
        this.load.image('abutton', 'assets/images/abutton.png');
        this.load.image('acomment', 'assets/images/acomment.png');
        this.load.image('background', 'assets/images/background.png');
        this.load.image('bbutton', 'assets/images/bbutton.png');
        this.load.image('bcomment', 'assets/images/bcomment.png');
        this.load.image('board', 'assets/images/board.png');
        this.load.image('correctsign', 'assets/images/correctsign.png');
        this.load.image('mushroom', 'assets/images/mushroom.png');
        this.load.image('pipe', 'assets/images/pipe.png');
        this.load.image('question-box', 'assets/images/question-box.png');
        this.load.image('square-cloud', 'assets/images/square-cloud.png');
        this.load.image('star', 'assets/images/star.png');
        this.load.image('startbtn', 'assets/images/startbtn.png');
        this.load.image('wrongsign', 'assets/images/wrongsign.png');
        this.load.image('zbutton', 'assets/images/zbutton.png');
        this.load.image('zcomment', 'assets/images/zcomment.png');
        this.load.json('questions', 'assets/data/questions.json');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0).setScale(1.05);

        this.add.image(35, 525, 'pipe').setOrigin(0).setScale(0.5);
        this.add.image(240, 525, 'pipe').setOrigin(0).setScale(0.5);
        this.add.image(450, 525, 'pipe').setOrigin(0).setScale(0.5);
        this.add.image(650, 525, 'pipe').setOrigin(0).setScale(0.5);

        let boardHeight = this.textures.get('board').getSourceImage().height;
        let squareCloudHeight = this.textures.get('square-cloud').getSourceImage().height;

        let board = this.add.image(115, -boardHeight * 1.25, 'board').setOrigin(0).setScale(1.1).setAlpha(0.90);
        let squareCloud = this.add.image(35, -squareCloudHeight, 'square-cloud').setOrigin(0).setScale(1.1);

        this.add.image(60, 330, 'question-box').setOrigin(0).setScale(0.37);
        this.add.image(265, 330, 'question-box').setOrigin(0).setScale(0.37);
        this.add.image(475, 330, 'question-box').setOrigin(0).setScale(0.37);
        this.add.image(680, 330, 'question-box').setOrigin(0).setScale(0.37);

        this.add.image(65, 275, 'mushroom').setOrigin(0).setScale(0.30);
        this.add.image(270, 275, 'mushroom').setOrigin(0).setScale(0.30);
        this.add.image(480, 275, 'mushroom').setOrigin(0).setScale(0.30);
        this.add.image(685, 275, 'mushroom').setOrigin(0).setScale(0.30);



        const allQuestions = this.cache.json.get('questions');
        this.questions = allQuestions[`level${this.level}`];

        // animaciones
        this.tweens.add({
            targets: board,
            y: 65,
            ease: 'Bounce.easeOut',
            duration: 2000,
            delay: 500
        });
        this.tweens.add({
            targets: squareCloud,
            y: 0,
            ease: 'Bounce.easeOut',
            duration: 2000,
            delay: 500
        });

        // Aquí puedes comenzar a mostrar las preguntas y respuestas
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            // Mostrar la pregunta y las opciones de respuesta
            // Implementar la lógica para seleccionar una respuesta
        } else {
            // Fin del juego
        }
    }

    // Implementar más métodos para manejar la lógica del juego
}


