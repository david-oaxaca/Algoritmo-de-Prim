var numElems = 0;
var numEdges = 0;

var prevEdges = [];
var prevNodes = [];

var newEdge = [];

var elemSelected;

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

    ]
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
			if(edgeWeight != null  && !isNaN(edgeWeight)){
				
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
			}
		}else{
			alert("No puede crear dos aristas (Edges) con el mismo source y target");
		}

		newEdge.splice(0, 2);
		//Genera una nueva arista con los nodos seleccionados y el peso dado

		
	}else if(newEdge[1] == newEdge[0]){ //Evita que se pueda crear una arista que va hacia el mismo nodo
		newEdge.splice(0, 2);
	}
	
});

function eliminarElem(){

	if(elemType == "Edge") removeItem(prevEdges, elemSelected);
	if(elemType == "Node") removeItem(prevNodes, elemSelected);

	cy.remove('#'+elemSelected);
	//cy.remove(cy.nodes('#'+elemSelected).connectedEdges());
	elemSelected = "";
	newEdge.splice(0, 2);
	$("#eliminar_elem").hide();
}

function recorridoPrim(){

	const nodesWithoutEdges = cy.nodes().filter(node => node.connectedEdges(":visible").size() === 0);
	if(nodesWithoutEdges == 0 && elemType == "Node"){
		alert("Vamos bien");
		cy.nodes('#'+elemSelected).connectedEdges().animate({
		    style: {lineColor: "#018ABE"}
		});
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
	prevEdges = [];
	newEdge = [];
	elemSelected = "";
	elemType = "";
	$("#eliminar_elem").hide();
	cy.elements().remove();
}

function removeItem(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}


