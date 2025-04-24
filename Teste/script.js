import { perguntas, placeholders, curiosidades, imagensPerguntas } from './data.js';
import { gerarPDF } from './geradorPDF.js';

let etapaAtual = 0;
const totalEtapas = perguntas.length;
const respostas = [];
let arquivoFatura = null;
let modoArbitragem = false;
let modoPeakShaving = false;
let modoBackup = false;
let modoOutros = false;
let redirecionouPeak = false;
let redirecionouBackup = false;
let redirecionouOutros = false;

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

function devePularPergunta(index) {
  if (index <= 2) return false; // Etapas fixas (nome, fatura, tipo)

  // Lógica SIM/NÃO para todas as opções
  if (index === 4 && respostas[3]?.toLowerCase() !== "sim") return true;
  if ([6, 7, 8, 9].includes(index) && respostas[5]?.toLowerCase() !== "sim") return true;

  // Regras por modo
  if (modoArbitragem && (index < 3 || index > 11)) return true;

  if (modoPeakShaving) {
    if ([13, 14, 15, 16].includes(index)) return true; // Pula cargas críticas
    if (index < 3 && index !== 12) return true; // Só permite 12 antes da lógica
    if (modoPeakShaving && redirecionouPeak && index === 12) return true;
  }

  if (modoBackup) {
    // Permite etapas 13 a 16 antes do redirecionamento
    if (!redirecionouBackup) {
      if (index < 13 || index > 16) return true;
    } else {
      // Após as perguntas iniciais, permite apenas 3 a 11
      if (index < 3 || index > 11) return true;
    }
  }  

  if (modoOutros) {
    // Antes do redirecionamento, só mostra 12 a 16
    if (!redirecionouOutros && (index < 12 || index > 16)) return true;
  
    // Depois do redirecionamento, mostra apenas 3 a 11 (com lógica sim/não)
    if (redirecionouOutros) {
      if (index === 12) return true; // 👈 EVITA repetição da pergunta 12
      if (index < 3 || index > 11) return true;
    }
  }
  

  return false;
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
    const erroUpload = document.getElementById("uploadErro");

    if (!file) {
      erroUpload.style.display = 'block';
      erroUpload.textContent = "Por favor, selecione um arquivo.";
      return;
    } else {
      erroUpload.style.display = 'none';
    }
    
    arquivoFatura = file;
    respostas[etapaAtual] = "Fatura anexada";
  } else if (etapaAtual === 2) {
    const selectElement = document.getElementById("selectOpcoes");
    const selecionados = Array.from(selectElement.selectedOptions).map(option => option.value);
    respostas[etapaAtual] = selecionados.length > 0 ? selecionados.join(", ") : "Nenhuma opção selecionada";

    modoArbitragem = selecionados.includes("Arbitragem");
    modoPeakShaving = selecionados.includes("Peak Shaving");
    modoBackup = selecionados.includes("Backup");
    modoOutros = selecionados.includes("Outros");

    if (modoArbitragem) etapaAtual = 2;
    if (modoPeakShaving) etapaAtual = 11;
    if (modoBackup) etapaAtual = 12;
    if (modoOutros) etapaAtual = 11;
  } else if ([3, 5].includes(etapaAtual)) {
    // Captura a resposta do radio
    const selected = document.querySelector('input[name="respostaRadio"]:checked');
    if (!selected) {
      alert("Por favor, selecione uma opção.");
      return;
    }
    respostas[etapaAtual] = selected.value;
  } else {
    respostas[etapaAtual] = respostaInput.value.trim();
  }

  // Se a etapa atual for 12 e o modo for Peak Shaving, vamos manualmente para a 3
  if (etapaAtual === 12 && modoPeakShaving && !redirecionouPeak) {
    etapaAtual = 2; 
    redirecionouPeak = true; 
  }

  if (etapaAtual === 16 && modoBackup && !redirecionouBackup) {
    etapaAtual = 2; 
    redirecionouBackup = true;
  }
  
  if (etapaAtual === 16 && modoOutros && !redirecionouOutros) {
    etapaAtual = 2; // a próxima será 3
    redirecionouOutros = true;
  
  }

  do {
    etapaAtual++;
  } while (etapaAtual < totalEtapas && devePularPergunta(etapaAtual));

  if (etapaAtual < totalEtapas) {
    atualizarPergunta();
    if (etapaAtual === totalEtapas - 1) nextButton.textContent = "Enviar";
  } else {
    finalizarFormulario();
  }

  atualizarProgresso();
});

prevButton.addEventListener("click", () => {
  do {
    etapaAtual--;
  } while (etapaAtual > 2 && devePularPergunta(etapaAtual));

  // 👉 Ao voltar, limpa seleção de radio se estiver visível
  if ([3, 5].includes(etapaAtual)) {
    const radios = document.querySelectorAll('input[name="respostaRadio"]');
    radios.forEach(r => r.checked = respostas[etapaAtual] === r.value);
  }

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
  const inputBoxRadio = document.getElementById("inputBoxRadio");

  if (etapaAtual === 1) {
    inputBoxTexto.style.display = 'none';
    inputBoxArquivo.style.display = 'block';
    inputBoxCheckBox.style.display = 'none';
    inputBoxRadio.style.display = 'none';
  } else if (etapaAtual === 2) {
    inputBoxTexto.style.display = 'none';
    inputBoxArquivo.style.display = 'none';
    inputBoxCheckBox.style.display = 'block';
    inputBoxRadio.style.display = 'none';
  } else if ([3, 5].includes(etapaAtual)) {
    // Perguntas com SIM/NÃO (FV e Gerador)
    inputBoxTexto.style.display = 'none';
    inputBoxArquivo.style.display = 'none';
    inputBoxCheckBox.style.display = 'none';
    inputBoxRadio.style.display = 'block';
    document.querySelectorAll('input[name="respostaRadio"]').forEach(el => el.checked = false);
  } else {
    inputBoxTexto.style.display = 'block';
    inputBoxArquivo.style.display = 'none';
    inputBoxCheckBox.style.display = 'none';
    inputBoxRadio.style.display = 'none';
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
        formData.append("coluna", "file_mkq2g4mm");

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
