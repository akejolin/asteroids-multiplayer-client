import type { CanvasItem } from './game.types'

const action = (item:CanvasItem) => new Promise<void>((resolve, reject) => {
    // Slow down the loop process to not overload memory
    const delay = 10
    setTimeout(async () => {
      try {
        item.destroy('nova')
        resolve()
      } catch(error) {
        reject()
      }
    }, delay)
  })
  export const superNova = async (haystack:CanvasItem[]) => {
    await haystack.reduce((accumulate, item) => {
      return accumulate.then(() => action(item))
    }, Promise.resolve())
  }