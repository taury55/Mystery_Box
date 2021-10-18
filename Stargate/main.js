import "./style.css";
import * as THREE from 'three/build/three.module.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Import Audio files

import chevronEngageSoundImport from "./assets/audio/chevron.mp3";
import gateStartSoundImport from "./assets/audio/gate_start.mp3";
import gateRollSoundImport from "./assets/audio/gate_roll.mp3";
import gateOpenSoundImport from "./assets/audio/gate_open.mp3";
import gateOpenedSoundImport from "./assets/audio/gate_opened.mp3";
import alertSoundImport from "./assets/audio/alert.mp3";
import lightSwitchSoundImport from "./assets/audio/kill_switch.mp3";
import epicSaxGuySoundImport from "./assets/audio/epic_sax_guy.mp3";

const chevronEngageSound = new Audio(chevronEngageSoundImport);
const gateStartSound = new Audio(gateStartSoundImport);
const gateRollSound = new Audio(gateRollSoundImport);
const gateOpenSound = new Audio(gateOpenSoundImport);
const gateOpenedSound = new Audio(gateOpenedSoundImport);
const alertSound = new Audio(alertSoundImport);
const lightSwitchSound = new Audio(lightSwitchSoundImport);
const epicSaxGuySound = new Audio(epicSaxGuySoundImport);

chevronEngageSound.volume = 0.12;
gateStartSound.volume = 0.12;
gateRollSound.volume = 0.12;
gateOpenSound.volume = 0.12;
gateOpenedSound.volume = 0.12;
alertSound.volume = 0.12;
lightSwitchSound.volume = 0.2;
epicSaxGuySound.volume = 0.12;

// Import FBX Files

const sceneGLTF = "./assets/geometry/scene.gltf";

// Import Texture Files

import concreteSidesColorTexture from "./assets/textures/concrete_sides_color.png";
import concreteSidesNormalTexture from "./assets/textures/concrete_sides_normal.png";
import concreteBackColorTexture from "./assets/textures/concrete_back_color.png";
import concreteBackNormalTexture from "./assets/textures/concrete_back_normal.png";

// Import Font

const anquietasFontImport = "./assets/fonts/Anquietas_Regular.json";


// Variables

const chars = ['-', '|', '_', ' '];
const colors = ['#29A6A6', '#D5C896', '#CCC99C', '#2B5858'];

const lights = [];

var currentSymbolIndex = null;

const modelSymbols = [0, 29, 21, 34, 20, 37, 3, 26, 6, 14, 11, 17, 36, 31, 25, 18, 4, 30, 1, 16, 27, 19, 28, 9, 15, 24, 10, 33, 8, 13, 22, 5, 38, 35, 32, 2, 23, 7, 12];

const symbolsChars = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n' ];

const onMorseSeq = [
	2, 2,
	1, 1,
	2, 1, 2, 1,
	1, 2, 1,
	2, 2, 2,
	1, 1, 1,
	2, 1, 2, 1,
	2, 2, 2,
	1, 2, 2, 1,
	1, 1,
	1, 1, 2,
	2, 2,
];

const offMorseSeq = [
	1, 3,
	1, 3,
	1, 1, 1, 3,
	1, 1, 3,
	1, 1, 3,
	1, 1, 3,
	1, 1, 1, 3,
	1, 1, 3,
	1, 1, 1, 3,
	1, 3,
	1, 1, 3,
	1, 6,
];

const onAlertSeq = [5, 2, 4, 4, 1, 4, 5, 3, 0];
const offAlertSeq = [1, 4, 2, 1, 1, 3, 4, 4, 10];

const chevron_movement = 1;
const chevron_speed = 0.003;
const symbol_rotation_speed = 0.4;

var actualSymbolSeq = [0, 0, 0, 0, 0, 0, 0];
var symbolsSelected = [0, 0, 0, 0, 0, 0, 0];
var seq = [];

var allSelected = 0;
var actual_symbol = 0;
var animation_direction = 1;
var last_direction = 1;
var rotation_timer = 0;
var chevron_direction = 0;
var run_chevron = 0;
var done_animation = 1;
var lit_chevrons = 0;

var lights_state = 0;

var radioIsPlaying = 0;

