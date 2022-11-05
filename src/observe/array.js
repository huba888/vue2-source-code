
let oldArrayProto = Array.prototype
export let newArrayProto = Object.create(oldArrayProto)
let methods= [
    "push","shift","pop","unshift","sort","reverse","splice"
]

methods.forEach(method => {
    newArrayProto[method] = function(...args){
        // 对函数的一个劫持
        let res = oldArrayProto[method].call(this,...args)
        // 但是..args里面的内容也可能是对象或者是数组 还需要进行观测
        let inserted;
        switch (method) {
            case "push":
            case "unshift":    
            inserted = args
            case "splice":
            inserted = args.slice(2)
            default:
                break;
        }
        if(inserted){
            // 对新增加的数据再次进行观测
            this.__ob__.observeArray(inserted)
        }
        return res
    }
})