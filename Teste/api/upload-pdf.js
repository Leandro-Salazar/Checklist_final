import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erro ao processar formulário" });

    const { itemId, columnId } = fields;
    const file = files.file;

    const fileStream = fs.createReadStream(file.filepath);
    const formData = new FormData();
    formData.append("query", `
      mutation ($file: File!) {
        add_file_to_column (file: $file, item_id: ${itemId}, column_id: "${columnId}") {
          id
        }
      }
    `);
    formData.append("variables[file]", fileStream, file.originalFilename);

    try {
      const response = await fetch("https://api.monday.com/v2/file", {
        method: "POST",
        headers: {
          Authorization: process.env.MONDAY_API_TOKEN,
        },
        body: formData,
      });

      const result = await response.json();
      return res.status(200).json(result);  // sempre retorna JSON aqui
    } catch (error) {
      console.error("Erro:", error);
      return res.status(500).json({ error: "Falha no envio para a Monday." });
    }
  });
}
