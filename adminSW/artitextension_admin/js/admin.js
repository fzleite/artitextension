'use strict';

/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                      CONFIGURAÇÕES PARA USO DO BACKGROUND                      ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

// *************************************************
// Constantes da intervalos de tempo
// *************************************************
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
const app = {
    firebase : {
        mainDB : "users/",
        adminDB : "admin/"
    }
}

function htmlRender(){
    this.html = "";

    this.addTable = () => {
        this.html += "<TABLE>";
    }
    
    this.closeTable = () => {
        this.html += "</TABLE>";
    }

    this.addRow = content => {
        this.html += "<TR>" + content + "</TR>";
    }

    this.addCelHeader = (content) => {
        return "<TD style=\"text-align: center;\" bgcolor=\"#cccccc\">" + (typeof content === 'undefined' ? '-' : content ) + "</TD>";
    }

    this.addCel = (content, alertar) => {
        alertar = alertar ? alertar : 0;
        return "<TD " + ( alertar > 4 ? 
                            ( alertar > 7 ? 
                                    "  style=\"color: white; font-weight: bold; padding: 5px 5px; text-align: center;border-radius: 25px\" bgcolor=\"red\"" : 
                                    "  style=\"font-weight: bold; padding: 5px 5px; text-align: center;border-radius: 25px\" bgcolor=\"yellow\"") : 
                                "  style=\"padding: 5px 5px; text-align: center;border-radius: 25px\"") +
                        ">" + (typeof content === 'undefined' ? '-' : content ) + "</TD>";
    }

    this.addCelNW = (content, alertar) => {
        alertar = alertar ? alertar : 0;
        return "<TD nowrap " + ( alertar > 4 ? 
                            ( alertar > 7 ? 
                                    "  style=\"color: white; font-weight: bold; padding: 5px 5px; text-align: center;border-radius: 25px\" bgcolor=\"red\"" : 
                                    "  style=\"font-weight: bold; padding: 5px 5px; text-align: center;border-radius: 25px\" bgcolor=\"yellow\"") : 
                                "  style=\"padding: 5px 5px; text-align: center;border-radius: 25px\"") +
                        ">" + (typeof content === 'undefined' ? '-' : content ) + "</TD>";
    }

    this.getHTML = () => {
        return this.html;
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
 *  *********************                                     FUNÇÔES GERAIS                             ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Metodo para ler o firebase
 */
function readFirebase(){

    let dbUsers = firebase.database().ref("users/");

    dbUsers.orderByChild("ultimo_apontamento").endAt("ultimo_apontamento").on('value', snap => {
        // ****************************************************
        // Desenha tabela de usuarios cadastrados
        let result = new htmlRender();
        result.addTable();
        result.addRow( 
            result.addCelHeader( "<B>Usu&aacute;rio</B>" ) +
            result.addCelHeader( "<B>Nome Completo</B>" ) +
            result.addCelHeader( "<B>Conectado</B>" ) + 
            result.addCelHeader( "<B>Vers&atilde;o</B>" ) + 
            result.addCelHeader( "<B>Dt. Registro</B>" ) + 
            result.addCelHeader( "<B>Dt. Ultima Notifica&ccedil;&atilde;o</B>" ) + 
            result.addCelHeader( "<B>Dt. Ultimo Apontamento</B>" ) +
            result.addCelHeader( "<B>Ultima Mensagem</B>" ) +
            result.addCelHeader( "<B>A&ccedil;&otilde;es</B>" )
        );

        snap.forEach( elem => {
            let userData = elem.val();

            let currDate  = getCurrentDate();
            let diff = dateDiffInDays( new Date(userData.ultimo_apontamento), new Date(currDate) );

            diff = diff ? diff : 0;

            result.addRow( 
                result.addCelNW( elem.key ) +
                result.addCelNW( userData.nome_completo ) + 
                result.addCelNW( userData.conectado ) + 
                result.addCelNW( userData.versao ) + 
                result.addCelNW( userData.data_registro ) + 
                result.addCelNW( userData.ultima_notificacao ) + 
                result.addCelNW( userData.ultimo_apontamento, diff ) + 
                result.addCel( (userData.mensagem ? userData.mensagem : "") + ( userData.viewCount ? "<BR><B>Mensagem exibita " + userData.viewCount + " vezes</B>" : "" ) ) + 
                result.addCel( "<a id=\"" + elem.key + "\" class=\"waves-effect message waves-light btn\"><i class=\"material-icons\">message</i></a> &nbsp;&nbsp;" )
            );
        })

        result.closeTable();
        document.getElementById("lista").innerHTML = result.getHTML();

        // ****************************************************
        // Adiciona listener de eventos para os botões de mensagem
        let messageList = document.getElementsByClassName("message");
        for( let i=0; i<messageList.length; i++ ){
            messageList[i].addEventListener('click', evt => {
                let target = evt.target || evt.srcElement;
    
                while(target && !target.id) 
                    target = target.parentNode;
                if( target ) {
                    let message = prompt("Defina a mensagem a ser enviada para " + target.id, "Voce esta ha alguns dias que voce nao aponta suas horas. Mantenha seu apontamento regular!" );

                    // Envia mensagem
                    sendMessage( message, target.id );

                    //Provoca reload da lista
                    readFirebase();
                }
            });
        }
    });

}


function sendMessage( message, id ){
    let currUser = localStorage.getItem("username");
    currUser = currUser.split("@")[0];

    let dbAdmin = firebase.database().ref( app.firebase.adminDB + currUser);
    dbAdmin.once('value', snap => {
        let adminData = snap.val();
        message += "\nEnviado por " + adminData.nome_exibicao;

        // Grava mensagem no firebase
        let dbMessage = firebase.database().ref( app.firebase.mainDB + id );
        dbMessage.once('value', userSnap => {
            let userData = userSnap.val();

            userData.mensagem = message;
            userData.viewCount = 0;
            dbMessage.set( userData );
        } );
    });
}


readFirebase();



document.getElementById("btAdd").addEventListener('click', evt => {
    let username = prompt("Entre com o nome do usuario administrador");
    let nome_exibicao = prompt("Entre com o nome a ser exibido");
    let specialKey = prompt("Entre com a chave publica");

    if( username && nome_exibicao && specialKey ){
        let adminData = {
            nome_exibicao : nome_exibicao,
            specialKey : specialKey
        };
    
        let dbAdmin = firebase.database().ref( app.firebase.adminDB + username);
        dbAdmin.set( adminData );
    }else{
        alert("Cancelado!");
    }
})



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
