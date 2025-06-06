export default class Detonou extends Phaser.Scene {
  constructor() {
    super('detonou');
  }

  preload() {
    this.load.image('detonou', 'assets/detonou.png'); // Adicione essa imagem na pasta
  }

  create() {
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
                  value: 400, // crédito em tijolinhos
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
    this.add.image(0, 0, 'detonou').setOrigin(0);
  }
}