"use strinc";

// *************************************************
// Constantes da aplicação
// *************************************************
const popup = {
    // Informações de URLs dentro da aplicação

    linkNames : {
        rosie      : "a-rosie",
        asaloc     : "a-rosie",
        www        : "a-site",
        disconnect : "a-disconnect",
        profile    : "a-profile"
    },

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
        openRosie         : "openRosie",
        openNewTab        : "openNewTab",
        NONE              : "none"
    }
}


// *************************************************
// Constantes da aplicação
// *************************************************
const app = {
    firebase : {
        mainDB : "users/",
        adminDB : "admin/"
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
 *  *********************                           BLOCO DE AÇÔES DA PAGINA                             ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Aplica regra para os links do portal de aplicações na pagina
 */
document.addEventListener('DOMContentLoaded', function () {
    let htmlLinks = document.getElementsByTagName("a");

    // Solicita atualização de status para o background
    messageTo( popup.location.backgroundPage, popup.request.update );

    // Verifica usuario da pagina
    var userName = localStorage.getItem("username");
    if( userName === null )
        messageTo( popup.location.backgroundPage, popup.request.setup );
    
    // Percorre todos os links do Popup para setar o metodo de chamada
    for (let i = 0; i < htmlLinks.length; i++) {
        let aTagElem = htmlLinks[ i ];
        // Adiciona evento para o onClick do link, inspecionando cada elemento individualmente
        aTagElem.onclick = (event) => {

            event.preventDefault();

            switch( aTagElem.id ){
                // Verifica se foi selecionado o link para abrir o Rosie
                case popup.linkNames.rosie :
                    messageTo( popup.location.backgroundPage, // Solicita atualização de status para o background
                               popup.request.defaultIcon );
                    messageTo( popup.location.backgroundPage, // Solicita atualização de status para o background
                               popup.request.openRosie );
                    break;

                case popup.linkNames.disconnect :
                    messageTo( popup.location.backgroundPage, // Solicita a desconexão do usuario corrente
                        popup.request.disconnect );
                    break;

                default :
                    messageTo( popup.location.backgroundPage, // Solicita a criação de uma nova Tab
                               popup.request.openNewTab, aTagElem.href );
            }
            window.close();
            
        }
    }

    let user = userName.split("@")[0];
    let dbAdminUser = firebase.database().ref( app.firebase.adminDB + user );

    dbAdminUser.once( 'value', snap => {
        let adminData = snap.val();
        let bValid = false;

        adminData.validado = ( adminData.validado ? adminData.validado : "Nao" );

        if( adminData.validado == "Sim" ){
            bValid = true;
        }else{
            let key = prompt("Entre a chave publica. Lembre-se, voce tem apenas 3 tentativas");

            if( key === adminData.specialKey ){
                adminData.validado = "Sim";
                adminData.specialKey = null;
                bValid = true;
            }else{
                adminData.validado = "Nao";
                adminData.tentativas = (adminData.tentativas ? adminData.tentativas-1 : 2);
                if( adminData.tentativas > 0 )
                    alert( "Chave invalida. Voce possui apenas mais " + adminData.tentativas + " tentativas");
                else{
                    adminData = null;
                }
            }
        }
        if( bValid )
            document.getElementById("adminLink").innerHTML = "<BR>( <a target=\"_new\" href=\"admin.html\">Painel de Administra&ccedil;&atilde;o</a> )";
        dbAdminUser.set( adminData );
     });    
});

/**
 * Função para setar mensagem na tela
 */
function setMessage(message) {
    let oAlert = document.getElementById("notificationAlert");
    oAlert.style.display = "block"
    oAlert.textContent = message;
}


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
 * Listener para captar mensagens do background
 */
chrome.runtime.onMessage.addListener( function( msg, sender, sendResponse ){

    /// Veficica se foram direcionados eventos para o popup
    if( msg.destinator === popup.location.popupPage ){
        switch( msg.request ){
            // Adiciona mensagem no alerta da pagina
            case  popup.request.setMessage :
                if( msg.message !== "" )
                    setMessage( msg.message );
                break;
        }
    }

});


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
    } );            
}
