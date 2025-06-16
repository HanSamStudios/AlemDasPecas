export default class Detonou extends Phaser.Scene {
  constructor() {
    super('detonou');
  }

  preload() {
    this.load.image('detonou', 'assets/detonou.png'); // Adicione essa imagem na pasta
  }

create() {
  globalThis.google.accounts.id.initialize({
    client_id: "331191695151-ku8mdhd76pc2k36itas8lm722krn0u64.apps.googleusercontent.com",
    callback: (res) => {
      console.log("Resposta do login Google:", res);

      if (res.error) {
        console.error("Erro no login:", res.error);
        return;
      }

      const token = res.credential;
      console.log("Token recebido:", token);

      axios.post(
        "https://feira-de-jogos.dev.br/api/v2/credit",
        {
          product: 41,
          value: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Crédito adicionado com sucesso:", response.data);
        alert("Crédito adicionado!");
      })
      .catch((error) => {
        console.error("Erro ao adicionar crédito:", error.response?.data || error.message || error);
        alert("Erro ao adicionar crédito :(");
      });

      // Exibe a imagem da cena normalmente
      this.add.image(0, 0, 'detonou').setOrigin(0);
    },
  });

  globalThis.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      globalThis.google.accounts.id.prompt();
    }
  });
}

}