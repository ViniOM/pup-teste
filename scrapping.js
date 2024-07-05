const puppeteer = require("puppeteer");
require("dotenv").config();
const scrape = (res) => {
  try {
    (async () => {
      // Launch the browser and open a new blank page
      const browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });
      const page = await browser.newPage();

      // Navigate the page to a URL
      await page.goto("https://example.com/");

      // Set screen size
      await page.setViewport({ width: 1080, height: 1024 });

      // Wait and click on first result

      const tituloAlvo = "h1";
      const textoAlvo = "p";

      // Locate the full title with a unique string
      const tituloAlvoSelector = await page.waitForSelector(tituloAlvo);
      const fullTitle = await tituloAlvoSelector?.evaluate(
        (el) => el.textContent,
      );

      const textoAlvoSelector = await page.waitForSelector(textoAlvo);
      const fullTextoAlvo = await textoAlvoSelector?.evaluate(
        (el) => el.textContent,
      );

      res.json({
        title: fullTitle,
        text: fullTextoAlvo,
      });

      await browser.close();
    })();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { scrape };
