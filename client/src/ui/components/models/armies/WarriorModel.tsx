/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 --types --keepnames --keepgroups --keepmeshes --transform --precision 6 client/public/models/Warrior.gltf 
Files: client/public/models/Warrior.gltf [3.04MB] > /Users/aymericdelabrousse/Projects/blockchain/cairo/realms/official-eternum/eternum/Warrior-transformed.glb [378.16KB] (88%)
*/

import * as THREE from "three";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";
import { Vector3, useGraph } from "@react-three/fiber";
import { useRunningSound } from "../../../../hooks/useUISound";

const FRIENDLY_ARMY_MODEL_HOVER_COLOR: string = "yellow";
const ENEMY_ARMY_MODEL_HOVER_COLOR: string = "orange";

type GLTFResult = GLTF & {
  nodes: {
    Face: THREE.Mesh;
    ShoulderPadL: THREE.Mesh;
    Warrior_Sword: THREE.Mesh;
    ShoulderPadR: THREE.Mesh;
    Warrior_Body: THREE.SkinnedMesh;
    Root: THREE.Bone;
  };
  materials: {
    Warrior_Sword_Texture: THREE.MeshBasicMaterial;
    Warrior_Texture: THREE.MeshBasicMaterial;
  };
  animations: GLTFAction[];
};

type ActionName =
  | "Death"
  | "Idle"
  | "Idle_Attacking"
  | "Idle_Weapon"
  | "PickUp"
  | "Punch"
  | "RecieveHit"
  | "Roll"
  | "Run"
  | "Run_Weapon"
  | "Sword_Attack"
  | "Sword_Attack2"
  | "Walk";
interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}
type ContextType = Record<
  string,
  React.ForwardRefExoticComponent<
    JSX.IntrinsicElements["mesh"] | JSX.IntrinsicElements["skinnedMesh"] | JSX.IntrinsicElements["bone"]
  >
>;

type WarriorModelProps = {
  id: number;
  position?: Vector3;
  rotationY: number;
  onClick: () => void;
  onPointerEnter: (e: any) => void;
  onPointerOut: (e: any) => void;
  onContextMenu: (e: any) => void;
  hovered: boolean;
  isRunning: boolean;
  isDead: boolean;
  isFriendly: boolean;
};

export function WarriorModel({
  id,
  position,
  rotationY,
  onClick,
  onPointerEnter,
  onPointerOut,
  onContextMenu,
  hovered,
  isRunning,
  isDead,
  isFriendly,
  ...props
}: WarriorModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/warrior.glb") as GLTFResult;
  const { actions } = useAnimations(animations, groupRef);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { play: playRunningSoud, stop: stopRunningSound } = useRunningSound();

  // Deterministic rotation based on the id
  const deterministicRotation = useMemo(() => {
    return Number(id % 360) * (Math.PI / 180); // Convert degrees to radians
  }, [id]);

  useEffect(() => {
    if (isDead) {
      nodes.Root.rotation.y = deterministicRotation;
    } else {
      nodes.Root.rotation.y = rotationY;
    }
  }, [deterministicRotation, rotationY, nodes.Root, isDead]);

  // add actions to onClick
  const onClickAction = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!isDead && isFriendly) {
        const action = actions["Sword_Attack"];
        if (action) {
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
        }
      }
      if (onClick) {
        onClick();
      }
    },
    [isDead, onClick],
  );

  useEffect(() => {
    const runAction = actions["Run"];
    const idleAction = actions["Idle_Attacking"];
    if (isRunning) {
      runAction?.play();
      playRunningSoud();
      idleAction?.stop();
    } else {
      runAction?.stop();
      stopRunningSound();
      const randomDelay = Math.random() * 2; // Generate a random delay between 0 and 2 seconds
      setTimeout(() => {
        idleAction?.play();
      }, randomDelay * 1000); // Convert the delay to milliseconds
    }
  }, [isRunning, actions]);

  useEffect(() => {
    if (isDead) {
      const action = actions["Death"];
      if (action) {
        action.play();
        action.paused = true; // Immediately pause the action
        action.time = action.getClip().duration; // Set to the last frame
        action.enabled = true;
        // // Ensure the action's transformations are applied
        requestAnimationFrame(() => {
          action.getMixer().update(0);
          // Apply the random rotation after the animation has been updated
          const randomRotation = Math.random() * 2 * Math.PI;
          nodes.Root.rotation.y = randomRotation;
        });
      }
    }
  }, [isDead, isDead, actions, nodes.Root]);

  const hoverMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial();
    material.color.set(isFriendly ? FRIENDLY_ARMY_MODEL_HOVER_COLOR : ENEMY_ARMY_MODEL_HOVER_COLOR);
    return material;
  }, []);

  useEffect(() => {
    const targetMaterial = hovered ? hoverMaterial : materials.Warrior_Texture;
    Object.values(nodes).forEach((node) => {
      if (node instanceof THREE.Mesh || node instanceof THREE.SkinnedMesh) {
        node.material = targetMaterial;
      }
    });
  }, [hovered, hoverMaterial, nodes, materials.Warrior_Texture]);

  return (
    <group
      {...props}
      ref={groupRef}
      onClick={onClickAction}
      onPointerEnter={onPointerEnter}
      onPointerOut={onPointerOut}
      onContextMenu={onContextMenu}
    >
      <group name="Scene">
        <group name="CharacterArmature">
          <primitive object={nodes.Root} />
        </group>
        <skinnedMesh
          name="Warrior_Body"
          // @ts-ignore
          geometry={nodes.Warrior_Body.geometry}
          material={hovered ? hoverMaterial : materials.Warrior_Texture}
          // @ts-ignore
          skeleton={nodes.Warrior_Body.skeleton}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/models/warrior.glb");
