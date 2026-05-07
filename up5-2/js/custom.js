// custom.js

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

document.addEventListener("DOMContentLoaded", () => {
  const cpf = getParameterByName("document") || "Não informado";
  const name = getParameterByName("name") || "Não informado";
  const nameEl = document.getElementById("name");
  const cpfEl = document.getElementById("cpf");

  if (nameEl) nameEl.textContent = name;
  if (cpfEl) cpfEl.textContent = cpf;
});
