import { Entity, Material, MeshRenderer, Schemas, TextAlignMode, TextShape, Texture, Transform, TransformType, engine } from "@dcl/sdk/ecs"
import { Color3, Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { ShapeUtil, VisibilityController } from "../util/shape_util"
import * as utils from '@dcl-sdk/utils'
import { TimerUtil } from "../util/timer_util"

export const InfoSignComponent = engine.defineComponent('infoSign', {
    imageUrl: Schemas.String,
    description: Schemas.String,
    animalName: Schemas.String,
    imageEntity: Schemas.Entity,
    descriptionEntity: Schemas.Entity,
    animalEntity: Schemas.Entity,
    loadingEntity: Schemas.Entity,
})

export class InfoSign {
    static displayElevation:number = 0.04
    // static imageScale = Vector3.create(1.5, 1.5, 1)
    // static loadingScale = Vector3.create(2, 2, 1)

    static createEntity(transform:Partial<TransformType>, animalName:string, collider:boolean = true) {
        let entity = ShapeUtil.createPosition(transform)
        // let baseEntity = ShapeUtil.createPlane({
        //     position: Vector3.create(0, 0, 0),
        //     scale: Vector3.create(4, 2, 1),
        //     parent: entity
        // }, undefined, collider)
        let baseEntity = ShapeUtil.createGltfShape({
            position: Vector3.create(0, 0, 0),
            scale: Vector3.create(2, 1.8, 1),
            // rotation: Quaternion.fromEulerDegrees(0, 0, 0),
            parent: entity,
        }, 'models/board.glb')
        let imageEntity = ShapeUtil.createPlane({
            position: Vector3.create(-1.05, 0.05, -InfoSign.displayElevation),
            scale: Vector3.create(1.5, 1.5, 1),
            parent: entity
        }, 'images/scene-thumbnail.png', collider)
        VisibilityController.attach(imageEntity, false)
        let loadingEntity = ShapeUtil.createGltfShape({
            position: Vector3.create(-1, -0.4, -0.1),
            scale: Vector3.create(2, 2, 1),
            // rotation: Quaternion.fromEulerDegrees(0, 0, 0),
            parent: entity,
        }, 'models/hourglass.glb')
        VisibilityController.attach(loadingEntity, true)
        // VisibilityController.set(loadingEntity, false)
        let descriptionEntity = ShapeUtil.createText({
            position: Vector3.create(0.75, -0.20, -InfoSign.displayElevation),
            parent: entity
        }, {
            text: `Description about ${animalName} with a very long text`,
            fontSize: 1.2,
            textAlign: TextAlignMode.TAM_TOP_LEFT,
            width: 2,
            height: 2,
            textWrapping: true,
            textColor: Color4.White(),
            outlineWidth: 0.1,
            outlineColor: Color4.Black(),
        })
        let nameEntity = ShapeUtil.createText({
            position: Vector3.create(0, 0.77, -InfoSign.displayElevation),
            parent: entity
        }, {
            text: animalName.toUpperCase(),
            fontSize: 2,
            textAlign: TextAlignMode.TAM_TOP_CENTER,
            textWrapping: true,
            textColor: Color4.Yellow(),
            outlineWidth: 0.1,
            outlineColor: Color4.Yellow(),
            width: 2,
        })

        InfoSignComponent.create(entity, {
            animalName: animalName,
            descriptionEntity: descriptionEntity,
            imageEntity: imageEntity,
            animalEntity: nameEntity,
            loadingEntity: loadingEntity,
        })

        return entity
    }

    static setText(entity:Entity, text:string) {
        let component = InfoSignComponent.getMutableOrNull(entity)
        if (! component) return

        component.description = text
        TextShape.getMutable(component.descriptionEntity).text = text
    }

    static setImage(entity:Entity, url:string) {
        let component = InfoSignComponent.getMutableOrNull(entity)
        if (! component) return

        component.imageUrl = url
        Material.setBasicMaterial(component.imageEntity, {
            texture: Material.Texture.Common({
                src: url
            })
        })
    }

    static setImageLoading(entity:Entity, loading:boolean) {
        let component = InfoSignComponent.getMutableOrNull(entity)
        if (! component) return

        if (loading) {
            component.imageUrl = 'images/loading_symbol.png'
            utils.perpetualMotions.startRotation(component.imageEntity, Quaternion.fromEulerDegrees(0, 0, -180))
            Material.setBasicMaterial(component.imageEntity, {
                texture: Material.Texture.Common({
                    src: component.imageUrl
                })
            })
            VisibilityController.set(component.imageEntity, false)
            VisibilityController.set(component.loadingEntity, true)
            // Transform.getMutable(component.imageEntity).scale = Vector3.Zero()
            // Transform.getMutable(component.loadingEntity).scale = InfoSign.loadingScale
            
        } else {
            utils.perpetualMotions.stopRotation(component.imageEntity)
            Transform.getMutable(component.imageEntity).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
            
            VisibilityController.set(component.imageEntity, true)
            VisibilityController.set(component.loadingEntity, false)
            // Transform.getMutable(component.imageEntity).scale = Vector3.Zero()
            // Transform.getMutable(component.loadingEntity).scale = InfoSign.loadingScale
        }
    }
}
