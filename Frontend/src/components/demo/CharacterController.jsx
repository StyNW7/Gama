import React from "react";

import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { Character } from "./models/Character";
import { useRef, useState, useEffect } from "react";
import { Vector3 } from "three";
import { useFrame, useThree  } from "@react-three/fiber";
import { useControls } from "leva";
import { useKeyboardControls } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import { MathUtils } from "three";
import { useGameStore } from "../../store/gameStore";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = () => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED } = useControls(
    "Character Control",
    {
      WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
      RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: {
        value: degToRad(0.5),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
    },
    { hidden: true }
  );

  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const [animation, setAnimation] = useState("idle");

  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);
  const cameraTarget = useRef();
  const cameraPosition = useRef();
  const cameraWorldPosition = useRef(new Vector3());
  const cameraLookAtWorldPosition = useRef(new Vector3());
  const cameraLookAt = useRef(new Vector3());
  
  const [subscribeKeys, get] = useKeyboardControls();
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const openChest = useGameStore((state) => state.openChest);
  const { cameraZoomOffset, zoomIn, zoomOut, joystickVector } = useGameStore();

  const { gl } = useThree();

  useEffect(() => {
    const unsubscribe = subscribeKeys(
      (state) => state.interact,
      (pressed) => {
        if (pressed) {
          openChest();
        }
      }
    );
    return unsubscribe;
  }, [openChest, subscribeKeys]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleWheel = (event) => {
      event.preventDefault();
      if (event.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [gl, zoomIn, zoomOut]);

  useFrame(({ camera }) => {
    if (rb.current) {
      const vel = rb.current.linvel();
      const pos = rb.current.translation();

      setPlayerPosition(pos);

      const movement = {
        x: 0,
        z: 0,
      };
const keyboard = get();
      
      const joystickMagnitude = Math.sqrt(joystickVector.x ** 2 + joystickVector.y ** 2);

      if (joystickMagnitude > 0.1) {
        movement.z = -joystickVector.y;
        movement.x = -joystickVector.x;
      } else {
        if (keyboard.forward) movement.z = 1;
        if (keyboard.backward) movement.z = -1;
        if (keyboard.left) movement.x = 1;
        if (keyboard.right) movement.x = -1;
      }

      let speed = keyboard.run ? RUN_SPEED : WALK_SPEED;
      
      if (joystickMagnitude > 0.1) {
        speed *= joystickMagnitude;
      }

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * movement.x;
      }

      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z);
        vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed;
        vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed;
        setAnimation(speed > WALK_SPEED + 0.1 ? "run" : "walk");
      } else {
        setAnimation("idle");
      }
      
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1
      );
      rb.current.setLinvel(vel, true);
    }

    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.1
    );

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    camera.position.lerp(cameraWorldPosition.current, 0.1);

    if (cameraPosition.current) {
        cameraPosition.current.position.y = 4 + cameraZoomOffset * 0.5;
        cameraPosition.current.position.z = -4 - cameraZoomOffset;
    }

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

      camera.lookAt(cameraLookAt.current);
    }
  });

  return (
    <RigidBody colliders={false} lockRotations ref={rb} position={[0, 3, 0]}>
      <group ref={container}>
        <group ref={cameraTarget} position-z={1.5} />
        <group ref={cameraPosition} position-y={4} position-z={-4} />
        <group ref={character}>
          <Character scale={0.18} animation={animation} />
        </group>
      </group>
      <CapsuleCollider args={[0.08, 0.15]} />
    </RigidBody>
  );
};
