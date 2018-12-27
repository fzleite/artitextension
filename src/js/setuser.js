"use strict";

/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************               CONFIGURAÇÕES PARA USO DA PAGINA DE USUARIO                      ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

const interval = {
    // Constantes de Tempo
    SECOND         : (1000),
    TWO_SECONDS    : (1000 * 2),
    QUARTER_MINUTE : (1000 * 15),
    HALF_MINUTE    : (1000 * 30),
    MINUTE         : (1000 * 60),
    FIVE_MINUTE    : (1000 * 60 * 5),
    QUARTER        : (1000 * 60 * 15),
    HALF_HOUR      : (1000 * 60 * 30),
    HOUR           : (1000 * 60 * 60),
    SIX_HOURS      : (1000 * 60 * 60 * 6),
    HALF_DAY       : (1000 * 60 * 60 * 12),
    DAY            : (1000 * 60 * 60 * 24)
}

// *************************************************
// Constantes da aplicação
// *************************************************
const userPage = {

    // Informações de localização de elementos
    location : {
        backgroundPage   : "background",
        contentPage      : "contentPage",
        popupPage        : "popupPage"
    },

    // Tipos de Request
    request : {
        update            : "updateMessage",
        setMessage        : "setMessage",
        defaultIcon       : "defaultIcon",
        alertIcon         : "alertIcon",
        disconnect        : "disconnectApp",
        setup             : "setup",
        NONE              : "none"
    },

}

// *************************************************
// Constantes da aplicação
// *************************************************
const app = {
    firebase : {
        mainDB : "users/"
    }
}


// Initialize Firebase
let firebaseConfig = {
    apiKey: "AIzaSyAcJ40SCSavUgGxdqp16tiKBaHLG-p3GQU",
    authDomain: "artitextension.firebaseapp.com",
    databaseURL: "https://artitextension.firebaseio.com",
    projectId: "artitextension",
    storageBucket: "",
    messagingSenderId: "418312739985"
};

firebase.initializeApp( firebaseConfig );


/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                               BLOCO DE LISTENERS                               ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Tira o evento de submut do formulario
 */
document.getElementById("frm").addEventListener('submit', function(event){
    event.preventDefault();
})


/**
 * Adiciona evento no botão Enviar do forma de email
 */
document.getElementById("btSend").addEventListener('click', function(){
    let nome = document.getElementById("nomecompleto");
    let email = document.getElementById("email");
    let chavepublica = document.getElementById("chavepublica");

    let mask = /\w[a-z]@(artit\.com\.br)$/;

    if( !mask.test( email.value ) ){
        setMessage("Email invalido. Lembre-se de usar seu email valido da Art IT");
    }else{
        let user = email.value.split("@")[0];
        let dbUser = firebase.database().ref( app.firebase.mainDB + user );

        dbUser.once('value', snap => {
            let userData = snap.val();

            if( userData ){

                if( !userData.bloqueado ){

                    if( userData.publickey === chavepublica.value ){

                        userData.nome_completo = nome.value;
                        userData.email = email.value;
                        userData.data_registro = getCurrentDate();
                        userData.validado = true;
                        userData.publickey = null;
                        userData.tentativas = null;

                        // Seta variavel local
                        localStorage.setItem("username", email.value);        
                        localStorage.setItem("fullName", nome.value);
                
                        setMessage("Efetuando login... aguarde!");

                        // Comunica backend que o usuario validou
                        messageTo( userPage.location.backgroundPage,
                                   userPage.request.setup );
                
                    }else{
                        userData.tentativas = (userData.tentativas ? userData.tentativas-1 : 2);
                        if( userData.tentativas === 0 ){
                            userData = null;
                        }else
                            setMessage("Chave invalida! Voce tem apenas " + userData.tentativas + " tentativas antes de ser bloqueado");
                    }

                }else{
                    setMessage("Usu&aacute;rio bloqueado! Contacte o administrador");
                }

                dbUser.set( userData );

            }else{
                setMessage("Usu&aacute;rio inexistente!");
            }
        });

    }
});

/**
 * Adiciona evento no botão Enviar do forma de email
 */
document.getElementById("btCancel").addEventListener('click', function(){
   window.close(); 
});

/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                          BLOCO DE FUNÇÕES DA PAGINA                            ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Informa mensagem de erro na tela
 */
function setMessage(message) {
    let oAlert = document.getElementById("notificationAlert");

    oAlert.style.display = "block"
    oAlert.textContent = message;
}


/**
 * Verifica se o usuario foi setado e fecha a aba caso positivo
 */
function checkUser(){
    let user = localStorage.getItem("username");

    if( user !== null )
        window.close();
}

// Monitora se o status de definição do usuario foi alterado de tempos em tempos
setInterval( checkUser, interval.TWO_SECONDS );


/**
 * Prepara o fechamento da janela apos 1 minuto e deixa este controle para o background
 */
setTimeout( 
    function(){
      window.close();  
    }, 
    interval.MINUTE
);


/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                          BLOCO DE FUNÇÕES DO CHROME                            ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Envia mensagem para a aplicação
 */
function messageTo( destinator, request, message ){
    message = ( message ? message : "");
    chrome.runtime.sendMessage( {
        destinator : destinator,
        request : request,
        message : message
    });            
}



/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                          BLOCO DE FUNÇÕES GERAIS                               ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Calcula diferença entre datas
 */
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  
    return Math.floor((utc2 - utc1) / interval.DAY );
}

/**
 * Função para retornar a data no formato correto
 */
function getCurrentDate(){
    let currDate = new Date();
    let ano = currDate.getFullYear();
    let mes = currDate.getMonth()+1;
    let dia = currDate.getDate();

    mes = '00' + mes;
    mes = mes.substr( mes.length-2, mes.length );

    dia = '00' + dia;
    dia = dia.substr( dia.length-2, dia.length );
    
    return ano + "-" + mes + "-" + dia;
}

