import { Animator, ColliderLayer, engine, Entity, GltfContainer, Material, MeshCollider, MeshRenderer, PBAnimationState, PBTextShape, Schemas, TextShape, Transform, TransformType } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

export class ShapeUtil {
    static createPosition(transform:Partial<TransformType>):Entity {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        return entity
    }

    static createGltfShape(transform:Partial<TransformType>, src:string, animations?:PBAnimationState[]):Entity {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        GltfContainer.create(entity, { 
            src: src,
            invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS, 
            visibleMeshesCollisionMask: ColliderLayer.CL_POINTER, 
        })
        if (animations) {
            Animator.create(entity, {
                states: animations
            })
        }
        return entity
    }

    static createBox(transform:Partial<TransformType>, collider: boolean = true):Entity {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        MeshRenderer.setBox(entity)
        if (collider) MeshCollider.setBox(entity)
        return entity
    }

    static createColliderBox(transform:Partial<TransformType>):Entity {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        // MeshRenderer.setBox(entity)
        MeshCollider.setBox(entity)
        return entity
    }

    static createCylinder(transform:Partial<TransformType>, bottomRaidus?:number, topRadius?:number, collider: boolean = true):Entity {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        MeshRenderer.setCylinder(entity, bottomRaidus, topRadius)
        if (collider) MeshCollider.setCylinder(entity, bottomRaidus, topRadius)
        return entity
    }

    static createPlane(transform:Partial<TransformType>, imageUrl?:string, collider: boolean = true):Entity {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        MeshRenderer.setPlane(entity)
        if (imageUrl) {
            Material.setBasicMaterial(entity, {
                texture: Material.Texture.Common({
                    src: imageUrl
                }),
            })
        }
        if (collider) MeshCollider.setPlane(entity)
        return entity
    }

    static createText(transform:Partial<TransformType>, textOption:PBTextShape) {
        let entity = engine.addEntity()
        Transform.create(entity, transform)
        TextShape.create(entity, textOption)

        return entity
    }
}

export const VisibilityControllerComponent = engine.defineComponent('visibilityController', {
    visible: Schemas.Boolean,
    originalScale: Schemas.Vector3,
})

export class VisibilityController {
    static attach(entity:Entity, visible:boolean = true) {
        let transform = Transform.getMutableOrNull(entity)
        if (!transform) return
        VisibilityControllerComponent.createOrReplace(entity, {
            visible: visible,
            originalScale: transform.scale
        })
        VisibilityController.apply(transform, transform.scale, visible)
    }

    static set(entity:Entity, visible:boolean) {
        let component = VisibilityControllerComponent.getMutableOrNull(entity)
        if (! component) return
        component.visible = visible
        let transform = Transform.getMutableOrNull(entity)
        if (!transform) return
        VisibilityController.apply(transform, component.originalScale, component.visible)
    }

    static toggle(entity:Entity) {
        let component = VisibilityControllerComponent.getMutableOrNull(entity)
        if (! component) return
        component.visible = !component.visible
        let transform = Transform.getMutableOrNull(entity)
        if (!transform) return
        VisibilityController.apply(transform, component.originalScale, component.visible)
    }

    private static apply(transform:TransformType, scale:Vector3, visible:boolean) {
        if (visible) {
            transform.scale = scale
        } else {
            transform.scale = Vector3.Zero()
        }
    }
}
