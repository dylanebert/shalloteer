import { JSX, DynamicPart, KinematicPart, StaticPart, Tween } from 'shalloteer/jsx';

export function Playground() {
  return JSX.Fragment({
    children: [
      DynamicPart({
        pos: { x: -2, y: 4, z: -3 },
        shape: "sphere",
        size: 1,
        color: 0xff4500
      }),
      
      DynamicPart({
        pos: { x: 2, y: 5, z: -3 },
        shape: "sphere",
        size: 1.2,
        color: 0x4169e1
      }),
      
      KinematicPart({
        pos: { x: 0, y: 3, z: 0 },
        shape: "box",
        size: { x: 4, y: 0.5, z: 4 },
        color: 0xffd700,
        children: [
          Tween({
            target: "body.pos-x",
            from: -5,
            to: 5,
            duration: 3,
            loop: "ping-pong"
          })
        ]
      }),
      
      KinematicPart({
        pos: { x: 0, y: 2, z: 5 },
        shape: "cylinder",
        size: { x: 1, y: 0.2, z: 1 },
        color: 0xffd700,
        children: [
          Tween({
            target: "body.euler-y",
            from: 0,
            to: 360,
            duration: 2,
            loop: "loop"
          })
        ]
      }),
      
      StaticPart({
        pos: { x: -5, y: 2, z: 0 },
        shape: "box",
        size: { x: 3, y: 0.5, z: 3 },
        color: 0x808080
      }),
      
      StaticPart({
        pos: { x: 5, y: 4, z: 0 },
        shape: "box",
        size: { x: 3, y: 0.5, z: 3 },
        color: 0x808080
      }),
      
      DynamicPart({
        pos: { x: 0, y: 10, z: 5 },
        shape: "sphere",
        size: 1,
        color: 0xff00ff,
        collider: { restitution: 0.9 }
      })
    ]
  });
}