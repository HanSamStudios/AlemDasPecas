export default class finalunico extends Phaser.Scene {
  constructor() {
    super('final-unico');
  }

  init() {}

  preload() {
    this.load.image('detonou', 'assets/detonou.png');
    this.load.image('parabens', 'assets/parabens.png');
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

    const pegouTodos = (data.verdes === 11 && data.vermelhos === 7);
    const creditos = pegouTodos ? 1500 : 500;
    const imagem = pegouTodos ? 'detonou' : 'parabens';

    // Google login e crédito
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
                product: 41,
                value: creditos,
              },
              {
                headers: {
                  Authorization: `Bearer ${res.credential}`,
                },
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

    this.add.image(0, 0, imagem).setOrigin(0);

    // Só mostra os textos se não pegou todos os cristais
    if (!pegouTodos) {
      const verdes = data.verdes || 0;
      const vermelhos = data.vermelhos || 0;

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
  }

  update() {}
}