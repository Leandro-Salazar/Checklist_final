export async function gerarPDF(respostas, perguntas, itemId) {
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // === TÍTULO ===
    const nomeCliente = respostas[0] || "Nome não informado";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Checklist Técnico - ${nomeCliente}`, 105, 20, { align: "center" });

    // Conteúdo das perguntas/respostas
    const pageHeight = doc.internal.pageSize.getHeight();
    const margemTopo = 45;
    const margemInferior = 20;
    const alturaLinha = 8;
    let y = margemTopo;

    respostas.forEach((resposta, index) => {
      const pergunta = perguntas[index];
      if (!pergunta) return;

      const textoPergunta = `${index + 1}. ${pergunta}`;
      const textoResposta = `${resposta}`;

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

    // Gerar e enviar o PDF
    const pdfBlob = doc.output("blob");
    const formData = new FormData();
    const nomeChecklist = nomeCliente.replace(/[^\w\s\-]/gi, '').replace(/\s+/g, '_') || 'checklist';

    formData.append("arquivo", pdfBlob, `${nomeChecklist}.pdf`);
    formData.append("itemId", itemId);
    
    fetch("https://checklist-final.onrender.com/api/upload-pdf", {
      method: "POST",
      body: formData
    })
      .then(() => console.log("✅ PDF enviado com sucesso"))
      .catch((error) => console.error("❌ Erro ao enviar o PDF:", error));
  });
}
