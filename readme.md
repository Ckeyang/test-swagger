## 测试 解析swagger
    执行main 函数 
    传入 swagger.json 地址, 相对生成路径

    1.0.1 抛出 main 函数
    1.0.2 优化 文件夹情况
    1.0.4 添加 源代码路径 大致使用方法
    1.0.6 优化 多层文件夹的情况
    1.0.8 优化
    1.0.10 支持ts
    1.0.12 支持配置request路径

## 引入方式
    
    npm install ckeyang-test-swagger --save
    yarn add ckeyang-test-swagger

## code

    const main = require('ckeyang-test-swagger')
    main('http://124.70.150.250:9007/v3/api-docs','./api/','ts','@/plugin/axios'); // 默认js

