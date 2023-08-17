import * as THREE from "three";
import WebGPU from "three/addons/capabilities/WebGPU.js";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import { texture, SpriteNodeMaterial } from "three/nodes";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/addons/libs/stats.module.js";

let camera,
	scene,
	renderer,
	controls,
	stats,
	mesh,
	group,
	isWebGPU = {};

let isRendererLoopRunning = false;

export default function webScene(webGPU) {
	isWebGPU = webGPU;
	if (WebGPU.isAvailable() === false) {
		document.body.appendChild(WebGPU.getErrorMessage());
		throw new Error("No WebGPU support");
	}

	const canvas = document.querySelector("#c4");
	canvas.innerHTML = "";

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
	controls.maxDistance = 1200;
	controls.minDistance = 75;
	controls.maxPolarAngle = Math.PI / 2;
	controls.mouseButtons = {
		LEFT: THREE.MOUSE.ROTATE,
		MIDDLE: THREE.MOUSE.DOLLY,
	};

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

	// Append the elements to the desired container
	document.querySelector("#card").appendChild(stats.domElement);
	document.querySelector("#card").appendChild(gui.domElement);

	// scene
	scene = new THREE.Scene();

	//light
	const lightColor = 0xffffff;
	const directIntensity = isWebGPU ? 3 : 1;
	const directLight1 = new THREE.DirectionalLight(lightColor, directIntensity);
	directLight1.position.set(0, 100, 100);
	scene.add(directLight1);

	const directLight2 = new THREE.DirectionalLight(lightColor, directIntensity);
	directLight2.position.set(0, 100, -100);
	scene.add(directLight2);

	//helper
	//scene.add(new THREE.DirectionalLightHelper(directLight1, 5));
	//scene.add(new THREE.DirectionalLightHelper(directLight2, 5));
	//gui.add(directLight1, "intensity", 0, 5, 0.01);
	//gui.add(directLight2, "intensity", 0, 5, 0.01);

	//add skyboy
	const loader = new THREE.TextureLoader();
	const bgTexture = loader.load("background.jpg", () => {
		bgTexture.mapping = THREE.EquirectangularReflectionMapping;
		bgTexture.colorSpace = THREE.SRGBColorSpace;
		bgTexture.flipY = isWebGPU ? false : true;
		scene.background = bgTexture;
	});

	//add ground
	const grassTexture = new THREE.TextureLoader().load("grass.png");
	const grassMaterial = new THREE.MeshBasicMaterial({
		map: grassTexture,
		color: 0x555555,
	});

	const planeGeometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
	const plane = new THREE.Mesh(planeGeometry, grassMaterial);

	plane.position.set(0, 0, 0);
	plane.rotation.x = Math.PI * -0.5;
	scene.add(plane);

	// add moving particles in three.js like snow
	// update particles like https://threejs.org/examples/?q=webgpu#webgpu_instance_mesh

	//number of particles
	let particleCount = 50;

	// instancing particles; cons: loaded all at once, can't change number of particles in runtime
	//renderParticlesInstance(particleCount);
	//scene.add(mesh);
	//gui.add(mesh, "count", 1, particleCount);

	group = new THREE.Group();
	scene.add(renderParticlesSprite(particleCount));
	gui.add({ particleCount }, "particleCount", 1, 5000, 100).onChange((v) => {
		scene.add(renderParticlesSprite(v));
	});

	//start animation loop
	if (!isRendererLoopRunning) {
		isRendererLoopRunning = true;
		requestAnimationFrame(render);
	}
}

// add particles
function renderParticlesSprite(particleCount) {
	// Create snow sprite texture
	const snowTexture = new THREE.TextureLoader().load("snowflake.png");

	const textureNode = texture(snowTexture);

	const glMaterial = new THREE.SpriteMaterial({
		map: snowTexture,
		color: 0xffffff,
	});
	const gpuMaterial = new SpriteNodeMaterial();
	gpuMaterial.colorNode = textureNode;
	gpuMaterial.opacityNode = textureNode.a;
	gpuMaterial.transparent = true;

	const material = isWebGPU ? gpuMaterial : glMaterial;

	group.children = [];
	for (let a = 0; a < particleCount; a++) {
		const x = Math.random() * 1000 - 500;
		const y = Math.random() * 750;
		const z = Math.random() * 1000 - 500;

		const sprite = new THREE.Sprite(material);

		sprite.position.set(x, y, z);

		sprite.scale.set(5, 5, 5);

		group.add(sprite);
	}

	return group;
}

function renderParticlesInstance(particleCount) {
	const geometry = new THREE.BoxGeometry(10, 10, 10);
	const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); //sprite node material?

	mesh = new THREE.InstancedMesh(geometry, material, particleCount);
	//mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

	// position particles random in instanced mesh
	const matrix = new THREE.Matrix4();
	for (let i = 0; i < particleCount; i++) {
		const x = Math.random() * 500 - 250;
		const y = Math.random() * 500;
		const z = Math.random() * 500 - 250;

		matrix.setPosition(x, y, z);
		mesh.setMatrixAt(i, matrix);
	}
	mesh.count = 10;
}

var counter = 0;
// animation loop
function render(time) {
	// particles group animation
	group.children.forEach((sprite) => {
		sprite.position.y -= Math.random() * 0.5 + 0.2;
		if (sprite.position.y < 0) {
			sprite.position.y = 500;
			sprite.position.x = Math.random() * 1000 - 500;
			sprite.position.x = Math.random() * 1000 - 500;
		}
	});

	// particles instance animation
	// for (let i = 0; i < mesh.count; i++) {
	// 	const instanceMatrices = mesh.instanceMatrix.array;
	// 	if (instanceMatrices[16 * i + 13] < 0) {
	// 		instanceMatrices[16 * i + 13] = 500;
	// 	}
	// 	instanceMatrices[16 * i + 13] -= 0.5;
	// }
	// mesh.instanceMatrix.needsUpdate = true;

	controls.update();
	renderer.render(scene, camera);
	stats.update();

	if (isRendererLoopRunning) {
		requestAnimationFrame(render);
	}
}
