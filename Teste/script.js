// script.js
import { perguntas, placeholders, curiosidades, imagensPerguntas } from './data.js';
import { gerarPDF } from './geradorPDF.js';

let etapaAtual = 0;
const totalEtapas = perguntas.length;
const respostas = [];
let arquivoFatura = null;

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

function checkScreenSize() {
  progressContainer.style.display = window.innerWidth > 768 ? 'block' : 'none';
}

function atualizarProgresso() {
  const progresso = Math.round((etapaAtual / totalEtapas) * 100);
  progressBar.style.width = `${progresso}%`;
  progressText.textContent = `${progresso}%`;
}

window.addEventListener('load', () => {
  checkScreenSize();
  atualizarProgresso();
});
window.addEventListener('resize', checkScreenSize);

startButton.addEventListener('click', () => {
  loginBox.style.display = 'none';
  questionBox.style.display = 'flex';
  atualizarPergunta();
  prevButton.style.display = 'none';
  checkScreenSize();
});

nextButton.addEventListener("click", async () => {
  if (etapaAtual === 1) {
    const file = document.getElementById("uploadFatura").files[0];
    if (!file) {
      alert("Por favor, envie a fatura de energia antes de continuar.");
      return;
    }
    arquivoFatura = file;
    respostas[etapaAtual] = "Fatura anexada";
  } else if (etapaAtual === 2) {
    const selectElement = document.getElementById("selectOpcoes");
    const selecionados = Array.from(selectElement.selectedOptions).map(option => option.value);
    respostas[etapaAtual] = selecionados.length > 0 ? selecionados.join(", ") : "Nenhuma opção selecionada";
  }
   else {
    respostas[etapaAtual] = respostaInput.value.trim();
  }
  
  etapaAtual++;

  if (etapaAtual < totalEtapas) {
    atualizarPergunta();
    if (etapaAtual === totalEtapas - 1) nextButton.textContent = "Enviar";
  } else {
    finalizarFormulario();
  }
  atualizarProgresso();
});

prevButton.addEventListener("click", () => {
  if (etapaAtual > 0) etapaAtual--;
  atualizarPergunta();
  atualizarProgresso();
});

function atualizarPergunta() {
  perguntaTexto.textContent = perguntas[etapaAtual];
  respostaInput.value = respostas[etapaAtual] || "";
  respostaInput.placeholder = "Digite aqui...";
  const textoAjuda = document.getElementById("textoAjuda");
  textoAjuda.textContent = placeholders[etapaAtual] || "";
  toggleText.innerHTML = `<h1>${curiosidades[etapaAtual] || "Obrigado por responder!"}</h1>`;

  prevButton.style.display = etapaAtual === 0 ? 'none' : 'inline-block';

  const inputBoxTexto = document.getElementById("inputBoxTexto");
  const inputBoxArquivo = document.getElementById("inputBoxArquivo");
  const inputBoxCheckBox = document.getElementById("inputBoxCheckBox");

  if (etapaAtual === 1) {
    inputBoxTexto.style.display = 'none';
    inputBoxArquivo.style.display = 'block';
    inputBoxCheckBox.style.display = 'none';
  } else if (etapaAtual === 2) {
    inputBoxTexto.style.display = 'none';
    inputBoxArquivo.style.display = 'none';
    inputBoxCheckBox.style.display = 'block'
  } else{
    inputBoxTexto.style.display = 'block';
    inputBoxArquivo.style.display = 'none';
    inputBoxCheckBox.style.display = 'none'
  }

  setTimeout(() => respostaInput.focus(), 50);

  const painelLateral = document.querySelector('.toggle-panel.toggle-left');
  const novaImagem = imagensPerguntas[etapaAtual % imagensPerguntas.length];
  const styleTag = document.getElementById('dynamic-bg-style') || (() => {
    const style = document.createElement('style');
    style.id = 'dynamic-bg-style';
    document.head.appendChild(style);
    return style;
  })();
  styleTag.innerHTML = `.toggle-panel.toggle-left::after { background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${novaImagem}'); }`;
  painelLateral.classList.add('show-new-bg');
  setTimeout(() => painelLateral.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${novaImagem}')`, 800);
  setTimeout(() => painelLateral.classList.remove('show-new-bg'), 1600);
}

async function finalizarFormulario() {
  respostas[etapaAtual] = respostaInput.value.trim();
  const form = document.getElementById("formPerguntas");
  form.innerHTML = `<div class="finalizacao"><h2>Enviando para nossa plataforma...</h2><p>Aguarde enquanto salvamos suas respostas.</p></div>`;

  try {
    const response = await fetch("http://localhost:3000/api/enviar-formulario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas })
    });

    const result = await response.json();
    const itemId = result.data?.create_item?.id;

    if (itemId) {
      if (arquivoFatura) {
        const formData = new FormData();
        formData.append("arquivo", arquivoFatura);
        formData.append("itemId", itemId);
        formData.append("coluna", "file_mkq2g4mm")

        await fetch("http://localhost:3000/api/upload-pdf", {
          method: "POST",
          body: formData
        });
      }

      await gerarPDF(respostas, perguntas, itemId);

      form.innerHTML = `<div class="finalizacao"><h2>Checklist enviado!</h2><p>Seu formulário foi registrado em nossa plataforma.</p></div>`;
    } else {
      throw new Error("Erro ao salvar item no Monday");
    }
  } catch (err) {
    form.innerHTML = `<div class="finalizacao"><h2>Erro ao enviar</h2><p>${err.message}</p></div>`;
  }
}
