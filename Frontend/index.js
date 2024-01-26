document.addEventListener('DOMContentLoaded', function () {
    var accessToken = sessionStorage.getItem('accessToken');

    // Verifica si accessToken está presente
    if (!accessToken) {
        MostrarLogin();
    }
});

async function logoutFunction() {
    try {
        const accessToken = sessionStorage.getItem('accessToken');
        const response = await fetch("http://localhost:8082/api/auth/logout", {
            method: 'GET',
            headers: {
                Authorization: "Bearer " + accessToken
            }
        });

        if (response.ok) {
            const result = await response.json();

            sessionStorage.removeItem('accessToken');

            MostrarLogin();

            console.log(result);
        }
    } catch (err) {
        mostrarAlerta(err);
    }

}

function MostrarLogin() {
    var nuevaURL = "login.html";
    window.location.href = nuevaURL;
}

function mostrarAlerta(mensaje) {
    var alerta = document.getElementById('errorAlert');
    var errorContent = document.getElementById('errorContent');

    if (!mensaje) {
        alerta.style.display = 'none';
    } else {

        errorContent.textContent = mensaje;

        alerta.style.display = 'block';
        setTimeout(function () {
            alerta.style.transform = 'translateY(-250%)';
            setTimeout(function () {
                alerta.style.display = 'none';
                alerta.style.transform = '';
                errorContent.textContent = '';
            }, 1000);
        }, 3000);
    }

}
function MasInfo(card, signo, downPanel, boton) {
    var carta = document.getElementById(card);
    var svg = document.getElementById(signo);
    var DownPanel = document.getElementById(downPanel);
    var Boton = document.getElementById(boton);
    // Check if the card is already expanded
    if (carta.style.height === '280px') {
        // If already expanded, set it back to the original size and toggle to positive sign
        carta.style.height = '';
        DownPanel.classList.remove('visible');
        svg.innerHTML = '<path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path>';
        Boton.style.background = '#ff6600'
    } else {
        // If not expanded, toggle the sign to negative and expand the card
        svg.innerHTML = '<path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M5 12h14v2H5z"></path>';
        carta.style.height = '280px';
        DownPanel.classList.add('visible');
        Boton.style.background = 'red'
    }
}

// Obtener el contexto del lienzo
var ctx = document.getElementById('miGrafico').getContext('2d');

// Datos del gráfico
var data = {
    labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    datasets: [{
        label: 'Ejemplo de Datos',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo de las barras
        borderColor: 'rgba(75, 192, 192, 1)', // Color del borde de las barras
        borderWidth: 1 // Ancho del borde de las barras
    }]
};

// Opciones del gráfico
var options = {
    scales: {
        y: {
            beginAtZero: true
        }
    }
};

// Crear el gráfico de barras
var miGrafico = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});

async function InicializarMapa() {
    const accessToken = sessionStorage.getItem('accessToken');
    try {
        const response = await fetch("http://localhost:8082/api/RecojerMunicipios", {
            method: 'GET',
            headers: {
                Authorization: "Bearer " + accessToken
            }
        });

        if (response.ok) {
            const result = await response.json();

            // Mapear los datos obtenidos en result a la estructura deseada para lugares
            var lugares = result.map(municipio => {
                return {
                    "nombre": municipio.NOMBRE_CAPITAL,
                    "id": municipio.id,
                    "latitud": parseFloat(municipio.Coordenadas.split(';')[1]),
                    "longitud": parseFloat(municipio.Coordenadas.split(';')[0])
                };
            });
            var map = L.map('map').setView([43.3171715, -1.78191785], 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);


            lugares.forEach(ciudad => {
                var marker = L.marker([ciudad.latitud, ciudad.longitud]).addTo(map);
                marker.bindTooltip(ciudad.nombre, {
                    permanent: false,    // El tooltip no será permanente
                    direction: 'top',    // Se mostrará encima del marcador
                    offset: L.point(0, -20) // Desplazamiento del tooltip respecto al marcador
                })


                // Agregar un manejador de clic al marcador
                marker.on('click', function () {
                    // Verificar si el icono ya tiene la clase 'green'
                    const hasGreenClass = this._icon.classList.contains('green');

                    // Si la clase ya está añadida, quitarla; de lo contrario, añadirla
                    if (hasGreenClass) {
                        this._icon.classList.remove('green');
                        CardId = document.getElementById('carta'+ciudad.id);

                        CardId.style.display = 'none';
                    } else {
                        this._icon.classList.add('green');
                        CardId = document.getElementById('carta'+ciudad.id);

                        CardId.style.display = 'flex';
                    }

                  



                });
            });

        }
    } catch (err) {
        console.error(err);
    }

}

