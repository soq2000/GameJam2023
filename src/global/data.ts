import { getCurrentRealm } from "~system/EnvironmentApi"
import { SC_CONFIG } from "../config"
import { getSceneInfo } from "~system/Scene"
import { TimerUtil } from "../util/timer_util"

let wordDataProm:Promise<any> | undefined
let playerDataProm:Promise<PlayerData> | undefined

interface PlayerData {
    realm: string,
    coordinate: string,
}

export async function fetchWordData() {
    let player = await fetchPlayerData();
    if (!wordDataProm) {
        wordDataProm = fetch(`${SC_CONFIG.apiServerUrl}/api/words?realm=${player.realm}&position=${player.coordinate}`).then((data) => data.json())
    }
    // wordDataProm = fetch(`${SC_CONFIG.apiServerUrl}/words?realm=${player.realm}&position=${player.coordinate}`).then((data) => data.json())
    let wordData = await wordDataProm
    if (wordData.length <= 0) {
        console.log('Word data not found, using default');
        
        wordData = [
            {
                index: 1,
                word: 'giraffe'
            },
            {
                index: 2,
                word: 'deer'
            },
            {
                index: 3,
                word: 'elephant'
            },
            {
                index: 4,
                word: 'parrot'
            },
        ]
    }

    return wordData
}

export function fetchPlayerData():Promise<PlayerData> {
    if (!playerDataProm) {
        playerDataProm = new Promise<PlayerData>(async (res, rej) => {
            let realm = (await getCurrentRealm({})).currentRealm?.displayName;
            let position = JSON.parse((await getSceneInfo({})).metadata).scene.base.replace(' ', '')
            res({
                realm:realm ?? 'LocalPreview',
                coordinate:position
            })
        })
    }

    return playerDataProm
}

export async function fetchPromptImage(prompt:string) {
    try {
        let data = await fetch(`${SC_CONFIG.imageServerUrl}/dalle/request?prompt=${prompt}&service_key=${SC_CONFIG.imageServerKey}`, {
            method: 'POST',
        }).then((data) => data.json()).catch((reason) => {
            console.error('Fetch image failed', reason)
            return null
        })
        console.log('Image id result', data)
        let id = data.id
        await TimerUtil.delay(4)
        let imageResult = await fetch(`${SC_CONFIG.imageServerUrl}/dalle/result?id=${id}&service_key=${SC_CONFIG.imageServerKey}`)
            .then((data) => data.json()).catch((reason) => {
                console.error('Fetch image failed', reason)
                return null
            })
        // console.log('Image result', imageResult)
        
        let count = 1
        while (imageResult.status != 'succeeded' && count < 5) {
            await TimerUtil.delay(2)
            imageResult = await fetch(`${SC_CONFIG.imageServerUrl}/dalle/result?id=${id}&service_key=${SC_CONFIG.imageServerKey}`)
                .then((data) => data.json()).catch((reason) => {
                    console.error('Fetch image failed', reason)
                    return null
                })
            // console.log('Image result', imageResult)
            count += 1
        }
        if (imageResult.status != 'succeeded') {
            throw new Error('Image generating failed after 5 attempt')
        }
        return imageResult.result.data[0].url
        
    } catch (error) {
        console.error('Fetch image failed', error)
    }
    return null
}

export async function fetchChatGptDescription(prompt:string) {
    try {
        let data = await fetch(`${SC_CONFIG.chatGptServerUrl}/api/chat?wstoken=${SC_CONFIG.chaGptKey}&message=${prompt}`, {
            method: 'POST',
        }).then((data) => data.json())
        
        return data.message
    } catch (error) {
        console.error('Fetch description failed')
    }
    return null
}