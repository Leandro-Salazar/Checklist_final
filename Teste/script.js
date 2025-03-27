document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector(".btn");

    button.addEventListener("click", function (event) {
        event.preventDefault(); 

        const container = document.querySelector(".container");
        container.classList.add("slide-out"); 

        setTimeout(() => {
            window.location.href = "outra-pagina.html"; 
        }, 800); 
    });
});
