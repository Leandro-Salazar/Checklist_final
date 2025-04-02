
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
const progressBar = document.querySelector('.progress-bar');
const progressText = document.getElementById('progressText');
const progressContainer = document.querySelector('.progress-container');
 
// Verifica se é mobile para mostrar/ocultar a barra de progresso
function checkScreenSize() {
    if (window.innerWidth > 768) { // Mostra apenas em telas maiores que 768px
        progressContainer.style.display = 'block';
    } else {
        progressContainer.style.display = 'none';
    }
}
 
// Atualiza a barra de progresso
function atualizarProgresso() {
    const progresso = Math.round((etapaAtual / totalEtapas) * 100);
    progressBar.style.width = `${progresso}%`;
    progressText.textContent = `${progresso}%`;
}
 
// Ao carregar a página
window.addEventListener('load', checkScreenSize);
window.addEventListener('resize', checkScreenSize);
 
// Ao clicar em "Vamos Lá!"
startButton.addEventListener('click', () => {
  loginBox.style.display = 'none';
  questionBox.style.display = 'flex';
  atualizarPergunta();
  prevButton.style.display = 'none';
  checkScreenSize(); // Verifica novamente ao iniciar
 
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
  atualizarProgresso(); // Atualiza o progresso após avançar
});
 
// Ao clicar em "Anterior"
prevButton.addEventListener("click", () => {
  if (etapaAtual > 0) {
    etapaAtual--;
    atualizarPergunta();
    atualizarProgresso(); // Atualiza o progresso ao voltar
  }
});
 
// Atualiza a pergunta e curiosidade
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
 
  // Transição fluida de imagem com overlay ::after
  const painelLateral = document.querySelector('.toggle-panel.toggle-left');
  const novaImagem = imagensPerguntas[etapaAtual % imagensPerguntas.length];

 
  // Cria ou atualiza a <style> dinâmica
  const styleTag = document.getElementById('dynamic-bg-style') || (() => {
    const style = document.createElement('style');
    style.id = 'dynamic-bg-style';
    document.head.appendChild(style);
    return style;
  })();
 
  // Define a nova imagem no ::after
  styleTag.innerHTML = `
    .toggle-panel.toggle-left::after {
      background-image:
        linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
        url('${novaImagem}');
    }
  `;
 
  painelLateral.classList.add('show-new-bg');
 
  setTimeout(() => {
    painelLateral.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${novaImagem}')`;
  }, 800);
  setTimeout(() => {
    painelLateral.classList.remove('show-new-bg');
  }, 1600);
}
 
async function gerarPDF(respostas) {
  const { jsPDF } = window.jspdf;  // Desestruturando a biblioteca jsPDF
  const doc = new jsPDF();
 
  // Adicionando título ao PDF
  doc.setFontSize(16);
  doc.text("Formulário - Respostas", 20, 20);
 
  // Adicionando as perguntas e respostas
  let yPosition = 30;  // Posição Y inicial
  perguntas.forEach((pergunta, index) => {
    const resposta = respostas[index] || "Não informado";
    doc.setFontSize(12);
    doc.text(`${pergunta}: ${resposta}`, 20, yPosition);
    yPosition += 10; // Espaçamento entre as perguntas
  });
 
  // Gerar o arquivo PDF
  const pdfBase64 = doc.output('datauristring');
  return pdfBase64;
}
 
async function enviarPDFParaColuna(pdfFile, itemId, colunaId) {
  const formData = new FormData();
  formData.append('file', pdfFile);  // Adiciona o arquivo PDF gerado
  formData.append('item_id', itemId); // Adiciona o ID do item no Monday
  formData.append('column_id', colunaId); // Adiciona o ID da coluna de arquivos
 
  try {
    const response = await fetch('https://api.monday.com/v2/files', {
      method: 'POST',
      headers: {
        'Authorization': MONDAY_API_TOKEN
      },
      body: formData
    });
 
    const result = await response.json();
    if (result.data?.add_file_to_column?.id) {
      console.log("Arquivo PDF enviado com sucesso para a coluna!");
    } else {
      throw new Error('Erro ao enviar o arquivo PDF para a coluna');
    }
  } catch (error) {
    console.error("Erro ao enviar o arquivo PDF para a coluna:", error);
  }
}
 
async function finalizarFormulario() {
  respostas[etapaAtual] = respostaInput.value.trim();
 
  try {
    const form = document.getElementById("formPerguntas");
    form.innerHTML = `
      <div class="finalizacao">
        <h2>Enviando para nossa plataforma...</h2>
        <p>Aguarde enquanto salvamos suas respostas.</p>
      </div>`;
 
    // 1. Primeiro construímos o objeto com todas as respostas
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
 
    // 2. Criar a mutação para criar o item no Monday.com
    const mutation = {
      query: `mutation {
        create_item(
          board_id: ${MONDAY_BOARD_ID},
          item_name: "Checklist ${respostas[0] || 'Novo'} - ${new Date().toLocaleDateString()}",
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) { id }
      }`
    };
 
    // 3. Enviar a mutação para criar o item
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Authorization": process.env.MONDAY_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mutation)
    });
 
    const result = await response.json();
    if (result.data?.create_item?.id) {
      // Gerar o PDF
      const pdfBase64 = await gerarPDF(respostas);
 
      // Converte o base64 para um Blob para envio
      const pdfBlob = await fetch(pdfBase64).then(res => res.blob());
      const pdfFile = new File([pdfBlob], "respostas_checklist.pdf", { type: "application/pdf" });
 
      // ID do item criado
      const itemId = result.data.create_item.id;
 
      // ID da coluna de arquivo
      const colunaId = "file_mkpjwzm"; // Coluna de arquivos no Monday
 
      // Enviar o PDF para a coluna de arquivo
      await enviarPDFParaColuna(pdfFile, itemId, colunaId);
 
      form.innerHTML = `
        <div class="finalizacao">
          <h2>Checklist enviado!</h2>
          <p>Seu formulário foi registrado em nossa plataforma.<br>
          Você será direcionado para nosso site em breve!</p>
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
 
 
 