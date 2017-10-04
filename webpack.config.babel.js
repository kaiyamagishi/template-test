/**
 * Created by krd on 2017/06/20.
 */

const glob = require("glob");
const path = require('path');
const webpack = require("webpack");
const NotifierPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');


module.exports = env => {
    let entries = {};
    glob.sync("./src/assets/js/main/**/*.js").map(function(file){
        // {key:value}のObject（連想配列形式）を生成
        // .src/の部分を削除する
        // console.log('rename path = ' + file);
        let rf = file.replace( /.\/src\//g , "");
        rf = rf.replace( /.js$/g , "");
        entries[rf] = file;
        console.log('rename path = ' + rf);
    });
    glob.sync("./src/assets/vue/**/*.vue").map(function(file){
        // console.log('rename path = ' + file);
        let rf = file.replace( /.\/src\//g , "");
        rf = rf.replace( /.vue$/g , "");
        entries[rf] = file;
        // console.log('rename path = ' + rf);
    });

    let conf = {
        watchOptions: {
            ignored: /src\/lib/
        },
        entry: entries,
        output: {
            path: path.join(__dirname, 'target'),
            filename: "[name].js",
            jsonpFunction: 'jsoneopack'
            // sourceMapFilename: "[file].map"
        },
        plugins: [
            new webpack.ProvidePlugin({
                Vue: 'Vue',
                // $: 'jquery',
                jq: 'jquery'
            }),
            // ここに変数を定義すればwebpackでトランスパイルするjsから参照できるようになる
            new webpack.DefinePlugin({
                // 'env.prod': env.prod,
                'env.dev': env.dev
            }),
            new NotifierPlugin({
                onErrors: (severity, errors) => {
                    if (severity !== 'error') {
                        return;
                    }
                    const error = errors[0];
                    notifier.notify({
                        title: "Webpack error",
                        message: `jsのトランスパイルでコケてる`,
                        subtitle: `Error in: ${error.file}` || '',
                        sound: true,
                        icon: path.join(__dirname, 'tool_icon', 'webpack.jpg')
                    });
                }
            }),
            new webpack.LoaderOptionsPlugin({
                // debug: env.dev,
                options: {
                    context: __dirname, //babel needs to set the context path here!
                    babel: {
                        presets: ['es2015', 'es2016', 'es2017'],
                        plugins: ['transform-runtime', 'transform-object-rest-spread']
                        // comments: false
                    }
                }
            })
        ],
        module: {
            rules: [
                {
                    // js用のトランスパイルの設定
                    // enforce: 'pre',          // pre: 初めに実行する, post: 最後に実行する, 無し: preとpostの中間で実行する
                    test: /\.js$/,           // ビルド対象（.js のファイルに対して）なぜtestと定義したのか問いたい
                    exclude: /(bower_components|node_modules)/, // ビルド対象から除外するフォルダ
                    //exclude: /src\/js\/lib/, // ビルド対象から除外するフォルダ
                    //loader: 'babel-loader',  // loader でローダの指定。（ babel-loader を使用して babel でトランスパイルする）
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            // babel周りの設定を追加する場合はここも
                            presets: ['es2015', 'es2016', 'es2017'],
                            plugins: ['transform-runtime', 'transform-object-rest-spread']
                        }
                    }]
                },
                {
                    // vue用のトランスパイルの設定
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            // babel周りの設定を追加する場合はここも
                            js: 'babel-loader?presets[]=es2015&presets[]=es2016&presets[]=es2017' +
                                '&plugins[]=transform-runtime' +
                                '&plugins[]=transform-object-rest-spread'
                        }
                    }
                },
                {
                    test: /\.css$/,
                    loader: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                    loader: 'file-loader?name=assets/font/[name].[ext]'
                },
                {
                    test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
                    use: [{
                        loader: 'file-loader',
                        query: {
                            name: '[name].[ext]?[hash]'
                        }
                    }]
                }
            ]
        },
        // requireで読み込むときのrootのpathを指定
        resolve: {
            //root: [
            //  path.join(__dirname + '/src/js'),
            //],
            extensions: ['*', '.js', '.vue'],
            modules: [
                "node_modules"
            ],
            alias: {
                // vue.js のビルドを指定する
                vue: 'vue/dist/vue.common.js'
            }
        }
    };
    if (env.dev) {
        // Uglifyかけるとファルサイズが約20%くらい(誤差はかなりある)まで圧縮される
        // conf.plugins.push(new webpack.optimize.UglifyJsPlugin());
        // トランスパイルしたjsをさらに軽量化して実行速度も上がる。しかしhmr(auto reload)が効かなくなるそうな
        conf.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
        conf = Object.assign(conf, {
            // inlineでsourcemapを吐くとサイズが倍以上になる
            devtool: '#inline-source-map',
            // devtool: '#source-map',
            watch: true
        });
    } else {
        conf.plugins.push(new webpack.optimize.UglifyJsPlugin());
        conf.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
        conf.output.path = path.join(__dirname, 'dist');
        // conf.output.filename = 'app.js';
        conf = Object.assign({}, conf, {
            devtool: '#source-map'
        });
    }
    return conf
};




