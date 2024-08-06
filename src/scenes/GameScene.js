import Phaser from 'phaser';
import CharacterAnimations from './CharacterAnimations';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.canAnswer = true;
        this.buttonImages = [];
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
            delay: 500,
            onComplete: () => {
                this.showQuestion();
            }
        });

        this.characterAnimations = new CharacterAnimations(this);
        this.characterAnimations.create();

        /* Eventos de teclado
        this.input.keyboard.on('keydown-A', () => this.handleCharacterAnimation('A'));
        this.input.keyboard.on('keydown-B', () => this.handleCharacterAnimation('B'));
        this.input.keyboard.on('keydown-Z', () => this.handleCharacterAnimation('Z'));
        */
        this.input.keyboard.on('keydown-A', () => this.handleAnswer(0));
        this.input.keyboard.on('keydown-B', () => this.handleAnswer(1));
        this.input.keyboard.on('keydown-Z', () => this.handleAnswer(2));
        
        // Texto para la puntuación
        this.scoreText = this.add.text(600, 20, 'Score: 0', { fontSize: '24px', fill: '#fe0404', align: 'center', wordWrap: { width: 450 }  });

        // Texto para la pregunta y respuestas
        this.questionText = this.add.text(400, 150, '', { fontSize: '24px', fill: '#fff', align: 'center', wordWrap: { width: 450 } }).setOrigin(0.5);
        this.answerTexts = [
            this.add.text(230, 100, '', { fontSize: '24px', fill: '#fff' }),
            this.add.text(230, 130, '', { fontSize: '24px', fill: '#fff' }),
            this.add.text(230, 160, '', { fontSize: '24px', fill: '#fff' })
        ];
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            this.questionText.setText(question.question);
            this.answerTexts.forEach(text => text.setText(''));

            this.canAnswer = true;
            this.time.delayedCall(6000, () => {
                if (this.canAnswer) {
                    this.showAnswers();
                }
            });
        } else {
            this.endGame();
        }
    }

    showAnswers() {
        const question = this.questions[this.currentQuestionIndex];
        this.questionText.setText('');
        
        // Limpiar imágenes de botones anteriores
        this.buttonImages.forEach(image => image.destroy());
        this.buttonImages = [];
        
        const buttons = ['abutton', 'bbutton', 'zbutton'];
        
        question.answers.forEach((answer, index) => {
            this.answerTexts[index].setText('');
            const buttonImage = this.add.image(this.answerTexts[index].x - 30, this.answerTexts[index].y + 10, buttons[index]).setOrigin(0.5).setScale(0.5);
            this.buttonImages.push(buttonImage);
            this.answerTexts[index].setText(answer);
        });

        this.time.delayedCall(5000, () => {
            if (this.canAnswer) {
                this.handleNoAnswer();
            }
        });
    }
    

    handleCharacterAnimation(character) {
        if (this.canAnswer) {
            this.characterAnimations.playAnimation(character);
            this.showAnswers();
        }
    }

    handleAnswer(index) {
        if (this.canAnswer) {
            const question = this.questions[this.currentQuestionIndex];
            if (index === question.correctAnswer) {
                this.score++;
                this.scoreText.setText(`Score: ${this.score}`);
                console.log('Respuesta correcta');
            } else {
                console.log('Respuesta incorrecta');
                this.canAnswer = false;
            }
            this.nextQuestion();
        }
    }

    handleNoAnswer() {
        console.log('No se respondió a tiempo');
        this.canAnswer = false;
        this.nextQuestion();
    }

    nextQuestion() {
        // Ocultar imágenes de botones antes de mostrar la siguiente pregunta
        this.buttonImages.forEach(image => image.destroy());
        this.buttonImages = [];
        
        this.currentQuestionIndex++;
        this.time.delayedCall(1000, () => {
            this.showQuestion();
        });
    }

    endGame() {
        this.add.text(400, 300, `Juego terminado. Puntuación: ${this.score}`, { fontSize: '32px', fill: '#fe0404' }).setOrigin(0.5);
    }
}