var lastMorseSeq = 0;
var lastAlertSeq = 0;
var alertState = 0;
var timerAlertSeq = 0;

var clockText = new THREE.Object3D();
var lastClockMins = -1;
var lastDoubleDot = 0;

var planetName = "none";
var dialingSuccess = 0;
var failed_timer = 2000;

// HTML elements
const binary1 = document.getElementById('binary-1');
const binary2 = document.getElementById('binary-2');

for (let i = 1; i <= 5; i++) {
	lights.push(document.getElementById('light-' + i));
}

const symbolSelection = document.getElementById('symbolSelection');
const circle = document.getElementById('circle');
const message = document.getElementById('message');
const planetNameMessage = document.getElementById('planetName').firstElementChild;

const symbols = [];
const chevrons = [];
const statusList = [];
for (let i = 0; i < 7; i++) {
	symbols.push(document.getElementById('symbol-' + i));
	chevrons.push(document.getElementById('chevron-' + i));
	statusList.push(document.getElementById('status-' + i));
}

const sdInputs = [];
for (let i = 1; i <= 6; i++) {
	sdInputs.push(document.getElementById("sd-input-num-"+i));
}

const panelInputs = [];
panelInputs.push(document.getElementById("sd-input"));
panelInputs.push(document.getElementById("info-input"));
panelInputs.push(document.getElementById("stargate-input"));


const panelOutputs = [];
panelOutputs.push(document.getElementById("sd-panel"));
panelOutputs.push(document.getElementById("info-panel"));
panelOutputs.push(document.getElementById("stargate-panel"));

// 3D Elements
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
	antialias: true,
});

const loader = new GLTFLoader();

const loaderFont = new THREE.FontLoader();

//const controls = new OrbitControls(camera, renderer.domElement);

var sceneRoot = new THREE.Object3D();

const materialsLib = [];
const bridgeLights = [];
const chevronLights = [];

const roomMainLight = new THREE.PointLight();
const leftAlertLight = new THREE.PointLight(0x970000, 0, 0.5);
const rightAlertLight = new THREE.PointLight(0x970000, 0, 0.5);

const concreteMaterials = [];

const backWallColorTexture = new THREE.TextureLoader().load(concreteBackColorTexture);
const backWallNormalTexture = new THREE.TextureLoader().load(concreteBackNormalTexture);

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const clickableObjects = [];


window.addEventListener('DOMContentLoaded', init, false);

