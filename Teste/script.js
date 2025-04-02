let etapaAtual = 0;
const totalEtapas = perguntas.length;
const respostas = [];

// Configurações do Monday.com
const MONDAY_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5MjM2MDA1MCwiYWFpIjoxMSwidWlkIjo3MzQ1MjY3MiwiaWFkIjoiMjAyNS0wMy0yOFQxNTozNzozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTgzNzg0NDMsInJnbiI6InVzZTEifQ.2qLzYivYuqpDvc8554M8TVYt-tAZl4LMzhuX6il8au4";
const MONDAY_BOARD_ID = 8821870387;

// Elementos do DOM
const startButton = document.getElementById('startButton');
const loginBox = document.querySelector('.form-box.login');
const questionBox = document.querySelector('.form-box.question');
const toggleText = document.getElementById('toggleText');
const perguntaTexto = document.getElementById("perguntaTexto");
const respostaInput = document.getElementById("respostaInput");
const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");

// Ao clicar em "Vamos Lá!"
startButton.addEventListener('click', () => {
  loginBox.style.display = 'none';
  questionBox.style.display = 'flex';
  atualizarPergunta();
  prevButton.style.display = 'none';

  setTimeout(() => {
    respostaInput.focus();
  }, 100);
});

// Ao clicar em "Próxima"
nextButton.addEventListener("click", () => {
  respostas[etapaAtual] = respostaInput.value.trim();
  etapaAtual++;

  if (etapaAtual < totalEtapas - 1) {
    atualizarPergunta();
  } else if (etapaAtual === totalEtapas - 1) {
    atualizarPergunta();
    nextButton.textContent = "Enviar";
  } else {
    finalizarFormulario();
  }
});

// Ao clicar em "Anterior"
prevButton.addEventListener("click", () => {
  if (etapaAtual > 0) {
    etapaAtual--;
    atualizarPergunta();
  }
});

function atualizarPergunta() {
  perguntaTexto.textContent = perguntas[etapaAtual];
  respostaInput.value = respostas[etapaAtual] || "";
  const textoAjuda = document.getElementById("textoAjuda");
  textoAjuda.textContent = placeholders[etapaAtual] || "";
  respostaInput.placeholder = "Digite aqui...";

  toggleText.innerHTML = `<h1>${curiosidades[etapaAtual] || "Obrigado por responder!"}</h1>`;

  prevButton.style.display = etapaAtual === 0 ? 'none' : 'inline-block';
  nextButton.textContent = etapaAtual === totalEtapas - 1 ? "Enviar" : "Próxima";

  respostaInput.style.display = 'block';
  nextButton.style.display = 'inline-block';
  setTimeout(() => {
    respostaInput.focus();
  }, 50);

  const painelLateral = document.querySelector('.toggle-panel.toggle-left');
  const indiceImagem = etapaAtual % imagensPerguntas.length;
  const novaImagem = imagensPerguntas[indiceImagem];

  const styleTag = document.getElementById('dynamic-bg-style') || (() => {
    const style = document.createElement('style');
    style.id = 'dynamic-bg-style';
    document.head.appendChild(style);
    return style;
  })();

  styleTag.innerHTML = `
    .toggle-panel.toggle-left::after {
      background-image:
        linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
        url('${novaImagem}');
    }
  `;

  painelLateral.classList.add('show-new-bg');

  setTimeout(() => {
    painelLateral.style.backgroundImage = `
      linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
      url('${novaImagem}')
    `;
  }, 800);

  setTimeout(() => {
    painelLateral.classList.remove('show-new-bg');
  }, 1600);
}

