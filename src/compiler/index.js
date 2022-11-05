import { parseHTML } from "./parse";

export function compileToFunction (template) {
    // 1.将template 进行 转换为 Ast 语法树
    const ast = parseHTML(template)
    // 2.生成 render方法 (render方法返回的结果就是 虚拟DOM)
    // code = _c("div",{id:"app"},_c("div",{name:"huba"},_v(_s(name)+"hello")))
    let code = codegen(ast)
    code = `with(this){return ${code}}`
    let render = new Function(code)
    return render
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function gen(node){
    // 如果是元素
    if(node.type === 1){
        return codegen(node)
    }else {
        // 文本
        let text = node.text
        if(!defaultTagRE.test(text)){
            // 纯文本
            return `_v(${JSON.stringify(text)})` 
        }else {
            // {{name}}  _v(_s(name) + "hello" + _s(name))
            const tokens = []
            let match;
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while(match = defaultTagRE.exec(text)){
                let index = match.index; // 匹配的位置
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join("+")})`

        }
    }
}

function genChildren(children){
    return children.map(child => gen(child)).join(",")
}

function getProps(attrs){
    let str = ``// {name,value}
    for(let i = 0;i<attrs.length;i++){
        let attr = attrs[i]
        if(attr.name == "style"){
            let obj = {}
            attr.value.split(";").forEach(item => {
                let [key,value] = item.split(":")
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}

function codegen(ast){
    let children = genChildren(ast.children)
    let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? getProps(ast.attrs) : "null"}${ast.children.length ? `,${children}`:""})`)
    return code
}