function init() {


	setInterval(() => {        
		if (binary1.innerHTML.length > 140) {
			binary1.innerHTML = binary1.innerHTML.slice(1);
		}

		if (binary2.innerHTML.length > 140) {
			binary2.innerHTML = binary2.innerHTML.slice(1);
		}

		if (Math.random() * 10 > 8) {
			binary1.innerHTML += ' ';
		} else {
			binary1.innerHTML += Math.round(Math.random()).toString();
		}

		if (Math.random() * 10 > 8) {
			binary2.innerHTML += ' ';
		} else {
			binary2.innerHTML += Math.round(Math.random()).toString();
		}
	}, 100);

	setInterval(() => {
		lights[0].innerHTML = '';
		lights[1].innerHTML = '';
		lights[2].innerHTML = '';
		lights[3].innerHTML = '';
		lights[4].innerHTML = '';

		for (let i = 0; i < 8; i++) {
			lights[0].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[1].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[2].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[3].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[4].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
		}

		for (let i = 0; i < 12; i++) {
			lights[0].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[1].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[2].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
			lights[3].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
		}

		for (let i = 0; i < 32; i++) {
			lights[3].innerHTML += '<span style="color:' + colors[Math.round(Math.random() * 3)] + '">' + chars[Math.round(Math.random() * 3)] + '<span>';
		}
	}, 1000);

	symbolSelection.style.display = 'none';


	// Panel Buttons Reset
	for (let i = 0; i<3; i++) {
		if (panelInputs[i].checked) {
			panelInputs[i].checked = false;
		}
	}


	// Adding Event Listeners


	// Window resize
	window.addEventListener( 'resize', onWindowResize, false);


	// Dialing Computer Symbol Clicked
	for (let i = 0; i < 7; i++) {
		document.getElementById("symbol-"+(i)).addEventListener('click', function() {
			onClickSymbol(i);
		}, false); 
	}

	// Symbol Selected
	for (let i = 0; i < 39; i++) {
		document.getElementById("symbolSel-"+i).addEventListener('click', function() {
			onSelectedSymbol(i);
		}, false);
	}

	// Symbol Database
	document.getElementById("sd-search").addEventListener('click', searchBtnClicked, false);

	for (let i = 1; i <= 6; i++) {
		document.getElementById("sd-input-num-"+i).addEventListener('keyup', function() {
			sdInputOnChange(i);
		},false);
	}

	// Lights
	document.getElementById("lights").addEventListener('click', lightSwitch, false);

	// Panel Buttons
	for (let i = 0; i<3; i++) {
		panelInputs[i].addEventListener('change', function() {
			panelOnChange(i);
		}, false);
	}

	// Click Body
	document.getElementById("bg").addEventListener('click', clickedCanvas,false);
	document.getElementById("bg").addEventListener('mousemove', moveCanvas,false);



	// Setup 3D
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.position.setZ(12);
	camera.position.setY(3);



	// Room Textures

	backWallColorTexture.wrapS = THREE.RepeatWrapping;
	backWallColorTexture.wrapT = THREE.RepeatWrapping;
	backWallColorTexture.repeat.set(1, -1);

	backWallNormalTexture.wrapS = THREE.RepeatWrapping;
	backWallNormalTexture.wrapT = THREE.RepeatWrapping;
	backWallNormalTexture.repeat.set(1, -1);


	concreteMaterials.push(new THREE.MeshStandardMaterial( {
		map: new THREE.TextureLoader().load(concreteSidesColorTexture),
		normalMap: new THREE.TextureLoader().load(concreteSidesNormalTexture),
	}));
	concreteMaterials.push(new THREE.MeshStandardMaterial( {
		map: backWallColorTexture,
		normalMap: backWallNormalTexture,
	}));
	concreteMaterials.push(new THREE.MeshStandardMaterial( {
		roughness: 0.1,
		color: 0x252525,
	}));

	// Materials

	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0x702700, opacity: 0.8, transparent: true, roughness: 0, name: 'chevron_off' } ));
	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0xff5900, opacity: 0.8, transparent: true, roughness: 0, name: 'chevron_on', emissive: 0xff5900, emissiveIntensity: 1} ));
	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0xffffff, opacity: 0.8, transparent: true, roughness: 0, name: 'lightbar_off' } ));
	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0xffffff, opacity: 0.8, transparent: true, roughness: 0, name: 'lightbar_on', emissive: 0xffffff, emissiveIntensity: 1} ));
	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, name: 'clock_text', emissive: 0xffffff, emissiveIntensity: 0.5} ));
	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0x440001, roughness: 0, name: 'alertLight_off' } ));
	materialsLib.push(new THREE.MeshStandardMaterial( { color: 0x970000, roughness: 0, name: 'alertLight_on', emissive: 0x970000, emissiveIntensity: 1} ));

	// Scene Mesh Load

	loader.load(sceneGLTF, function ( object ) {

		sceneRoot = object.scene;

		scene.add( sceneRoot );

		// Chevron Glasses Materials

		for (var i = 0; i < 9; i++) {
			sceneRoot.getObjectByName("Chevron_Glass-" + (i+1).toString()).material = materialsLib[0];
		}

		// Bridge Glasses Materials

		for (var i = 0; i < 8; i++) {
			sceneRoot.getObjectByName("LightsGlass-" + (i+1).toString()).material = materialsLib[2];
		}

		// Bridge Fance Metallic

		sceneRoot.getObjectByName("Fance").material = new THREE.MeshStandardMaterial({
			metalness: 1,
			roughness: 0.2,
		});

		// Room Concrete Textures

		sceneRoot.getObjectByName("Sides").material = concreteMaterials[0];
		sceneRoot.getObjectByName("BackWall").material = concreteMaterials[1];
		sceneRoot.getObjectByName("Floor").material = concreteMaterials[2];

		// Other Materials

		sceneRoot.getObjectByName("AlertLightLeft").material = materialsLib[5];
		sceneRoot.getObjectByName("AlertLightRight").material = materialsLib[5];

		alertAnimation();
		clockAnimation();

		clickableObjects.push(sceneRoot.getObjectByName("Radio"));
	});

	// Chevron Lights

	for (var i = 0; i<9; i++) {
		chevronLights.push(new THREE.PointLight(0xff5900));
		chevronLights[i].intensity = 0;
		chevronLights[i].distance = 1.5;
		chevronLights[i].position.set(0, 5.6, 0);
		scene.add(chevronLights[i]);
	}

	// Chevron lights rotation

	rotateAboutPoint(chevronLights[1], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(-36.9));
	rotateAboutPoint(chevronLights[2], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(-73.8));
	rotateAboutPoint(chevronLights[3], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(-110.7));
	rotateAboutPoint(chevronLights[6], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(36.9));
	rotateAboutPoint(chevronLights[5], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(73.8));
	rotateAboutPoint(chevronLights[4], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(110.7));
	rotateAboutPoint(chevronLights[7], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(-147.6));
	rotateAboutPoint(chevronLights[8], new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(147.6));

	// Bridge Lights

	for (var i = 0; i<8; i++) {
		bridgeLights.push(new THREE.PointLight(0xffffff));
		bridgeLights[i].intensity = 0;
		bridgeLights[i].distance = 3;
		bridgeLights[i].position.set(0, 2.4, 0);
		scene.add(bridgeLights[i]);
	}

	for (var i = 0; i < 4; i++) {
		bridgeLights[i].position.x = -.75;
		bridgeLights[i+4].position.x = .75;
		bridgeLights[i].position.z = 1+i*2.75;
		bridgeLights[i+4].position.z = 1+i*2.75;
	}

	// Room Lights

	roomMainLight.position.set(0, 8, 3.5);
	leftAlertLight.position.set(3.5, 7, -2.85);
	rightAlertLight.position.set(4.5, 7, -2.85);
	roomMainLight.intensity = 0;

	scene.add(roomMainLight);
	scene.add(leftAlertLight);
	scene.add(rightAlertLight);


	document.body.appendChild( renderer.domElement );
	renderer.render(scene, camera);
	animate();
}


