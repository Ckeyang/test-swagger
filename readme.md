## 测试 解析swagger
    执行main 函数 
    传入 swagger.json 地址, 相对生成路径

    1.0.1 抛出 main 函数
    1.0.2 优化 文件夹情况
    1.0.4 添加 源代码路径 大致使用方法

## code

    const main = require('ckeyang-test-swagger')
    main('http://124.70.150.250:9007/v3/api-docs','./api/');

