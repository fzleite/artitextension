"use strinc";


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

    version : "",

    // Informações de URLs dentro da aplicação
    url : {
        setUserPage      : "/set_user.html",
        rosieWebService  : "/data/rosieUserData.json",
        rosie            : "https://rosie.artit.com.br/",
        rosieApontamento : "https://rosie.artit.com.br/rh/apontamento-horas",
        disconnect       : "http://desconectar/",
        all_urls         : [
            "https://rosie.artit.com.br/rh/apontamento-horas",
            "https://rosie.artit.com.br/user/perfil",
            "https://rosie.artit.com.br/user/perfil#panel_apontamento"
        ]
    },

    // Informações de Icons
    icons : {
        defaultIcon      : "/images/icons/icon-72x72.png",
        alertIcon        : "/images/artit_notification.png",
        message          : "/images/message.png"
    },

    images : {
        notification : "/images/notification_bkg.png",
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
    },

    // Constantes de configuração de checagem
    config : {
        firstDayOfMonth    : 11,  // Constante que indica a partir de que dia deve apresentar os alertas de final de mês
        endOfMonth         : 25,  // Constante que indica a partir de que dia deve apresentar os alertas de final de mês
        differenceInDays   : 3    // Constante que indica com quantos dias sem apontamento deve iniciar a apresentar os alertas
    },

    firebase : {
        mainDB : "users/"
    }
}

