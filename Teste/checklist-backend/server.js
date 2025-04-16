require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const formidable = require('formidable');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/enviar-formulario', async (req, res) => {
  try {
    const respostas = req.body.respostas;

    const columnValues = {
      text_mkpjsmpc: respostas[0],
      text_mkpnpxjt: respostas[2], // "Demanda contratada" volta a ser [2] porque [1] é o upload
      text_mkpntfje: respostas[3],
      text_mkpns9mw: respostas[4],
      text_mkpnrmd0: respostas[5],
      text_mkpn766e: respostas[6],
      text_mkpnn53k: respostas[7],
      text_mkpnxs2v: respostas[8],
      text_mkpnza93: respostas[9],
      text_mkpnzzsa: respostas[10],
      text_mkpncg6g: respostas[11],
      text_mkpnj2z2: respostas[12],
      text_mkpn67sw: respostas[13],
      text_mkpntpbk: respostas[14],
      text_mkpndc5k: respostas[15],
      text_mkpnrkbk: respostas[16],
      text_mkpn1nf1: respostas[17],
      text_mkpnc0wq: respostas[18],
      text_mkpnh13t: respostas[19],
      text_mkpn5rsk: respostas[20],
      text_mkpna61f: respostas[21],
      text_mkpntay0: respostas[22],
      text_mkpntemc: respostas[23],
      text_mkpnfbbb: respostas[24],
      text_mkpn3qcd: respostas[25],
      text_mkpnqmth: respostas[26],
      text_mkpncnc3: respostas[27],
    };

    const mutation = {
      query: `mutation {
        create_item(
          board_id: ${process.env.MONDAY_BOARD_ID},
          item_name: "Checklist ${respostas[0]} - ${new Date().toLocaleDateString()}",
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) {
          id
        }
      }`
    };

    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        Authorization: process.env.MONDAY_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mutation)
    });

    const result = await response.json();
    if (result.errors) {
      console.error("❌ Erros retornados:", result.errors);
      return res.status(500).json({ error: "Erro ao enviar para o Monday", detalhe: result.errors });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
    res.status(500).json({ error: "Erro interno ao enviar formulário", detalhe: err.message });
  }
});

app.post("/api/upload-pdf", (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Erro ao processar arquivo.");

    const fileArray = files.arquivo;
    const itemId = fields.itemId;
    const coluna = fields.coluna || "file_mkpn46xc"; // se não enviado, vai para checklist PDF

    if (!fileArray || !itemId) {
      return res.status(400).json({ error: "Arquivo ou itemId ausente." });
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    const filePath = file?.filepath || file?.path;

    const formData = new FormData();
    formData.append("query", `
      mutation ($file: File!) {
        add_file_to_column(file: $file, item_id: ${itemId}, column_id: "${coluna}") {
          id
        }
      }`);
    formData.append("variables[file]", fs.createReadStream(filePath));

    try {
      const response = await fetch("https://api.monday.com/v2/file", {
        method: "POST",
        headers: {
          Authorization: process.env.MONDAY_API_TOKEN
        },
        body: formData
      });

      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Erro ao enviar para Monday:", error);
      res.status(500).send("Erro ao enviar arquivo para Monday");
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
