import { Font } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { Button, Callback, Input, Label, ReactEcsRenderer, UiEntity } from "@dcl/sdk/react-ecs";

export function setupUi() {
    ReactEcsRenderer.setUiRenderer(uiComponent)
}

var currentTextString = "";
var isMenuVisible: boolean = false
var placeholderText = "Fill text in"
var currentIndex = 1
var submitCallback:(index:number, text:string) => void = (index, text) => {console.log('form submit', index, text);
};

export function getInputText() {
    return currentTextString;
}

export function setMenuVisibility(visible: boolean) {
    isMenuVisible = visible
}


function resetInputText(text: string) {
    currentTextString = text
}

export function setFormIndex(index:number) {
    currentIndex = index
}

export function setSubmitCallback(callback:(index:number, text:string) => void) {
    submitCallback = callback
}

// let inputValue: string | undefined = undefined

export const uiComponent = () => (

    <UiEntity
        uiTransform={{
            display: isMenuVisible ? 'flex' : 'none',
            width: "40%",
            height: 200,
            flexDirection: 'column',
            justifyContent: "center",
            margin: { left: "25%", top: 20, right: "25%" },
            padding: { left: 10, top: 10, right: 10 },
            alignSelf: 'center'
        }}
        uiBackground={{ color: Color4.White() }}
        uiText={{ value: 'Input this animal name', fontSize: 20 }}
    >
        <Label
            value="Input this animal name"
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
            onChange={(e) => { currentTextString = e }}
            fontSize={20}
            placeholder={placeholderText}
            placeholderColor={Color4.Gray()}
            // value={currentTextString}
            uiTransform={{
                height:70
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
            uiBackground={{ color: Color4.White() }}
        >
            <Button
                textAlign="middle-center"
                fontSize={20}
                value="Submit"
                variant='primary'
                uiTransform={{ width: 100, height: 50, alignSelf: "center" }}
                onMouseDown={() => {
                    // getInputText();
                    setMenuVisibility(false)
                    // console.log("input text String: " + currentTextString);
                    // if (currentTextString == "firework") {
                    //     playFireWork();
                    // }
                    // resetInputText(placeholderText)
                    // onSubmit(1, currentTextString)
                    submitCallback(currentIndex, currentTextString)
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
                    setMenuVisibility(false)
                    console.log("cancel button")
                    resetInputText(placeholderText)
                    // inputValue = 'clear'
                    // inputValue = undefined
                }}
            />
        </UiEntity>

    </UiEntity>
)