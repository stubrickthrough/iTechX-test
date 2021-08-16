layui.define(['jquery', 'util'], function(exports){

    var $ = layui.jquery,
        util = layui.util;

    var course_card = (function(options){
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

            config: function(options_) {
                options = assign(options, options_);
            },

            render_: function(container){
                node = window.document.getElementById(container);
                this.loadFolders(node);
            },

            loadFolders: function(element) {
                $.ajax({
                    url: options.baseURL + "/repos/" + options.owner + "/" + options.repo + "/contents/courses",
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
                                    cardComponent.loadDetails(element, file.name);
                                }
                            }
                        } else {
                            console.log('data error:', data);
                        }
                    },
                    error: function(err) {
                        console.log(err);
                    }
                })
            },

            loadDetails: function(element, course_code) {
                $.ajax({
                    url: options.baseURL + "/repos/" + options.owner + "/" + options.repo + "/contents/courses/" + course_code + "/meta.json",
                    type: "GET",
                    data: {
                        'ref': 'file-base'
                    },
                    headers: {
                        'Accept': 'application/json',
                    },
                    success: function (data) {
                        if (data) {
                            if (data && data.content) {
                                var string = decodeURIComponent(escape(window.atob(data.content.replace(/[\r\n]/g,""))));
                                var elem = JSON.parse(string);

                                var semester_strings = new Array();
                                for (e in elem.semesters)
                                    semester_strings.push(e.slice(0,-4) + ' ' + e.slice(-4));
                                
                                var d = document.createElement('div');
                                if (elem.hasOwnProperty("status") && elem.status == "activate"){
                                    d.classList.add("activate");
                                    cardHTML = '<div class="layui-card" style="border-radius: 10px;"><div class="layui-card-body"><div class="layui-row"><div class="layui-col-md3"><a href="course?course_code='+ elem.code +'"><img class="shadow" src="'+ elem.cover +'"style="width:100%;"></a></div><div class="layui-col-md9"><div style="margin: 5px 1em;"><div style="font-family: Quicksand; font-weight: bold; text-align: left; font-size: 2em;"><a href="course?course_code='+ elem.code +'">'+ elem.name +'</a></div><div class="layui-row"><div class="layui-col-md9"><p style="padding-top: 1%; text-align: left; font-family: Quicksand; font-weight: bold; font-size: 1.2em; margin-bottom: 0.2em; color:#8FBC8F;">ACTIVATE</p></div></div><div class="layui-row"><div class="layui-col-md9"><p style="padding-top: 7%; text-align: left; font-size: 1.2em; margin-bottom: 0.2em;">'+ elem.code +'</p><p style="text-align: left; font-size: 1.2em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ semester_strings.join(', ') +'</p></div><div class="layui-col-md3" style="padding-top: 5%; text-align: center;"><a href="course?course_code='+ elem.code +'" class="layui-btn layui-btn-lg layui-btn-violet" style="font-weight: normal;">查看课程</a></div></div></div></div></div></div></div>';
                                } else {
                                    cardHTML = '<div class="layui-card" style="border-radius: 10px;"><div class="layui-card-body"><div class="layui-row"><div class="layui-col-md3"><a href="course?course_code='+ elem.code +'"><img class="shadow" src="'+ elem.cover +'"style="width:100%;"></a></div><div class="layui-col-md9"><div style="margin: 5px 1em;"><div style="font-family: Quicksand; font-weight: bold; text-align: left; font-size: 2em;"><a href="course?course_code='+ elem.code +'">'+ elem.name +'</a></div><div class="layui-row"><div class="layui-col-md9"><p style="padding-top: 14%; text-align: left; font-size: 1.2em; margin-bottom: 0.2em;">'+ elem.code +'</p><p style="text-align: left; font-size: 1.2em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ semester_strings.join(', ') +'</p></div><div class="layui-col-md3" style="padding-top: 12%; text-align: center;"><a href="course?course_code='+ elem.code +'" class="layui-btn layui-btn-lg layui-btn-violet" style="font-weight: normal;">查看课程</a></div></div></div></div></div></div></div>';
                                }

                                d.innerHTML = cardHTML;
                                element.appendChild(d);
                            } else {
                                console.log('data error:', data);
                            }
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
                cardComponent.render_(container);
            }
        }

        return cardComponent;
    });
    exports('course_card', course_card);
});

