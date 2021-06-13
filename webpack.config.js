const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require("path")

module.exports = {
    entry:{
        main:"./src/client/js/main.js",
        videoPlayer:"./src/client/js/videoPlayer.js"
    },
    mode:"development",
    watch:true,
    plugins: [new MiniCssExtractPlugin({
        filename:"css/style.css"
    })],
    output: {
        filename:"js/[name].js",
        path:path.resolve(__dirname,"assets"),
        clean:true,
    },
    module:{
        rules:[
            {
                test:/\.js$/i,
                use:{
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        ['@babel/preset-env', { targets: "defaults" }]
                      ]
                    },
                },
            },
            {
                test:/\.scss$/i,
                use:[
                    MiniCssExtractPlugin.loader,"css-loader","sass-loader"
                ]
            }
        ],
    },
};