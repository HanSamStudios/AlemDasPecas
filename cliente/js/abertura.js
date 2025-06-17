
export default class abertura extends Phaser.Scene {

    constructor () {
        super('abertura')
    }

    init(){ }
    preload () {
        this.load.image('capa', 'assets/capa.png')
        this.load.spritesheet("foxabertura", "assets/foxabertura.png", {
          frameWidth: 64,
          frameHeight: 64,
        });
        this.load.image('botao', 'assets/botao.png', {
            frameWidth: 250,
            frameHeight: 130
        })
    }

    create() {
        this.add.image(400, 225, 'capa');
    
        this.botao = this.add.image(580, 220, 'botao')
            .setInteractive()
            .setScale(0.5)
            .on('pointerdown', () => {
                this.startGame();
            });
    
        // Listener para clicar em qualquer lugar da tela
        this.input.on('pointerdown', () => {
            this.startGame();
        });
        this.anims.create({
          key: "andar_direita",
          frames: this.anims.generateFrameNumbers("foxabertura", {
            start: 0,
            end: 12,
          }),
          frameRate: 10,
          repeat: -1,
        });

        this.anims.create({
          key: "andar_esquerda",
          frames: this.anims.generateFrameNumbers("foxabertura", {
            start: 14,
            end: 25,
          }),
          frameRate: 10,
          repeat: -1,
        });

        // Adiciona o sprite da raposa e inicia a animação
        this.fox = this.add
          .sprite(400, 140, "foxabertura")
          .play("andar_direita");
        this.fox.setScale(1.5); // opcional, para deixar maior ou menor

        // Variáveis de controle de movimento
        this.foxDirecao = "direita";
        this.foxVelocidade = 1.5;
    }
    
    startGame() {
        navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((stream) => {
                this.game.midias = stream;
                this.scene.start('detonou');
            })
            .catch((error) => {
                console.error("Erro ao acessar o microfone:", error);
                  this.game.midias = null; // ou false, dependendo de como você usa depois
            this.scene.start('detonou');
            });
    }
    update() {
            if (!this.fox) return;
        
            // Movimenta a raposa
            if (this.foxDirecao === 'direita') {
                this.fox.x += this.foxVelocidade;
                if (this.fox.x >= 760) { // limite direito
                    this.foxDirecao = 'esquerda';
                    this.fox.play('andar_esquerda');
                }
            } else {
                this.fox.x -= this.foxVelocidade;
                if (this.fox.x <= 400) { // limite esquerdo
                    this.foxDirecao = 'direita';
                    this.fox.play('andar_direita');
                }
            }
        }
     }
