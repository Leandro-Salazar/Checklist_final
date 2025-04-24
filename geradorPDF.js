export async function gerarPDF(respostas, perguntas, itemId) {
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // === CAPA ===
    // Texto "WE KEEP YOU ON"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("WE KEEP YOU ON", 105, 40, { align: "center" });

    // Linha horizontal
    doc.setLineWidth(0.5);
    doc.line(70, 43, 140, 43); // linha abaixo do texto

    // Logo da empresa
    const logo = new Image();
    logo.src = "./img/Logo Verde.png"; // substitua pelo caminho correto

    logo.onload = () => {
      doc.addImage(logo, "PNG", 75, 100, 60, 25); // centraliza o logo

      // Título
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(
        "CheckList Técnico",
        105,
        140,
        { align: "center" }
      );

      // Nova página para iniciar conteúdo
      doc.addPage();

      const pageHeight = doc.internal.pageSize.getHeight();
      const margemTopo = 20;
      const margemInferior = 20;
      const alturaLinha = 8;
      let y = margemTopo;

      respostas.forEach((resposta, index) => {
        const pergunta = perguntas[index];
        if (!pergunta) return
        const textoPergunta = `${index + 1}. ${pergunta}`;
        const textoResposta =  `${resposta}`;

        const linhasPergunta = doc.splitTextToSize(textoPergunta, 180);
        const linhasResposta = doc.splitTextToSize(textoResposta, 180);
        const alturaBloco = (linhasPergunta.length + linhasResposta.length) * alturaLinha + 4;

        if (y + alturaBloco > pageHeight - margemInferior) {
          doc.addPage();
          y = margemTopo;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(linhasPergunta, 10, y);
        y += linhasPergunta.length * alturaLinha;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(linhasResposta, 10, y);
        y += linhasResposta.length * alturaLinha + 6;
      });

      // Geração do PDF
      const pdfBlob = doc.output("blob");
      const formData = new FormData();
      formData.append("arquivo", pdfBlob, "checklist.pdf");
      formData.append("itemId", itemId);

      fetch("http://localhost:3000/api/upload-pdf", {
        method: "POST",
        body: formData
      })
        .then(() => console.log("✅ PDF enviado com sucesso"))
        .catch((error) => console.error("❌ Erro ao enviar o PDF:", error));
    };
  });
}
