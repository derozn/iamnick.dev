import { GroupProps } from '@react-three/fiber';
import { MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import { type Mesh } from 'three';

export function PlatformLarge(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-ctQ5CDmraQ.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group scale={0.1} {...props} dispose={null}>
      <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh castShadow receiveShadow geometry={allNodes.Platform_4x4_1.geometry}>
          <meshBasicMaterial {...materials.Texture_Signs} color={[10, 10, 10]} toneMapped={false} />
        </mesh>
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
    <group scale={0.1} {...props} dispose={null}>
      <pointLight intensity={0.03} color={[10, 2, 5]} distance={2.5} />
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_1.geometry}
          material={materials.LightGrey}
        >
          <MeshReflectorMaterial mirror={1} />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_2x2_2.geometry}
          material={materials.Grey}
        />
        <mesh castShadow receiveShadow geometry={allNodes.Platform_2x2_3.geometry}>
          <meshBasicMaterial {...materials.Texture_Signs} color={[10, 10, 10]} toneMapped={false} />
        </mesh>
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

export function PlatformLong({ children, ...props }: GroupProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-J3AJSwqmBJ.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group scale={0.1} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={allNodes.Platform_4x2_1.geometry}
          material={materials.Texture_Signs}
        >
          <meshBasicMaterial {...materials.Texture_Signs} color={[10, 10, 10]} toneMapped={false} />
        </mesh>
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
        {children}
      </group>
    </group>
  );
}

useGLTF.preload('/models/Cyberpunk Platform-J3AJSwqmBJ.glb');
useGLTF.preload('/models/Cyberpunk Platform-dHymLbsOMY.glb');
useGLTF.preload('/models/Cyberpunk Platform-ctQ5CDmraQ.glb');
