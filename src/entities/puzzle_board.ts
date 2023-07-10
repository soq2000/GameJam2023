import { Animator, Billboard, Entity, GltfContainer, InputAction, Schemas, Transform, TransformType, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ShapeUtil } from "../util/shape_util";
import { PointerEventUtil } from "../util/multi_pointer_event";
import { setFormIndex, setMenuVisibility, setSubmitCallback } from "../textinput_ui";
import { Firework } from "./firework";
import { fetchChatGptDescription, fetchPromptImage, fetchWordData } from "../global/data";
import { InfoSign } from "./sign";
import { MainUI } from "../ui/main";
import * as utils from '@dcl-sdk/utils'
import { TimerUtil } from "../util/timer_util";

export const PuzzleBoardComponent = engine.defineComponent('puzzleBoard', {
    index: Schemas.Number,
    animalName: Schemas.String,
    isCompleted: Schemas.Boolean,
    firework: Schemas.Entity,
    fireworkLeft: Schemas.Entity,
    fireworkRight: Schemas.Entity,
    infosign: Schemas.Entity,
    questionBall: Schemas.Entity,
    base: Schemas.Entity,
})

export class PuzzleBoard {
    static InfoSignScale = 0.5

    static async createEntity(transform:Partial<TransformType>, index:number, showInfo = false) {
        let entity = ShapeUtil.createPosition(transform)
        let wordData:any[] = await fetchWordData()
        let word = wordData.find(w => ((w.index == index) && (w.index == index)))
        if (word == null) {
            console.error('Animal index', index, 'not found')
            return null
        }
        let baseEntity = ShapeUtil.createGltfShape({
            position: Vector3.create(0, -0.5, 0),
            scale: Vector3.create(1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 180, 0),
            parent: entity,
        }, 'models/board_base.glb')
        let ballEntity = ShapeUtil.createGltfShape({
            position: Vector3.create(0, 0.5, 0),
            scale: Vector3.create(-1, 1, 1),
            rotation: Quaternion.fromEulerDegrees(0, 180, 0),
            parent: entity,
        }, 'models/ball.glb')
        Billboard.create(ballEntity)
        let fireworks = Firework.createCluster([
            {
                position: Vector3.create(0, -1, 0),
                rotation: Quaternion.fromEulerDegrees(0, 90, 0),
                parent: entity
            },
            {
                position: Vector3.create(-0.2, -1, 0),
                rotation: Quaternion.fromEulerDegrees(0, 90, 0),
                parent: entity
            },
            {
                position: Vector3.create(0.2, -1, 0),
                rotation: Quaternion.fromEulerDegrees(0, 90, 0),
                parent: entity
            },
        ])
        let infosign = InfoSign.createEntity({
            position: Vector3.create(0, 0.5, 0),
            scale: showInfo ? Vector3.create(PuzzleBoard.InfoSignScale, PuzzleBoard.InfoSignScale, PuzzleBoard.InfoSignScale):Vector3.create(0, 0, 0),
            rotation: Quaternion.fromEulerDegrees(15, 0, 0),
            parent: entity,
        }, word.word, false)
        PuzzleBoardComponent.create(entity, {
            index: index,
            firework: fireworks[0],
            fireworkLeft: fireworks[1],
            fireworkRight: fireworks[2],
            infosign: infosign,
            animalName: word.word,
            isCompleted: false,
            questionBall: ballEntity,
            base: baseEntity,
        })

        PointerEventUtil.setEvents(baseEntity, [
            {
                button: InputAction.IA_POINTER,
                hoverText: 'Input answer',
                eventCallback: () => PuzzleBoard.showQuestion(index)
            }
        ])
        PointerEventUtil.setEvents(ballEntity, [
            {
                button: InputAction.IA_POINTER,
                hoverText: 'Input answer',
                eventCallback: () => PuzzleBoard.showQuestion(index)
            }
        ])
        
        return entity
    }

    static showQuestion(index:number) {
        MainUI.dialog.index = index
        MainUI.dialog.onSubmit = PuzzleBoard.onFormSubmit
        MainUI.dialog.show()
    }

    static findEntityByIndex(index:number) {
        const lsPuzzle =  engine.getEntitiesWith(PuzzleBoardComponent)
        for (const [entity, puzzle] of lsPuzzle) {
            if (puzzle.index == index) return entity
        }
        return null
    }

    static async onFormSubmit(index:number, text:string) {
        let wordData:any[] = await fetchWordData()
        
        let word = wordData.find(w => ((w.index == index) && (w.word.trim().toLowerCase() == text.trim().toLowerCase())))
        if (word) {
            MainUI.dialog.hide()
            let entity = PuzzleBoard.findEntityByIndex(index)
            if (entity) {
                let component = PuzzleBoardComponent.getMutable(entity)
                component.isCompleted = true
                Transform.getMutable(component.questionBall).scale = Vector3.Zero()
                Firework.launch(component.firework)
                console.log('Launch firework')
                TimerUtil.delay(0.5).then(() => {
                    console.log('Launch other firework')
                    Firework.launch(component.fireworkLeft)
                    Firework.launch(component.fireworkRight)
                })
                PuzzleBoard.showInfoBoard(entity, true)
                PointerEventUtil.removeEvent(component.base)
            } else {
                console.error('Entity not found:', entity)
            }
        } else {
            MainUI.dialog.wrongText = 'Wrong answer, try again'
        }
    }

    static async showInfoBoard(entity:Entity, fetchData = true) {
        let component = PuzzleBoardComponent.getOrNull(entity)
        if (!component) return;

        // let transform = Transform.getMutable(component.infosign)
        // transform.scale = Vector3.create(PuzzleBoard.InfoSignScale, PuzzleBoard.InfoSignScale, PuzzleBoard.InfoSignScale)
        utils.tweens.startScaling(
            component.infosign, 
            Vector3.create(PuzzleBoard.InfoSignScale, 0.1, PuzzleBoard.InfoSignScale), 
            Vector3.create(PuzzleBoard.InfoSignScale, PuzzleBoard.InfoSignScale, PuzzleBoard.InfoSignScale), 
            0.3, utils.InterpolationType.EASEBOUNCE)

        if (fetchData) {
            InfoSign.setText(component!.infosign, `Loading description for "${component.animalName}"...`)
            InfoSign.setImageLoading(component!.infosign, true)

            fetchChatGptDescription(`Describe a ${component.animalName} in a short sentence`).then((data) => {
                if (data != null) {
                    InfoSign.setText(component!.infosign, data)
                } else {
                    InfoSign.setText(component!.infosign, 'Error fetching result from ChatGPT')
                }
            })
            fetchPromptImage(`${component.animalName} in the wild, realistic`).then((data) => {
                InfoSign.setImageLoading(component!.infosign, false)
                if (data != null) {
                    InfoSign.setImage(component!.infosign, data)
                } else {
                    InfoSign.setImage(component!.infosign, 'images/error_symbol.png')
                }
            })
        }
    }
}
