const puppeteer = require("puppeteer");
const fs = require("fs").promises;
require("dotenv").config();

let browser; // Variável para armazenar o navegador aberto
let captchaPage; // Variável para armazenar a página do CAPTCHA aberta

const inicializarNavegador = async () => {
  await fecharNavegador();

  // Inicia um novo navegador
  browser = await puppeteer.launch({
    headless: "shell", // Altere para true para executar sem interface gráfica
    args: [
      `--no-sandbox`,
      `--headless`,
      `--disable-gpu`,
      `--disable-dev-shm-usage`,
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  // Abre uma nova página para o CAPTCHA
  captchaPage = await browser.newPage();
  await captchaPage.goto(
    "https://portaldenegociacao.semparar.com.br/recuperaportal/",
  );
  await captchaPage.setViewport({ width: 1080, height: 1024 });
};

const fecharNavegador = async () => {
  try {
    // Fecha a página do CAPTCHA
    if (captchaPage) {
      await captchaPage.close();
      captchaPage = null;
    }

    // Fecha o navegador
    if (browser) {
      await browser.close();
      browser = null;
    }
  } catch (err) {
    console.error("Erro ao fechar o navegador:", err);
  }
};

const capturarCaptcha = async (res) => {
  try {
    // Inicializa o navegador se necessário
    await inicializarNavegador();

    // Captura o tamanho e a posição do elemento CAPTCHA
    const captchaId = "#CaptchaImage";
    await captchaPage.waitForSelector(captchaId);
    const captchaElement = await captchaPage.$(captchaId);
    const captchaBoundingBox = await captchaElement.boundingBox();

    // Verifica se o elemento foi encontrado
    if (!captchaBoundingBox) {
      throw new Error(`Elemento ${captchaId} não encontrado.`);
    }

    // Captura apenas a área do elemento do CAPTCHA
    const captchaScreenshotPath = "captcha_screenshot.png";
    await captchaPage.screenshot({
      path: captchaScreenshotPath,
      clip: {
        x: captchaBoundingBox.x,
        y: captchaBoundingBox.y,
        width: captchaBoundingBox.width,
        height: captchaBoundingBox.height,
      },
    });

    const imageBuffer = await fs.readFile(captchaScreenshotPath);
    const base64Image = imageBuffer.toString("base64");

    res.json({
      captchaImage: base64Image,
    });
  } catch (err) {
    console.error("Erro ao capturar o CAPTCHA:", err);
    res.status(500).send("Ocorreu um erro ao capturar o CAPTCHA");
  }
};

const realizarLogin = async (cpf, placa, captchaSolution) => {
  try {
    // Verifica se a página do CAPTCHA está aberta
    if (!captchaPage) {
      throw new Error("Página do CAPTCHA não inicializada.");
    }

    // Preenche o formulário de login
    await captchaPage.type("#CPF", cpf);
    await captchaPage.type("#PlacaVeiculo", placa);
    await captchaPage.type("#CaptchaInputText", captchaSolution);

    // Submete o formulário
    await captchaPage.click("button");

    // Aguarda a navegação após a submissão do formulário
    await captchaPage.waitForNavigation();

    // Verifica se o login foi bem-sucedido
    const loginSuccess = await captchaPage.evaluate(() => {
      return !document.querySelector("#loginButton"); // Lógica para verificar sucesso
    });

    return loginSuccess;
  } catch (err) {
    console.error("Erro ao realizar o login:", err);
    throw new Error("Ocorreu um erro ao realizar o login");
  }
};

module.exports = { capturarCaptcha, realizarLogin };
