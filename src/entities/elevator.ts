import { Animator, Entity, GltfContainer, InputAction, Schemas, Transform, TransformType, engine, inputSystem } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ShapeUtil } from "../util/shape_util";

export const ElevatorComponent = engine.defineComponent('elevator', {
    speed: Schemas.Number,
})

export class Elevator {
    static createEntity(transform:Partial<TransformType>, speed:number) {
        let entity = ShapeUtil.createColliderBox(transform)
        ElevatorComponent.create(entity, {
            speed: speed
        })

        return entity
    }

    static system(delta:number) {
        let lsEntity = engine.getEntitiesWith(ElevatorComponent)
        for (const [entity, elevator] of lsEntity) {
            if (inputSystem.isPressed(InputAction.IA_JUMP)) {
                let transform = Transform.getMutable(entity)
                transform.position.y += elevator.speed * delta
            }
            if (inputSystem.isPressed(InputAction.IA_WALK)) {
                let transform = Transform.getMutable(entity)
                if (transform.position.y > 0)
                transform.position.y -= elevator.speed * delta
            }
        }
    }
}

engine.addSystem((delta) => Elevator.system(delta))