// ***************************************************
// objeto para persistir dados internos do background
// ***************************************************
var bg = {
    message : "",
    indicator : null,

    alarm : {
        interval : null,
        notificationId : null
    },
    rosie : {
        interval : null
    },
    firebase : {
        interval : null
    },
    history : {
        interval : null
    },
    configuration : {
        interval : null,
        tabId : null
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
 *  *********************                                      SETUP                                     ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Metodo para setup do Background
 */
function setup(){
    // Verifica se existe um usuario configurado
    if( checkUser() ){

        // Desliga monitor do Setup
        clearInterval( bg.configuration.interval );

        // Verifica historico e o Rosie antes de executar os alarmes
        runHistory();
        runRosieFirebase();
        //runRosie();

        // Programa o alarme para executar em 15 segundos para dar tempo de processar o historico e o Rosie
        setTimeout( runAlarm, interval.QUARTER_MINUTE );

        // Verifica o historico do Browser para saber se o Rosie foi acessado
        bg.history.interval = setInterval(
                                    runHistory,
                                    interval.HOUR - interval.HALF_MINUTE
                            );
        
        // Verifica o webservice do Rosie para saber se houve apontamento
        //bg.rosie.interval = setInterval(
        //                        runRosie,
        //                        interval.SIX_HOURS
        //                    );
        // Verifica o firebase para ver se existem mensagens ou pedidos
        bg.firebase.interval = setInterval(
                                runRosieFirebase,
                                interval.SIX_HOURS
                            );

        // Programa a verificação a primeira verificação geral para 15 segundos, 
        // permitindo o tempo de resposta das leituras anteriores
        bg.alarm.interval = setInterval(
                                runAlarm, 
                                interval.HOUR
                            );
    }else{
        // Desliga demais processos
        clearInterval( bg.history.interval );
        clearInterval( bg.rosie.interval );
        clearInterval( bg.firebase.interval );
        clearInterval( bg.alarm.interval );

        // Limpa variaveis internas
        localStorage.removeItem("lastCheck");
        localStorage.removeItem("origem");
        localStorage.removeItem("AlarmCheckStatus");
        localStorage.removeItem("historyCheckStatus");
        //localStorage.removeItem("WSRosieCheckStatus");
        //localStorage.removeItem("WSRosieStatusDetail");
        localStorage.removeItem("FirebaseCheckStatus");
        localStorage.removeItem("FirebaseStatusDetail"); 

        // Agenda checagem de Setup
        bg.configuration.interval = setInterval( 
                                        setup, 
                                        interval.FIVE_MINUTE
                                    );

        // Chama metodo de abertura do Rosie
        openTab( app.url.setUserPage );                                                                
    }
}

/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  Checa o numero da versão e atualiza variaveis para registro
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */
let appVersionWS = new WebService({ 
    url: "manifest.json" 
});

appVersionWS.get( wsData => {
    app.version = wsData.version;
});

/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  Faz a chamada do metodo princiap
*  ****************************************************************************************************************************
*  ************************************************************************************************************************* */
setup();

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
 * Listener para captar mensagens da aplicação
 */
chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {

    // Captura mensagem de atualização de erro
    if( message.destinator === app.location.backgroundPage && message.request === app.request.update ){
        messageTo( 
            app.location.popupPage, 
            app.request.setMessage, 
            bg.message 
        );

    // Captura mensagem para definir icone padrão sem mensagem de erro
    }else if( message.destinator === app.location.backgroundPage && message.request === app.request.defaultIcon ){
        chrome.browserAction.setIcon({
            path : app.icons.defaultIcon
        });
        chrome.browserAction.setBadgeText({
            text: ""
        });

    // Recebe mensagem de disconexão
    }else if( message.destinator === app.location.backgroundPage && message.request === app.request.disconnect ){
        disconnectUser();
        setup();       

    // Recebe mensagem de setup
    }else if( message.destinator === app.location.backgroundPage && message.request === app.request.setup ){
        let user = localStorage.getItem("username").split("@")[0];
        let fullName  = localStorage.getItem("fullName");

        let dbRegister = firebase.database().ref( app.firebase.mainDB + user );
        dbRegister.once('value', snap => {
            let userData = snap.val();
            userData.conectado = true;
            userData.versao = app.version;

            dbRegister.set( userData );
        });

        setup(); 

    // Captura mensagem para abrir o Rosie
    }else if( message.destinator === app.location.backgroundPage && message.request === app.request.openRosie ){
        // Abre o Rosie
        openTab( app.url.rosieApontamento );
        localStorage.setItem("lastCheck", getCurrentDate() );

    // Captura mensagem para abrir uma Tab com um link
    }else if( message.destinator === app.location.backgroundPage && message.request === app.request.openNewTab ){
        // Abre o Rosie
        openTab( message.message );
    
    }   

});



/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                                 SEÇÃO DE RUNNERS                               ***********************
 *  *********************                                CHECAGEM DOS DADOS                              ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

/**
 * Checa se o usuario esta configurado
 */
function checkUser(){
    // Verifica se existem os dados do usuário
    let userName = localStorage.getItem("username");

    // Codigo para verificar se os dados do usuario existem na versão 1.4
    let name = localStorage.getItem("fullName"); // Esta variavel é da versão 1.4
    if( typeof name === null ){
        localStorage.removeItem("username");
        userName = null;
    }

    return ( userName === null ? false : true);
}


/**
 * Função de disconexão
 */
function disconnectUser(){
    let user = localStorage.getItem("username").split("@")[0];
    let dbLanc = firebase.database().ref( app.firebase.mainDB + user);

    dbLanc.once( 'value', snap => {
        let userData = snap.val();
        userData.conectado = false;

        dbLanc.set( userData );
    } );

    localStorage.removeItem("username");
}

/**
 * Checa historico para saber se houve acesso do rosie
 */
function runHistory(){
    let lastCheck;

    try{
        chrome.history.search( {
            text : app.url.rosie
        }, historyItems => {
            let bExistHistory = false;

            if( historyItems.length > 0 ){
                // Percorre toda a lista de historico
                for( let i=0; i<historyItems.length; i++ ){
                    bExistHistory = app.url.all_urls.contains( historyItems[i].url );
                    if( bExistHistory )
                        break;
                }
            }

            if( bExistHistory ){
                lastCheck = getCurrentDate();
                localStorage.setItem(
                    "lastCheck", 
                    getCurrentDate() 
                );

                chrome.browserAction.setIcon({
                    path : app.icons.defaultIcon
                });

                chrome.browserAction.setBadgeText({text: ""});

                // Informa que foi executado com sucesso
                localStorage.setItem(
                    "historyCheckStatus", 
                    "sucess"
                );
            }
        });
    }catch( err ){
        // Informa que foi executado com sucesso
        localStorage.setItem(
            "historyCheckStatus", 
            "failure"
        );
    }
    
}


/**
 * Checa Rosie para saber se houve apontamnento
 */
function runRosie(){

    try{
        let user = localStorage.getItem("username");
        let ws = new WebService({
            url : app.url.rosieWebService,
            format : "object"
        });
        
        if( user !== null ){
            user = user.split("@");
    
            // Budca dados do WebService
            ws.get(
                rosieData => {
                    let userData = rosieData.users[ user[0] ];
                    
                    if( typeof userData !== 'undefined' ){
                        let lastRegister = userData.ultimo_apontamento;
                        
                        lastRegister = lastRegister.split("/");
                        lastRegister = lastRegister[2] + "-" + lastRegister[1] + "-" + lastRegister[0];
                        localStorage.setItem(
                            "lastCheck", 
                            lastRegister);

                        // Informa que foi executado com sucesso
                        localStorage.removeItem("WSRosieStatusDetail");
                        localStorage.setItem(
                            "WSRosieCheckStatus", 
                            "sucess"
                        );
                    }else{
                        // Informa que foi executado com sucesso
                        localStorage.setItem(
                            "WSRosieCheckStatus", 
                            "failure"
                        );
                        localStorage.setItem(
                            "WSRosieStatusDetail", 
                            "Erro ao ler dados do usuario " + user[0]
                        );
                        throw new Error("Impossivel ler dados do usuário " + user[0] );
                    }
                }, err => {
                    // Informa que foi executado com sucesso
                    localStorage.setItem(
                        "WSRosieCheckStatus", 
                        "failure"
                    );
                    localStorage.setItem(
                        "WSRosieStatusDetail", 
                        err
                    );
                }
            );
        }
    }catch( err ){
        // Informa que foi executado com sucesso
        console.log(err);
        localStorage.setItem(
            "WSRosieCheckStatus", 
            "failure"
        );
        localStorage.setItem(
            "WSRosieStatusDetail", 
            err
        );
    }
    
}


/**
 * Ações a serem executadas quando chamado o alarme de hora em hora
 */
function runAlarm(){
    // Prepara variaveis de data
    let currDate = new Date();
    let diasDiff = 0;
    let lastCheck;

    // Reseta mensagem para refletir status atual
    bg.message = "";

    try{
        // Vefifica se existe o usuario cadastrado
        if( checkUser() ){

            // Recupera a data corrente no formato armazenado
            currDate  = getCurrentDate();
        
            // Busca a ultima data armazenada e a diferença para a data corrente
            lastCheck = localStorage.getItem("lastCheck");
            diasDiff = ( lastCheck === null ? 
                            30 :
                            dateDiffInDays( new Date(lastCheck), new Date(currDate) )
                        );

            // Envia notificação caso esteja a mais de 3 dias sem apontar as horas
            if( diasDiff > app.config.differenceInDays ){
                bg.message = "Você esta a mais de " + diasDiff + " dias sem apontar suas horas.";

            // Verificar se esta chegando o final do mês
            }else if( new Date(currDate).getDate() > app.config.endOfMonth & currDate != lastCheck ){
                bg.message = "Esta chegando o final do mês, não se esqueça de apontar suas horas!";

            // Verificar se esta chegando o final do mês
            }else if( (new Date(currDate).getDate()+1) == app.config.firstDayOfMonth & currDate != lastCheck ){
                bg.message = "Hoje é o ultimo dia para deixar seu apontamento em dia. Aponte suas horas!";
            }
            
            // Verifica se há mensagem e notificação a ser enviada
            if( bg.message !== "" ){
                bg.indicator = diasDiff.toString();
                sendNotification( {
                    indicator : bg.indicator,
                    message : bg.message
                } );
            }

        // Fim do If de checagem de Usuario
        }else{
            // Chama novamente o setup para interromper processos em andamento e reiniciar configuração
            setup();
        }

        localStorage.setItem("AlarmCheckStatus", "sucess");
    }catch( err ){
        localStorage.setItem("AlarmCheckStatus", "failure");
    }

}


/**
 * Checa Rosie para saber se houve apontamnento
 */
function runRosieFirebase(){

    try{

        let user = localStorage.getItem("username");
        
        if( user !== null ){
            user = user.split("@")[0];

            let dbLanc = firebase.database().ref( app.firebase.mainDB + user );

            // Budca dados do Firebase
            dbLanc.once('value', fbData => {
                let userData = fbData.val();

                if( userData ){
                    let lastRegister = localStorage.getItem("lastCheck");
                    lastRegister = ( lastRegister === null ? "2018-01-01" : lastRegister );
                    userData.ultimo_apontamento = lastRegister;

                    // Informa que foi executado com sucesso
                    localStorage.removeItem("FirebaseStatusDetail");
                    localStorage.setItem(
                        "FirebaseCheckStatus", 
                        "sucess"
                    );
    
                    // Verifica se há mensagem para o usuario
                    if( userData.mensagem ){
                        
                        // Checa se a mensagem foi exibida no limite
                        if( userData.viewCount < userData.limiteExibicao ){
                            userData.viewCount++;
                            let viewCount = ( userData.viewCount ? userData.viewCount : 0 );
                            viewCount = viewCount.toString();

                            sendNotification( {
                                    indicator : viewCount,
                                    iconUrl   : app.icons.message,
                                    message   : userData.mensagem
                                },
                                false 
                            );

                            // Informa contadores de visualização
                            userData.ultima_notificacao = getCurrentDate();
                        }else{
                            // Limpa mensagem
                            userData.mensagem = null;
                            //userData.viewCount = null;
                            //userData.limiteExibicao = null;
                        }
                    }

                    //Verifica se o usuario foi bloqueado ou resetado
                    if( userData.bloqueado || userData.publickey ){
                        disconnectUser();
                        setup();
                    }

                    dbLanc.set( userData );

                }else{
                    // Informa que foi executado com sucesso
                    localStorage.setItem(
                        "FirebaseCheckStatus", 
                        "failure"
                    );
                    localStorage.setItem(
                        "FirebaseStatusDetail", 
                        "Erro ao ler dados do usuario " + user[0]
                    );
                    throw new Error("Impossivel ler dados do usuário " + user[0] );
                }

            }, error => {
                // Informa que foi executado com sucesso
                localStorage.setItem(
                    "FirebaseCheckStatus", 
                    "failure"
                );
                localStorage.setItem(
                    "FirebaseStatusDetail", 
                    error.code
                );
            }); 
            
            // Verifica se chegou mensagem e apresenta para o usuario realtime
            let dbMessage = firebase.database().ref( app.firebase.mainDB + user + "/mensagem");
            dbMessage.on( 'value', snap => {
                let message = snap.val();
                runRosieFirebase();
                dbMessage.off();
            });

            // Verifica se o usuario foi bloqueado realtime
            let dbBloqueado = firebase.database().ref( app.firebase.mainDB + user + "/bloqueado");
            dbBloqueado.on( 'value', snap => {
                let bloqueado = snap.val();
                if( bloqueado ){
                    runRosieFirebase();
                    dbBloqueado.off();
                }
            });
        }
    }catch( err ){
        // Informa que foi executado com sucesso
        console.log(err);
        localStorage.setItem(
            "FirebaseCheckStatus", 
            "failure"
        );
        localStorage.setItem(
            "FirebaseStatusDetail", 
            err
        );
    }
    
}


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
 * Função para envio de notificações
 * @param {Object} notificationArgs
 * {
 *      indicator : text / number,
 *      message : text,
 * }
 * @param callBackF
 * @param eventsReponse
 */
function sendNotification( notificationArgs, sendImage ) {
    // Prepara variaveis de data
    try{

        // Verifica se é para exibir a imagem
        sendImage = ( sendImage !== false ? true : false );

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {

            // Trata parametros de entrada da notificação
            if( notificationArgs ){

                // Verifica se foi informado um indicador
                notificationArgs.indicator = 
                    ( notificationArgs.indicator ? notificationArgs.indicator : "!!!" );
                
                // Verifica se foi informado uma mensagem
                notificationArgs.message = 
                    ( notificationArgs.message ? notificationArgs.message : "Atenção, aponte suas horas agora mesmo" );

                notificationArgs.iconUrl = 
                    ( notificationArgs.iconUrl ? notificationArgs.iconUrl : app.icons.alertIcon );

                // Altera o icone do popup para o icone de alerta
                chrome.browserAction.setIcon({
                    path : app.icons.alertIcon
                });

                // Verifica se foi informado solicitado um novo badge
                if( notificationArgs.indicator ){
                    chrome.browserAction.setBadgeText({
                        text: notificationArgs.indicator
                    });                            
                }

            }

            // Invoca notificação do Chrome
            if( sendImage ){
                chrome.notifications.create({
                    type : 'image',
                    iconUrl : notificationArgs.iconUrl,
                    title : "ROSIE: ALERTA URGENTE",
                    message : notificationArgs.message,
                    imageUrl : app.images.notification,
                    priority : 2,
                    buttons : [
                        { title : "Apontar Agora"},
                        { title : "Lembrar em 1 hora"}
                    ]
                }, (id) => {
                    bg.alarm.notificationId = id;
                    setTimeout( () => {
                        chrome.notifications.clear( bg.alarm.notificationId );
                    }, interval.HALF_MINUTE );
                });
            }else{
                chrome.notifications.create({
                    type : 'basic',
                    iconUrl : notificationArgs.iconUrl,
                    title : "MENSAGEM DIRETA",
                    message : notificationArgs.message,
                    priority : 2,
                    buttons : [
                        { title : "Apontar Agora"},
                        { title : "Lembrar em 1 hora"}
                    ]
                }, (id) => {
                    bg.alarm.notificationId = id;
                    setTimeout( () => {
                        chrome.notifications.clear( bg.alarm.notificationId );
                    }, interval.HALF_MINUTE );
                });
            }

            let user        = localStorage.getItem("username").split("@")[0];
            let dbLastNotif = firebase.database().ref( app.firebase.mainDB + user);
            dbLastNotif.once('value', snap => {
                let userData = snap.val();

                userData.ultima_notificacao = getCurrentDate();
                dbLastNotif.set( userData );
            });
            
            
            // Cria evento para monitorar o click dos botões de ação
            chrome.notifications.onButtonClicked.addListener( (id, index) => {
                if( id === bg.alarm.notificationId ){
                    // Alerta do 1o botão
                    if( index === 0 ){
                        let lastCall = getCurrentDate();
                        localStorage.setItem("lastCheck", lastCall );

                        // Ajusta para o icone padrão
                        chrome.browserAction.setIcon({
                            path : app.icons.defaultIcon
                        });
                        
                        // Limpa o badge partindo do pressuposto de que o usuario irá apontar as horas
                        chrome.browserAction.setBadgeText({
                            text: ""
                        });
                                
                        // Abre o Rosie
                        openTab( app.url.rosieApontamento );

                        //Avisa o firebase que foi aberto o apontamento de horas
                        let user = localStorage.getItem("username").split("@")[0];
                        let dbApontamento = firebase.database().ref( app.firebase.mainDB + user );
                        dbApontamento.once('value', snap => {
                            let userData = snap.val();
                            userData.ultima_notificacao = getCurrentDate();

                            dbApontamento.set( userData );
                        })

                        chrome.notifications.clear( bg.alarm.notificationId );
                    // Alerta do 2o botão (Fechar)
                    }else{
                        chrome.notifications.clear( bg.alarm.notificationId );
                    }
                }
            });
            
        }

    }catch( err ){
        console.log( err );
    }
}


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


/**
 * Função para abrir nova aba
 * @param {address} address 
 */
function openTab( address ){
    // checa se a aba esta ativa

    address = !address ? app.url.rosieApontamento : address;

    chrome.tabs.query( {}, (tabList) => {
        let opened = false;
        // Percorre abas abertas para verificar se foi aberta uma aba do Rosie
        for( let i=0; i < tabList.length; i++ ){
            if( tabList[i].id === bg.configuration.tabId )
                opened = true;
        }
        // Abre nova aba para a configuração
        if(!opened){
            chrome.tabs.create({
                active : true,
                url : address
            }, tabInfo => {
                bg.configuration.tabId = tabInfo.id;
            });
        }else{
            //chrome.tabs.highlight( bg.configuration.tabId );
        }
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



/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                OBJETO PARA LER SERVIÇO EXTERNO                                 ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */



/**
 * Objeto para fazer leitura de JSON
 * @author Fernando Zimmermann Leite
 * @date 10/04/2018
 * {
 *     url : "",
 *     mimeType : ["application/json"],
 *     method : ["GET", "PUT", "PUSH"],
 *     format : ["object", "text"],
 *     auth : {
 *        user : "",    
 *        password : "",    
 *     }
 * }
 * 
 * Uso do prototype para adicionar novos metodos
 * get
 */
function WebService( args ) {
    this.wsParams = args;

    // Verifica parametro do objeto de entrada
    this.wsParams.mimeType = ( this.wsParams.mimeType ? "application/json" : this.wsParams.mimeType );
    this.wsParams.method = ( this.wsParams.method ? "GET" : this.wsParams.method );
    this.wsParams.format = ( this.wsParams.format ? "object" : this.wsParams.format );
    this.wsParams.format = ( ( this.wsParams.format !== "object" && this.wsParams.format !== "text" ) ? "object" : this.wsParams.format );
    if( this.wsParams.auth ){
        this.wsParams.auth.user = ( this.wsParams.auth.user ?this.wsParams.auth.user : null );
        this.wsParams.auth.password = ( this.wsParams.auth.password ? "" : this.wsParams.auth.password );
    }

    /**
     * Define metodo GET
     * @param callback
     */
    this.get = (callback, errorCb) => {
        try{
            let format = this.wsParams.format;
            let wsResponse = new XMLHttpRequest();
            wsResponse.overrideMimeType( 
                this.wsParams.mimeType );
            if( this.wsParams.auth === null ){
                wsResponse.open( 
                    this.wsParams.method, 
                    this.wsParams.url, 
                    true
                );
            }else{
                wsResponse.open( 
                    this.wsParams.method, 
                    this.wsParams.url, 
                    true,
                    this.wsParams.user, 
                    this.wsParams.password
                );
            }
            wsResponse.onreadystatechange = () => {
                if( wsResponse.status === 403 ){
                    throw new Error( "WebService Error reading: Status 403: Forbidden" );
                }else if( wsResponse.status === 404 ){
                    throw new Error( "WebService Error reading: Status 404: Not Found" );
                }else if (wsResponse.readyState == 4 && wsResponse.status == "200") {
                    if( callback !== 'undefined' ){
                        if( typeof callback === 'function' ){
                            if( format === "object" )
                                callback( JSON.parse( wsResponse.responseText ) );
                            else
                                callback( wsResponse.responseText );
                        }
                    }
                }
            }
            wsResponse.send(null);
            errorCb = null;
        }catch(err){
            errorCb( err );
        }
    } // Fim do metodo getData
    
}


/** ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  *********************                                                                                ***********************
 *  *********************                ALTERAÇÔES NAS ESTRUTURAS DOS OBJETOS                           ***********************
 *  *********************                                                                                ***********************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ****************************************************************************************************************************
 *  ************************************************************************************************************************* */

 /**
  * Metodo para checar se um array contem um objeto
  * @param obj
  */
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}