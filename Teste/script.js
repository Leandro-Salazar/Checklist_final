const placeholders = [
    "Ex.: Carlos Alberto",
    "Ex.: 1000KW",
    "Ex.: Sim",
    "Ex.: O maior excedente durante o dia é de 100KW por 2 horas.",
    "Ex.: Em anexo segue o perfil diário de consumo da planta",
    "Ex.: Sim",
    "Ex.: 40% dos 735KW totais, isto é aproximadamente 294KW.",
    "Ex.: 2 motores de 100CV (75KW) não apresentam inversores de frequência e partem diretamente na rede. Os demais são controlados por inversor de frequência.",
    "Ex.: Segue anexo lista de cargas da planta",
    "Ex.: Sim",
    "Ex.: 20 ms",
    "Ex.: Hoje temos 200KW em cargas críticas, isto é, 20% do total das cargas não podem parar.",
    "Ex.: Dos 200KW de cargas críticas, 75% são cargas indutivas, isto é, 150KW	",
    "Ex.: Não",
    "Ex.: Existe uma área de 200m2 para instalação de uma planta",
    "Ex.: Modalidade A3 Verde com tarifa ponta e fora ponta.",
    "Ex.: Aparentemente existe mas não sei em quanto estimar este excedente",
    "Ex.: Sim, 250KVA em 380Vca",
    "Ex.: R$5,70 por litro",
    "Ex.: O gerador diesel hoje é utilizado nos horários de ponta das 17h até às 20h",
    "Ex.: A rede elétrica cai cerca de 5 vezes ao ano com duração média de 1 hora",
    "Ex.: Será instalado na subestação na barra de 13,8KV",
    "Ex.: 100 metros até a subestação.",
    "Ex.: O sistema deverá ser instalado em sala elétrica a ser construida pelo proponente com dimensões máximas de 10m x 20m. É uma região distante do mar e portanto sem salinidade. Entretanto a umidade na região é alta, na ordem de 95%, e não se trata de uma área classificada.",
    "Ex.: Sim, existe um superviório da empresa XXXX que deve conversar com o novo sistema de armazenamento com comunicação Modbus TCP IP.",
    "Ex.: Seguem os desenhos elétricos em anexo.",
    "Ex.: Cotar em regime turn key, o qual engloba EPC e serviços de M&M",
  ];
  

