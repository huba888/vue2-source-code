import Dep from "../dep";

let id = 0;

// 不同组件有不同的Wachter
// 目前只有一个






class Watcher {
    constructor(vm,fn,options){
        this.id = id++
        this.renderWatcher = options // true 是一个 渲染的过程
        this.getter = fn  // 这个getter 意味着调用着 可以发生取值操作
        this.deps = [] // 后续我们实现计算属性 或者 清理的时候
        this.depsId = new Set()
        this.get()
    }
    get(){
        // 当我们创建渲染Watcher的时候,我们会把当前的渲染watcher放到Dep.target上面
        // 调用_render方法 会 走到 get 上面
        Dep.target = this
        this.getter() // 会去vm上取值
        Dep.target = null
    }
    addDep(dep){
        let id = dep.id
        // 去重
        // watcher 记住了 dep
        if(!this.depsId.has(id)){
            this.deps.push(dep)
            this.depsId.add(id)
            // 让dep 记住 watcher
            dep.addSub(this)
        }
    }
    upadte(){
        this.get() // 重新渲染
    }
}
// 需要给每一个属性增加一个dep 目的就是手机Watcher
// 一个组件 有多少个组件? n个dep 对应一个Watcher
// 1个属性 对应着 多个组件
// 多 对 多

export default Watcher