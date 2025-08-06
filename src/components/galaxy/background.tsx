import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();
const vertices = [];
const colors = []; // 添加颜色数组

for ( let i = 0; i < 10000; i ++ ) {
	// 生成球坐标：半径500-2000，随机角度
	const radius = THREE.MathUtils.randFloat(500, 2000);
	const theta = THREE.MathUtils.randFloat(0, Math.PI * 2); // 水平角
	const phi = THREE.MathUtils.randFloat(0, Math.PI); // 垂直角
	
	// 转换为笛卡尔坐标
	const x = radius * Math.sin(phi) * Math.cos(theta);
	const y = radius * Math.sin(phi) * Math.sin(theta);
	const z = radius * Math.cos(phi);
	
	vertices.push(x);
	vertices.push(y);
	vertices.push(z);
	
	// 固定RGB，随机Alpha
	const r = Math.random() / 2 + 0.5;
	const g = Math.random() / 2 + 0.5;
	const b = Math.random() / 2 + 0.5;
	const a = THREE.MathUtils.randFloat(0.3, 1);
	
	colors.push(r, g, b, a);
}

geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 4 ) ); // 4表示RGBA

export const particles = new THREE.Points(
	geometry,
	new THREE.PointsMaterial( { 
		vertexColors: true, // 启用顶点颜色
		transparent: true,
		blending: THREE.AdditiveBlending
	} )
);

// 添加闪烁函数
export const updateParticleFlicker = (time: number) => {
	const colors = particles.geometry.attributes.color.array;
	for (let i = 3; i < colors.length; i += 4) { // 每4个值中的第4个是Alpha
		colors[i] = 0.3 + 0.5 * Math.sin(time + i * 0.1);
	}
	particles.geometry.attributes.color.needsUpdate = true;
};