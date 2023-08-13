import * as THREE from "three";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/addons/libs/stats.module.js";

let camera,
	scene,
	renderer,
	cube,
	controls,
	stats,
	particleSystem = {};

let isRendererLoopRunning = false;

export default function webScene(isWebGPU) {
	const canvas = document.querySelector("#c4");
	if (isWebGPU) {
		renderer = new WebGPURenderer();
		canvas.appendChild(renderer.domElement);
		console.log("*** WebGPU Renderer ***");
	} else {
		renderer = new THREE.WebGLRenderer({ canvas });
		console.log("*** WebGL Renderer ***");
	}

	renderer.setSize(1280, 720);

	//camera
	const fov = 75;
	const aspect = 2;
	const near = 1;
	camera = new THREE.PerspectiveCamera(fov, aspect, near);
	camera.position.z = 200;
	camera.position.y = 100;

	//controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxDistance = 300;
	controls.minDistance = 75;
	controls.maxPolarAngle = Math.PI / 2;
	scene = new THREE.Scene();

	// Check if stats and gui element already exist
	const existingStatsElement = document.querySelector("#stats");
	const existingGUIElement = document.querySelector("#gui");
	if (existingStatsElement || existingGUIElement) {
		existingStatsElement.remove();
		existingGUIElement.remove();
	}

	// stats init
	stats = new Stats();
	stats.domElement.style.position = "relative";
	stats.domElement.id = "stats";

	// GUI init
	const gui = new GUI({ name: "My GUI" });
	gui.domElement.style.position = "relative";
	gui.domElement.id = "gui";
	var mySize;

	// Append the elements to the desired container
	document.querySelector("#card").appendChild(stats.domElement);
	document.querySelector("#card").appendChild(gui.domElement);

	//light
	const color = 0xffffff;
	const directIntensity = isWebGPU ? 3 : 1;
	const directLight1 = new THREE.DirectionalLight(color, directIntensity);
	directLight1.position.set(0, 100, 100);
	scene.add(directLight1);

	const directLight2 = new THREE.DirectionalLight(color, directIntensity);
	directLight2.position.set(0, 100, -100);
	scene.add(directLight2);

	//helper
	//scene.add(new THREE.DirectionalLightHelper(directLight1, 5));
	//scene.add(new THREE.DirectionalLightHelper(directLight2, 5));
	//gui.add(directLight1, "intensity", 0, 5, 0.01);
	//gui.add(directLight2, "intensity", 0, 5, 0.01);

	//add three.js plane
	const plane = new THREE.Mesh(
		new THREE.BoxGeometry(350, 350, 0.5),
		new THREE.MeshPhongMaterial({ color: 0x727272 })
	);
	plane.position.set(0, 0, 0);
	plane.rotation.x = Math.PI * -0.5;
	scene.add(plane);

	//cube
	const boxWidth = 50;
	const boxHeight = 50;
	const boxDepth = 50;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	const material = new THREE.MeshPhongMaterial({ color: 0xffaa88 }); // greenish blue
	cube = new THREE.Mesh(geometry, material);
	cube.position.y = 25;
	scene.add(cube);
	gui.add(cube.scale, "x", 0, 5, 0.01).name("Scale X");
	gui.add(cube.scale, "y", 0, 5, 0.01).name("Scale Y");

	// add moving particles in three.js like snow
	const particleCount = 5000;
	const particles = new THREE.BufferGeometry();
	const pMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 1,
		//map: new THREE.TextureLoader().load("snowflake.png"),
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
	});
	//gui add
	//gui.add(pMaterial, "size", 0, 10, 0.01).name("Particle Size");
	const positions = [];
	for (let i = 0; i < particleCount; i++) {
		const x = Math.random() * 400 - 200;
		const y = Math.random() * 400;
		const z = Math.random() * 400 - 200;
		positions.push(x, y, z);
	}
	particles.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3)
	);
	particleSystem = new THREE.Points(particles, pMaterial);
	scene.add(particleSystem);

	if (!isRendererLoopRunning) {
		isRendererLoopRunning = true;
		requestAnimationFrame(render);
	}
}

// animation loop
function render(time) {
	time *= 0.001; // convert time to seconds

	cube.rotation.y = time;

	//update position of single particle
	const positions = particleSystem.geometry.attributes.position.array;
	for (let i = 0; i < positions.length; i += 3) {
		const y = positions[i + 1];
		positions[i + 1] = y - 0.15;

		if (y < 0) {
			positions[i + 1] = 400;
		}
	}
	particleSystem.geometry.attributes.position.needsUpdate = true;

	controls.update();
	renderer.render(scene, camera);
	stats.update();

	if (isRendererLoopRunning) {
		requestAnimationFrame(render);
	}
}
