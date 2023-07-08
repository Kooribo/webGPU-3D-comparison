import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Box from "./three_components/Box";
import WebGPUCapabilities from "three/examples/jsm/capabilities/WebGPU";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";

function WebCanvas({ webGPU }) {
	//https://codesandbox.io/p/sandbox/r3f-webgpu-forked-0v5e36?file=%2Fsrc%2FWebGPU.tsx%3A23%2C5
	//github.com/CharlesBreton99/sandbox-main/tree/master/src

	if (!WebGPUCapabilities.isAvailable() && webGPU) {
		return (
			<div className="support-error">
				It seems like your current browser does{" "}
				<a
					href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility"
					target="_blank"
					rel="noreferrer"
				>
					not support WebGPU
				</a>
			</div>
		);
	}
	return (
		<>
			<Canvas
				gl={(canvas) => {
					const r = new WebGPURenderer({ canvas });
					r.xr.enabled = false;
					return r;
				}}
			>
				<ambientLight intensity={0.5} />
				<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
				<pointLight position={[-10, -10, -10]} />
				<Box position={[-1.2, 0, 0]} />
				<Box position={[1.2, 0, 0]} />
				<OrbitControls />
			</Canvas>
		</>
	);
}

export default WebCanvas;
