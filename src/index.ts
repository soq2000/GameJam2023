import { GltfContainer, Transform, engine } from '@dcl/sdk/ecs'

import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { createMainScene } from './entities/main_scene';
import { setupUi } from './textinput_ui';
import { fetchChatGptDescription, fetchPromptImage, fetchWordData } from './global/data';
import { MainUI } from './ui/main';
import { InfoSign } from './entities/sign';


export async function main() {
    fetchWordData();
    
    MainUI.init();
    createMainScene()
}