// GERA E ENVIA PDF
async function gerarEPDF(itemId, respostas, perguntas, mondayToken, columnId = "file_mkpjwzm") {
  try {
    const doc = new window.jspdf.jsPDF();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Checklist Técnico - You.On", 10, 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let y = 30;
    for (let i = 0; i < respostas.length; i++) {
      const pergunta = perguntas[i] || `Pergunta ${i + 1}`;
      const resposta = respostas[i] || "Não informado";

      doc.text(`${i + 1}. ${pergunta}`, 10, y);
      y += 7;
      doc.text(`Resposta: ${resposta}`, 12, y);
      y += 10;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    const pdfBlob = doc.output("blob");
    const pdfFile = new File([pdfBlob], "Checklist_Tecnico_YouOn.pdf", { type: "application/pdf" });

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("itemId", itemId);
    formData.append("columnId", columnId);

    const res = await fetch("https://check-list-one.vercel.app/api/upload-pdf", {
      method: "POST",
      body: formData,
    });
    
    const text = await res.text();
    
    try {
      const result = JSON.parse(text);
      if (!result?.data?.add_file_to_column?.id) {
        throw new Error("Erro ao anexar o PDF via backend (Vercel).");
      }
      console.log("✅ PDF enviado com sucesso pela rota /api/upload-pdf");
    } catch (err) {
      throw new Error("Erro ao interpretar resposta do backend: " + text);
    }
  } catch (err) {
    console.error("❌ Erro ao gerar/enviar PDF via rota backend:" + text);
  }
}

// FINALIZA FORMULÁRIO
async function finalizarFormulario() {
  respostas[etapaAtual] = respostaInput.value.trim();

  try {
    const form = document.getElementById("formPerguntas");
    form.innerHTML = `
      <div class="finalizacao">
        <h2>Enviando para nossa plataforma...</h2>
        <p>Aguarde enquanto salvamos suas respostas.</p>
      </div>`;

    const columnValues = {
      text_mkpjsmpc: respostas[0] || "Não informado",
      text_mkpj3d37: respostas[1] || "Não informado",
      text_mkpjsfrs: respostas[2] || "Não informado",
      text_mkpjybzm: respostas[3] || "Não informado",
      text_mkpj97jw: respostas[4] || "Não informado",
      text_mkpj4ffz: respostas[5] || "Não informado",
      text_mkpjab1d: respostas[6] || "Não informado",
      text_mkpj3h7a: respostas[7] || "Não informado",
      text_mkpjvnnq: respostas[8] || "Não informado",
      text_mkpjyxr7: respostas[9] || "Não informado",
      text_mkpjfymr: respostas[10] || "Não informado",
      text_mkpjycdk: respostas[11] || "Não informado",
      text_mkpjmap: respostas[12] || "Não informado",
      text_mkpjr0bc: respostas[13] || "Não informado",
      text_mkpj1prj: respostas[14] || "Não informado",
      text_mkpj3yza: respostas[15] || "Não informado",
      text_mkpjkg81: respostas[16] || "Não informado",
      text_mkpjrrx1: respostas[17] || "Não informado",
      text_mkpjswmv: respostas[18] || "Não informado",
      text_mkpj9c1b: respostas[19] || "Não informado",
      text_mkpjzpdx: respostas[20] || "Não informado",
      text_mkpj4ay: respostas[21] || "Não informado",
      text_mkpj98d6: respostas[22] || "Não informado",
      text_mkpjwtgj: respostas[23] || "Não informado",
      text_mkpjj31v: respostas[24] || "Não informado",
      text_mkpjn1jp: respostas[25] || "Não informado",
      text_mkpj6st5: respostas[26] || "Não informado",
    };

    const mutation = {
      query: `mutation {
        create_item(
          board_id: ${MONDAY_BOARD_ID},
          item_name: "Checklist ${respostas[0] || 'Novo'} - ${new Date().toLocaleDateString()}",
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) { id }
      }`
    };

    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Authorization": MONDAY_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mutation)
    });

    const result = await response.json();
    if (result.data?.create_item?.id) {
      const itemId = result.data.create_item.id;
      await gerarEPDF(itemId, respostas, perguntas, MONDAY_API_TOKEN);

      form.innerHTML = `
        <div class="finalizacao">
          <h2>Checklist enviado!</h2>
          <p>Seu formulário foi registrado em nossa plataforma.<br>ID: ${itemId}<br>Redirecionando em 5 segundos...</p>
        </div>`;
    } else {
      throw new Error('Erro desconhecido ao enviar para Monday');
    }
  } catch (error) {
    const form = document.getElementById("formPerguntas");
    form.innerHTML = `
      <div class="finalizacao">
        <h2>Erro ao enviar</h2>
        <p>${error.message}</p>
        <button onclick="window.location.reload()" class="btn">Tentar novamente</button>
      </div>`;
    console.error("Erro detalhado:", error);
  } finally {
    setTimeout(() => {
      window.location.href = "https://www.youonenergy.com/";
    }, 5000);
  }
}
