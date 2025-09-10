import { JSX, World, StaticPart } from 'shalloteer/jsx';
import { Playground } from './components/Playground';

export function Game() {
  return World({
    canvas: "#game-canvas",
    sky: "#87ceeb",
    children: [
      StaticPart({
        pos: { x: 0, y: -0.5, z: 0 },
        shape: "box",
        size: { x: 20, y: 1, z: 20 },
        color: 0x90ee90
      }),
      
      Playground()
    ]
  });
}