import { Text } from '@react-three/drei';

export const Axes = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      <axesHelper args={[2000]} />
      <Text position={[6, 1, 0]} fontSize={0.5} color="red">
        X
      </Text>
      <Text position={[1, 6, 0]} fontSize={0.5} color="green">
        Y
      </Text>
      <Text position={[1, 0, 6]} fontSize={0.5} color="blue">
        Z
      </Text>
    </group>
  );
};