function onClickSymbol (id) {
	currentSymbolIndex = id;
	symbolSelection.style.display = 'grid';
}

function onSelectedSymbol(symbolId) {
	symbolSelection.style.display = 'none';

	actualSymbolSeq[currentSymbolIndex] = symbolId;

	if (symbolsSelected[currentSymbolIndex] == 0) {
		allSelected += 1;
		symbolsSelected[currentSymbolIndex] = 1;
	}

	symbols[currentSymbolIndex].innerHTML = symbolsChars[symbolId];

	if (allSelected > 6) {
		setSeq();

		allSelected = 0;
	}
}

function searchBtnClicked() {
	var url = 'https://simposium.cz/mb/api/symbol-database/';

	for (let i = 1; i <= 6; i++) {
		url += document.getElementById("sd-input-num-"+i).value;
	}

	httpGet(url, changeSdResult);
};

function sdInputOnChange(id) {
	const sdInputNum = document.getElementById("sd-input-num-"+id);
	var actualValue = sdInputNum.value.split("");

	for(var i = 0; i<actualValue.length; i++) {
		var lastChar = actualValue.pop();

		if (lastChar >= '0' && lastChar <= '9') {
			sdInputNum.value = lastChar;
			return;
		}
	}

	sdInputNum.value = '0';
}	

function changeSdResult(response) {
	document.getElementById("sd-result").innerHTML = response;
}

function httpGet(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
	pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

	if(pointIsWorld){
		obj.parent.localToWorld(obj.position);
	}

	obj.position.sub(point);
	obj.position.applyAxisAngle(axis, theta);
	obj.position.add(point);

	if(pointIsWorld){
		obj.parent.worldToLocal(obj.position);	}

	obj.rotateOnAxis(axis, theta);
}

function panelOnChange(id) {
	if (panelInputs[id].checked) {
		panelOutputs[id].classList.add("panel-wrap-open");
	} else {
		panelOutputs[id].classList.remove("panel-wrap-open");
	}
};




function moveCanvas( event) {
	pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects(clickableObjects);

	//scene.add(new THREE.ArrowHelper( raycaster.ray.direction, raycaster.ray.origin, 100, Math.random() * 0xffffff ));

	if ( intersects.length > 0 ) {
		document.getElementById("bg").style.cursor = 'pointer';
	} else {
		document.getElementById("bg").style.cursor = 'auto';
	}
}

