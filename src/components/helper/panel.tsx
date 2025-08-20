import * as THREE from 'three';

export class Panel3D {
    public group: THREE.Group;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private texture: THREE.CanvasTexture;
    private panelMesh: THREE.Mesh;
    private padding: number;
    private lineHeight: number;
    private posX: Array<number>;
    private posY: Array<number>;
    private posZ: Array<number>;

    constructor(data: Record<string, any>, padding = 10, lineHeight = 28) {
        this.posX = new Array(10);
        this.posY = new Array(10);
        this.posZ = new Array(10);

        this.group = new THREE.Group();
        this.padding = padding;
        this.lineHeight = lineHeight;

        // 初始化 Canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.font = '24px monospace';
        this.ctx.fillStyle = 'rgb(231, 240, 72)';
        this.ctx.textBaseline = 'top';

        // 初始化纹理和 Mesh
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.panelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({ map: this.texture, transparent: true })
        );

        this.group.add(this.panelMesh);
        this.group.position.set(1, 2, 3);

        const dummyCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        // 初次绘制
        this.update(data, dummyCamera);
    }

    update(
        data: Record<string, any>,
        camera: THREE.PerspectiveCamera,
        pos = { x: 0, y: 0, z: 0 }
    ) {
        const entries = Object.entries(data);

        // ---------- 计算 Canvas 尺寸 ----------
        const maxLen = entries.length
            ? Math.max(...entries.map(([k, v]) => (k + ': ' + v).length))
            : 10;
        const MAX_CANVAS_SIZE = 512; // GPU安全尺寸
        const newCanvasWidth = Math.min(maxLen * 16 + this.padding * 2, MAX_CANVAS_SIZE);
        const newCanvasHeight = Math.min(entries.length * this.lineHeight + this.padding * 2, MAX_CANVAS_SIZE);

        // 仅在尺寸变化时更新 Canvas 和 PlaneGeometry
        if (this.canvas.width < newCanvasWidth || this.canvas.height < newCanvasHeight) {
            this.canvas.width = newCanvasWidth;
            this.canvas.height = newCanvasHeight;
            // 重新创建纹理
            this.texture.dispose();
            this.texture = new THREE.CanvasTexture(this.canvas);
            this.panelMesh.material.map = this.texture;

            const aspect = newCanvasWidth / newCanvasHeight;
            this.panelMesh.geometry.dispose();
            this.panelMesh.geometry = new THREE.PlaneGeometry(aspect, 1);
        }

        // ---------- 绘制背景 ----------
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(239, 138, 255, 0.81)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // ---------- 绘制文字 ----------
        this.ctx.fillStyle = 'rgb(23, 23, 23)';
        this.ctx.font = `24px monospace`;
        this.ctx.textBaseline = 'top';
        entries.forEach(([k, v], i) => {
            this.ctx.fillText(`${k}: ${v}`, this.padding, this.padding + i * this.lineHeight);
        });

        // ---------- 更新纹理 ----------
        this.texture.needsUpdate = true;

        // ---------- 缩放 PlaneMesh ----------
        const vFOV = camera.fov * (Math.PI / 180); // 转弧度
        const distance = camera.position.distanceTo(new THREE.Vector3(pos.x, pos.y, pos.z));
        const screenHeight = 2 * Math.tan(vFOV / 2) * distance; // 当前距离对应视口高度
        const scaleY = screenHeight * 0.03; // 面板占屏幕高度比例，比如 10%
        const aspect = this.canvas.width / this.canvas.height;
        const scale = scaleY * aspect; // 按纵横比计算宽度
        this.panelMesh.scale.set(scale, scale, 1);

        // ---------- 平滑位置 ----------
        const avgPos = this.updateAndGetAvgPos(pos.x, pos.y, pos.z);
        const alpha = 0.2; // 平滑系数
        this.group.position.lerp(new THREE.Vector3(avgPos.x, avgPos.y, avgPos.z), alpha);
    }

    updateAndGetAvgPos(x: number, y: number, z: number) {
        this.posX.unshift(x);
        if (this.posX.length > 10) this.posX.pop();

        this.posY.unshift(y);
        if (this.posY.length > 10) this.posY.pop();

        this.posZ.unshift(z);
        if (this.posZ.length > 10) this.posZ.pop();

        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

        return {
            x: avg(this.posX),
            y: avg(this.posY),
            z: avg(this.posZ),
        };
    }
}
