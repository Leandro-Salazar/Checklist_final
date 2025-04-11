export async function gerarPDF(respostas, perguntas, itemId) {
    import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
      
        const pageHeight = doc.internal.pageSize.getHeight();
        const margemTopo = 20;
        const margemInferior = 20;
        const alturaLinha = 8;
        let y = margemTopo;
      
        respostas.forEach((resposta, index) => {
          const pergunta = perguntas[index];
          const textoPergunta = `${index + 1}. ${pergunta}`;
          const textoResposta = `Resposta: ${resposta}`;
      
          const linhasPergunta = doc.splitTextToSize(textoPergunta, 180);
          const linhasResposta = doc.splitTextToSize(textoResposta, 180);
      
          const alturaBloco = (linhasPergunta.length + linhasResposta.length) * alturaLinha + 4;
      
          // Se não houver espaço suficiente na página atual, cria nova
          if (y + alturaBloco > pageHeight - margemInferior) {
            doc.addPage();
            y = margemTopo;
          }
      
          doc.setFontSize(10);
          doc.text(linhasPergunta, 10, y);
          y += linhasPergunta.length * alturaLinha;
      
          doc.setFontSize(12);
          doc.text(linhasResposta, 10, y);
          y += linhasResposta.length * alturaLinha + 6;
        });
      
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
      });
    }