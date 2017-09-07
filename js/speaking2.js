/**
 * Created by Administrator on 2014/12/23.
 */
/* 口语测试 */
var post_flag=false;
var recorder;
requirejs([ 'jquery', 'audioBar'],function ($, audioBar) {
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
	Date.prototype.Format = function (fmt) { //author: meizz 
	    var o = {
	        "M+": this.getMonth() + 1, //月份 
	        "d+": this.getDate(), //日 
	        "h+": this.getHours(), //小时 
	        "m+": this.getMinutes(), //分 
	        "s+": this.getSeconds(), //秒 
	        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
	        "S": this.getMilliseconds() //毫秒 
	    };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
	    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
	}

    $(document).ready(function () {
    	$(function(){
    		window.recordering={
				init:function(){
			        var self=this;
			        //调用方法
			        //this.addListener();
			        this.html5Recorder();
				},
				html5Recorder:function(){
					$(".text-loading").css("display","none")
				    $('#no-flashplayer').remove();
				    var audio = document.querySelector('audio#au-record');
				    $("#recording").removeClass("butInvalid");
				    /* 开始录音 */
					$("#recording").click(function () {
					  if (!$(this).hasClass("butInvalid")) {
					    HZRecorder.get(function (rec) {
			              recorder = rec;
			              recorder.start();
			              $("#recording").addClass("butInvalid");
			              $("#stop").removeClass("butInvalid");
			            });
					  }
					});
					/* 停止录音 */
				    $("#stop").click(function () {
				      if (!$(this).hasClass("butInvalid")) {
				    	recorder.stop();
			            $(".record-volume-bar").width(0);
				    	$("#stop").addClass("butInvalid");
			            $("#play").removeClass("butInvalid");
			            $("#js_next").removeClass("invalid-continue");
			            $("#upload").removeClass("butInvalid");
				      }
				    });
				    /* 播放录音 */
				    $("#play").click(function () {
				      if (!$(this).hasClass("butInvalid") && audio)
				      {
				    	$("#retry").removeClass("butInvalid");
				        if ($(this).text().indexOf("Play") != -1) {
				          $(this).text("Pause");
				          recorder.play(audio);
				        } else if ($(this).text().indexOf("Pause") != -1) {
				          $(this).text("Play");
				          recorder.stopPlay(audio);  //暂停
				        }
				        audio.addEventListener("ended", function() {
			                $("#play").text("Play");
			            }, !1);
				      }	    	
				    });
				    /* 重新录音 */
				    $("#retry").click(function () {
				      if (!$(this).hasClass("butInvalid")) {
				    	recorder.stopPlay(audio);
				        $("#recording").removeClass("butInvalid");
				        $(this).addClass("butInvalid");
				        $("#play").addClass("butInvalid");
				        $("#play").text("Play");
			            $("#upload").addClass("butInvalid");
			            $("#remotePlay").addClass("butInvalid");
			            $("#hd-audioSrc").val('');
			            $(".audio-tool").hide();
				      }
				    });
				    $("#upload").click(function () {
				    	audioName=new Date().Format("yyyyMMddhhmmss")+parseInt(100*Math.random())+'.mp3';
				    	$("#hd-audioSrc").val(audioName);
				    	qiniuSave(audioName);
				    });
				    /* continue进入下一页面 */
				    $("#js_next").click(function () {
				      if (!$("#js_next").hasClass("invalid-continue")) {
				    	recorder.stop();
				        ajaxPost();
				      }
				    });
				}
    		};
    		recordering.init();
    	});
    });
});

function qiniuSave(audioName){
	//存入七牛云
	var url = "https://up.qbox.me"
        , _data = {
          token: '__J8wgBO2iI4FR-tO3e2RhD-2aFKZT3uMk4Sl8XJ:_OSx_G_00s2i7iG1b8sE0C97O6s=:eyJzY29wZSI6Imt5dy1yZWNvcmQtbXAzLTAwMSIsImRlYWRsaW5lIjoxNTA0MjU0ODY4fQ==',
          key: audioName  //音频的名称
        };
	recorder.upload(url,_data, function (state, e) {
		//debugger;
		switch (state) {
			case 'uploading':
				var percentComplete = Math.round(e.loaded * 100 / e.total) + '%';
				$("#upload").text(percentComplete);
				break;
			case 'ok':
			//	alert(e.target.responseText);
	            $("#remotePlay").removeClass("butInvalid");
	            $("#upload").text("Upload");
				alert('上传成功');
				break;
			case 'error':
				$("#upload").text("Upload");
				alert('上传失败');
				break;
			case 'cancel':
				$("#upload").text("Upload");
				alert('上传被取消');
				break;
		}     	
	
	});
}

// ----------------------------向荣传回token----------------------------------------
function recordPost(blob) {
    
    $.ajax({
        type: "POST",
        url: "/exam/voicePost",
        async: false,
        processData: false,
        contentType: false,
        data: formDt,
        success: function (dataval) {
            if ('success' != dataval.status) {
                var dialog = new Dialog({ok: '确定', title: '录音提醒', message: '对不起，麦克风异常，录音失败，请刷新页面，重新录入该题！'});
                dialog.show();
            } else {
            	//存入七牛云
            	var url = "https://up.qbox.me"
	                , _data = {
	                  token: dataval.token,
	                  key: dataval.path  //音频的名称
	                };
		  			recorder.upload(url,_data, function (state, e) {
		  				//debugger;
		  				switch (state) {
		  					case 'uploading':
		  						var percentComplete = Math.round(e.loaded * 100 / e.total) + '%';
		  						break;
		  					case 'ok':
		  					//	alert(e.target.responseText);
		  					//	alert('上传成功');
		  				    	post_flag=true;
                            	recorder.close();
        		                ajaxPost();
		  						break;
		  					case 'error':
		  						//alert('上传失败');
		  						var dialog = new Dialog({ok: '手动提交', title: '录音提醒', message: '对不起，请求超时，您可以点击手动提交，或者刷新页面，重新录入该题！',okFunction:function(){recordPost(blob)}});
		  			            dialog.show();
		  						break;
		  					case 'cancel':
		  						//alert('上传被取消');
		  						var dialog = new Dialog({ok: '手动提交', title: '录音提醒', message: '对不起，请求超时，您可以点击手动提交，或者刷新页面，重新录入该题！',okFunction:function(){recordPost(blob)}});
		  			            dialog.show();
		  						break;
		  				}     	
		            	
		  			});
            }
        },
        error: function (data) {
            var dialog = new Dialog({ok: '手动提交', title: '录音提醒', message: '对不起，请求超时，您可以点击手动提交，或者刷新页面，重新录入该题！',okFunction:function(){recordPost(blob)}});
            dialog.show();
        }
    });
}
