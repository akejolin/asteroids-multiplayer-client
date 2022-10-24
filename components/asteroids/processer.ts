import type { IState, CanvasItem, CanvasItemGroups, collisionObject } from './game.types'

export const updateObjects = (targets:CanvasItemGroups, state:IState, ctx: any) => new Promise<void>((resolve, reject) => {
  let index = 0;
  for (let key in targets) {
    index = 0;
    const items = targets[key];
    for (let item of items) {
      if (item.delete) {
        typeof items ? items.splice(index, 1): null;
      } else{
        
        typeof items[index].render === "function" ? items[index].render(state, ctx): console.log('no renderfunction');
      }
      index++;
    }
  }
  resolve()
})

export const fakeUpdateObjects = (targets:CanvasItemGroups, state:IState, ctx: any) => new Promise<void>((resolve, reject) => {
  let index = 0;
  for (let key in targets) {
    index = 0;
    const items = targets[key];
    for (let item of items) {
        typeof items[index].render === "function" ? items[index].render(state, ctx): console.log('no renderfunction');
      index++;
    }
  }
  resolve()
})
  
  

export const RectCircleColliding:Function = (rect:any, circle:any):boolean => {
  const distX = Math.abs(circle.position.x - rect.position.x-rect.w/2);
  const distY = Math.abs(circle.position.y - rect.position.y-rect.h/2);

  if (distX > (rect.w/2 + circle.radius)) { return false; }
  if (distY > (rect.h/2 + circle.radius)) { return false; }

  if (distX <= (rect.w/2)) { return true; } 
  if (distY <= (rect.h/2)) { return true; }

  var dx=distX-rect.w/2;
  var dy=distY-rect.h/2;
  return (dx*dx+dy*dy<=(circle.radius*circle.radius));
}


  export const checkCollision = (obj1:CanvasItem, obj2:CanvasItem, distance = 0):boolean => {
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if (length < ((obj1.radius + distance) + (obj2.radius + distance))) {
      return true;
    }
    return false;
  }

  export const collisionBetweens = (haystack:CanvasItemGroups, array:collisionObject[]) => {
    const promises = array.map(item => {
      collisionBetween(haystack, item.primary, item.secondary, item.cb, item.inRadarCb ? item.inRadarCb: () => {})
    });
    return Promise.all(promises)
  }
  

  export const collisionBetween = (
    haystack:CanvasItemGroups,
    primary:string,
    secondary:Array<string>,
    cb:Function,
    inRadarCb:Function = () => {},
    isCollision:Function = checkCollision
  ):Promise<void> => new Promise<void>((resolve, reject) => {
   
    const primaryArray:CanvasItem[] = haystack[`${primary}s`]
    let secondaryArray:CanvasItem[] = []
    secondary.forEach(element => {
      secondaryArray.push(...haystack[`${element}s`])
    });
    let a = primaryArray.length - 1;
    let b;
    for (a; a > -1; --a) {
      b = secondaryArray.length - 1;
      for (b; b > -1; --b) {
        const item1 = primaryArray[a];
        const item2 = secondaryArray[b];
        if (item1 && item2 && isCollision(item1, item2)) {
          cb(item1, item2)
          resolve()
        }
        inRadarCb(checkInradar(item1, item2), item1, item2)
      }
    }
    resolve()
  })

  export const checkInradar = (obj1:CanvasItem, obj2:CanvasItem):boolean => {
    if (!obj1.radarRadius) {
      return false
    }
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if (length < ((obj1.radius + obj1.radarRadius) + (obj2.radius + obj1.radarRadius))) {
      return true;
    }
    return false;
  }
