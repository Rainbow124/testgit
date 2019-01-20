$(function () {

    //0.自定义滚动条
    $(".content-list").mCustomScrollbar();
    var $audio = $("audio");
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;

    //1.加载本地数据文件
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url:"./source/musiclist.json",
            dataType:"json",
            success:function (data) {
                player.musicList = data;
                //3.1遍历获取到的数据。创建每一条音乐
                var $musicList = $(".content-list ul");
                $.each(data,function (index,ele) {
                    var $item = createMusicItem(index,ele);

                    $musicList.append($item);

                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);


            },
            error:function (ele) {
                console.log(ele);
            }


        });


        //2.初始化歌曲信息
        function initMusicInfo(music) {
            //获取对应元素
            var $musicImage = $(".song-info-pic img");
            var $musicName = $(".song-info-name a");
            var $musicSinger = $(".song-info-singer a");
            var $musicAlbum = $(".song-info-album a");
            var $musicProgressName = $(".music-progress-name");
            var $musicProgressTime = $(".music-progress-time");
            var $musicBg = $(".mask-bg");

            // 给获取到的元素赋值
            $musicImage.attr("src", music.cover);
            $musicName.text(music.name);
            $musicSinger.text(music.singer);
            $musicAlbum.text(music.album);
            $musicProgressName.text(music.name +" / "+ music.singer);
            $musicProgressTime.text("00:00 / "+ music.time);
            $musicBg.css("background", "url('"+music.cover+"')");
        }
        // 3.初始化歌词信息
        function initMusicLyric(music){
            lyric = new Lyric(music.link_lrc);
            var $lyricContainer = $(".song-lyric");
            // 清空上一首音乐的歌词
            $lyricContainer.html("");
            lyric.loadLyric(function () {
                // 创建歌词列表
                $.each(lyric.lyrics, function (index, ele) {
                    var $item = $("<li>"+ele+"</li>");
                    $lyricContainer.append($item);
                });
            });
        }
        // 4.初始化进度条
        initProgress();
        function initProgress(){
            var $progressBar = $(".music-progress-bar");
            var $progressLine = $(".music-progress-line");
            var $progressDot = $(".music-progress-dot");
            progress = Progress($progressBar,$progressLine,$progressDot);
            progress.progressClick(function (value) {
                player.musicSeekTo(value);
            });
            progress.progressMove(function (value) {
                player.musicSeekTo(value);
            });


            var $voiceBar = $(".music-voice-bar");
            var $voiceLine = $(".music-voice-line");
            var $voiceDot = $(".music-voice-dot");
            voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
            voiceProgress.progressClick(function (value) {
                player.musicVoiceSeekTo(value);
            });
            voiceProgress.progressMove(function (value) {
                player.musicVoiceSeekTo(value);
            });
        }

        //2.初始化事件的监听
       initEvents();
        function initEvents() {
            //1.监听歌曲的移入和移出事件
            $(".content-list").delegate(".list-music","mouseenter",function () {
                $(this).find(".list-menu").stop().fadeIn(100);
                $(this).find(".list-time a").stop().fadeIn(100);
                //隐藏时长

                $(this).find(".list-time span").stop().fadeOut(100);
            });
            $(".content-list").delegate(".list-music","mouseleave",function () {
                //隐藏子菜单
                $(this).find(".list-menu").stop().fadeOut(100);
                $(this).find(".list-time a").stop().fadeOut(100);
                //显示时长
                $(this).find(".list-time span").stop().fadeIn(100);
            });

            //2.监听选中框的点击事件
            $(".content-list").delegate(".list-check","click",function () {
                $(this).toggleClass("list-checked");
            });

            //3.添加子菜单播放按钮的监听
            var $musicPlay = $(".music-play");
            $(".content-list").delegate(".list-menu-play", "click", function () {
                //优化代码
                var $item = $(this).parents(".list-music");

                //3.1切换播放图标
                $(this).toggleClass("list-menu-play2");
                //3.2找到这首音乐的兄弟元素并删除类
                $item.siblings().find(".list-menu-play").removeClass("list-menu-play2");
                //3.3同步底部的播放按钮
                if($(this).attr("class").indexOf("list-menu-play2") != -1){
                    //当前子菜单的播放按钮是播放状态
                    $musicPlay.addClass("music-play2");
                    //让文字高亮
                    $item.find("div").css("color","#fff");
                    $item.siblings().find("div").css("color","rgba(255,255,255,0.5)");

                }else{
                    //当前子菜单的播放按钮不是播放状态
                    $musicPlay.removeClass("music-play2");
                    //让文字高亮
                    $item.find("div").css("color","rgba(255,255,255,0.5)");

                }
                //3.4 切换序号的状态
                $item.find(".list-number").toggleClass("list-number2");
                //做排他处理
                $item.siblings().find(".list-number").removeClass("list-number2");
                //3.5 播放音乐
                player.playMusic($item.get(0).index,$item.get(0).music);
                //3.6 切换歌曲信息
                initMusicInfo($item.get(0).music);
                //3.7 切换歌词信息
                initMusicLyric($item.get(0).music);


            });
            //4.监听底部控制区域播放按钮的点击
            $musicPlay.click(function () {
                // 判断有没有播放过音乐
                if(player.currentIndex == -1){
                    // 没有播放过音乐
                    $(".list-music").eq(0).find(".list-menu-play").trigger("click");
                }else{
                    // 已经播放过音乐
                    $(".list-music").eq(player.currentIndex).find(".list-menu-play").trigger("click");
                }
            });

            // 5.监听底部控制区域上一首按钮的点击
            $(".music-pre").click(function () {
                $(".list-music").eq(player.preIndex()).find(".list-menu-play").trigger("click");
            });

            // 6.监听底部控制区域下一首按钮的点击
            $(".music-next").click(function () {
                $(".list-music").eq(player.nextIndex()).find(".list-menu-play").trigger("click");
            });
            // 7.监听删除按钮的点击
            $(".content-list").delegate(".list-menu-del", "click", function () {
                //找到被点击的音乐
                var $item =$(this).parents(".list-music");

                //判断当前删除的是否是正在播放的
                if($item.get(0).index == player.currentIndex){
                    $(".music-next").trigger("click");
                }
                $item.remove();
                player.changeMusic($item.get(0).index);

                //重新排序
                $(".list-music").each(function (index, ele) {
                    ele.index = index;
                    $(ele).find(".list-number").text(index + 1);
                });
            });

            // 8.监听播放的进度
            player.musicTimeUpdate(function (currentTime, duration, timeStr) {
                // 同步时间
                $(".music-progress-time").text(timeStr);
                // 同步进度条
                // 计算播放比例
                var value = currentTime / duration * 100;
                progress.setProgress(value);
                // 实现歌词同步
                var index = lyric.currentIndex(currentTime);
                var $item = $(".song-lyric li").eq(index);
                $item.addClass("cur");
                $item.siblings().removeClass("cur");

                // 实现歌词滚动
                if(index <= 2) return;
                $(".song-lyric").css({
                    marginTop: (-index + 2) * 30
                });
            });
            // 9.监听声音按钮的点击
            $(".music-voice-icon").click(function () {
                // 图标切换
                $(this).toggleClass("music-voice-icon2");
                // 声音切换
                if($(this).hasClass("music-voice-icon2")){
                    // 变为没有声音
                    player.musicVoiceSeekTo(0);
                }else{
                    // 变为有声音
                    player.musicVoiceSeekTo(1);
                }
            });




        }

    }
    //定义一个方法创建一条音乐
    function createMusicItem(index,music) {
        var $item = $("<li class=\"list-music\">\n" +
            "                        <div class=\"list-check \"><i></i></div>\n" +
            "                        <div class=\"list-number\">"+(index+1)+"</div>\n" +
            "                        <div class=\"list-name\">"+music.name+"\n" +
            "                            <div class=\"list-menu\">\n" +
            "                                <a href=\"javascript:;\" title=\"播放\" class='list-menu-play'></a>\n" +
            "                                <a href=\"javascript:;\" title=\"添加到\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                        <div class=\"list-singer\">"+music.singer+"</div>\n" +
            "                        <div class=\"list-time\">\n" +
            "                            <span>"+music.time+"</span>\n" +
            "                            <a href=\"javascript:;\" title=\"删除\" class='list-menu-del'></a>\n" +
            "                        </div>\n" +
            "                    </li>");

        $item.get(0).index = index;
        $item.get(0).music = music;

        return $item;
    }

});