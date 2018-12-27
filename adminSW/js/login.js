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
        mainDB : "users/",
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
    let nome         = document.getElementById("nomecompleto");
    let email        = document.getElementById("email");
    let chavepublica = document.getElementById("chavepublica");

    let mask = /\w[a-z]@(artit\.com\.br)$/;

    if( !mask.test( email.value ) ){
        setMessage("Email invalido. Lembre-se de usar seu email valido da Art IT");
    }else{
        if( nome.value.length > 10 ){
            if( chavepublica.value.length > 1 ){
                let user        = email.value.split("@")[0];
                let dbAdminUser = firebase.database().ref( app.firebase.mainDB + user );

                /**
                 * Inicio da verificação do Firebase
                 */
                dbAdminUser.once( 'value', snap => {
                    let adminData = snap.val();
                    let bValid = false;

                    if( adminData ){
            
                        adminData.validado = ( adminData.validado ? adminData.validado : false );
                
                        if( !adminData.validado ){
                            console.log( adminData );
                            console.log( chavepublica.value === adminData.publickey );
    
                            if( chavepublica.value === adminData.publickey && adminData.admin ){
                                adminData.validado = true;
                                adminData.nome_completo = nome.value;
                                adminData.email = email.value;
                                adminData.data_registro = getCurrentDate();
                                adminData.publickey = null;
                                bValid = true;
                            }else{
                                adminData.validado = false;
                                adminData.tentativas = (adminData.tentativas ? adminData.tentativas-1 : 2);
                                if( adminData.tentativas > 0 )
                                    setMessage( "Chave invalida ou voce nao tem acesso a esta tela. Voce possui apenas mais " + adminData.tentativas + " tentativas");
                                else{
                                    adminData = null;
                                }
                            }
                        }else
                            bValid = true;
    
                        dbAdminUser.set( adminData );
                        if( bValid ){
                            localStorage.setItem("username", email.value);        
                            localStorage.setItem("fullName", nome.value);
                            registerAndFollow();
                        }
    
                    //Caso o usuario não seja encontrado
                    }else{
                        setMessage( "Usuario não encontrado");
                    }
                 });

            }else{
                setMessage("Chave publica não atende os requisitos minimos");
                chavepublica.focus();
            }
        }else{
            setMessage("Nome deve conter pelo menos 10 caracteres");
            nome.focus();
        }
    }
});

/**
 * Adiciona evento no botão Enviar do forma de email
 */
document.getElementById("btCancel").addEventListener('click', function(){
   window.close(); 
});


/**
 * Verifica situação de login assim que a pagina estiver aberta
 */
document.addEventListener('DOMContentLoaded', event => {
    let localUser = localStorage.getItem("username");
    console.log("Verificando usuario localmente");
    
    if( localUser ){
        let user = localUser.split("@")[0];
        let dbAcess = firebase.database().ref( app.firebase.mainDB + user );

        dbAcess.once( 'value', snap => {
            let adminData = snap.val();
    
            adminData.validado = ( adminData.validado ? adminData.validado : false );
            adminData.bloqueado =  ( adminData.bloqueado ? adminData.bloqueado : false );
    
            // Direciona se não foi bloqueado e se esta validado
            if( adminData.validado && !adminData.bloqueado && adminData.admin ){
                adminData.publickey = null;
                dbAcess.set( adminData );
                registerAndFollow();
            }

            // Apresenta mensagem se o usuario foi bloqueado
            if( adminData.bloqueado ){
                localStorage.removeItem("username");
                setMessage( "Você foi bloqueado. Utilize outra credencial para usar a aplica&ccedil;&atilde;o");
            }

            // Apresenta mensagem se o usuario foi bloqueado por não ser admin
            if( !adminData.admin ){
                localStorage.removeItem("username");
                setMessage( "Você não possui acesso de administrador. Utilize outra credencial para usar a aplica&ccedil;&atilde;o");
            }

        });
        }
});


function registerAndFollow(){
    let register = false;
    /**
     * Registro do Service Worer caso o login seja realizado com sucesso
     */
    if ('serviceWorker' in navigator) {
        if( register ){
            navigator.serviceWorker
                .register('./service-worker.js')
                .then( () => { 
                    console.log('Service Worker Registrado'); 
                });
        }else{
            navigator.serviceWorker.getRegistrations().then( registrations => {
                for(let registration of registrations) {
                    registration.unregister()
                }
            });
    }
    }
    window.location.href = "admin.html";
}

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