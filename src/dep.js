let id = 0
class Dep {
    constructor(){
        // 属性的dep 要去收集Watcher
        this.id = id++
        this.subs = [] // 这里存放着 当前 属性对应的Watcher
    }
    depend(){
        // 这里 我们不希望放重复的Watcher
        Dep.target.addDep(this) // 让Watcher 记住 Dep 
        // 一个组件对应一个Watcher
        // 一个属性对应一个dep
        // dep 和 watcher 的关系  多对多的关系
        // (一个属性可以在多个组件中使用 dep -> 多个watcher)
        // 一个组件中使用了多个属性 (一个watcher 对应 多个dep)
    }
    addSub(watcher){
        // 这里不需要去重了 因为 在 Watcher中已经去重
        this.subs.push(watcher)        
    }
    // 跟新方法
    notify(){
        this.subs.forEach(watcher => watcher.upadte())
    }
}
Dep.target = null

export default Dep