function clickedCanvas( event) {
	pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects(clickableObjects);

	//scene.add(new THREE.ArrowHelper( raycaster.ray.direction, raycaster.ray.origin, 100, Math.random() * 0xffffff ));

	if ( intersects.length > 0 ) {
		radioOnClick();
	}
}






// Animations

function radioOnClick() {
	if (radioIsPlaying == 0) {
		epicSaxGuySound.play();
		epicSaxGuySound.loop = true;
		radioIsPlaying = 1;
	} else {
		epicSaxGuySound.pause();
		epicSaxGuySound.loop = false;
		epicSaxGuySound.currentTime = 0;
		radioIsPlaying = 0;
	}
}

function lightbarMorseAnimation() {
	sceneRoot.getObjectByName("LightsGlass-2").material = materialsLib[3];
	bridgeLights[1].intensity = 1;

	setTimeout(function(){
		sceneRoot.getObjectByName("LightsGlass-2").material = materialsLib[2];
		bridgeLights[1].intensity = 0;

		setTimeout(function(){
			lastMorseSeq += 1;
			if (lastMorseSeq > 35) {
				lastMorseSeq = 0;
			}

			if (lights_state == 1) lightbarMorseAnimation();

		}, offMorseSeq[lastMorseSeq]*500);
	}, onMorseSeq[lastMorseSeq]*500);
}

function alertAnimation() {
	if (timerAlertSeq <= 1) {
		if (alertState == 0) {
			alertState = 1;
			timerAlertSeq = onAlertSeq[lastAlertSeq];

			sceneRoot.getObjectByName("AlertLightLeft").material = materialsLib[6];
			leftAlertLight.intensity = 1;
		} else {
			alertState = 0;
			timerAlertSeq = offAlertSeq[lastAlertSeq];

			sceneRoot.getObjectByName("AlertLightLeft").material = materialsLib[5];
			leftAlertLight.intensity = 1;
			leftAlertLight.intensity = 0;

			lastAlertSeq += 1;

			if (lastAlertSeq > 8) lastAlertSeq = 0;
		}
	} else {
		timerAlertSeq -= 1;
	}


	sceneRoot.getObjectByName("AlertLightRight").material = materialsLib[6];
	rightAlertLight.intensity = 1;

	setTimeout(function(){
		sceneRoot.getObjectByName("AlertLightRight").material = materialsLib[5];
		rightAlertLight.intensity = 0;

		setTimeout(function(){
			alertAnimation();
		}, 500);
	}, 500);
}

function refreshClock() {
	var hours = new Date().getHours().toString().padStart(2, '0');
	var mins = new Date().getMinutes().toString().padStart(2, '0');

	if (lastDoubleDot == 0) {
		var doubleDot = ':';
		lastDoubleDot = 1;
	} else {
		var doubleDot = ' ';
		lastDoubleDot = 0;
	}

	new THREE.FontLoader().load(anquietasFontImport, function (font) {
		const clockGeo = new THREE.TextGeometry( hours + doubleDot + mins, {
			font: font,
			size: 0.6,
			height: 0.05
		});

		scene.remove(clockText);

		clockText = new THREE.Mesh( clockGeo, materialsLib[4] );

		clockText.position.set(3.25, 5.5, -2.85);

		scene.add(clockText);
	});
}

function clockAnimation() {
	refreshClock();

	setTimeout(function() {
		clockAnimation();
	}, 1000);
}

function lightSwitch() {
	var interval = 100;

	if (lights_state == 0) {
		interval = 1000;
		lights_state = 1;
	} else {
		interval = 100;
		lights_state = 0;
	}

	setTimeout(function(){
		bridgeLightChange(0, lights_state);
		bridgeLightChange(4, lights_state);
		lightSwitchSound.play();
		setTimeout(function(){
			lightbarMorseAnimation();
			bridgeLightChange(5, lights_state);
			lightSwitchSound.cloneNode(true).play();
			setTimeout(function(){
				bridgeLightChange(2, lights_state);
				bridgeLightChange(6, lights_state);
				lightSwitchSound.cloneNode(true).play();
				setTimeout(function(){
					bridgeLightChange(3, lights_state);
					bridgeLightChange(7, lights_state);
					lightSwitchSound.cloneNode(true).play();
					setTimeout(function(){
						roomMainLight.intensity = lights_state;
						lightSwitchSound.cloneNode(true).play();
					}, interval);
				}, interval);
			}, interval);
		}, interval);
	}, interval);
}

