
 
let etapaAtual = 0;
const totalEtapas = perguntas.length;
const respostas = [];
 
// Configurações do Monday.com
const MONDAY_API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5MjIxMzY5MCwiYWFpIjoxMSwidWlkIjo3Mzg3MDM0MSwiaWFkIjoiMjAyNS0wMy0yOFQxMToyOTowMS4yODVaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg2OTUyNjYsInJnbiI6InVzZTEifQ.MaWoehZB1adED02JlS9HHak3yZFie9ChPD9V6ZLTKjQ";
const MONDAY_BOARD_ID = 8804798077;
 
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
  const novaImagem = imagensPerguntas[etapaAtual];

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
  painelLateral.style.backgroundImage = `
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url('${novaImagem}')
  `;
}, 800); 
setTimeout(() => {
  painelLateral.classList.remove('show-new-bg');
}, 1600);
  
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
      text_mkpfpsxv: respostas[0] || "Não informado",
      text_mkpfjtrm: respostas[1] || "Não informado",
      text_mkpf5mqb: respostas[2] || "Não informado",
      text_mkpf3ekf: respostas[3] || "Não informado",
      text_mkpfsqdz: respostas[4] || "Não informado",
      text_mkpfjzyb: respostas[5] || "Não informado",
      text_mkpfk1pt: respostas[6] || "Não informado",
      text_mkpf3epb: respostas[7] || "Não informado",
      text_mkpfd1dz: respostas[8] || "Não informado",
      text_mkpfftt: respostas[9] || "Não informado",
      text_mkpf601k: respostas[10] || "Não informado",
      text_mkpf6sng: respostas[11] || "Não informado",
      text_mkpf8e37: respostas[12] || "Não informado",
      text_mkpfe85s: respostas[13] || "Não informado",
      text_mkpfpaen: respostas[14] || "Não informado",
      text_mkpfkve5: respostas[15] || "Não informado",
      text_mkpfntst: respostas[16] || "Não informado",
      text_mkpfw19b: respostas[17] || "Não informado",
      text_mkpfczdz: respostas[18] || "Não informado",
      text_mkpf4ck7: respostas[19] || "Não informado",
      text_mkpf2v5t: respostas[20] || "Não informado",
      text_mkpfpx5v: respostas[21] || "Não informado",
      text_mkpfbx0b: respostas[22] || "Não informado",
      text_mkpfzspc: respostas[23] || "Não informado",
      text_mkpfgctg: respostas[24] || "Não informado",
      text_mkpf7abc: respostas[25] || "Não informado"
    };
    
    // 2. Depois criamos a mutation com os valores formatados corretamente
    const mutation = {
      query: `mutation {
        create_item(
          board_id: ${MONDAY_BOARD_ID},
          item_name: "Checklist ${respostas[0] || 'Novo'} - ${new Date().toLocaleDateString()}",
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) { id }
      }`
    };
 
    console.log("Dados sendo enviados:", mutation); // Para debug
 
    // 3. Finalmente fazemos o fetch com os dados preparados
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Authorization": MONDAY_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mutation)
    });
 
    const result = await response.json();
    console.log("Resposta da API:", result); // Para debug
   
    if (result.data?.create_item?.id) {
      form.innerHTML = `
      <div class="finalizacao">
        <h2>Checklist enviado!</h2>
        <p>Seu formulário foi registrado em nossa plataforma.<br>
        ID: ${result.data.create_item.id}<br>
        Redirecionando em 5 segundos...</p>
      </div>`;
    } else {
      throw new Error(result.errors?.[0]?.message || 'Erro desconhecido ao enviar para Monday');
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