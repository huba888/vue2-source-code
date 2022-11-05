import { compileToFunction } from "./compiler"
import { mountComponnent } from "./lifecycle"
import { initState } from "./state"


export function initMixin(Vue) { // 给Vue 增加init方法的
    Vue.prototype._init = function (options) { // 用于初始化操作
        const vm = this
        vm.$options = options
        // 初始化状态
        initState(vm)

        // 挂载
        if(options.el){
            vm.$mount(options.el) //数显数据的挂在
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        let ops = vm.$options
        el = document.querySelector(el)
        // 先判断有没有render函数
        // 如果没有 就看一下是否写了template选项 和 有el
        // render > template > el.outerHtml
        let template 
        if(!ops.render){
            if(!ops.template && el){ // 没有写模板,但是写了el
                template = el.outerHTML
            }else{
                if(el){
                    template = ops.template
                }
            }
        }
        // 写了template 就用 写了的template
        // template = <div></div>
        if(template && el){
            // 如果有模板 那就进行编译
            let render = compileToFunction(template)
            ops.render = render
        }
        // 最后一定会有一个 ops.render
        mountComponnent(vm,el) // 组件的挂载
    }
}
