export interface CustomWindow extends Window {
  gameIntervals:  { [key: string]: any };
}
declare let window: CustomWindow;

export const removeInterval = (intervalName:string):null => {
  if (!window.gameIntervals) {
    return null
  }
  if (!window.gameIntervals[intervalName]) {
    return null
  }
  clearInterval(window.gameIntervals[intervalName])
  return null
}

export const addInterval = (intervalName:string, time:number, callback = () => {}) => {
  if (!window.gameIntervals) {
    window.gameIntervals = {}
  }
  removeInterval(intervalName)
  window.gameIntervals[intervalName] = setInterval(() => {
    callback()
  }, Number(time))
  return null
}

export const clearAllIntervals = ():null => {
  if (!window.gameIntervals) {
    return null
  }
  const keys = Object.keys(window.gameIntervals)
  for (const key of keys) {
    removeInterval(key)
  }
  return null
}