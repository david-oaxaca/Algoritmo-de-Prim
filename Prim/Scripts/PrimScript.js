var numElems = 0;
var numEdges = 0;
var aux;
var prevEdges = [];
var prevNodes = [];
var edgesVerificar=[];
var nodesArbol=[];
var newEdge = [];
var SumaPesos = 0;

var elemSelected;
var lastElemeSelected;
var elemType;

var cy = cytoscape({
 container: document.getElementById('cy'),

  style: [
    {
      selector: 'node',
      style: {
		'text-halign' : 'center',
		'text-valign' : 'center',
        shape: 'circle',
        'background-color': '#02457A',
        color : "#FFFFFF",
        label: 'data(id)'
      }
    },
    {
      selector: 'edge',
      css: {
        'label': 'data(weight)',
        'text-margin-y': 15,
        
      }
    }

    ],

    wheelSensitivity: 0.2
});
cy.layout({
    name: 'circle'
}).run();

//Funcion OnClick para el fondo del canvas (En ningun elemento del grafo)
cy.on('tap',  function(event){
	// El target hace referencia al objeto seleccionado
	var evtTarget = event.target;

	if( evtTarget === cy ){
		//Crea un nuevo nodo en la posicion del canvas seleccionada
		var nuevoID = generarID(numElems);
		cy.add({
			group: 'nodes',
            data: { id:  nuevoID},
            renderedPosition: {
	            x: event.renderedPosition.x,
	            y: event.renderedPosition.y,
	        }
        });
        prevNodes.push(nuevoID);
        numElems++;
        newEdge.splice(0, 2);
	}
});

cy.on('tap', 'edge',  function(event){
	var evtTarget = event.target;
	//Si una arista edge fue seleccionada
	//Guarda el elemento seleccionado 
	elemSelected = event.target.id(); 
	$("#eliminar_elem").show(100);
	elemType = "Edge";
});

//Funcion OnClick para un elemento seleccionado, en este caso, unicamente si es un nodo
cy.on('tap', 'node',  function(event){
	// El target hace referencia al objeto seleccionado
	var evtTarget = event.target;
	elemSelected = event.target.id();
	nodesArbol[0]=elemSelected;
	cy.nodes('#'+lastElemeSelected).animate({
		style: {'background-color': "#02457A"}
	});
	cy.nodes('#'+elemSelected).animate({
		style: {'background-color': "#018ABE"}
	});
	$("#eliminar_elem").show(100);
	elemType = "Node";

    //OnClick en un elemento del grafo
	newEdge.push(event.target.id());
	//Si dos nodos diferentes son seleccionados crea una nueva arista
	if(newEdge.length == 2 && (newEdge[1] != newEdge[0])){
		
		//Verificación de que la arista que se va a crear no comparta el mismo target y source que otra

		var ext = prevEdges.indexOf( (newEdge[1] + newEdge[0]));
		var extInv = prevEdges.indexOf( (newEdge[0] + newEdge[1]));
		
		if(ext < 0 && extInv < 0){
			//Pregunta con un prompt cual sera el peso de la arista

			var edgeWeight = prompt("¿Cual es el peso de esta arista? (Deje en blanco para asignar peso al azar)");
			//var edgeWeight="";
			if(edgeWeight != null  && !isNaN(edgeWeight)){

				if(edgeWeight > 0 || edgeWeight == ""){
				
					if(edgeWeight == "") edgeWeight = Math.floor(Math.random() * (99 - 1) + 1);
				
					cy.add({
						group: 'edges',
		                data: {
		                    id: newEdge[0] + newEdge[1],
		                    source: newEdge[0],
		                    target: newEdge[1],
		                    weight: edgeWeight
		                }
		            });

					prevEdges.push(newEdge[0] + newEdge[1]);
		            numEdges++;
		        }else{
		        	alert("No introduzca numeros negativos");
		        }    
			}
		}else{
			alert("No puede crear dos aristas (Edges) con el mismo source y target");
		}
		
		newEdge.splice(0, 2);
		//Genera una nueva arista con los nodos seleccionados y el peso dado

		
	}else if(newEdge[1] == newEdge[0]){ //Evita que se pueda crear una arista que va hacia el mismo nodo
		newEdge.splice(0, 2);
	}
	lastElemeSelected=elemSelected;
});

function eliminarElem(){

	if(elemType == "Edge") removeItem(prevEdges, elemSelected);
	if(elemType == "Node"){ 

		cy.nodes("#"+elemSelected).connectedEdges().forEach(edge => {
			removeItem(prevEdges, edge.data().id);
		});

		removeItem(prevNodes, elemSelected);

	}

	cy.remove('#'+elemSelected);
	//cy.remove(cy.nodes('#'+elemSelected).connectedEdges());
	elemSelected = "";
	newEdge.splice(0, 2);
	$("#eliminar_elem").hide();
}

function recorridoPrim(){
	const nodesWithoutEdges = cy.nodes().filter(node => node.connectedEdges(":visible").size() === 0);
	if(nodesWithoutEdges == 0 && elemType == "Node"){
		
		seleccionEdges(nodesArbol,prevEdges);
		console.log("edgesVerificar "+edgesVerificar);

		obtenerPesoMenor();
		$("#eje_Prim").val("Siguiente paso >>");
		$("#eliminar_elem").hide();
		$("#eliminarElemento").hide();
		$( "#cy" ).addClass("proceso-prim");
		$("#reiniciar").show(100);
		$("#indicador-nodesD").show(100);
		if(prevNodes.length==nodesArbol.length){
			document.getElementById('eje_Prim').style.display="none";
			$("#reiniciar").val("Volver a intentar");

			$("#Titulo_recorrido").empty();

			var titulo = "<h2>Recorrido completado</h2>";
	    	 $("#Titulo_recorrido").append(titulo); 
		}

	}else{
		alert("Asegurese de haber seleccionado un nodo para iniciar y que todos los nodos tengan al menos una conexión");
	}
	
	
}

