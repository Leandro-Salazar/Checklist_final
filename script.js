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
let etapaAnterior = null;
let arquivoSCDE = null;



const startButton = document.getElementById('startButton');
const loginBox = document.querySelector('.form-box.login');
const questionBox = document.querySelector('.form-box.question');
const toggleText = document.getElementById('toggleText');
const perguntaTexto = document.getElementById("perguntaTexto");
const respostaInput = document.getElementById("respostaInput");
const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");
const erroOpcao = document.getElementById("opcaoErro");
const uploadInput = document.getElementById("uploadFatura");
const arquivoSelecionado = document.getElementById("arquivoSelecionado");
const outroTextoContainer = document.getElementById("outroTextoContainer");
const outroTextoInput = document.getElementById("outroTexto");

document.getElementById("selectOpcoes").addEventListener("change", () => {
  const selecionados = Array.from(document.getElementById("selectOpcoes").selectedOptions).map(opt => opt.value);
  outroTextoContainer.style.display = selecionados.includes("Outro") ? "block" : "none";
});

    
uploadInput.addEventListener("change", () => {
  const erroUpload = document.getElementById("uploadErro");

  if (uploadInput.files.length > 0) {
    const arquivo = uploadInput.files[0];
    arquivoSelecionado.innerHTML = `
      <strong>Seu arquivo:</strong> ${arquivo.name} (${(arquivo.size / 1024).toFixed(1)} KB)
    `;
    erroUpload.style.display = "none"; // Esconde o erro ao selecionar arquivo
  } else {
    arquivoSelecionado.innerHTML = "";
  }
});


    document.getElementById("uploadSCDE").addEventListener("change", () => {
      const file = document.getElementById("uploadSCDE").files[0];
      const scdeSelecionado = document.getElementById("scdeSelecionado");
    
      if (file) {
        scdeSelecionado.innerHTML = `<strong>Arquivo:</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        arquivoSCDE = file;
      } else {
        scdeSelecionado.innerHTML = "";
        arquivoSCDE = null;
      }
    });
    

    function atualizarProgresso() {
      const progressoTexto = document.getElementById('progressText');
      if (progressoTexto) {
        progressoTexto.textContent = `Etapa ${etapaAtual + 1} de ${totalEtapas}`;
      }
    }
    
function devePularPergunta(index) {
  if (index <= 2) return false; 

  
  if (index === 4 && respostas[3]?.toLowerCase() !== "sim") return true;
  if ([6, 7, 8, 9].includes(index) && respostas[5]?.toLowerCase() !== "sim" && !(modoOutros && redirecionouOutros)) {
    return true;
  }
  

  if (modoArbitragem && (index < 3 || index > 11)) return true;

  if (modoPeakShaving) {
    if ([13, 14, 15, 16].includes(index)) return true; 
    if (index < 3 && index !== 12) return true; 
    if (modoPeakShaving && redirecionouPeak && index === 12) return true;
  }

  if (modoBackup) {
    
    if (!redirecionouBackup) {
      if (index < 13 || index > 16) return true;
    } else {
     
      if (index < 3 || index > 11) return true;
    }
  }  

  if (modoOutros) {
    if (redirecionouOutros) {
      // Após redirecionamento, mostrar apenas da 2 até 11
      if (index < 2 || index > 11) return true;
    } else {
      // Antes do redirecionamento, mostrar apenas de 12 a 16
      if (index < 12 || index > 16) return true;
    }
  }
  
  

  return false;
}

window.addEventListener('load', () => {
  atualizarProgresso();
});

startButton.addEventListener('click', () => {
  loginBox.style.display = 'none';
  questionBox.style.display = 'flex';
  atualizarPergunta();
  prevButton.style.display = 'none';

});

nextButton.addEventListener("click", async () => {
  if (etapaAtual === 1) {
    const file = document.getElementById("uploadFatura").files[0];
    const erroUpload = document.getElementById("uploadErro");
    const semFatura = document.getElementById("semFaturaCheckbox").checked;

    if (!file && !semFatura) {
      erroUpload.style.display = 'block';
      erroUpload.textContent = "Por favor, selecione um arquivo.";
      return;
    } else {
      erroUpload.style.display = 'none';
    }

    if (semFatura) {
      respostas[etapaAtual] = "Cliente não possui fatura no momento";
      arquivoFatura = null;
    } else {
      respostas[etapaAtual] = "Fatura anexada";
      arquivoFatura = file;
    }

  } else if (etapaAtual === 2) {
    const selectElement = document.getElementById("selectOpcoes");
    const selecionados = Array.from(selectElement.selectedOptions)
      .map(option => option.value)
      .filter(value => value !== "");

    if (selecionados.length === 0) {
      erroOpcao.style.display = 'block';
      erroOpcao.textContent = "Por favor, selecione uma opção válida.";
      return;
    } else {
      erroOpcao.style.display = 'none';
    }

    if (selecionados.includes("Outro")) {
      const outroTexto = outroTextoInput.value.trim();
      if (!outroTexto) {
        erroOpcao.style.display = 'block';
        erroOpcao.textContent = "Por favor, descreva sua opção personalizada.";
        return;
      }
      const index = selecionados.indexOf("Outro");
      if (index !== -1) {
        selecionados.splice(index, 1, outroTexto);
      }
    }

    respostas[etapaAtual] = selecionados.join(", ");
    etapaAnterior = 2;

    modoArbitragem = selecionados.includes("Arbitragem/Load Shifting");
    modoPeakShaving = selecionados.includes("Peak Shaving");
    modoBackup = selecionados.includes("Backup");
    modoOutros = selecionados.includes("Não sei, me ajude com isso") || selecionados.includes("Outro");

    if (modoArbitragem) etapaAtual = 2;
    if (modoPeakShaving) etapaAtual = 11;
    if (modoBackup) etapaAtual = 12;
    if (modoOutros) etapaAtual = 11;

  } else if ([3, 5].includes(etapaAtual)) {
    const selected = document.querySelector('input[name="respostaRadio"]:checked');
    if (!selected) {
      erroOpcao.style.display = 'block';
      erroOpcao.textContent = "Por favor, selecione uma opção antes de continuar.";
      return;
    } else {
      erroOpcao.style.display = 'none';
    }
    respostas[etapaAtual] = selected.value;

  } else if (etapaAtual === 12) {
    const scdeCheckbox = document.getElementById("scdeCheckbox");
    const scdeUpload = document.getElementById("uploadSCDE");
    const erroSCDE = document.getElementById("erroSCDE");

    if (scdeCheckbox.checked && scdeUpload.files.length === 0) {
      erroSCDE.style.display = "block";
      erroSCDE.textContent = "Por favor, anexe o arquivo SCDE.";
      return;
    } else {
      erroSCDE.style.display = "none";
    }

    respostas[etapaAtual] = respostaInput.value.trim();

  } else {
    respostas[etapaAtual] = respostaInput.value.trim();
  }

  // Redirecionamento após solução específica
  if (etapaAtual === 12 && modoPeakShaving && !redirecionouPeak) {
    etapaAtual = 2;
    redirecionouPeak = true;
  }
  if (etapaAtual === 16 && modoBackup && !redirecionouBackup) {
    etapaAtual = 2;
    redirecionouBackup = true;
  }
  if (etapaAtual === 16 && modoOutros && !redirecionouOutros) {
    etapaAtual = 2;
    redirecionouOutros = true;
  }

  do {
    etapaAtual++;
  } while (etapaAtual < totalEtapas && devePularPergunta(etapaAtual));

  if (respostas[2] && etapaAtual === 3) {
    if (modoPeakShaving && !redirecionouPeak) {
      etapaAtual = 11;
      redirecionouPeak = true;
    } else if (modoBackup && !redirecionouBackup) {
      etapaAtual = 12;
      redirecionouBackup = true;
    } else if (modoOutros && !redirecionouOutros) {
      etapaAtual = 11;
      redirecionouOutros = true;
    }
  }

  if (etapaAtual < totalEtapas) {
    atualizarPergunta();
    if (etapaAtual === totalEtapas - 1) nextButton.textContent = "Enviar";
  } else {
    finalizarFormulario();
  }

  atualizarProgresso();
});


prevButton.addEventListener("click", () => {
  if ([11, 12, 13, 14, 15, 16].includes(etapaAtual) && etapaAnterior === 2) {
    etapaAtual = 2;
    etapaAnterior = null; // limpa para não bugar em voltas futuras
  } else {
    etapaAtual--;
  
    while (etapaAtual > 2 && devePularPergunta(etapaAtual)) {
      etapaAtual--;
    }
  }
  
  if (etapaAtual === 2) {
    redirecionouPeak = false;
    redirecionouBackup = false;
    redirecionouOutros = false;
    modoArbitragem = false;
    modoPeakShaving = false;
    modoBackup = false;
    modoOutros = false;
  }
  

  if ([3, 5].includes(etapaAtual)) {
    const radios = document.querySelectorAll('input[name="respostaRadio"]');
    radios.forEach(r => r.checked = respostas[etapaAtual] === r.value);
    erroOpcao.style.display = "none";
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
  const scdeContainer = document.getElementById("scdeExtraContainer");
  const scdeCheckbox = document.getElementById("scdeCheckbox");
  const scdeUploadArea = document.getElementById("scdeUploadArea");

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
    inputBoxTexto.style.display = 'none';
    inputBoxArquivo.style.display = 'none';
    inputBoxCheckBox.style.display = 'none';
    inputBoxRadio.style.display = 'block';
  
    const radios = document.querySelectorAll('input[name="respostaRadio"]');
    radios.forEach(el => el.checked = respostas[etapaAtual] === el.value);
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

  if (etapaAtual === 12) {
    
    scdeContainer.style.display = "block";
  } else {
    scdeContainer.style.display = "none";
    scdeUploadArea.style.display = "none";
    scdeCheckbox.checked = false;
  }
  
  scdeCheckbox?.addEventListener("change", () => {
    scdeUploadArea.style.display = scdeCheckbox.checked ? "block" : "none";
  });
}

async function finalizarFormulario() {
  respostas[etapaAtual] = respostaInput.value.trim();
  const form = document.getElementById("formPerguntas");
  form.innerHTML = `<div class="finalizacao"><h2>Enviando CheckList, aguarde...</h2><p>Aguarde enquanto salvamos suas respostas.</p></div>`;

  try {
    const response = await fetch("https://checklist-final.onrender.com/api/enviar-formulario", {
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

        await fetch("https://checklist-final.onrender.com/api/upload-pdf", {
          method: "POST",
          body: formData
        });
      } 
      if (arquivoSCDE) {
        respostas.push("Arquivo SCDE anexado");
      
        const formDataSCDE = new FormData();
        formDataSCDE.append("arquivo", arquivoSCDE);
        formDataSCDE.append("itemId", itemId);
        formDataSCDE.append("coluna", "file_mkqq7eha"); // substitua pelo ID correto, se necessário
      
        await fetch("https://checklist-final.onrender.com/api/upload-pdf", {
          method: "POST",
          body: formDataSCDE
        });
      
      } else {
        respostas.push("Arquivo SCDE não anexado");
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
