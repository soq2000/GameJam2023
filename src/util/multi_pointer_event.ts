import { ComponentDefinition, engine, Entity, InputAction, inputSystem, MapComponentDefinition, PBPointerEventsResult, PointerEvents, PointerEventType, Schemas } from "@dcl/sdk/ecs";

export const MultiPointerEvent = engine.defineComponent('multiPointerEvent', {
    events: Schemas.Array(Schemas.Map({
        type: Schemas.Number,
        button: Schemas.Number,
        hoverText: Schemas.String,
        maxDistance: Schemas.Number,
        showFeedback: Schemas.Boolean,
    }, {
        button: InputAction.IA_POINTER,
        type: PointerEventType.PET_DOWN,
        hoverText: 'Interact',
        maxDistance: 100,
        showFeedback: true
    }))
})

export interface MultiPointerEventParam {
    button: InputAction
    type: PointerEventType
    hoverText: string
    maxDistance: number
    showFeedback: boolean
    eventCallback: (event:PBPointerEventsResult) => any
}

export class PointerEventUtil {
    private static entityEventMap: Record<number, Record<string, (event:PBPointerEventsResult) => any>> = {}

    static setEvents(entity:Entity, params:Partial<MultiPointerEventParam>[]) {
        if (params.length <= 0) return
        MultiPointerEvent.createOrReplace(entity, { events: params.map(p => this.toComponentParam(p)) })
        PointerEvents.createOrReplace(entity, {
            pointerEvents: params.map(p => this.toPointerEventParam(p))
        })

        this.entityEventMap[entity] = {}

        for (const p of params) {
            if (p.eventCallback) {
                this.entityEventMap[entity][`${p.type ?? PointerEventType.PET_DOWN},${p.button ?? InputAction.IA_POINTER}`] = p.eventCallback
            }
        }
    }

    static removeEvent(entity:Entity) {
        if (entity in this.entityEventMap) {
            delete this.entityEventMap[entity]
            MultiPointerEvent.deleteFrom(entity)
            PointerEvents.deleteFrom(entity)
        }
    }

    private static toComponentParam(param:Partial<MultiPointerEventParam>) {
        return {
            type: param.type ?? PointerEventType.PET_DOWN,
            button: param.button ?? InputAction.IA_POINTER,
            hoverText: param.hoverText ?? 'Interact',
            maxDistance: param.maxDistance ?? 100,
            showFeedback: param.showFeedback ?? true
        }
    }

    private static toPointerEventParam(param:Partial<MultiPointerEventParam>) {
        return {
            eventType: param.type ?? PointerEventType.PET_DOWN,
            eventInfo: {
                button: param.button,
                hoverText: param.hoverText,
                maxDistance: param.maxDistance,
                showFeedback: param.showFeedback,
            },
        }
    }

    static system(dt:number) {
        const eventEntities = engine.getEntitiesWith(MultiPointerEvent)
        for (const [entity, mevent] of eventEntities) {
            for (const event of mevent.events) {
                const cmd = inputSystem.getInputCommand(event.button, event.type, entity) 
                if (cmd && cmd.hit && cmd?.hit?.length < event.maxDistance) {
                    this.entityEventMap[entity][`${event.type},${event.button}`](cmd)
                }
            }
        }
    }
}

engine.addSystem((dt) => PointerEventUtil.system(dt))