function bridgeLightChange(index, state) {
	if (state == 1) {
		bridgeLights[index].intensity = 1;
		sceneRoot.getObjectByName("LightsGlass-"+(index+1).toString()).material = materialsLib[3];
	} else {
		bridgeLights[index].intensity = 0;
		sceneRoot.getObjectByName("LightsGlass-"+(index+1).toString()).material = materialsLib[2];
	}
}

function setSeq() {
	done_animation = 0;

	for (var i = 0; i < 7; i++) {
		seq.unshift(modelSymbols.indexOf(actualSymbolSeq[i]));
	}

	document.getElementById("message").firstElementChild.innerHTML = "DIALING";
	document.getElementById("message").style.color = "yellow";

	done_animation = 1;

	alertSound.play();
	alertSound.loop = true;
}

function checkAddress() {
	var outputAddress = "";
	var url = "https://simposium.cz/mb/api/stargate/"

	for (var i = 0; i < 7; i++) {
		outputAddress += symbolsChars[actualSymbolSeq[i]];
	}

	url += outputAddress;

	httpGet(url, changeFromResponse);
}

function changeFromResponse(response) {
	planetName = response;

	if (planetName == "none") {
		dialingSuccess = -1;
	} else {
		dialingSuccess = 1;
	}
}

function failingDialing() {
	document.getElementById("message").firstElementChild.innerHTML = "Failure";
	document.getElementById("message").style.color = "red";
}

function failedDialing() {
	alertSound.loop = false;
	alertSound.pause();
	alertSound.currentTime = 0;

	for (var i = 0; i < 9; i++) {
		sceneRoot.getObjectByName("Chevron_Glass-"+(i+1).toString()).material = materialsLib[0];
		chevronLights[i].intensity = 0;
	}

	actualSymbolSeq = [0, 0, 0, 0, 0, 0, 0];
	symbolsSelected = [0, 0, 0, 0, 0, 0, 0];
	allSelected = 0;
	dialingSuccess = 0;
	lit_chevrons = 0;
	failed_timer= 2000;

	for (var i = 0; i < 7; i++) {
		document.getElementById("symbol-" + (i+1).toString()).innerHTML = "+";
		chevrons[i].classList.remove("engaged");
		statusList[i].classList.remove("engaged");
		statusList[i].children.item(0).classList.add("engaged");
		statusList[i].children.item(1).classList.remove("engaged");
		statusList[i].children.item(3).classList.remove("engaged");
		statusList[i].children.item(3).innerHTML = "KO";
	}
}

function runSequence(sequence) {
	done_animation = 0;
	var new_symbol = sequence.pop();

	if (sequence.length == 1) {
		checkAddress();
	}

	if (sequence.length == 0) {
		if (dialingSuccess != 1) {
			rotateToSymbol(new_symbol);

			gateStartSound.play();
			gateRollSound.loop = true;
			setTimeout(function(){ gateRollSound.play();}, gateStartSound.duration);

			failed_timer = rotation_timer;

			rotateToSymbol(-1);
		} else {
			rotateToSymbol(new_symbol);
			run_chevron = 1;

			gateStartSound.play();
			gateRollSound.loop = true;
			setTimeout(function(){ gateRollSound.play();}, gateStartSound.duration);
		}
	} else {
		rotateToSymbol(new_symbol);
		run_chevron = 1;

		gateStartSound.play();
		gateRollSound.loop = true;
		setTimeout(function(){ gateRollSound.play();}, gateStartSound.duration);
	}
}

