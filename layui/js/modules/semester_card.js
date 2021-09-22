layui.define(['jquery', 'util'], function(exports){

    var $ = layui.jquery,
        util = layui.util;

    var semester_card = (function(options){
        var assign = function(defaultValue, value){
            output = {};
            for (var k in defaultValue)
                output[k] = defaultValue[k];
            for (var k in value)
                output[k] = value[k];
            return output;
        };

        const queryStringify = query => {
            const queryString = Object.keys(query)
              .map(key => `${key}=${encodeURIComponent(query[key] || '')}`)
              .join('&')
            return queryString
        }

        const queryParse = (search = window.location.search) => {
            if (!search) return {}
            const queryString = search[0] === '?' ? search.substring(1) : search
            const query = {}
            queryString
              .split('&')
              .forEach(queryStr => {
                const [key, value] = queryStr.split('=')
                /* istanbul ignore else */
                if (key) query[decodeURIComponent(key)] = decodeURIComponent(value)
              })
          
            return query
          }

        options = assign({
            proxy: 'https://ghproxy.com/',
            baseURL: 'https://api.github.com',
        }, options);

        var cardComponent = {
            construct: function(callback) {
                const query = queryParse();
                if (query.course_code) {
                    this.course_code = query.course_code;
                    $.ajax({
                        url: options.baseURL + "/repos/" + options.owner + "/" + options.repo + "/contents/courses/" + query.course_code + "/meta.json",
                        type: "GET",
                        data: {
                            'ref': 'file-base'
                        },
                        headers: {
                            'Accept': 'application/json',
                        },
                        success: function (data) {
                            if (data && data.content) {
                                var string = decodeURIComponent(escape(window.atob(data.content.replace(/[\r\n]/g,""))));
                                console.log(string);
                                var content = JSON.parse(string);
                                cardComponent.content = content;
                            } else {
                                console.log('data error:', data);
                            }
                            if (callback) callback();
                        },
                        error: function(err) {
                            console.log(err);
                            if (callback) callback();
                        }
                    })
                } else {
                    if (callback) callback();
                }
            },

            getPeople: function(callback) {
                $.ajax({
                    url: options.baseURL + "/repos/" + options.owner + "/" + options.repo + "/contents/people/meta.json",
                    type: "GET",
                    data: {
                        'ref': 'file-base'
                    },
                    headers: {
                        'Accept': 'application/json',
                    },
                    success: function (data) {
                        if (data && data.content) {
                            var string = decodeURIComponent(escape(window.atob(data.content.replace(/[\r\n]/g,""))));
                            var content = JSON.parse(string);
                            cardComponent.people = content;
                        } else {
                            console.log('data error:', data);
                        }
                        if (callback) callback();
                    },
                    error: function(err) {
                        console.log(err);
                        if (callback) callback();
                    }
                })
            },

            config: function(options_) {
                options = assign(options, options_);
            },

            render_: function(container){
                node = window.document.getElementById(container);
                content = this.content;
                cards = "";

                cards += '                                                                                \
                    <h1 style="font-family: Quicksand; margin: 1em;"><b>' + content.name + '</b></h1>     \
                    <hr>                                                                                  \
                    <div class="layui-row"><div class="layui-col-sm9">                                    \
                ';

                for (const idx in content.semesters) {
                    const semester = content.semesters[idx];
                    const key = semester.course_id + '_' + semester.season + '_' + semester.year;
                    cards += '                                                                          \
                    <div class="menu" semester="' + key + '">                                           \
                        <div class="layui-card">                                                        \
                            <div class="layui-card-body">                                               \
                                <div class="layui-row" style="padding-top: 1em; padding-bottom: 1em;">  \
                                    <div class="layui-col-md2">                                         \
                                        <div class="semester">                                          \
                                            <div class="semester_season">' + semester.season + '</div> \
                                            <div class="semester_year">' + semester.year + '</div>      \
                                        </div>                                                          \
                                    </div>                                                              \
                                    <div class="layui-col-md10">                                        \
                                        <div style="margin: 5px 1em;">                                  \
                                            <div class="layui-row" style="font-family: Quicksand;">     \
                                                <div class="layui-col-md4">                             \
                                                    <div style="margin: 5px;">                          \
                                                        <b>Instructor 教师：</b>                        \
                                                    </div>                                              \
                    ';

                    for (const pid in semester.teacher) {
                        if (Object.hasOwnProperty.call(this.people, semester.teacher[pid])) {
                            const pinfo = this.people[semester.teacher[pid]];
                            cards += '                                          \
                            <div class="instructor">                            \
                                <a href="javascript:;">                         \
                                <div><img src="' + (pinfo.image ? pinfo.image : "layui/images/teacher.jpg") + '" style="border-radius: 50%; width: 60px; height: 60px;"></div> \
                                <div>' + pinfo.name + '</div>                   \
                                </a>                                            \
                            </div>                                              \
                            ';
                        }
                    }
                    
                    cards += '                                  \
                        </div>                                  \
                        <div class="layui-col-md8">             \
                        <div style="margin: 5px;">              \
                            <b>Teaching Assistant 助教：</b>    \
                        </div>                                  \
                    ';

                    for (const pid in semester.ta) {
                        if (Object.hasOwnProperty.call(this.people, semester.ta[pid])) {
                            const pinfo = this.people[semester.ta[pid]];
                            cards += '                                          \
                            <div class="instructor">                            \
                                <a href="javascript:;">                         \
                                <div><img src="' + (pinfo.image ? pinfo.image : "layui/images/teacher.jpg") + '" style="border-radius: 50%; width: 60px; height: 60px;"></div> \
                                <div>' + pinfo.name + '</div>                   \
                                </a>                                            \
                            </div>                                              \
                            ';
                        }
                    }
                                                
                    cards += '                                                                                          \
                                                </div>                                                                  \
                                                <div class="layui-col-md12" style="margin: 0.5em 0;"></div>             \
                                                <div class="layui-col-md6">                                             \
                                                    <b>开课单位：</b>' + semester.department + '                                     \
                                                </div>                                                                   \
                                                <div class="layui-col-md6">                                             \
                                                    <b>学分：</b>' + semester.credit + '                                                      \
                                                </div>                                                                  \
                                                <div class="layui-col-md6">                                              \
                                                    <b>学时：</b>' + semester.hours + '                                                     \
                                                </div>                                                                  \
                                                <div class="layui-col-md6">                                             \
                                                    <b>先修课程：</b>' + semester.prerequisite + '                                                   \
                                                </div>                                                                  \
                                                <div class="layui-col-md12">                                            \
                                                    <b>评分标准：</b>' + semester.evaluation + '                                                   \
                                                </div>                                                                  \
                                            </div>                                                                      \
                                            <div class="layui-row" style="padding-top: 1em;">                           \
                                                <a href="javascript:;" class="layui-btn layui-btn-lg layui-btn-violet layui-btn-disabled" style="font-weight: normal; float: right;">查看主页</a>    \
                                            </div>                                                                      \
                                        </div>                                                                          \
                                    </div>                                                                              \
                                </div>                                                                                  \
                            </div>                                                                                      \
                        </div>                                                                                          \
                    ';
                                                
                    cards += '</div>';
                }

                cards += '                                                                                                                  \
                        </div>                                                                                                              \
                        <div class="layui-col-sm3">                                                                                         \
                            <div style="margin: 2em;">                                                                                      \
                                <p><b>重要课程日期</b></p>                                                                                   \
                                <blockquote class="layui-elem-quote" style="font-weight: bold; margin-bottom: 0;">' + util.toDateString(new Date(), '今天是 yyyy年MM月dd日 HH:mm UTC+8') + '</blockquote>   \
                                <blockquote class="layui-grey-quote">                                                                       \
                                    您拥有完全访问许可。                                                                                      \
                                </blockquote>                                                                                               \
                            </div>                                                                                                          \
                        </div>                                                                                                              \
                    </div>                                                                                                                  \
                    <div class="layui-footer" style="margin:2em;">                                                                                              \
                        <!-- 底部固定区域 -->                                                                                                \
                        <p style="display:flex; justify-content: center;">© 2020-2021 iTechX - MIT license.</p>                             \
                    </div>                                                                                                                  \
                ';

                node.innerHTML = cards;
                var card_elements = node.getElementsByClassName("menu");

                for (var idx = 0; idx < card_elements.length; idx++) {
                    var e = card_elements[idx];
                    this.loadFolders(e);
                }
            },

            loadFolders: function(element) {
                var semester = element.getAttribute('semester');
                $.ajax({
                    url: options.baseURL + "/repos/" + options.owner + "/" + options.repo + "/contents/courses/" + this.course_code + "/" + semester,
                    type: "GET",
                    data: {
                        'ref': 'file-base'
                    },
                    headers: {
                        'Accept': 'application/json',
                    },
                    success: function (data) {
                        if (data) {
                            for (var idx in data) {
                                var file = data[idx];
                                if (file.type == "dir") {
                                    var d = document.createElement('details');
                                    var details = '                                         \
                                        <summary>' + file.name + '</summary>                \
                                        <div class="details-wrapper">                       \
                                        <div class="details-styling">                       \
                                            <i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop" style="margin-right: 10px;"></i> Loading... \
                                        </div>                                              \
                                        </div>                                              \
                                    ';
                                    d.innerHTML = details;
                                    element.appendChild(d);
                                    cardComponent.loadFiles(d, file.url);
                                }
                            }
                            var accordion = new Collapse(element, { accordion: false }).init();
                        } else {
                            console.log('data error:', data);
                        }
                    },
                    error: function(err) {
                        console.log(err);
                    }
                })
            },

            preprocessURL: function(url) {
                if (url.endsWith(".md") || url.endsWith(".mdx") || url.endsWith(".htmlx")) {
                    return "reader?url="+ options.proxy + url;
                } else {
                    return options.proxy + url;
                }
            },

            loadFiles: function(element, path) {
                $.ajax({
                    url: path,
                    type: "GET",
                    headers: {
                        'Accept': 'application/json',
                    },
                    success: function (data) {
                        if (data) {
                            var normal_contents = new Array();
                            var reader_contents = new Array();
                            for (var idx in data) {
                                var file = data[idx];
                                if (file.type == "file") {
                                    var url = file.download_url;

                                    if (url.endsWith(".md") || url.endsWith(".mdx") || url.endsWith(".htmlx")) {
                                        url = "reader?url="+ options.proxy + url;
                                        reader_contents.push('                        \
                                        <a href="' + url + '">' + file.name + '</a>   \
                                        ');
                                    } else {
                                        url = options.proxy + url;
                                        normal_contents.push('                        \
                                        <a href=&quot;' + url + '&quot;>' + file.name + '</a>   \
                                        ');
                                    }
                                }
                            }
                            if (normal_contents.length > 0) {
                                var message = "javascript:layui.use('layer', function(){  var layer = layui.layer;  layer.open({area: '50%', title: '文件信息',content: '"+ normal_contents.join("<hr>") +"'}); });"
                                reader_contents.push('                        \
                                <a href="'+message+'">浏览文件...</a>   \
                                ');
                            }
                            element.children[1].children[0].innerHTML = reader_contents.join("<hr>");
                        } else {
                            console.log('data error:', data);
                            element.children[1].children[0].innerHTML = "Loading failed. Please try again.";
                        }
                    },
                    error: function(err) {
                        console.log(err);
                        element.children[1].children[0].innerHTML = "Loading failed. Please try again.";
                    }
                })
            },

            render: function(container){
                var index = layer.load(2, {
                    content:"<p style='position: relative; left: -10px;'><br><br>Loading...</p>",
                    shade:0
                });
                cardComponent.construct(function(){
                    cardComponent.getPeople(function(){
                        cardComponent.render_(container);
                        layer.close(index);
                    })
                });
            }
        }

        return cardComponent;
    });
    exports('semester_card', semester_card);
});

