import gltf from 'rollup-plugin-gltf';

// vite.config.js
export default {
	input: "main.js",
	output: {
		file: "dist/bundle.js",
		format: "cjs",
	},
	base: "/mb/stargate/",

	build: {
		chunkSizeWarningLimit: "1000",

		outDir: "build",

		rollupOptions: {
			plugins: [
				gltf({
					include: 'assets/geometry/scene.gltf',
					inlineAssetLimit: 250 * 1024, // 250kb
					inline: false,
				}),
			],
		}
	},
}
