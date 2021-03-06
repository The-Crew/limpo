/* 
  Habilitar debug no console
  Se quiser o debug no popup, manter debugPopup = true.
  @filipe
 */
var debugConsole = true,
	debugPopup = false;

function debug(frase, dados1="", dados2="", dados3="", dados4=""){
	dados = dados1 != "" ? typeof(dados1) != 'object' ? dados1 : JSON.stringify(dados1) : "";
	dados += dados2 != "" ? typeof(dados2) != 'object' ? ', '+ dados2 : ', '+ JSON.stringify(dados2) : "";
	dados += dados3 != "" ? typeof(dados3) != 'object' ? ', '+ dados3 : ', '+ JSON.stringify(dados3) : "";
	dados += dados4 != "" ? typeof(dados4) != 'object' ? ', '+ dados4 : ', '+ JSON.stringify(dados4) : "";

	if(debug){
		if(debugPopup){
			alert(frase+': '+dados);
   		}else{
			console.log(frase+': '+dados);
		}
	}
}
/* */

/*
  OBJETO RESPONSÁVEL POR CONTROLAR AS SOLICITAÇÕES E O TRAFEGO DE DADOS ENTRE OS MÉTODOS DO APP
  @filipe
*/

var Controller = function (){

    this.verificar = function(dados, tipo){
        /* debuando */
        debug('controller.js - controller.verificar()', dados, tipo);
		/* */
		
		switch(tipo){
			case 'user':
        		if(verificar(dados)!==false){
        			/* debuando */
        			debug('controller.js - controller.verificar()', 'Verificação aprovou');
        			/* */
        			return true;
        		}else{
        			/* debuando */
        			debug('controller.js - controller.verificar()', 'Erro na verificação');
        			/* */
            		return false;
        		}
        	break;
		    case 'imovel':
		    	if(verificar(dados)!==false){
		    		/* debuando */
        			debug('controller.js - controller.verificar()', 'Verificação aprovou');
        			/* */
        			return true;
        		}else{
        			/* debuando */
        			debug('controller.js - controller.verificar()', 'Erro na verificação');
        			/* */
            		return false;
        		}
		    break;
    	}
	}

	/*
	TRATANDO JSON AO REGISTRAR
	ESSE JSON SERÁ ENVIADOR DIRETAMENTE PARA O SERVIDOR
	TODOS ATRIBUTOS QUE O SERVIDOR PRECISE DEVE SER COLOCADO AQUI
	ESSA FOI A MELHOR FORMA DE FAZER PARA TENTAR FACILITAR A COMUNICAÇÃO CLIENTE-SERVIDOR
	O JSON SERÁ PASSADO PARA O server.enviar, NO QUAL IRÁ ENVIAR AO SERVIDOR SEM ALTERAR DADOS
	@filipe
	*/
	this.registrar = function(dados, tipo){
		/* debuando */
        debug('controller.js - controller.registrar()', dados, tipo);
		/* */
		switch(tipo){
			case 'user':
				if(controller.verificar(dados.dados, tipo)){
					json = {};

            		json.action = dados.action == 'atualizar' ? 'atualizar' : 'registrar';
					json.tipo = 'user';
					json.idUser = dados.dados.getId();
					//UMA FORMA PRATICA DE OBTER OS DADOS DO OBJETO
					json.dados = dados.dados.getJson();

					server.enviar(json, function(retorno){
						retorno = JSON.parse(retorno);
						if(retorno){
							user.setJson(retorno);
							if(json.action == 'registrar'){
								//abrir pagina inicial
								view.pagina('mapa');
							}else{
								//ficar na pagina
							}
						}else{
							/* debuando */
							debug('controller.js - controller.registrar() - Dados retornado pelo server',retorno);
							/* */
							view.err('Falha ao registrar');
						}
					});
					
				}else{
					//view.err(dados.dados);
				}
			break;
			case 'imovel':
				if(controller.verificar(dados.dados, tipo)){
					json = {};
            		json.action = dados.action == 'atualizar' ? 'atualizar' : 'registrar';
					json.tipo = 'imovel';
					json.idUser = user.getId();
					//UMA FORMA PRATICA DE OBTER OS DADOS DO OBJETO
					json.dados = dados.dados.getJson();

					server.enviar(json, function(retorno){
						retorno = JSON.parse(retorno);
						if(retorno){
							/*	AO ENVIAR E REGISTRAR O NOVO IMOVEL É RETORNADO UM NOVO
								ARRAY DE IMOVEIS E O MESMO PRECISA SER NOVAMENTE INSTANCIADO
								NO ARRAY DE IMOVEIS DO APP
								NESSE CASO FOI NECESSÁRIO UM FOR PARA INSTANCIAR OS IMOVEIS
								NO ARRAY DE IMOVEIS DO APP
							*/
							imoveis = [];
							for(var i in retorno){
								console.log('For 1 dos imoveis, i: '); console.log(i);
								imoveis[i] = new Imovel();
								//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
								imoveis[i].setJson(retorno[i]);
							}
							console.log(imoveis);
							view.pagina('imoveis');
						}else{
							/* debuando */
							debug('controller.js - controller.registrar() - Dados retornado pelo server',retorno);
							/* */
							view.err('Falha ao registrar');
						}
					});
					
				}else{
					//view.err(dados.dados);
				}
			break;
			case 'remover':
				if(dados.tipo == 'user'){
					var popup = {};
					popup.perigo = true;
					popup.titulo = 'Tem certeza que deseja remover sua conta?';
					popup.texto = 'Essa operação não terá mais retorno';
					view.popup(popup, 'confirm', function(retorno){
						if(retorno){
							var json = {};
							json.idUser = dados.idUser;
							json.action = 'remover';
							json.tipo = 'user';
							server.enviar(json, function(retorno){
								console.log(retorno);
								view.pagina('login');
							});
						}else{}
					})
					
				}else if(dados.tipo == 'imovel'){
					var json = {};
					json.idUser = user.getId();
					json.idImovel = dados.idImovel;
					json.action = 'remover';
					json.tipo = 'imovel';
					server.enviar(json, function(retorno){
						retorno = JSON.parse(retorno);
						if(retorno){
							/*	AO REMOVER UM IMOVEL É RETORNADO UM NOVO
								ARRAY DE IMOVEIS E O MESMO PRECISA SER NOVAMENTE INSTANCIADO
								NO ARRAY DE IMOVEIS DO APP
								NESSE CASO FOI NECESSÁRIO UM FOR PARA INSTANCIAR OS IMOVEIS
								NO ARRAY DE IMOVEIS DO APP
							*/
							imoveis = [];
							for(var i in retorno){
								console.log('For 1 dos imoveis, i: '); console.log(i);
								imoveis[i] = new Imovel();
								//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
								imoveis[i].setJson(retorno[i]);
							}
							console.log(imoveis);
							view.pagina('imoveis');
						}else{
							/* debuando */
							debug('controller.js - controller.registrar() - Dados retornado pelo server',retorno);
							/* */
							view.err('Falha ao registrar');
						}
					});
				}
			break;
			case 'faxineira':
				dados.idUser = user.getId();
				server.enviar(dados, function(){

				});
			break;
		}
	}
	this.solicitar = function(dados, tipo, callback){
		/* debuando */
        debug('controller.js - controller.solicitar()', dados, tipo);
		/* */

		switch(tipo){
			case 'user':
				/*	SOLICITAR DADOS DO USUARIO AO SERVIDOR.
					OS DADOS SERÃO RETORNADOS COM TODAS INFORMAÇÕES DO USUARIO
					@filipe
				*/
				if(dados.action == 'login'){
					user.setId(dados.idUser);
					server.obter(dados, function(retorno){
						if(retorno != 'false'){
							// CONVERTER EM OBJETO
							retorno = JSON.parse(retorno);
							//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
							user.setJson(retorno);

							/*	IRÁ RETORNAR JUNTO COM OS DADOS O ARRAY DE IMOVEIS
								NESSE CASO FOI NECESSÁRIO UM FOR PARA INSTANCIAR OS IMOVEIS
								NO ARRAY DE IMOVEIS DO APP
							*/
							imoveis = [];
							for(var i in retorno.imoveis){
								console.log('For 1 dos imoveis, i: '); console.log(i);
								imoveis[i] = new Imovel();
								//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
								imoveis[i].setJson(retorno.imoveis[i]);
							}
							var listaFax = [];
							for(var i in retorno.indic){
								if(!listaFax.hasOwnProperty(retorno.indic[i].id)){
									listaFax[retorno.indic[i].id] = true;
									faxineiras[i] = new Faxineira();
									//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
									faxineiras[i].setJson(retorno.indic[i]);
								}
							}
							console.log(imoveis);
							$(".nome-user").html(user.getNome());
							carregado = true;
							view.pagina('mapa');
						}else{
							/* debuando */
							debug('controller.js - controller.solicitar() - Dados retornado pelo server',retorno);
							/* */
							view.pagina('cadastro');
						}
					});
				}
			break;
			case 'imovel':
				if(dados == 'array'){
					var json={};
					json.id = user.getId();
					json.tipo = 'imovel';
					
					var retorno = server.obter(json);

					if(!retorno){
						/* debuando */
						debug('controller.js - controller.registrar() - Dados retornado pelo server',retorno);
						/* */
						view.err('Falha ao solicitar');
					}else{
						return retorno;
					}
				}
			break;
			case 'faxineira':
				console.log("faxineira");
				if(dados.tipo == 'lista'){
					dados = {action:"faxineira", tipo:"lista", idUser:user.getId()};
					server.obter(dados, function(retorno){
						var listaFax = [];
						for(var i in retorno.indic){
							if(!listaFax.hasOwnProperty(retorno.indic[i].id)){
								listaFax[retorno.indic[i].id] = true;
								faxineiras[i] = new Faxineira();
								//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
								faxineiras[i].setJson(retorno.indic[i]);
							}
						}
						callback.call(null, faxineiras);
					});
				}else if(dados.tipo == 'sys'){
					dados = {action:"faxineira", tipo:"sys", idFax:dados.idFax};
					server.obter(dados, function(retorno){
						console.log("Faxineira: "+retorno);
						callback.call(null, JSON.parse(retorno));
					});
				}else if(dados.tipo == 'melhor'){
					dados = {action:"faxineira", tipo:"melhor", idUser:dados.idUser};
					server.obter(dados, function(retorno){
						console.log("Melhor faxineira: "+retorno);
						callback.call(null, JSON.parse(retorno));
					});
				}else if(dados.action == "solicitar"){
					dados.idUser = user.getId();
					server.obter(dados, function(retorno){
						console.log("Retorno: "+retorno);
						retorno = JSON.parse(retorno);
						if(retorno == false){
							view.popup({texto:'Faxineira ocupada'})
						}else{
							var listaFax = [];
							for(var i in retorno.indic){
								if(!listaFax.hasOwnProperty(retorno.indic[i].id)){
									listaFax[retorno.indic[i].id] = true;
									faxineiras[i] = new Faxineira();
									//UMA FORMA PRATICA DE SETAR OS DADOS NO OBJETO
									faxineiras[i].setJson(retorno.indic[i]);
								}
							}
							for(var i = 0; i < retorno.qualificacao; i++){
								conteudoAguardando+='<img style="margin-top:-15px" src="images/star15.png" height="15px">';
							}
							console.log(retorno)
							retorno.sexo = retorno.sexo == "M" ? "Masculino" : "Feminino";
							var conteudoAguardando = '<div class="text-center"><div class="widget scale-image d-margins" data-uib="media/img" data-ver="0"><figure class="figure-align"><img src="images/icon-faxineira.png"></figure></div><h2>'+retorno.nome+'</h2>';
							for(var i = 0; i < retorno.qualificacao; i++){
								conteudoAguardando +='<img style="margin-top:-15px" src="images/star15.png" height="15px">';
							}
							conteudoAguardando += '</div><blockquote><div class=""><div>Sexo: ';
							conteudoAguardando += retorno.sexo+'</div><div>'+retorno.endereco+'</div><div>Distancia: '+distanciaF+'</div><div>Tempo estimado: '+tempoF+'</div></div></blockquote>';
							$("#content-aguardando").html(conteudoAguardando);
							view.pagina('aguardando');
						}
						
					});
				}else if(dados.action == "solicitarOff"){
					dados.idUser = user.getId();
					server.obter(dados, function(retorno){
						console.log("Retorno: "+retorno);
						retorno = JSON.parse(retorno);
						if(retorno == 'false'){
							controller.solicitar({action:'solicitarOff',idFax:faxineiraASerSolicitada, solLat:null, solLng:null},'faxineira');
						}else{
							$('.btn-aguardando').hide();
							view.pagina('mapa');
						}
						
					});
				}else if(typeof(dados) == "number"){
					controller.solicitar({action:'solicitar',idFax:faxineiraASerSolicitada, solLat:imoveis[dados].getLat(), solLng:imoveis[dados].getLng()},'faxineira');
				}

			break;
		}
	}
}

//INSTANCIA O OBJETO PARA SER USADO POR TODO PROGRAMA
var controller = new Controller;