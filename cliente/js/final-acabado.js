/*global Phaser, axios*/
/*eslint no-undef: "error"*/

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

  create (data) {
      globalThis.google.accounts.id.initialize({
        client_id:
          "331191695151-ku8mdhd76pc2k36itas8lm722krn0u64.apps.googleusercontent.com",
        callback: (res) => {
          if (res.error) {
            console.error(res.error);
          } else {
            axios
              .post(
                "https://feira-de-jogos.dev.br/api/v2/credit",
                {
                  product: 41, // id do jogo cadastrado no banco de dados da Feira de Jogos
                  value: 500, // crédito em tijolinhos
                },
                {
                  headers: {
                    Authorization: `Bearer ${res.credential}`,
                  }
                }
              )
              .then(function (response) {
                console.log(response);
                alert("Crédito adicionado!")
              })
              .catch(function (error) {
                console.error(error)
                alert("erro ao adicionar crédito :(")
              });
          }
        },
      });
  
      globalThis.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          globalThis.google.accounts.id.prompt();
        }
      });
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
