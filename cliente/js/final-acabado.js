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

    this.add.image(0, 0, 'parabens').setOrigin(0).setDepth(0);

    const pontuacao = data.pontuacao || 0;
    const verdes = data.verdes || 0;
    const vermelhos = data.vermelhos || 0;

    // Texto total
    this.add.text(
      320, 280,
      `${verdes} / 11`,
      {
        fontFamily: 'game-over',
        fontSize: '28px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    // Texto verde
    this.add.text(
      540, 280,
      `${vermelhos} / 7`,
      {
        fontFamily: 'game-over',
        fontSize: '28px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

  }

  update() {}
}
