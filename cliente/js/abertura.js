
export default class abertura extends Phaser.Scene {

    constructor () {
        super('abertura')
    }

    init(){ }
    preload () {
        this.load.image('capa', 'assets/capa.png')
        this.load.spritesheet('botao', 'assets/botao.png', {
            frameWidth: 250,
            frameHeight: 130
        })
    }

    create () {
        this.add.image(400, 225, 'capa')
        this.anims.create({
            key: 'botao',
            frames: this.anims.generateFrameNumbers('botao', { start: 0, end: 1 }),
            frameRate: 30
        })
        this.botao = this.add.sprite(600, 240, 'botao')
        this.botao
            .setInteractive()
            .on('pointerdown', () => {
                navigator.mediaDevices
                    .getUserMedia({ video: false, audio: true })
                    .then((stream) => {
                        this.game.midias = stream;
                    })
                    .catch((error) => {
                    console.error("Erro ao acessar o microfone:", error)
                    })
            this.botao.play('botao')
            this.time.delayedCall(200, () => {
                this.scene.start('precarregamento');
                })
            })
    }
    update() { }
}