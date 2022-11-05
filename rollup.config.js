// rollup 默认可以导出一个对象作为配置文件
import babel from "rollup-plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
export default {
    input:"./src/index.js",
    output:{
        file:"./dist/vue.js", //出口
        name:"Vue", // global.Vue
        format:"umd", //esm es6模块 commonjs模块 iife自执行函数
        sourcemap:true,
    },
    plugins:[
        babel({
            exclude:"node_modules/**"//排除文件
        }),
        resolve()
    ]
}