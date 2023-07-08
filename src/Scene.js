import * as THREE from "three";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";

let camera,
	scene,
	renderer,
	cube,
	controls,
	stats = {};

let isRendererLoopRunning = false;

export default function webScene(isWebGPU) {
	const canvas = document.querySelector("#c4");
	if (isWebGPU) {
		renderer = new WebGPURenderer();
		canvas.appendChild(renderer.domElement);
	} else {
		renderer = new THREE.WebGLRenderer({ canvas });
	}

	renderer.setSize(1280, 720);
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 5;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 2;

	scene = new THREE.Scene();

	controls = new OrbitControls(camera, renderer.domElement);

	//stats
	const existingStatsElement = document.querySelector("#stats");
	if (existingStatsElement) {
		// If it exists, remove it before appending a new one
		existingStatsElement.remove();
	}

	stats = new Stats();
	console.log(stats);

	stats.domElement.style.position = "relative";
	stats.domElement.id = "stats";

	// Check if stats element already exists

	// Append the stats element to the desired container
	document.querySelector("#card").appendChild(stats.domElement);

	//light
	const color = 0xffffff;
	const intensity = 1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 2, 4);
	scene.add(light);

	//cube
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	const material = new THREE.MeshPhongMaterial({ color: 0xffaa88 }); // greenish blue
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	if (!isRendererLoopRunning) {
		isRendererLoopRunning = true;
		requestAnimationFrame(render);
	}
}

function render(time) {
	time *= 0.001; // convert time to seconds

	cube.rotation.x = time;
	cube.rotation.y = time;

	controls.update();
	renderer.render(scene, camera);

	stats.update();

	if (isRendererLoopRunning) {
		requestAnimationFrame(render);
	}
}
