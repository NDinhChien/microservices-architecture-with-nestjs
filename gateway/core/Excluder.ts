export type excludeOption = {
  null?: boolean, 
  undefined?: boolean, 
  both?: boolean
} 
export class Excluder {
  public static exe(target: any, properties : string[], option: excludeOption) {

    for (const key of properties) {
      delete target[key];
    }

    if (option.both === true) {
      option.null = option.undefined = true;
    }

    for (const key of Object.keys(target)) {
      if (option.null && target[key]===null || 
        option.undefined && target[key]===undefined)
        delete target[key];
    }
    return target as any;
  }
}
