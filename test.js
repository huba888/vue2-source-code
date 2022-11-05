function Vue (options) {
    this._init(options)   
}

Vue.prototype._init = function (options){
    const vm = this
    vm.$options = options
    initState(vm)
}

function initState(vm){
    const options = vm.$options
    if(options.data){
        initData(vm)
    }
}
function initData(vm){
    let data = vm.$options.data
    data = typeof data == "function" ? data() : data
    vm._data = data
    observe(data)
    for(let key of data){
        proxy(vm,"_data",key)
    }
}
function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newValue){
            vm[target][key] = newValue
        }
    })
}
function observe(data){
    if(typeof data !== "object") return 
    new Observe(data)
}
class Observe {
    constructor(data){
        if(Array.isArray(data)){
            this.observeArray(data)
        }else {
            this.walk(data)
        }
    }
    walk(data){
        Object.keys(data).forEach(key => defineReactive(target,key,target[key]))
    }
    observeArray(data){
        data.forEach(item => observe(item))
    }
}
function defineReactive(target,key,value){
    observe(value)
    Object.defineProperty(target,key,{
        get(){
            return value
        },
        set(newValue){
            if(value == newValue) return
            observe(newValue)
            value = newValue
        }
    })
}