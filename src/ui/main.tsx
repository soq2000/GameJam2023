import { Font, pointerEventsSystem } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { Button, Callback, Input, Label, ReactEcsRenderer, UiEntity } from "@dcl/sdk/react-ecs";
import { PuzzleInputDialog } from "./puzzle_input";

export class MainUI {
    static dialog = new PuzzleInputDialog()

    static init() {
        ReactEcsRenderer.setUiRenderer(MainUI.render)
    }

    static checkVisible() {
        return this.dialog.isVisible()
    }

    static render() {
        return <UiEntity
            uiTransform={{
                display: MainUI.checkVisible() ? 'flex':'none',
                width: "50%",
                height: 200,
                flexDirection: 'column',
                justifyContent: "center",
                margin: { left: "25%", top: 20, right: "25%" },
                alignSelf: 'center',
                overflow: "visible"
            }}
        >
            {MainUI.dialog.render()}
        </UiEntity>
    }
}