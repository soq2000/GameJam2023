import { engine } from "@dcl/sdk/ecs";

enum TimerType {
    TIMEOUT = 0,
    INTERVAL = 1,
    TIMEOUT_FRAME = 2,
    INTERVAL_FRAME = 3,
}

interface Timer {
    type: TimerType,
    initial: number,
    left?: number,
    callback: () => void
}

export class TimerUtil {
    static timerIdCounter:number = 0
    static timerMap:Record<number, Timer> = {}

    static create(option:Timer) {
        const id = ++TimerUtil.timerIdCounter
        option.left = option.initial
        this.timerMap[id] = option

        return id
    }

    static setTimeout(callback: () => void, seconds:number) {
        return this.create({
            callback: callback,
            initial: seconds,
            type: TimerType.TIMEOUT
        })
    }

    static clearTimeout(id:number) {
        delete this.timerMap[id]
    }

    static setInterval(callback: () => void, seconds:number) {
        return this.create({
            callback: callback,
            initial: seconds,
            type: TimerType.INTERVAL
        })
    }

    static clearInterval(id:number) {
        delete this.timerMap[id]
    }

    static setFrameTimeout(callback: () => void, frames:number) {
        return this.create({
            callback: callback,
            initial: frames,
            type: TimerType.TIMEOUT_FRAME
        })
    }

    static clearFrameTimeout(id:number) {
        delete this.timerMap[id]
    }

    static setFrameInterval(callback: () => void, frames:number) {
        return this.create({
            callback: callback,
            initial: frames,
            type: TimerType.INTERVAL_FRAME
        })
    }

    static clearFrameInterval(id:number) {
        delete this.timerMap[id]
    }

    static delay(seconds:number) {
        return new Promise<void>((res, rej) => {
            this.setTimeout(() => res(), seconds)
        })
    }

    static system(delta:number) {
        for (const id in this.timerMap) {
            const timer = this.timerMap[id]
            timer.left! -= (timer.type == TimerType.INTERVAL_FRAME || timer.type == TimerType.TIMEOUT_FRAME) ? 1:delta

            if (timer.left! < 0) {
                timer.callback()
                if (timer.type == TimerType.INTERVAL || timer.type == TimerType.INTERVAL_FRAME) timer.left = timer.initial
                else delete this.timerMap[id]
            }
        }
    }
}

engine.addSystem((dt) => TimerUtil.system(dt))