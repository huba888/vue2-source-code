// h() _c()
// 创建元素的虚拟节点
export function createElementVNode(vm,tag,data = {},...children){
    if(data == null){
        data ={}
    }
    let key = data.key
    if(key){
        delete data.key
    }
    return vnode(vm,tag,key,data,children)
}
// _v()
// 创建元素的虚拟节点
export function createTextVNode(vm,text){
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}
// 那不是和ast差不多了吗？
// ast 做的是语法层面的转换,他描述的是语法本身（ast 可以描述js css html）等等
// vnode 虚拟节点 描述的是dom元素 可以增加一些自定义的元素(描述dom)
function vnode(vm,tag,key,data,children,text){
    return {
        vm,tag,key,data,children,text
    }
}