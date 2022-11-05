// 对模板进行编译处理
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) //<div
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // </div>
// 匹配属性 name = 123 name = "123" name = '123'
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)+|([^'])'+|([^\s"'=<>`]+)))?/
// <div> <br/>
const startTagClose = /^\s*(\/?)>/
// {{ name }}
export function parseHTML(html) { 
    function advance(n){
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if(start){
            const match = {
                tagName:start[1], // 标签名字
                attrs:[]
            }
            advance(start[0].length)
            // 如果不是开始标签的结束,就一直匹配下去
            let attr,end
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                advance(attr[0].length)
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5]} || true)
            }
            if(end){
                advance(end[0].length)
            }
            // console.log(match)
            return match
        }
        // 不是开始标签 可能 是一个结束标签
        return false
    }
    let stack = []
    let currentParent;
    let root;
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3
    function createASTElement(tag,attrs){
        return {
            tag,
            attrs,
            type:ELEMENT_TYPE,
            parent:null,
            children:[]
        }
    }
    function start(tag,attrs){
        let node = createASTElement(tag,attrs)
        if(!root){
            root = node
        }
        if(currentParent){
            currentParent.children.push(node)
            node.parent = currentParent
        }
        currentParent = node
        stack.push(node)
    }
    function chars(text){
        // text = text.replace(/\s{2,}/g," ")
        text = text.replace(/\s/g,"")
        text && currentParent.children.push({
            type:TEXT_TYPE,
            text
        })
    }
    function end () {
        let node = stack.pop() // 这里可以检验标签的合法性
        currentParent = stack[stack.length - 1]
    }
    // 如果textEnd = 0 说明是一个开始标签 或者 是一个结束标签
    // 如果textEnd > 0 说明是文本的接触位置
    while(html){
        let textEnd = html.indexOf("<")
        if(textEnd == 0){
            // 可能是开始标签
            const startTagMatch = parseStartTag() // 开始标签的
            if(startTagMatch) { // 解析到的开始标签
                start(startTagMatch.tagName,startTagMatch.attrs)
                continue
            }
            // 可能是结束标签
            const endTagMatch = html.match(endTag)
            if(endTagMatch){
                end()
                advance(endTagMatch[0].length)
                continue
            }
        }
        // 文本
        if(textEnd > 0){
            let text = html.substring(0,textEnd) // 解析到的文本
            if(text){
                chars(text)
                advance(text.length)
            }
        }
    }
    return root
}