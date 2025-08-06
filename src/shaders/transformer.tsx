export function ColourRamp() {
    return `
    vec3 colorRamp(float factor, float blackPos, float whitePos) {
        float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
        return mix(blackColor, whiteColor, t);
    }  
    `;
}