// URL to consume API
const API = "https://pokeapi.co/api/v2/pokemon?limit=30&offset=00";

// Consume API
const getData = (API) => {
    return fetch(API)
    .then((response) => response.json())
    .then((json) => {
        fillData(json), pagination(json);
    })
    .catch((err) => {
        console.log("Error: ", err)
    });
};

// Fill cards with characters
const fillData = (data) => {
let html = "";
document.getElementById("characterData").innerHTML = "";
data.results.forEach((cd) => {
    const pokeURL = cd.url;
    return fetch(pokeURL)
    .then((response) => response.json())
    .then((json) => {
        pokeCard(json, html);
    })
    .catch((err) => {
        console.log("Error: "+ err)
    })
    });
};

const pokeCard = (data, html) =>{
    html += `<div class="col mt-5">`;
    html += `<div class="card cardStyle" style="width: 12rem;">`
    html += `<img src="${data.sprites.front_shiny}" class="card-img-top" alt="${data.name}"`;
    html += `<div class="card-body">`;
    html += `<h5 class="card-title text-center">${data.name}</h5>`;
    html += `<p class="card-text text-center"> Height: ${data.height}</p>`;
    html += `<p class="card-text text-center"> Weight: ${data.weight}</p>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    document.getElementById("characterData").innerHTML += html;
}
// Pagination method
const pagination = (info) => {
    let html = "";
    html += `<li class="page-item btn-secondary btn-lg font-weight-bold ${info.previous ? "" : "disabled"}"><a class="page-link" onclick="getData('${info.previous}')">Prev</a></li>`;
    html += `<li class="page-item btn-primary btn-lg font-weight-bold ${info.next ? "" : "disabled"}"><a class="page-link" onclick="getData('${info.next}')">Next</a></li>`;
    document.getElementById("pagination").innerHTML = html;
};

// Execute API
getData(API);

