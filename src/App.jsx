import { useEffect, useState } from "react";
import "./App.css";
import scene from "./Scene.js";
//import WebCanvas from "./WebCanvas";

function App() {
	const [isWebGPU, setIsWebGPU] = useState(false);

	useEffect(() => {
		scene(isWebGPU);
	}, [isWebGPU]);

	return (
		<>
			<h1>3D Comparison</h1>
			{!navigator.gpu ? (
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
			) : (
				<div className="card" id="card">
					<div className="buttons">
						<button
							className={isWebGPU ? "select-button active" : "select-button"}
							onClick={() => setIsWebGPU(true)}
						>
							WebGPU
						</button>
						<button
							className={!isWebGPU ? "select-button active" : "select-button"}
							onClick={() => setIsWebGPU(false)}
						>
							WebGL
						</button>
					</div>
				</div>
			)}

			<div className="card-full">
				{isWebGPU ? <div id="c4" /> : <canvas id="c4" />}
			</div>
		</>
	);
}

export default App;
