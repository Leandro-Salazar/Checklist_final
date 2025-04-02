import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao processar formulário", detalhes: err.message });
    }

    const { itemId, columnId } = fields;
    const file = files.file;

    try {
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

      const response = await fetch("https://api.monday.com/v2/file", {
        method: "POST",
        headers: {
          Authorization: process.env.MONDAY_API_TOKEN,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result?.data?.add_file_to_column?.id) {
        return res.status(500).json({ error: "Erro ao anexar PDF", detalhes: result });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao enviar para Monday:", error);
      return res.status(500).json({ error: "Erro interno no servidor", detalhes: error.message });
    }
  });
}
