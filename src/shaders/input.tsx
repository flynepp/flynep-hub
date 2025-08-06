export function LayerWeight(){
    // viewDir 摄像机指向表面点的向量
    // normal 片元的表面法线
    return `
    float fresnel(vec3 viewDir, vec3 normal, float blend) {
        // pow(1.0 - dot(viewDir, normal), 5.0) 产生边缘亮度
        // mix(1.0, f, blend) 用于 Blender 的 blend 参数
        return mix(1.0, pow(1.0 - dot(viewDir, normal), 5.0), blend);
    }
    `
}