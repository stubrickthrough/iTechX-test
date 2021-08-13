layui.define(['jquery', 'element'], function(exports){

    var $ = layui.jquery,
        element = layui.element;

    var ajax = (function(){
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

        options = {
            proxy: 'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
            baseURL: 'https://api.github.com',
            page: 'none',
        };
        
        var ajaxComponent = {
            construct: function(container) {
                const query = queryParse();
                var outside = this;
                if (query.code) {
                    const code = query.code
                    const replacedUrl = `${window.location.origin}${window.location.pathname}${queryStringify(query)}${window.location.hash}`
                    options = assign(options, {
                        url: replacedUrl,
                        id: replacedUrl
                    })
                    console.log(code);

                    $.ajax({
                        url: options.proxy,
                        type: "POST",
                        data: {
                            'Accept': 'application/json',
                            'code': code,
                            'client_id': options.clientID,
                            'client_secret': options.clientSecret
                        },
                        success: function (data) {
                            data = queryParse(data);
                            console.log(data);
                            if (data && data.access_token) {
                                window.localStorage.setItem('GT_ACCESS_TOKEN', data.access_token);
                                outside.getUserInfo(container);
                            } else {
                                // no access_token
                                console.log('data error:', data)
                            }
                        },
                        error: function(err) {
                            err = queryParse(err);
                            console.log(err);
                        }
                    })
                } else {
                    outside.getUserInfo(container);
                }
            },

            getUserInfo: function (container) {
                accessToken = options.accessToken || window.localStorage.getItem('GT_ACCESS_TOKEN');
                if (!accessToken) {
                  return;
                }
                var outside = this;
                $.ajax({
                    url: options.baseURL + "/user",
                    type: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'token ' + accessToken,
                    },
                    success: function (data) {
                        outside.userInfo = data;
                        outside.render_(container);
                    },
                    error: function(err) {
                        console.log(err);
                    }
                })
            },

            config: function(options_) {
                options = assign(options, options_);
            },

            getLoginLink: function() {
                const githubOauthUrl = 'https://github.com/login/oauth/authorize';
                const { clientID } = options;
                const query = {
                    client_id: clientID,
                    redirect_uri: window.location.href,
                    scope: 'public_repo,read:user,user:email'
                };
                return `${githubOauthUrl}?${queryStringify(query)}`;
            },

            hello: function(str){
                $.ajax({
                    url: options.baseURL + "/repos/stubrickthrough/testAPI/contents",
                    type: "GET",
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: {
                        'ref': 'gh-pages'
                    },
                    success: function (data) {
                        console.log(data);
                    }
                })
            },

            prerender: function(container){
                node = window.document.getElementById(container);
                page = options.page;
                tabs = "";

                if (page == "dashboard") {
                    tabs += '<li class="layui-nav-item layui-layout-right layui-this" style="position: relative; margin-right: 16em;"><a href="">课程面板</a></li>';
                } else {
                    tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 16em;"><a href="">课程面板</a></li>';
                }

                if (page == "help") {
                    tabs += '<li class="layui-nav-item layui-layout-right layui-this" style="position: relative; margin-right: 10em;"><a href="help.html">帮助</a></li>';
                } else {
                    tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 10em;"><a href="help.html">帮助</a></li>';
                }

                tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 2em;">                \
                    <a href="'+this.getLoginLink()+'">                                                                                \
                        <img src="layui/images/github.svg" class="layui-nav-img">登录</a>                                                      \
                </li>'

                node.innerHTML = '<div class="layui-header">                                                                                                                        \
                    <ul class="layui-nav" lay-filter="">                                                                                                                            \
                        <a class="logo" href="">                                                                                                                                    \
                            <img src="F:/iTechX/iTechX/image/iTechX.png" height="30px" style="position: relative; bottom: -15px; float: left; margin-right: 2%;" alt="iTechX">      \
                        </a>                                                                                                                                                        \
                        ' + tabs + ' \
                    </ul>                                                                                                                                                           \
                </div>';
                element.render('nav');
            },

            render_: function(container){
                node = window.document.getElementById(container);
                page = options.page;
                tabs = "";

                if (page == "dashboard") {
                    tabs += '<li class="layui-nav-item layui-layout-right layui-this" style="position: relative; margin-right: 16em;"><a href="">课程面板</a></li>';
                } else {
                    tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 16em;"><a href="">课程面板</a></li>';
                }

                if (page == "help") {
                    tabs += '<li class="layui-nav-item layui-layout-right layui-this" style="position: relative; margin-right: 10em;"><a href="help.html">帮助</a></li>';
                } else {
                    tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 10em;"><a href="help.html">帮助</a></li>';
                }

                if (this.userInfo) {
                    tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 2em;">                \
                                                                                                        \
                        <a href="javascript:;"><img src="'+this.userInfo.avatar_url+'" class="layui-nav-img"></a>                  \
                        <dl class="layui-nav-child" style="left:auto; right:0; text-align:center;">                                                    \
                            <dd><a href="'+this.userInfo.html_url+'">'+this.userInfo.login+'</a></dd>                                    \
                            <dd><a href="javascript:window.localStorage.removeItem(\'GT_ACCESS_TOKEN\');window.location.reload();">退出</a></dd>                                    \
                        </dl>                                                                           \
                    </li>'
                } else {
                    tabs += '<li class="layui-nav-item layui-layout-right" style="position: relative; margin-right: 2em;">                \
                        <a href="'+this.getLoginLink()+'">                                                                                \
                            <img src="layui/images/github.svg" class="layui-nav-img">登录</a>                                                      \
                    </li>'
                }

                node.innerHTML = '<div class="layui-header">                                                                                                                        \
                    <ul class="layui-nav" lay-filter="">                                                                                                                            \
                        <a class="logo" href="">                                                                                                                                    \
                            <img src="F:/iTechX/iTechX/image/iTechX.png" height="30px" style="position: relative; bottom: -15px; float: left; margin-right: 2%;" alt="iTechX">      \
                        </a>                                                                                                                                                        \
                        ' + tabs + ' \
                    </ul>                                                                                                                                                           \
                </div>';
                element.render('nav');
            },

            render: function(container){
                this.prerender(container);
                this.construct(container);
            }
        }

        return ajaxComponent;
    })();
    exports('ajax', ajax);
});


