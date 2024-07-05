const express = require("express");
const cors = require("cors");
const { scrape } = require("./scrapping");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Puppeteer rodando normalmente /");
});

app.get("/scrape", (req, res) => {
  scrape(res);
});

app.listen(3030, () => console.log("http://localhost:3030"));
