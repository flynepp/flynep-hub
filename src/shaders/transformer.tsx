export function ColourRamp() {
    return `
    vec3 colourRamp(
        float factor, 
        float blackPos, 
        float whitePos, 
        vec3 blackColor, 
        vec3 whiteColor
    ) {
        float t = clamp((factor - blackPos) / (whitePos - blackPos), 0.0, 1.0);
        return mix(blackColor, whiteColor, t);
    }
    `
    ;
}

export function Multiply() {
    return `
        float multiply(float a, float b) {
            return a * b;
        }
    
        float multiply(float a, float b, float c) {
            return a * b * c;
        }
    
        vec3 multiply(vec3 v, float f) {
            return v * f;
        }
    `
    ;
}

export function Add() {
    return `
        float add(float a, float b) {
            return a + b;
        } 
        
        float add(float a, float b, float c) {
            return a + b + c;
        }

        float add(float a, float b, float c, float d) {
            return a + b + c + d;
        }
    `
    ;
}