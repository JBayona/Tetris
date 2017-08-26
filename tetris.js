const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);


//Funcion para limpiar los renglines y dar puntos	
function arenaSweep() { //Desde abajo para arriba
    let rowCount = 1;
    outer: for (let x = arena.length -1; x > 0; --x) {
        for (let y = 0; y < arena[y].length; ++y) {
            if (arena[x][y] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(x, 1)[0].fill(0); //remove the row once we filled, la llenamo vacia
        arena.unshift(row); //y la ponemos en la cima de la arena
        ++x;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

//Funcion para verificar si chocan las piezas
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    	for (let y = 0; y < m.length; ++y) {
        	for (let x = 0; x < m[y].length; ++x) {
            	if (m[y][x] !== 0 &&
          		 	(arena[y + o.y] &&
                	arena[y + o.y][x + o.x]) !== 0) {
                	return true;
       		 	}
        	}	
    	}
     return false;
}

function createMatrix(w, h){ //width, height
	const matrix = [];
	while(h--){
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

//Funcion para recibir un tipo y regresar la estructura de la pieza
function createPiece(type){
	if(type === 'T'){
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0]
		];
	}else if( type === 'O'){
		return [
			[2, 2],
			[2, 2],
		];
	}else if( type === 'L'){
		return [
			[0, 3, 0],
			[0, 3, 0],
			[0, 3, 3]
		];
	}else if( type === 'J'){
		return [
			[0, 4, 0],
			[0, 4, 0],
			[4, 4, 0]
		];
	}else if( type === 'I'){
		return [
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0]
		];
	}else if( type === 'S'){
		return [
			[0, 6, 6],
			[6, 6, 0],
			[0, 0, 0]
		];
	}else if( type === 'Z'){
		return [
			[7, 7, 0],
			[0, 7, 7],
			[0, 0, 0]
		];
	}
}

function draw(){
	context.fillStyle = '#000'; //Color negro de nuestro juego
	context.fillRect(0, 0, canvas.width, canvas.height); //clean canvas

	drawMatrix(arena, {x:0, y:0}); //Dibuja los elementos ya caidos en el juego
	//console.log(player.pos);
	//Al principio la posicion va centrado en nuestro juego y despues se va modificando segun lo que presionemos
	drawMatrix(player.matrix, player.pos); //Dibuja cada uno de nuestras piezas que van cayendo del tetris
}

//Funcion que se ejecuta cada vez que la pieza va cayendo
//Cuando la pieza llega hasta abajo
function playerDrop(){
	player.pos.y++; //Esto es lo que hace que la pieza vaya cayendo una posicion cada tiempo
	//Llego al fondo o choco con otra pieza
	if(collide(arena, player)){
		player.pos.y--; //Un espacio menos para colocar
		merge(arena, player); //Hace el merge de nuestro juego con nuestra arena
		playerReset(); //Mandar una nueva pieza, actualizar puntajes, verificar fin del juego.
		arenaSweep(); //checa si ya se lleno una linea para limpiarla
		updateScore(); //Actualiza el score si es necesario
	}
	dropCounter = 0;
}

function playerMove(dir){
	//Mueve en la direccion que le mandemos con las flechas
	player.pos.x += dir;
	//Para no poder mas movimientos en las paredes
	if(collide(arena, player)){
		player.pos.x -= dir;
	}
}

function playerReset() {
    const pieces = 'TJLOSZI'; //String con nuestros tipos aleatorios
    //Generar una pieza aleatoria
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); //Player matrix es nuestra pieza aleatoria
    //Mandarla desde el principio
    player.pos.y = 0;
    //Colocar la pieza a la mitad
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    //Game is over
    if (collide(arena, player)) {
    	//Remove everything from arena
        arena.forEach(row => row.fill(0));
        //Reiniciamos contadores
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir){
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	//Evitar rotar en la pared y que se pare
	while(collide(arena,player)){
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1 )); //separa el tetris de la pared al rotarlo
		if(offset > player.matrix[0]. length){
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	};
}

//Transponse (cambiar los renglones a columnas y columnas a renglon) + reverse = rotate
function rotate(matrix, dir){
	for(let y = 0; y < matrix.length; ++y){
		for(let x = 0; x < y; ++x){
			//Para hacer el swap es como [a,b] = [b,a]
			[
				matrix[x][y],
				matrix[y][x]
			] = [
				matrix[y][x],
				matrix[x][y]
			]
		}
	}

	if(dir > 0){
		matrix.forEach(row => row.reverse());
	}else{
		matrix.reverse();
	}
}

let dropCounter = 0;
let dropInterval  = 1000; //Every 1 second we will drop a piece
let lastTime = 0;
//Se ejecuta periodicamente
function update(time = 0){
	const deltaTime = time -lastTime;
	lastTime = time;
	dropCounter += deltaTime;
	//The piece will go down each second
	if(dropCounter > dropInterval){
		playerDrop();
	}
	draw(); //Clean the pieces
	requestAnimationFrame(update); //Hacer cambios cada milisegundos
}

function updateScore(){
	document.getElementById('score').innerText = 'Score: ' + player.score;

}

//copy the values from player to arena, this is in order to control the pieces
function merge(arena, player){
	player.matrix.forEach((row,y) => {
		row.forEach((value, x) => {
			if(value !== 0){
				arena[ y + player.pos.y][x + player.pos.x] = value;
			}
		});
	});
}

function drawMatrix(matrix, offset) {
	matrix.forEach( (row,y) => {
		row.forEach((value,x) => {
			if(value !== 0){ //Los ceros los ignoramos, solo nos interesan los unos que son las figuras
				context.fillStyle = colors[value]; //Para los valores aleatorios
				context.fillRect(x + offset.x, y + offset.y, 1, 1); //x = width, y = tall
			}
		});
	});
}

document.addEventListener('keydown', event => {
	if(event.keyCode === 37){ //left
		playerMove(-1);
	}else if(event.keyCode === 39){ //right
		playerMove(	1);
	}else if(event.keyCode === 40){ //down
		playerDrop();
	}else if(event.keyCode === 81){ //q
		playerRotate(-1);
	}else if(event.keyCode === 87){ //w
		playerRotate(1);
	}
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena =  createMatrix(12,20);
//console.table(arena);

const player = {
	pos: {x : 0, y : 0},
	matrix: null,
	score: 0
};

//init
playerReset();
updateScore();
update();