const curiosidades = [
    "Você sabia? A You.On é pioneira em armazenamento de energia no Brasil.",
    "Você sabia? A You.On é pioneira em armazenamento de energia no Brasil.",
    "A You.On já economizou mais de 500 toneladas de CO₂ com seus projetos.",
    "Temos soluções em mais de 8 estados brasileiros.",
    "Nossos sistemas suportam automação e monitoramento em tempo real.",
    "Você pode acompanhar seu consumo pelo nosso app exclusivo.",
    "Trabalhamos com as maiores marcas de baterias do mundo.",
    "Nossos técnicos são certificados internacionalmente.",
    "Fazemos manutenção preventiva e corretiva especializada.",
    "Oferecemos suporte 24h em projetos críticos.",
    "Participamos de feiras de inovação energética em 3 continentes.",
    "Projetamos soluções sob medida para cada cliente.",
    "Usamos IA para otimizar o consumo de energia.",
    "Somos parceiros oficiais da Tesla Energy.",
    "Mais de 200 empresas confiam em nossa tecnologia.",
    "Somos destaque em revistas de energia renovável.",
    "Temos a menor taxa de falha em sistemas on-grid.",
    "Desenvolvemos soluções para comunidades isoladas.",
    "Ajudamos empresas a reduzir até 60% da conta de luz.",
    "Nossa equipe é 100% dedicada ao cliente.",
    "Você pode simular seu sistema direto no nosso site.",
    "Nosso tempo médio de instalação é de 72h.",
    "Acompanhamos os resultados por até 12 meses.",
    "Temos programas de fidelidade para clientes recorrentes.",
    "Você pode integrar nosso sistema com Alexa e Google.",
    "Estamos construindo o maior banco de baterias do país.",
    "A sustentabilidade é um dos pilares da You.On."
  ];
  
  const perguntas = [
    "Digite seu nome: ",
    "Qual é a demanda contratada da concessionária em kW (máxima potência entregue pela subestação)?",
    "A empresa nos dias atuais sofre alguma penalização da concessionária por exceder essa demanda contratada ?",
    "Caso haja essa penalização, em quantos KW se estima que seja esse excedente e por quanto tempo ? Se existirem vários excedentes durante o dia, informar o de maior demanda.",
    "Alternativamente à questão acima, pedimos informar o perfil de carga, isto é, o perfil de consumo diário da planta.",
    "Com relação à carga total alimentada pela rede elétrica hoje, existem cargas indutivas tais como motores elétricos, compressores de ar condicionado, elevadores, transformadores, etc. ?",
    "Caso existam cargas indutivas, quanto essas cargas representam percentualmente (em KW) com relação a carga total ?",
    "Dos motores elétricos existentes na planta, quais deles NÃO apresentam inversores de frequência para partida e/ou controle de velocidade ?",
    "Caso possua, pedimos informar a lista de cargas com a relação de potências de todos os equipamentos.",
    "Nos conte um pouco sobre as cargas críticas da planta. Existem cargas na sua planta que não podem parar de forma alguma?",
    "Qual tempo máximo de comutação de on grid para off grid aceitável em caso de uma queda de rede ?",
    "Qual o percentual em KW dessas cargas críticas com relação à potencia total da planta ?",
    "Do total de cargas críticas, qual o percentual de cargas indutivas, isto é, motores elétricos, compressores de ar condicionado, elevadores, transformadores, etc. ?",
    "Hoje, existe alguma planta solar instalada ? Qual a potência dessa planta ?",
    "Caso não exista, há espaço físico para instalação de uma nova planta solar ? Qual é essa área aproximadamente?",
    "Qual a modalidade tarifária atual da empresa ? Essa informação consta da conta de energia.",
    "Há excedente na geração solar durante a produção diária que possa ser aproveitada em outro horário do dia ?",
    "Possui gerador a diesel no local? Se sim qual potência em ( kVA/kW).",
    "Qual valor do combustível no local do Projeto (R$/L)?",
    "Qual período de utilização do gerador diesel ? (ex: H.Ponta das 18h as 21h / somente em contingencias de rede)",
    "Qual a frequencia de queda de energia proveniente da concessionária local e qual a sua duração média?",
    "Qual a tensão do ponto de conexão onde o sistema de armazenamento de energia deverá ser instalado ?",
    "Qual a distância aproximada do espaço previsto para instalação do sistema de armazenamento ao ponto de conexão ?",
    "Alguma observação relevante quanto ao local de instalação, limites de espaço físico, área classificada, etc.?",
    "Existe alguma automação na planta hoje a qual deva interagir com o novo sistema de armazenamento de energia ?",
    "Fornecer desenhos e diagramas unifilares do ponto de conexão do projeto.",
    "Outras observações técnicas relevantes sobre o escopo"
  ];
  
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
  
  // Ao clicar em "Vamos Lá!"
  startButton.addEventListener('click', () => {
    loginBox.style.display = 'none';
    questionBox.style.display = 'flex';
    atualizarPergunta();
    prevButton.style.display = 'none';
  });
  
  // Ao clicar em "Próxima"
  nextButton.addEventListener("click", () => {
    respostas[etapaAtual] = respostaInput.value.trim();
    etapaAtual++;
  
    if (etapaAtual < totalEtapas - 1) {
      atualizarPergunta();
    } else if (etapaAtual === totalEtapas - 1) {
      atualizarPergunta(); // Última pergunta
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
  }
  
  
  // Finaliza visualmente o formulário
  function finalizarFormulario() {
    const form = document.getElementById("formPerguntas");
    form.innerHTML = `
    <div class="finalizacao">
        <h2>Checklist finalizado!</h2>
        <p>A You.On agradece por sua colaboração.<br>Em breve você receberá um resumo.</p>
    </div>`;

  }
  