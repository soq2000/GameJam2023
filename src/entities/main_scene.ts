import { GltfContainer, InputAction, Transform, engine, inputSystem } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ShapeUtil } from "../util/shape_util";
import { PuzzleBoard } from "./puzzle_board";
import { Elevator } from "./elevator";


export function createMainScene() {
    let building = ShapeUtil.createGltfShape({
        position: Vector3.create(7.5, 0.01, 16),
        scale: Vector3.create(0.975, 0.9, 0.975),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    }, 'models/campus.glb');

    let giraffePuzzle = PuzzleBoard.createEntity({
        position: Vector3.create(-56.16,0.5,17.89),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, -90, 0),
    }, 1)

    let deerPuzzle = PuzzleBoard.createEntity({
        position: Vector3.create(-54.89,0.5,9.82),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    }, 2)

    let elephantPuzzle = PuzzleBoard.createEntity({
        position: Vector3.create(-52.18,0.5,16.99),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    }, 3)

    let parrotPuzzle = PuzzleBoard.createEntity({
        position: Vector3.create(-56.02,0.5,23.97),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, -90, 0),
    }, 4)

    // let elevator = Elevator.createEntity({
    //     position: Vector3.create(-48, 0, 16),
    //     scale: Vector3.create(128, 0.1, 32),
    // }, 5)

    return building
}

// Log player position upon pressing E key for easier object placement
// engine.addSystem((delta) => {
//     if (inputSystem.isPressed(InputAction.IA_PRIMARY)) {
//         let transform = Transform.get(engine.PlayerEntity)
//         let pos = transform.position
//         console.log(`PLAYER POSITION: ${pos.x.toFixed(2)},${pos.y.toFixed(2)},${pos.z.toFixed(2)}`)
        
//     }
// })