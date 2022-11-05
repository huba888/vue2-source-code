import { newArrayProto } from "./array"

class Observe {
    constructor(data){
        // Object.defineProperty 执行劫持已经存在的属性(vue2 中会为此单独写一些Api $set $delete)
        // data.__ob__ = this 这样会死循环
        Object.defineProperty(data,"__ob__",{
            value:this,
            enumerable:false
        })
        if(Array.isArray(data)){
            // 如果是数组
            Object.setPrototypeOf(data,newArrayProto)
            this.observeArray(data)
        }else {
            // 如果是对象
            this.walk(data)
        }
    }
    walk(data){ // 让这个data循环 // 对对象的一个方法
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data,key,data[key]))
    }
    
    observeArray(data){
        data.forEach(item => observe(item))
    }
}
export function defineReactive(target,key,value){
    observe(value)
    Object.defineProperty(target,key,{
        get(){
            return value
        },
        set(newValue){
            if(newValue === value) return
            observe(newValue)
            value = newValue
        }
    })
}
// 观测对象的方法
export function observe (data) {
    // 只对象进行劫持
    if(typeof data !== "object" || data == null){
        return
    }
    if(data.__ob__ instanceof Observe){
        return data.__ob__
    }
    // 如果一个对象被劫持了，那就不需要再次劫持了(要判断一个对象是否被劫持过,用实例来判断对象是否被劫持过)
    new Observe(data)
}  