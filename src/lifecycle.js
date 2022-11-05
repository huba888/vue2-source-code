import Watcher from "./observe/watcher"
import { createElementVNode, createTextVNode } from "./vdom"
// 这个函数有初次渲染的功能,又有更新的功能
function createElm(vnode){
    let { tag,data,children,text } = vnode
    if(typeof tag == "string"){
        vnode.el = document.createElement(tag) // 这里将真实节点将虚拟节点对应起来 后续如果修改属性
        // 更新属性
        patchProps(vnode.el,data)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
function patchProps(el,props){
    for(let key in props){
        if(key == "style"){
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName]
            }
        }else {
            el.setAttribute(key,props[key])
        }
    }
}
function patch(oldNode,vnode){
    // nodeType是原生的方法 判断是初次渲染还是跟新
    const isRealElement = oldNode.nodeType;
    if(isRealElement){
        // 初次渲染
        const elm = oldNode // 获取真实元素
        const parentElm = elm.parentNode //拿到父元素
        // 通过虚拟DOM生成了真实的DOM
        const newElm = createElm(vnode)
        // console.log(newElm)
        parentElm.insertBefore(newElm,elm.nextSibling)
        // 删除老节点
        parentElm.removeChild(elm)
        return newElm
    }else {
        //diff算法
    }
}
export function initLifeCycle(Vue){
    // _render == vm.$options.render 执行之后生成虚拟Dom
    Vue.prototype._render = function(){
        let vm = this
        return vm.$options.render.call(vm) // 通过ast语法转换之后生成的render方法
    }
    // 虚拟Dom变为真实Dom的方法
    Vue.prototype._update = function(vnode){
        const el = this.$el
        // patch既有跟新的功能,又有初始化的功能
        this.$el = patch(el,vnode)
     }
    // _c("div",{},...children)
    Vue.prototype._c = function(){
        return createElementVNode(this,...arguments)
    }
    // _v(text)
    Vue.prototype._v = function(){
        return createTextVNode(this,...arguments)
    }
    // 值转字符串
    Vue.prototype._s = function(value){
        if(typeof value !== "object") return value
        return JSON.stringify(value)
    }
}

// 组件的挂载
export function mountComponnent (vm,el) {
    // 1.调用reander 生成虚拟DOM
    // 2.根据虚拟DOM 生成 真实DOM
    // 3.插入到el元素中
    vm.$el = el
    const updateComponnent = ()=>{
        vm._update(vm._render()) // vm.$options.render() -> 虚拟节点
    }
    new Watcher(vm,updateComponnent,true) //true用于标识是一个渲染过程
}

// Vue的核心流程
// 1.创建了响应式数据
// 2.模板转换为ast
// 3.将ast语法树转为render函数
// 后续数据的更新可以只是执行render函数 (无需再次执行ast的转换)
// render函数会去生成虚拟节点
// 根据生成的虚拟节点创造真实的DOM