InicializarMapa();


async function GenerarCards() {
    try {
        const response = await fetch("http://localhost:8082/api/RecojerMunicipios", {
            method: 'GET',
            headers: {}
        });

        if (response.ok) {
            const result = await response.json();
            const contenedor = document.getElementById("cartitas");


            // Iterar sobre cada elemento del JSON original
            result.forEach(municipio => {
                // HTML de la carta
                const existingCarta = document.getElementById(`carta${municipio.id}`);
                if (existingCarta) {
                    // Si la carta ya existe, actualizar su contenido
                    existingCarta.querySelector('.temperatura').textContent = `${municipio.Temperatura}ºc`;
                    existingCarta.querySelector('.ciudad').textContent = municipio.NOMBRE_CAPITAL;
                    existingCarta.querySelector('.SensacionTermica').textContent = `${municipio.SensacionTermica}ºc`;
                    existingCarta.querySelector('.Presion').textContent = municipio.Presion;
                    existingCarta.querySelector('.Humedad').textContent = municipio.Humedad;
                    existingCarta.querySelector('.VelocidadDelViento').textContent = municipio.VelocidadDelViento;
                    existingCarta.querySelector('.Descripcion').textContent = municipio.Descripcion;
                    existingCarta.querySelector('.DireccionDelViento').textContent = municipio.DireccionDelViento;
                } else {


                    const htmlCarta = `
                                    
                <div class="carta" id="carta${municipio.id}">
                <div class="up-panel">
                    <div class="left-panel panel">
                    <div class="temperatura">
                        ${municipio.Temperatura}ºc
                    </div>
                    <div class="ciudad">
                        ${municipio.NOMBRE_CAPITAL}
                    </div>
                    </div>
                    <div class="right-panel panel">
                    <img src="https://codefrog.space/cp/wp/ts.png" height="80px" width="100px">
                    </div>
                </div>

                <div id="down-panel${municipio.id}" class="down-panel">
                    <div class="items">
                    <div class="panelizq">
                        <div class="item">
                        <span class="SensacionTermica">${municipio.SensacionTermica}ºc</span>
                        <img src="https://cdn-icons-png.flaticon.com/512/3262/3262966.png" height="25px" width="25px">
                        </div>
                        <div class="item">
                        <span class="Presion">${municipio.Presion}</span>
                        <img src="https://cdn-icons-png.flaticon.com/256/2676/2676004.png" height="25px" width="25px">
                        </div>
                        <div class="item">
                        <span class="Humedad">${municipio.Humedad}</span>
                        <img src="https://cdn-icons-png.flaticon.com/512/6755/6755816.png" height="25px" width="25px">
                        </div>
                    </div>
                    <div class="panelder">
                        <div class="item">
                        <span class="VelocidadDelViento">${municipio.VelocidadDelViento}</span>
                        <img src="https://i.pinimg.com/originals/10/e7/6a/10e76afc7fb205cb36525eee814f5ad1.png" height="25px"
                            width="50px">
                        </div>
                        <div class="item">
                        <span class="Descripcion">${municipio.Descripcion}</span>
                        <img src="https://codefrog.space/cp/wp/ts.png" height="25px" width="25px">
                        </div>
                        <div class="item">
                        <span class="DireccionDelViento">${municipio.DireccionDelViento}</span>
                        <img src="https://cdn-icons-png.flaticon.com/512/3512/3512240.png" height="25px" width="25px">
                        </div>
                    </div>
                    </div>
                </div>
                <button id="boton${municipio.id}" onclick="MasInfo('carta${municipio.id}', 'svg${municipio.id}', 'down-panel${municipio.id}','boton${municipio.id}')" class="cssbuttons-io-button">
                    <svg id="svg${municipio.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path>
                    </svg>
                    <span>Info</span>
                </button>
                </div>
                `;

                    // Agregar el HTML de la carta al principio del contenido del contenedor
                    contenedor.insertAdjacentHTML('afterbegin', htmlCarta);
                }
            });

        }
    } catch (err) {
        console.error(err);
    }
}
GenerarCards();
setInterval(GenerarCards, 15000);