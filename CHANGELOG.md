# 变更日志
## [3.0.2] - 2025-09-28 11:06
### 优化:
- 删除配置里的隐形重安装指令:"install": "node install.js",

## [3.0.0] - 2025-09-27 09:28
# 重大更新:
```javascript
        // 使用方式改为:
// 方式一(示例):
const { env } = require('lunjack-env');

console.log(env.DB_HOST); // 访问环境变量 ( env会根据3级策略自动查找 .env 文件变量)

// 方式二(示例):
const { config } = require('lunjack-env');
const env = config({
    path: './path/.env',  // 自定义路径
    encoding: 'utf8',     // 字符集 (默认utf8)
    debug: true           // 调试模式 (默认false)
});

console.log(env.PORT); // 访问配置项
```

## [2.0.0] - 2025-09-24 16:14
### 重大更新:
- 将原包名改为:lunjack-env;直接访问变量也改为:env.变量名