window.onload = start;

function start(){
  let urldiv = document.createElement("div");
  urldiv.innerHTML = window.location;
  document.body.appendChild(urldiv);
}
