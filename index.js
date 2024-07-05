const express = require("express");
const cors = require("cors");
const { capturarCaptcha, realizarLogin } = require("./src/pagina");
const app = express();
app.use(cors());
app.use(express.json());

// Rota para carregar a página inicial e capturar o CAPTCHA
app.get("/", async (req, res) => {
  await capturarCaptcha(res);
});

// Rota para processar o login
app.post("/login", async (req, res) => {
  const { cpf, placa, captchaSolution } = req.body;

  try {
    const success = await realizarLogin(cpf, placa, captchaSolution);
    res.json({ success });
  } catch (err) {
    console.error("Erro ao realizar o login:", err);
    res.status(500).send("Erro ao realizar o login");
  }
});

// Inicia o servidor na porta 3030
app.listen(3030, () =>
  console.log("Servidor rodando em http://localhost:3030"),
);
