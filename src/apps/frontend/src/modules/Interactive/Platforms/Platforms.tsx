import { GroupProps } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Mesh } from 'three';

export function PlatformLarge(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-ctQ5CDmraQ.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group {...props} dispose={null}>
      <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x4_1.geometry}
          material={materials.Texture_Signs}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x4_2.geometry}
          material={materials.LightGrey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x4_3.geometry}
          material={materials.Grey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x4_4.geometry}
          material={materials.DarkGrey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x4_5.geometry}
          material={materials.Black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x4_6.geometry}
          material={materials.Orange}
        />
      </group>
    </group>
  );
}

export function PlatformSmall(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-dHymLbsOMY.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_1.geometry}
          material={materials.LightGrey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_2.geometry}
          material={materials.Grey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_3.geometry}
          material={materials.Texture_Signs}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_4.geometry}
          material={materials.Black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_5.geometry}
          material={materials.DarkGrey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_6.geometry}
          material={materials.Orange}
        />
      </group>
    </group>
  );
}

export function PlatformLong(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-J3AJSwqmBJ.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_1.geometry}
          material={materials.Texture_Signs}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_2.geometry}
          material={materials.LightGrey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_3.geometry}
          material={materials.Black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_4.geometry}
          material={materials.Grey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_5.geometry}
          material={materials.Orange}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_6.geometry}
          material={materials.DarkGrey}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/models/Cyberpunk Platform-J3AJSwqmBJ.glb');
useGLTF.preload('/models/Cyberpunk Platform-dHymLbsOMY.glb');
useGLTF.preload('/models/Cyberpunk Platform-ctQ5CDmraQ.glb');
