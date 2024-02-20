"use strict"

window.onload = function () {

    $('body').append(`
    <div class="container-fluid container-md text-center translate-midle">
    <div id="row1" class="row text-center mt-5"></div>
    <div id="row2" class="row ">
        <div id="cardRow" class="container-fluid col-xl-8 col-lg-6 col-md-12 col-sm-12 col-xs-12 my-5">
            <div><h3 class="py-5">Seleccione una carta:</h3><br></div>
        </div>
        <div id="infoRow" class="container-lg col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12 my-5"></div>
    </div>
</div>
`
    );

    //Introducimos el audio
    $('#row1').append(`<audio id="cantinaSong"> <source src="./media/cantinaSong.webm" type="audio/mpeg"> Tu navegador no soporta el elemento de audio. </audio>`);
    $('#row1').append(`<button id="Song" class="btn">Iniciar música</button>`);
    $('#Song').click(function () {
        var audio = document.getElementById("cantinaSong");
        var boton = document.getElementById("Song");

        if (audio.paused) {
            audio.play();
            boton.textContent = "Parar Música";
        } else {
            audio.pause();
            boton.textContent = "Iniciar Música";
        }
    });

    const nombres = ["Chewbacca", "Darth Vader", "R2-D2", "C-3PO", "Yoda"];

    //creación de estructura HTML
    $('#infoRow').append('</div><div class="infoDiv">');
    $('#cardRow').append('<div class="cardsRow row"></div>');

    //Creación de las cartas de manera dinámica e inserción de la foto del pj
    const nCartas = 5;
    for (let index = 1; index <= nCartas; index++) {
        $('.cardsRow').append(`<div id='card${index}' class='card col-1'><p class="cardText">${nombres[index - 1]}</p><br><img id='pj${index}' class='pj'></img></div>`);
    }
    for (let index = 1; index <= nCartas; index++) {
        $(`#pj${index}`).attr('src', `./media/${index}.jpeg`)
    }



    //Establecer altura de capas y la altura en el eje Y
    const medio = Math.ceil(nCartas / 2);
    let transY = 0;

    for (let index = 1; index <= nCartas; index++) {
        if (index < medio) {
            $(`#card${index}`).css('z-index', `${index}`).css('transform', `rotate(-15deg) translateY(${transY}px)`).click(
                function() {
                    seleccionPj($(this).find('p').text()); //Pasamos el valor de h2 a la función
                }
            ).hover(
                function () {
                    $(this).css('z-index', `${nCartas + 1}`)
                }, function () {
                    $(this).css('z-index', `${index}`);
                });
            transY -= 15;
        } else if (index == medio) {
            $(`#card${index}`).css('z-index', `${index}`).css('transform', `translateY(${transY}px)`).click(
                function() {
                    seleccionPj($(this).find('p').text()); //Pasamos el valor de h2 a la función
                }
            ).hover(
                function () {
                    $(this).css('z-index', `${nCartas + 1}`)
                    
                }, function () {
                    $(this).css('z-index', `${index}`);
                });
            transY += 15;
        } else if (index > medio) {
            $(`#card${index}`).css('z-index', `${nCartas - index + 1}`).css('transform', `rotate(15deg) translateY(${transY}px)`).click(
                function() {
                    seleccionPj($(this).find('p').text()); //Pasamos el valor de h2 a la función
                }
            ).hover(
                function () {
                    $(this).css('z-index', `${nCartas + 1}`)
                }, function () {
                    $(this).css('z-index', `${nCartas - index + 1}`)
                });
            transY += 15;
        }
    }




    //datos a buscar
    const datosPrimBus = ["name", "height", "mass", "skin_color", "eye_color", "birth_year", "gender"];

    //Mapa para los personajes
    let personajes = new Map(); //nombre - ArrayDatos

    for (let index = 0; index < nombres.length; index++) {
        $.ajax({
            url: `https://swapi.dev/api/people/?search=${nombres[index]}&format=json`,
            method: 'GET',
            dataType: 'json',
            success: function (personaje) {
                //extraemos los datos en la primera búsqueda y los vamos insertando en un array
                let datosPj = [];

                for (let index = 0; index < datosPrimBus.length; index++) {
                    let dato = datosPrimBus[index];

                    if (personaje.results[0][dato] === "n/a") { //Si no tiene género guardamos que no tiene
                        datosPj.push("Sin género");
                    } else {
                        datosPj.push(personaje.results[0][dato]);
                    }
                }

                //Extracción de la especie
                if (personaje.results[0].species[0] == null) {
                    datosPj.push("humano");
                    extracthomeworld(personaje);
                } else {
                    $.ajax({
                        url: personaje.results[0].species[0],
                        method: 'GET',
                        dataType: 'json',

                        success: function (especie) {
                            //almacenamiento en el array auxiliar
                            datosPj.push(especie.name);
                            extracthomeworld(personaje);
                        },
                        error: function (xhr, status, error) {
                            console.error('Error en la petición:', error);
                        }
                    })
                }
                function extracthomeworld(personaje) {
                    //Extracción del planeta natal

                    $.ajax({
                        url: personaje.results[0].homeworld,
                        method: 'GET',
                        dataType: 'json',

                        success: function (planeta) {
                            if (planeta.name == "unknown") {
                                datosPj.push("Desconocido");
                            } else {
                                //almacenamiento en el array auxiliar
                                datosPj.push(planeta.name);
                            }
                            //se van a guardar los nombres de las películas en un array y ese array se va a almacenar en el mapa
                            const nPelis = personaje.results[0].films;
                            const nombrePelis = [];

                            for (let index = 0; index < nPelis.length; index++) {
                                $.ajax({
                                    url: nPelis[index],
                                    method: 'GET',
                                    dataType: 'json',
                                    success: function (pelicula) {
                                        //Introducimos el nombre de la película en el array
                                        nombrePelis.push(pelicula.title)
                                    },
                                    error: function (xhr, status, error) {
                                        console.error('Error en la solicitud:', error);
                                    }
                                });
                            }
                            //introducimos el array de las peliculas en el mapa
                            datosPj.push(nombrePelis);

                        },
                        error: function (xhr, status, error) {
                            console.error('Error en la petición:', error);
                        }
                    })
                }
                //Añadimos al mapa de los personajes el array con todos los datos necesarios
                personajes.set(nombres[index], datosPj);


            },
            error: function (xhr, status, error) {

            }
        });
    }

    function seleccionPj(pj) { //Impresión de los datos
        //array con el orden de los datos a extraer
        const infRelev = ["Nombre: ", "Altura: ", "Peso: ", "Color de piel: ", "Color de ojos: ", "Nacimiento: ", "Género: ", "Especie", "Planeta de origen: ", "Películas donde aparece: <br>"];

        //Extraemos los datos que nos interesa con el nombre del pj
        const datosPj = personajes.get(pj);

        //Desplegamos la lista
        $('.infoDiv').html(`<div id="infoHeader"><div>INFORMACIÓN DEL PERSONAJE:</div></div><div id="infoContent"><ul id="infoPj"></div>`);
        //impresión de datos
        for (let index = 0; index < infRelev.length; index++) {
            const dato = infRelev[index];
            let valor = datosPj[index];

            if (Array.isArray(valor)) { //consultamos si es un array para imprimirlo como un String
                valor = valor.join(", ");
            }

            $('#infoPj').append(`<li id="Dato:${index}">  <p>${dato} ${valor}</p>`);
            $('#infoPj').append(`</li>`);
        }
        $('.infoDiv').append(`</ul>`);
    }
}