function engageChevron() {
	const chevron_timeout = Math.floor(chevron_movement / chevron_speed);

	chevronEngageSound.play();

	setTimeout(function(){

		chevron_direction = -1;
		sceneRoot.getObjectByName("Chevron_Glass-7").material = materialsLib[1];
		chevronLights[0].intensity = 10;

		setTimeout(function(){

			chevron_direction = 0;

			setTimeout(function(){

				chevron_direction = 1;

				setTimeout(function(){

					chevron_direction = 0;
					sceneRoot.getObjectByName("Chevron_Glass-7").material = materialsLib[0];
					chevronLights[0].intensity = 0;
					lightChevron();
					done_animation = 1;

				}, chevron_timeout);
			}, 400);
		}, chevron_timeout);
	}, 700);
}

function lightChevron() {
	sceneRoot.getObjectByName("Chevron_Glass-" + (1+lit_chevrons).toString()).material = materialsLib[1];
	chevronLights[1+lit_chevrons].intensity = 10;
	chevrons[lit_chevrons].classList.add("engaged");
	statusList[lit_chevrons].classList.add("engaged");
	statusList[lit_chevrons].children.item(0).classList.remove("engaged");
	statusList[lit_chevrons].children.item(1).classList.add("engaged");
	statusList[lit_chevrons].children.item(3).classList.add("engaged");
	statusList[lit_chevrons].children.item(3).innerHTML = "OK";
	lit_chevrons += 1;

	if (lit_chevrons > 6) {
		sceneRoot.getObjectByName("Chevron_Glass-1").material = materialsLib[1];
		sceneRoot.getObjectByName("Chevron_Glass-8").material = materialsLib[1];
		sceneRoot.getObjectByName("Chevron_Glass-9").material = materialsLib[1];
		chevronLights[7].intensity = 10;
		chevronLights[8].intensity = 10;
		chevronLights[0].intensity = 10;

		document.getElementById("message").firstElementChild.innerHTML = "Success";
		document.getElementById("message").style.color = "limegreen";
		circle.classList.add("engaged");
		planetNameMessage.innerHTML = planetName;

		alertSound.loop = false;
		alertSound.pause();
		alertSound.currentTime = 0;

		gateOpenSound.play();
		setTimeout(function() {
			gateOpenedSound.play();
			gateOpenedSound.loop = true;
		}, gateOpenSound.duration);

		lit_chevrons = 0;
	}
}

function rotateToSymbol(symbol) {
	if (symbol == -1) {
		symbol = 0;
		rotation_timer += 360 / symbol_rotation_speed;
		return;
	}

	var symbol_difference = 0;

	if (last_direction == -1) {
		last_direction = 1;
		animation_direction = 1;
		symbol_difference = symbol - actual_symbol;
	} else {
		last_direction = -1;
		animation_direction = -1;
		symbol_difference = actual_symbol - symbol;
	}

	if (symbol_difference < 0) {
		symbol_difference += 39;
	}

	rotation_timer = (symbol_difference * (360/39) / symbol_rotation_speed) - rotation_timer;
	actual_symbol = symbol;
}

// Animation Loop

function animate() {
	requestAnimationFrame(animate);

	if (rotation_timer > 0) {
		// gate ring rotation
		if (animation_direction == 1) {
			rotateAboutPoint(sceneRoot.getObjectByName("Symbols"), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(-symbol_rotation_speed));
			rotateAboutPoint(sceneRoot.getObjectByName("BGSymbols"), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(symbol_rotation_speed));
		} else {
			rotateAboutPoint(sceneRoot.getObjectByName("Symbols"), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, 1), THREE.Math.degToRad(symbol_rotation_speed));
			rotateAboutPoint(sceneRoot.getObjectByName("BGSymbols"), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(-symbol_rotation_speed));
		}

		if (dialingSuccess == -1) {
			if (failed_timer < 0) {
				failingDialing();
			} else {
				failed_timer -= 1;
			}
		}

		rotation_timer -= 1;

	} else if (dialingSuccess == -1 && seq.length == 0) {

		failedDialing();

		gateRollSound.loop = false;
		gateRollSound.pause();
		gateRollSound.currentTime = 0;

	} else if (run_chevron) {

		gateRollSound.loop = false;
		gateRollSound.pause();
		gateRollSound.currentTime = 0;
		run_chevron = 0;
		engageChevron();

	} else if (chevron_direction != 0) {

		scene.getObjectByName("Chevron-7").position.y += chevron_direction * chevron_speed;

	} else if (seq.length > 0 && done_animation == 1) {
		runSequence(seq);
	}

	renderer.render(scene, camera);
}
