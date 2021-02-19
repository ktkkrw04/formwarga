// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function(form) {
        const btn = document.getElementById("btn-submit");
        btn.addEventListener(
            "click",
            function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
                let data = new FormData(form);
                fetch("http://localhost:8080/warga", {
                    mode: "no-cors",
                    method: "POST",
                    body: data,
                    redirect: "follow",
                }).then((res) => {
                    console.log(res);
                });
            },
            false
        );
    });
})();