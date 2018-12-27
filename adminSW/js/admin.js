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
        mainDB : "users/"
    }
}

  
function htmlRender(){
    this.html = "";

    this.addTable = () => {
        this.html += "<ul class=\"collapsible\">";
    }
    
    this.closeTable = () => {
        this.html += "</ul>";
    }

    this.addRow = (title, content, badge) => {
        this.html += "<li>";
        this.html += " <div class=\"collapsible-header\">";
        this.html += "   <i class=\"material-icons\">filter_drama</i>";
        this.html +=     title;
        this.html += "   <span class=\"new badge\" data-badge-caption=\" dias\">" + badge + "</span></div>";
        this.html += "   <div class=\"collapsible-body\"><p>" + content + "</p></div>";
        this.html += "</li>";
    
    }

    this.addInfo = (key, userData) => {
        let htmlCode = "";
        let currDate  = getCurrentDate();
        let diff = dateDiffInDays( new Date(userData.ultimo_apontamento), new Date(currDate) );

        diff = diff ? diff : 0;

        htmlCode += "<TABLE>";
        htmlCode += "   <TR>";
        htmlCode += "       <td width=\"100\" style=\"text-align: right;\" bgcolor=\"#cccccc\">Usu&aacute;rio :</td>";
        htmlCode += "       <td>" + key + ( userData.admin ? "(Admin)" : "" ) + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Conectado :</td>";
        htmlCode += "       <td>" + ( userData.conectado ? "Sim" : "N&atilde;0" ) + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Bloqueado :</td>";
        htmlCode += "       <td>" + ( userData.bloqueado ? "Sim" : "N&atilde;0" ) + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Vers&atilde;o :</td>";
        htmlCode += "       <td>" + userData.versao + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Data de Registro :</td>";
        htmlCode += "       <td>" + userData.data_registro + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Ultimo Apontamento :</td>";
        htmlCode += "       <TD " + ( diff > 4 ? 
                                        ( diff > 7 ? 
                                                "  style=\"color: white; font-weight: bold; padding: 5px 5px; text-align: left;border-radius: 25px\" bgcolor=\"red\"" : 
                                                "  style=\"font-weight: bold; padding: 5px 5px; text-align: left;border-radius: 25px\" bgcolor=\"yellow\"") : 
                                            "  style=\"padding: 5px 5px; text-align: left;border-radius: 25px\"") +
                                            ">" + (typeof userData.ultimo_apontamento === 'undefined' ? '-' : userData.ultimo_apontamento ) + "</TD>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Ultima Notificação :</td>";
        htmlCode += "       <td>" + ( userData.ultima_notificacao ? userData.ultima_notificacao : "-") + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">Mensagem :</td>";
        htmlCode += "       <td>" + ( userData.mensagem ? 
                                        userData.mensagem : 
                                            "") + 
                                        ( userData.viewCount ? 
                                            "<BR><B>Mensagem exibita " + userData.viewCount + " vezes</B>" : 
                                            "" ) + "</td>";
        htmlCode += "   </TR>";
        htmlCode += "   <TR>";
        htmlCode += "       <td  nowrap style=\"text-align: right;\" bgcolor=\"#cccccc\">A&ccedil;&otilde;es :</td>";
        htmlCode += "       <td>";
        htmlCode += "         <a id=\"" + key + "\" class=\"waves-effect message waves-light btn\"><i class=\"material-icons\">message</i></a> &nbsp;&nbsp;";
        htmlCode += "         <a id=\"" + key + "\" class=\"waves-effect blockUser waves-light btn\"><i class=\"material-icons\">block</i></a> &nbsp;&nbsp;";
        htmlCode += "       </td>";
        htmlCode += "   </TR>";
        htmlCode += "</TABLE>";

        return htmlCode;

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

    let dbUsers = firebase.database().ref( app.firebase.mainDB );

    dbUsers.orderByChild("ultimo_apontamento").endAt("ultimo_apontamento").on('value', snap => {
        // ****************************************************
        // Desenha tabela de usuarios cadastrados

        let result = new htmlRender();
        result.addTable();

        snap.forEach( elem => {
            let userData = elem.val();
            let currDate  = getCurrentDate();
            let diff = dateDiffInDays( new Date(userData.ultimo_apontamento), new Date(currDate) );
    
            diff = diff ? diff : 0;
    
            result.addRow( userData.nome_completo,
                result.addInfo( elem.key, userData ),
                diff
            );
        })

        result.closeTable();
        document.getElementById("lista").innerHTML = result.getHTML();
        $('.collapsible').collapsible();

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
                }
            });
        }

        // ****************************************************
        // Adiciona listener de eventos para os botões de bloqueio
        let blockList = document.getElementsByClassName("blockUser");
        for( let i=0; i<blockList.length; i++ ){
            blockList[i].addEventListener('click', evt => {
                let target = evt.target || evt.srcElement;
    
                while(target && !target.id) 
                    target = target.parentNode;
                if( target ) {
                    let opcao = confirm("Confirma o bloqueio do usuario " + target.id);

                    if( opcao ){
                        let dbBlock = firebase.database().ref( app.firebase.mainDB + target.id );
                        dbBlock.once('value', snap => {
                            let userData = snap.val();
                            userData.bloqueado = true;
                            dbBlock.set( userData );
                        })

                        // Envia mensagem
                        sendMessage( "Seu acesso a extensao foi bloqueado", target.id );
                    }
                }
            });
        }

    });

}


