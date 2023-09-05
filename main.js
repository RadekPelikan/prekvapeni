const nameElement = document.querySelector("#name");

window.onload = async () =>  {
    var res = await fetch("https://svatkyapi.cz/api/day");
    var data = await res.json();
    nameElement.textContent = data.name;
}