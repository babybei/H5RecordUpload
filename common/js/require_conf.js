/**
 * Created by 吴青龙 on 2014/12/17.
 * 功能：requireJS配置，在调用require.js前调用，其他文件无需再定义require.config
 */
if(typeof require_conf_run != 'object') (function () {
    var scriptEle = document.querySelectorAll("head > script");
    //var baseUrl = scriptEle[scriptEle.length - 1].getAttribute("src").replace(/\w+(\.\w+)*$/, '../../lib');
    var baseUrl = scriptEle[scriptEle.length - 1].getAttribute("src").split('?')[0].replace(/\w+(\.\w+)*$/, '../../lib');
    while(baseUrl.match(/\w+\/\.\.\//)) {
        baseUrl = baseUrl.replace(/\w+\/\.\.\//,'');
    }
    requirejs.config({
        //By default load any module IDs from js/lib
        baseUrl: baseUrl,
        //except, if the module ID starts with "app",
        //load it from the js/app directory. paths
        //config is relative to the baseUrl, and
        //never includes a ".js" extension since
        //the paths config could be for a directory.
        paths: {
//            jquery: 'http://code.enhance.cn/dist/libs/jquery/1.11.0/jquery'
            'jquery': 'jquery-1.10.2.js',

//      自定义模块
            'audioBar': '../common/js/ours_mod/audio_bar.js',
            'audioIE8': '../common/js/ours_mod/audio_ie8.js',
            'audioPlayer': '../js/audio.min.js',
        },
        shim: {
            'circleBar': {
                deps: ['jquery']
            },
            'calendario': {
                deps: ['jquery']
            },
            'icheck': {
                deps: ['jquery']
            },
            'bootstrap':{
                deps: ['jquery']
            },
            'ScrollBar':{
                deps: ['jquery']
            },
            'slick':{
                deps: ['jquery']
            },
            'imagePicker':{
                deps: ['jquery']
            },
            'isLoading':{
                deps: ['jquery']
            },
            'pop_show':{
                deps: ['jquery']
            },
            'cookie':{
                deps: ['jquery']
            }
        }
    });
    require_conf_run = {};
})();