/**
 * Metodo para enviar mensagem na tela
 * @param {*} message 
 * @param {*} id 
 */
function sendMessage( message, id ){
    let currUser = localStorage.getItem("username");
    currUser = currUser.split("@")[0];

    let dbAdmin = firebase.database().ref( app.firebase.mainDB + currUser);
    dbAdmin.once('value', snap => {
        let adminData = snap.val();
        message += "\nEnviado por " + adminData.nome_exibicao;

        // Grava mensagem no firebase
        let dbMessage = firebase.database().ref( app.firebase.mainDB + id );
        dbMessage.once('value', userSnap => {
            let userData = userSnap.val();

            userData.mensagem = message;
            userData.viewCount = 0;
            userData.limiteExibicao = 10;
            dbMessage.set( userData );
        } );
    });
}


// Executa o listener do fitebase
readFirebase();


/**
 * Adiciona evento do botão para adicionar administrador
 */
document.getElementById("btAdd").addEventListener('click', evt => {
    let username = prompt("Entre com o nome do usuario administrador");
    let nome_exibicao = prompt("Entre com o nome a ser exibido");
    let publickey = prompt("Entre com a chave publica");

    if( username && nome_exibicao && specialKey ){
        let adminData = {
            nome_completo : nome_exibicao,
            publickey : publickey,
            admin : true
        };
    
        let dbAdmin = firebase.database().ref( app.firebase.mainDB + username);
        dbAdmin.set( adminData );
    }else{
        alert("Cancelado!");
    }
})


/**
 * Adiciona evento do botão para adicionar administrador
 */
document.getElementById("btAddUser").addEventListener('click', evt => {
    let username = prompt("Entre com o nome do usuario");
    let nome_exibicao = prompt("Entre com o nome a ser exibido");
    let publickey = prompt("Entre com a chave publica");

    if( username && nome_exibicao && publickey ){
        let userData = {
            nome_exibicao : nome_exibicao,
            publickey : publickey,
            admin : false
        };
    
        let dbAdmin = firebase.database().ref( app.firebase.mainDB + username);
        dbAdmin.set( userData );
    }else{
        alert("Cancelado!");
    }
})

/**
 * Metodo de logoff
 */
function logoff(){
    localStorage.removeItem("username");
    window.location = 'index.html';
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
