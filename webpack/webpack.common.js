const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");
const entry = {};

// 读取目录中的文件
fs.readdirSync(srcDir).forEach((file) => {
    const filePath = path.join(srcDir, file);
    const stats = fs.statSync(filePath);

    // 如果是文件且扩展名为 ".tsx" 或 ".ts"
    if (stats.isFile() && /\.(tsx?|ts)$/.test(file)) {
        const fileName = path.basename(file, path.extname(file));
        entry[fileName] = filePath;
    }
});

module.exports = {
    entry,
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all",
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
        // ...
    ],
};
