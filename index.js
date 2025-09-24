const fs = require('fs');
const path = require('path');
const os = require('os');
const { exampleLines } = require('./env');

class envLoader {
    constructor(options = {}) {
        this.options = {
            path: options.path || '.env',
            encoding: options.encoding || 'utf8',
            debug: options.debug || false,
            ...options
        };

        this.variables = {};
        this.loaded = false;

        this.load(); // 自动加载
    }

    // 解析 .env 文件内容
    parse(content) {
        const lines = content.split('\n');
        const result = {};

        for (let line of lines) {
            // 移除前后空白字符
            line = line.trim();

            // 跳过空行和注释
            if (!line || line.startsWith('#')) continue;

            // 解析键值对
            const equalsIndex = line.indexOf('=');
            if (equalsIndex === -1) {
                if (this.options.debug) console.warn(`⚠️  跳过无效行: ${line}`);
                continue;
            }

            const key = line.substring(0, equalsIndex).trim();
            let value = line.substring(equalsIndex + 1).trim();

            // 移除值两端的引号（如果存在）
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
                value = value.substring(1, value.length - 1);

            if (key) {
                result[key] = value;
                if (this.options.debug) console.log(`✓ 加载变量: ${key} = ${value}`);
            }
        }

        return result;
    }

    // 查找 .env 文件
    findEnvFile() {
        const possiblePaths = [
            this.options.path,
            path.join(process.cwd(), this.options.path),
            path.join(process.cwd(), '.env'),
            path.join(os.homedir(), '.env')
        ];

        for (const filePath of possiblePaths) {
            try {
                if (fs.existsSync(filePath)) return filePath;
            } catch (error) { }
        }

        return null;
    }

    // 创建示例文件
    createExampleFile(filePath) {
        try {
            // 处理示例内容
            const formattedContent = exampleLines.join('\n');

            fs.writeFileSync(filePath, formattedContent, 'utf8');
            console.log('✓ 已创建 .env 示例文件: ' + filePath + ';请编辑环境变量后重新运行程序');
            process.exit(1);
        } catch (error) {
            console.error('✗ 创建 .env 文件失败:', error.message);
        }
    }

    // 加载环境变量
    load() {
        if (this.loaded) return this.variables;

        const envFilePath = this.findEnvFile();

        if (!envFilePath) {
            console.error('❌ 错误: 未找到 .env 文件');
            console.log('💡 正在创建示例文件...');

            const defaultPath = path.join(process.cwd(), '.env');
            this.createExampleFile(defaultPath);
        }

        try {
            const content = fs.readFileSync(envFilePath, this.options.encoding);
            this.variables = this.parse(content);
            this.loaded = true;

            if (this.options.debug) {
                console.log(`✓ 成功加载 .env 文件: ${envFilePath}`);
                console.log(`✓ 加载了 ${Object.keys(this.variables).length} 个变量`);
            }

            // 将变量设置到 process.env
            for (const [key, value] of Object.entries(this.variables)) {
                if (!process.env[key]) process.env[key] = value;
            }

        } catch (error) {
            console.error('❌ 读取 .env 文件失败:', error.message);
            process.exit(1);
        }

        return this.variables;
    }

    // 获取所有变量
    getAll() {
        return { ...this.variables };
    }

    // 获取单个变量
    get(key, defaultValue = null) {
        return this.variables[key] || defaultValue;
    }

    // 检查变量是否存在
    has(key) {
        return key in this.variables;
    }
}

// 创建单例实例
const envInstance = new envLoader();

// 代理处理器，实现 env.变量名 的调用方式
const handler = {
    get(target, prop) {
        if (prop in target) return target[prop];

        // 如果属性不存在于 envLoader 实例，尝试从变量中获取
        const variables = target.getAll();
        if (prop in variables) return variables[prop];

        return undefined;
    },

    set(target, prop, value) {
        console.warn('⚠️  警告: 不能直接设置 env 变量，请编辑 .env 文件');
        return false;
    }
};

// 创建代理实例
const env = new Proxy(envInstance, handler);
module.exports = env;