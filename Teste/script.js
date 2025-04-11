
import { perguntas, placeholders, curiosidades, imagensPerguntas } from './data.js';
import { gerarPDF } from './geradorPDF.js';



let etapaAtual = 0;
const totalEtapas = perguntas.length;
const respostas = [];
 
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
window.addEventListener('load', () => {
  checkScreenSize();  
  atualizarProgresso(); 
});

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
 

 
async function finalizarFormulario() {
  respostas[etapaAtual] = respostaInput.value.trim();

  try {
    const form = document.getElementById("formPerguntas");
    form.innerHTML = `
      <div class="finalizacao">
        <h2>Enviando para nossa plataforma...</h2>
        <p>Aguarde enquanto salvamos suas respostas.</p>
      </div>`;

    const response = await fetch("http://localhost:3000/api/enviar-formulario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ respostas })
    });

    const result = await response.json();

    if (result.data?.create_item?.id) {
      form.innerHTML = `
        <div class="finalizacao">
          <h2>Checklist enviado!</h2>
          <p>Seu formulário foi registrado em nossa plataforma.<br>
          Você será direcionado para nosso site em breve!</p>
        </div>`;

      // ✅ Chama função externa para gerar o PDF estilizado e enviar
      await gerarPDF(respostas, perguntas, result.data.create_item.id);
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
  }
} 