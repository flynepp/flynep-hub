import { useGLTF } from '@react-three/drei'

const sunModel = useGLTF('/galaxy/stars/sun/sun.glb');
const sunHaloModel = useGLTF('/galaxy/stars/sun/sunHalo.glb');
const rotationPeriod = 0.5; // mins

export {
    sunModel,
    sunHaloModel,
    rotationPeriod
};