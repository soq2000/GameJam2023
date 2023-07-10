import { Font } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { Button, Callback, Input, Label, ReactEcsRenderer, UiEntity } from "@dcl/sdk/react-ecs";

export class PuzzleInputDialog {
    private visible:boolean = false
    value?:string
    index:number = 0
    wrongText:string = ''
    private inputValue?:string
    onSubmit?:(index:number, text:string) => void
    onCancel?:() => void

    show() {
        this.visible = true
        this.value = undefined
        this.inputValue = this.value
    }

    hide() {
        this.visible = false
        this.value = this.inputValue
        this.wrongText = ''
    }

    isVisible() {
        return this.visible
    }

    render() {
        return  <UiEntity
        uiTransform={{
            display: this.visible ? 'flex':'none',
            width: "40%",
            height: 300,
            flexDirection: 'column',
            justifyContent: "center",
            margin: { left: 10, top: 20, right: 10 },
            padding: { left: 10, top: 10, right: 10 },
            alignSelf: 'center'
        }}
        uiBackground={{ color: Color4.White() }}
        uiText={{ value: 'Input animal name', fontSize: 20 }}
    >
        <Label
            value="What's the name of this animal?"
            color={Color4.Black()}
            fontSize={20}
            uiTransform={{
                margin: {
                    bottom: 10
                },
                height: 30
            }}
        />

        <Input
            onChange={(e) => { this.inputValue = e }}
            fontSize={17}
            placeholder={'Input animal name'}
            placeholderColor={Color4.Gray()}
            value={this.value}
            uiTransform={{
                height: 80
            }}

        />
        <Label
            value={this.wrongText}
            color={Color4.Red()}
            fontSize={20}
            uiTransform={{
                margin: {
                    bottom: 10
                },
                height: 30
            }}
        />
        <UiEntity
            uiTransform={{
                width: "100%",
                height: 150,
                flexDirection: 'row',
                justifyContent: "center",
                alignContent: 'flex-start'

            }}
            // uiBackground={{ color: Color4.White() }}
        >
            <Button
                textAlign="middle-center"
                fontSize={20}
                value="Submit"
                variant='primary'
                uiTransform={{ width: 100, height: 50, alignSelf: "center" }}
                onMouseDown={() => {
                    // this.hide()
                    if (this.onSubmit) this.onSubmit(this.index, this.inputValue ?? '')
                }}
            />
            <Button
                textAlign="middle-center"
                fontSize={20}
                value="Cancel"
                variant='primary'
                color={Color4.White()}
                uiBackground={{
                    color: Color4.Gray()
                }}
                uiTransform={{ width: 100, height: 50, alignSelf: "center", margin: { left: 5 } }}
                onMouseDown={() => {
                    this.hide()
                    if (this.onCancel) this.onCancel()
                }}
            />
        </UiEntity>

    </UiEntity>
    }
}