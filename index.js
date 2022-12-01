//引入依赖
const inquirer = require('inquirer');
const fs = require("fs");
const path = require("path");
const colors = require('colors');
const axios = require('axios');
//启动函数
async function main(URL='',PATH='') {
    console.log(`读取json数据......`.yellow)
    const params =await getParams();
    const url = URL || params.get('url');//请求json地址
    const apiPath = PATH || params.get('apiPath')||'/';//存放api文件地址
    const choices = [];//存储所有重复性文件
    const res = await getData(url)
    console.log('res========'.yellow)
    console.log(res.data)
    const { definitions, paths, tags, basePath } = res.data
    console.log(`获取tag分类数据成功......`.yellow)
    console.log(tags);  //选择要生成的Tag对象
    console.log(`获取paths分类数据成功......`.yellow)
    console.log(paths);
    console.log(`获取definitions分类数据成功......`.yellow)
    console.log(definitions);
    console.log(`获取basePath分类数据成功......`.yellow)
    console.log(basePath);
    const answers = await getTags(tags);
    console.log(answers)
    for(let i=0;i<answers.length;i++){
        let e = answers[i];
        const urls = tagPaths(paths, e);
        const tpl = tagTemp(urls, basePath)
        tagFiles(apiPath, tpl, e, choices)
    }
    repeatConfirm(choices);
}

//启动函数
async function test() {
    console.log(`读取json数据......`.yellow)
    const params =await getParams();
    const url =  params.get('url');//请求json地址
    const apiPath = params.get('apiPath')||'/';//存放api文件地址
    const choices = [];//存储所有重复性文件
    const res = await getData(url)
    console.log('res========'.yellow)
    console.log(res.data)
    const { definitions, paths, tags, basePath } = res.data
    console.log(`获取tag分类数据成功......`.yellow)
    console.log(tags);  //选择要生成的Tag对象
    console.log(`获取paths分类数据成功......`.yellow)
    console.log(paths);
    console.log(`获取definitions分类数据成功......`.yellow)
    console.log(definitions);
    console.log(`获取basePath分类数据成功......`.yellow)
    console.log(basePath);
    const answers = await getTags(tags);
    console.log(answers)
    for(let i=0;i<answers.length;i++){
        let e = answers[i];
        const urls = tagPaths(paths, e);
        const tpl = tagTemp(urls, basePath)
        tagFiles(apiPath, tpl, e, choices)
    }
    repeatConfirm(choices);
}
async function getParams(){
    let result = new Map()
    process.argv.forEach((val, index) => {
        console.log(`${index}: ${val}`);
        let i=val.indexOf(':');
        val.substring(0,i)
        result.set(val.substring(0,i),val.substring(i+1));
    });
    return result
}
//获取swagger.json数据
async function getData(url) {
    return await axios({url:url,method:'get'});
}
//选取需要生成的Tag对象
async function getTags(tags) {  //选择要生成的Tag对象
    const question = {
        type: 'checkbox',
        name: 'tags',
        message: `请选择要生成的tag对象`.yellow,
        choices: tags
    }
    let answers = await inquirer.prompt(question)
    return answers.tags;
}
function tagPaths(paths, tag) {
    let tagPaths = [];
    Object.keys(paths).forEach(e => {
        Object.keys(paths[e]).forEach(j => {
            if (paths[e][j] && paths[e][j].tags[0] == tag) {
                paths[e][j].url = '${basePath}' + e.replace(/{/, "${");
                tagPaths.push(paths[e]);
            }
        })
    })
    return tagPaths;
}

/**
 * 文件demo
 * @param urls
 * @param basePath
 * @returns {string}
 */
function tagTemp(urls, basePath) {
    let template =
        `import request from '@/utils/request'  \nconst basePath='${basePath}' \n`;
                urls.forEach(e => {
                    Object.keys(e).forEach(j => {
                        let obj = e[j]
                        let body = j === 'get' ? 'params' : 'data'
                        let path = [];
                        let name ='';
                        let query='';
                        let url='';
                        if(obj.parameters){
                            obj.parameters.forEach(e => {
                                if (e.in == 'path') {
                                    path.push(e.name)
                                }
                            })
                        }
                        if (path.length) {
                             url = obj.url.replace(/[${}]/g, "");
                             name = url.substring(url.lastIndexOf("/") + 1);
                             query = j == 'get' ? `${path.toString()},params` : `${path.toString()},data`
                        } else {
                             name = obj.url.substring(obj.url.lastIndexOf("/") + 1);
                             query = j == 'get' ? 'params' : 'data'
                        }
                        template +=
                            `// ${obj.summary} 
                            export function ${name}(${query}) {  
                            return request({    
                                url:\`${obj.url}\`,    
                                method:'${j}',    
                                ${body}  
                            })}`
                    })
                })
    return template;
}
//创建目标目录
function mkdirsSync(dirpath) {
    try {
        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(path.join(dirpath))
        }
        return true
    } catch (e) {
        console.log("create director fail! path=" + dirpath + " errorMsg:" + e)
        return false
    }}
//把单个tag tpl模板生成文件
async function tagFiles(apiPath, tpl, fileName, choices) {
    let fPath = process.cwd() + '/' + apiPath;  //生成目录
    if (!fs.existsSync(fPath)) {
        mkdirsSync(fPath)
        console.log(`创建api目录成功：${fPath}`.green)
    }
    // 要生成的文件完整路径
    fPath +=  fileName + '.js'
    const ex = fs.existsSync(fPath)
    if (ex) {
        choices.push({ name: fPath, value: { tpl: tpl, path: fPath } })
    } else {
        fs.writeFileSync(fPath, tpl)
        console.log(`代码创建成功`.red, `${fPath}`.green)
    }}
//多个文件
function repeatConfirm(choices) {
    if (choices.length > 0) {
        const question = {
            type: 'checkbox',
            name: 'cover',
            message: `以下文件已存在，请勾选要覆盖的文件`.yellow,
            choices: choices
        }
        inquirer.prompt(question).then((answers) => {
            answers.cover.forEach(e => {
                fs.writeFileSync(e.path, e.tpl)
                console.log('代码生成成功^_^'.red,`${e.path}`.green,'已覆盖'.blue)
            })
        })
    }}
// run();
// test();
module.exports = main
