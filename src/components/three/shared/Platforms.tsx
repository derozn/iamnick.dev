import { type ThreeElements } from '@react-three/fiber';
import { MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import { type Mesh, type MeshStandardMaterial } from 'three';

type GroupProps = ThreeElements['group'];

/**
 * Cyberpunk platform bases — ported from the legacy Interactive Hero module.
 * Sign meshes use an HDR basic material (colour > 1, toneMapped off) so Bloom
 * picks up the neon signage texture. The 2.5× multiplier keeps the sign art
 * legible (10× blew the texture out to white) while still clearing the bloom
 * luminance threshold on bright pixels.
 */

function signMap(materials: Record<string, unknown>, key: string) {
  return (materials[key] as MeshStandardMaterial).map ?? undefined;
}

export function PlatformLarge(props: GroupProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-ctQ5CDmraQ.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group scale={0.1} {...props} dispose={null}>
      <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <mesh geometry={allNodes.Platform_4x4_1.geometry}>
          <meshBasicMaterial
            map={signMap(materials, 'Texture_Signs')}
            color={[2.5, 2.5, 2.5]}
            toneMapped={false}
          />
        </mesh>
        <mesh geometry={allNodes.Platform_4x4_2.geometry} material={materials.LightGrey} />
        <mesh geometry={allNodes.Platform_4x4_3.geometry} material={materials.Grey} />
        <mesh geometry={allNodes.Platform_4x4_4.geometry} material={materials.DarkGrey} />
        <mesh geometry={allNodes.Platform_4x4_5.geometry} material={materials.Black} />
        <mesh geometry={allNodes.Platform_4x4_6.geometry} material={materials.Orange} />
      </group>
    </group>
  );
}

interface PlatformSmallProps extends GroupProps {
  /**
   * Mirror-finish top via MeshReflectorMaterial — re-renders the scene per
   * reflector, so only enable on the single hero island.
   */
  reflector?: boolean;
}

export function PlatformSmall({ reflector = false, ...props }: PlatformSmallProps) {
  const { nodes, materials } = useGLTF('/models/Cyberpunk Platform-dHymLbsOMY.glb');

  const allNodes = nodes as Record<string, Mesh>;

  return (
    <group scale={0.1} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        {reflector ? (
          <mesh geometry={allNodes.Platform_2x2_1.geometry}>
            <MeshReflectorMaterial mirror={1} />
          </mesh>
        ) : (
          <mesh geometry={allNodes.Platform_2x2_1.geometry} material={materials.LightGrey} />
        )}
        <mesh geometry={allNodes.Platform_2x2_2.geometry} material={materials.Grey} />
        <mesh geometry={allNodes.Platform_2x2_3.geometry}>
          <meshBasicMaterial
            map={signMap(materials, 'Texture_Signs')}
            color={[2.5, 2.5, 2.5]}
            toneMapped={false}
          />
        </mesh>
        <mesh geometry={allNodes.Platform_2x2_4.geometry} material={materials.Black} />
        <mesh geometry={allNodes.Platform_2x2_5.geometry} material={materials.DarkGrey} />
        <mesh geometry={allNodes.Platform_2x2_6.geometry} material={materials.Orange} />
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
        <mesh geometry={allNodes.Platform_4x2_1.geometry}>
          <meshBasicMaterial
            map={signMap(materials, 'Texture_Signs')}
            color={[2.5, 2.5, 2.5]}
            toneMapped={false}
          />
        </mesh>
        <mesh geometry={allNodes.Platform_4x2_2.geometry} material={materials.LightGrey} />
        <mesh geometry={allNodes.Platform_4x2_3.geometry} material={materials.Black} />
        <mesh geometry={allNodes.Platform_4x2_4.geometry} material={materials.Grey} />
        <mesh geometry={allNodes.Platform_4x2_5.geometry} material={materials.Orange} />
        <mesh geometry={allNodes.Platform_4x2_6.geometry} material={materials.DarkGrey} />
        {children}
      </group>
    </group>
  );
}

useGLTF.preload('/models/Cyberpunk Platform-J3AJSwqmBJ.glb');
useGLTF.preload('/models/Cyberpunk Platform-dHymLbsOMY.glb');
useGLTF.preload('/models/Cyberpunk Platform-ctQ5CDmraQ.glb');
