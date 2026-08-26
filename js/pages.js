(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var done = form.parentElement.querySelector(".w-form-done");
    var fail = form.parentElement.querySelector(".w-form-fail");
    var button = form.querySelector('[type="submit"]');

    if (!form.checkValidity()) {
      form.reportValidity();
      if (fail) fail.style.display = "block";
      return;
    }

    if (button) {
      button.value = button.getAttribute("data-wait") || "Please wait...";
      button.disabled = true;
    }

    window.setTimeout(function () {
      form.style.display = "none";
      if (done) done.style.display = "block";
      if (fail) fail.style.display = "none";
    }, 400);
  });
})();
