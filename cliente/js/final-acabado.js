export default class finalacabado extends Phaser.Scene {
  constructor() {
    super('final-acabado');
  }

  init() {}

  preload() {
    this.load.image('parabens', 'assets/parabens.png'); // Imagem de fundo
    this.fontReady = false;

    WebFont.load({
      custom: {
        families: ['game-over'],
      },
      active: () => {
        this.fontReady = true;
      }
    });
  }

  create(data) {
    if (!this.fontReady) {
      this.time.delayedCall(100, () => this.create(data), [], this); // Espera a fonte carregar
      return;
    }

    // Fundo
    this.add.image(0, 0, 'parabens').setOrigin(0).setDepth(0)
    // Pega pontuação do jogador
    const pontuacao = data.pontuacao || 0;

    // Mostra quantos cristais foram coletados
    this.add.text(
      300,
      280,
      `${pontuacao}`,
      {
        fontFamily: 'game-over',
        fontSize: '30px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);
  }

  update() {}
}