function generarID(num){
	var newID = "";
	//var limit = (num/25) >= 1 ? 1 : 0;

	//El numero maximo de nodos que se pueden tener es 99, y esta combinación permite hasta 650 
	if((num/26) >= 1){
		newID += String.fromCharCode( num/26 + 64);
		newID +=  String.fromCharCode( (num % 26)  + 65);
	}else{
		newID += String.fromCharCode( num + 65);
	}

	return newID;
}

function resetGraph(){
	numElems = 0;
	numEdges = 0;
	SumaPesos = 0;
	prevEdges = [];
	newEdge = [];
	elemSelected = "";
	elemType = "";
	aux;
	prevEdges = [];
	prevNodes = [];
	edgesVerificar=[];
	nodesArbol=[];
	newEdge = [];
	lastElemeSelected = "";
	$( "#Titulo_peso" ).empty();
	vaciarRecorrido();
	$( "#cy" ).removeClass("proceso-prim");
	$("#indicador-nodesD").hide();
	$("#eliminar_elem").hide();
	$("#reiniciar").hide(100);
	$("#eje_Prim").val("Reiniciar grafo");
	$("#eje_Prim").val("Mostrar el algoritmo de Prim");
	$("#eliminarElemento").show(100);
	$("#eje_Prim").show(100);
	cy.elements().remove();

}

function removeItem(arr, value) {
	
	var index = arr.indexOf(value);
	if (index !== -1) {
		arr.splice(index, 1);
	}
	return arr;
}
function obtenerPesoMenor(){
	var edgeWeight;
	var lastEdgetWeight=cy.edges("#"+edgesVerificar[0]).data().weight;
	var edgewin;
	
	if(edgesVerificar.length == 1){
		edgewin=edgesVerificar[0];
		nodesArbol.forEach(node => {
			if(edgewin.includes(node)){
				console.log("elem "+node);
				nodeAdd=edgewin.replace(node,'');
			}	
		});
		
		nodesArbol.push(nodeAdd);
		console.log("Arbol ultimo "+ nodesArbol);
	}else{
		j=0;
		for(i=1;i<edgesVerificar.length;i++){
			edgeWeight=cy.edges("#"+edgesVerificar[i]).data().weight;
			if(lastEdgetWeight>edgeWeight){
				lastEdgetWeight=edgeWeight;
				edgewin=edgesVerificar[i];
				j=i;	
			}
			else{
				edgewin=edgesVerificar[j];
			}
		}
		nodesArbol.forEach(node => {
			if(edgewin.includes(node)){
				console.log("elem "+node);
				nodeAdd=edgewin.replace(node,'');
			}	
		});
		
		nodesArbol.push(nodeAdd);
		console.log("Arbol ultimo "+ nodesArbol);
	}

	SumaPesos += cy.edges('#'+edgewin).data().weight;
		
	cy.edges('#'+edgewin).animate({
		style: {lineColor: "#018ABE"}
	});
	cy.nodes('#'+nodeAdd).animate({
		style: {'background-color': "#018ABE"}
	});

	displayNode(nodeAdd);
}

function seleccionEdges(nodos,aristas){
	var j=0;
	nodos.forEach(node => {
		aristas.forEach(edge => {
			if(edge.includes(node)){
				edgesVerificar[j]=edge;
				j++;
			}
		});
	});console.log("edges sin elmi "+edgesVerificar)
	//elimino id de edge repetidas
	for(i = edgesVerificar.length -1; i >=0; i--){
		if(edgesVerificar.indexOf(edgesVerificar[i]) !== i) 
			edgesVerificar.splice(i,1);
	}
	console.log("arbol promero "+nodesArbol)
	//elimino edges 
	for(i=0;i<nodesArbol.length-1;i++){
		for(j=1;j<nodesArbol.length;j++){
			removeItem(edgesVerificar,(nodesArbol[i]+nodesArbol[i+j]))
			removeItem(edgesVerificar,(nodesArbol[i+j]+nodesArbol[i]))
		}
	}
		//edgesVerificar=removeItem(edgesVerificar,(nodesArbol[0]+nodesArbol[1]));
}


function displayNode(nodeID){
	if ( $('#Nodes_display').children().length == 0 ) {
		var titulo = "<h2>Nodos recorridos</h2>";
	    $("#Titulo_recorrido").append(titulo); 

	    var tituloP = "<h2>Peseo del recorrido :  "+SumaPesos+"</h2>";
	    $("#Titulo_peso").append(tituloP); 

	     var inicial = "<div class='nodo-recorrido'>"+elemSelected+"</div>";
	     $("#Nodes_display").append(inicial); 
	}

	$( "#Titulo_peso" ).empty();

	var tituloP = "<h2>Peso del recorrido :  "+SumaPesos+"</h2>";
	$("#Titulo_peso").append(tituloP); 

	var nodeD = "<div class='nodo-recorrido'>"+nodeID+"</div>";   
	$("#Nodes_display").append(nodeD); 
}

function vaciarRecorrido(){
	$( "#Nodes_display" ).empty();
	$("#Titulo_recorrido").empty();
}
