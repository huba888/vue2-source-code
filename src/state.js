import { observe } from "./observe/index"

export function initState(vm){
    const opts = vm.$options
    if(opts.data){
        initData(vm)
    }
}
function initData(vm){
    let data = vm.$options.data // data可能是函数 也可能是对象
    data = typeof data === "function" ? data.call(this) : data

    // 对数据进行劫持 vue2里面使用了一个api defineProperty
    vm._data = data
    observe(data)
    
    for(const key in data){
        proxy(vm,"_data",key)
    }
}
function proxy (vm,target,key) {
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newValue){
            vm[target][key] = newValue 
        }
    })
}