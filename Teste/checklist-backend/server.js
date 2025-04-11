require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // CORREÇÃO
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/enviar-formulario', async (req, res) => {
    const formidable = require("formidable");
    const fs = require("fs");
    const FormData = require("form-data");
    
    app.post("/api/upload-pdf", (req, res) => {
      const form = new formidable.IncomingForm({ keepExtensions: true });
    
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).send("Erro ao processar arquivo.");
        }
    
        const fileArray = files.arquivo;
        const itemId = fields.itemId;
    
        if (!fileArray || !itemId) {
          return res.status(400).json({ error: "Arquivo ou itemId ausente." });
        }
    
        const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
        const filePath = file?.filepath || file?.path;
    
        const formData = new FormData();
        formData.append("query", `
          mutation ($file: File!) {
            add_file_to_column(file: $file, item_id: ${itemId}, column_id: "file_mkpn46xc") {
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
          res.status(500).send("Erro ao enviar PDF.");
        }
      });
    });
    
  try {
    const respostas = req.body.respostas;

    const columnValues = {
      text_mkpjsmpc: respostas[0],
      text_mkpnpxjt: respostas[1],
      text_mkpntfje: respostas[2],
      text_mkpns9mw: respostas[3],
      text_mkpnrmd0: respostas[4],
      text_mkpn766e: respostas[5],
      text_mkpnn53k: respostas[6],
      text_mkpnxs2v: respostas[7],
      text_mkpnza93: respostas[8],
      text_mkpnzzsa: respostas[9],
      text_mkpncg6g: respostas[10],
      text_mkpnj2z2: respostas[11],
      text_mkpn67sw: respostas[12],
      text_mkpntpbk: respostas[13],
      text_mkpndc5k: respostas[14],
      text_mkpnrkbk: respostas[15],
      text_mkpn1nf1: respostas[16],
      text_mkpnc0wq: respostas[17],
      text_mkpnh13t: respostas[18],
      text_mkpn5rsk: respostas[19],
      text_mkpna61f: respostas[20],
      text_mkpntay0: respostas[21],
      text_mkpntemc: respostas[22],
      text_mkpnfbbb: respostas[23],
      text_mkpn3qcd: respostas[24],
      text_mkpnqmth: respostas[25],
      text_mkpncnc3: respostas[26],
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

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
