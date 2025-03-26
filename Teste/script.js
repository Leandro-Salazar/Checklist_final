const steps = document.querySelectorAll('.steps li');
const formSteps = document.querySelectorAll('.form-step');
const sidebar = document.querySelector('.sidebar');
let currentStep = 0;

// Atualiza a etapa ativa e o tema da barra lateral
function updateSteps() {
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });
    formSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });

    // Atualiza o tema da barra lateral com base no progresso
    if (currentStep === 0) {
        sidebar.classList.remove('theme-step-2', 'theme-step-3');
        sidebar.classList.add('theme-step-1');
    } else if (currentStep === 1) {
        sidebar.classList.remove('theme-step-1', 'theme-step-3');
        sidebar.classList.add('theme-step-2');
    } else if (currentStep === 2) {
        sidebar.classList.remove('theme-step-1', 'theme-step-2');
        sidebar.classList.add('theme-step-3');
    }
}

// Botões "Próximo"
document.querySelectorAll('.next-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (currentStep < formSteps.length - 1) {
            currentStep++;
            updateSteps();
        }
    });
});

// Botões "Anterior"
document.querySelectorAll('.prev-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateSteps();
        }
    });
});

// Inicializa o formulário
updateSteps();
