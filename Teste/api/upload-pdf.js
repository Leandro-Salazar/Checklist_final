
import dotenv from "dotenv";
dotenv.config();
console.log("🔐 MONDAY_API_TOKEN carregado:", process.env.MONDAY_API_TOKEN);
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).send("Only POST allowed");
    }

    const form = new formidable.IncomingForm();
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Erro ao processar formulário:", err);
        return res.status(500).send("Erro ao processar formulário");
      }
  
      try {
        const { itemId, columnId } = fields;
        const file = files.file;
  
        const fileStream = fs.createReadStream(file.filepath);
  
        const formData = new FormData();
        formData.append(
          "query",
          `
          mutation ($file: File!) {
            add_file_to_column (file: $file, item_id: ${itemId}, column_id: "${columnId}") {
              id
            }
          }
        `
        );
        formData.append("variables[file]", fileStream, file.originalFilename);
  
        const mondayRes = await fetch("https://api.monday.com/v2/file", {
          method: "POST",
          headers: {
            Authorization: process.env.MONDAY_API_TOKEN, // ✅ Definida no painel da Vercel
          },
          body: formData,
        });
  
        const result = await mondayRes.json();
  
        if (!result?.data?.add_file_to_column?.id) {
          console.error("Erro ao enviar para Monday:", result);
          return res.status(500).json({ error: "Falha no envio para a Monday." });
        }
  
        return res.status(200).json(result);
      } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({ error: "Erro inesperado no servidor." });
      }
    });
  }
   