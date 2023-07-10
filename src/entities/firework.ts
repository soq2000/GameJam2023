import { Animator, Entity, GltfContainer, Transform, TransformType, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ShapeUtil } from "../util/shape_util";

export class Firework {
    static createEntity(transform: Partial<TransformType>, playAnimation:boolean = false) {
        return ShapeUtil.createGltfShape(transform, 'models/firework.glb', [
            {
                name: "Animation",
                clip: "Animation",
                playing: playAnimation,
                loop: false
            }
        ])
    }

    static createCluster(transforms: Partial<TransformType>[], playAnimation:boolean = false) {
        return transforms.map((transform) => ShapeUtil.createGltfShape(transform, 'models/firework.glb', [
            {
                name: "Animation",
                clip: "Animation",
                playing: playAnimation,
                loop: false
            }
        ]))
    }

    static launch(fireworkEntity:Entity) {
        Animator.playSingleAnimation(fireworkEntity, 'Animation', true)
    }
}
