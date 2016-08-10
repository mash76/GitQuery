
//初期処理
osRunOneLine('git version', 'version')
osRunOneLine('node -v', 'node_version')

// nodejs情報など  上の左
var git_command1 = 'node -v'
osRunCb(git_command1, function(ret_ary){
  $('#nodejs_info').append(sRed(git_command1) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})
var git_command2 = 'npm -g list'
osRunCb( git_command2, function(ret_ary){
  $('#nodejs_info').append(sRed(git_command2) + '<br/>' + ret_ary.join('<br/>') + '<br/>')
})
osRunCb('npm -g list', 'nodejs_info')

//上の右
var com2 = 'git config --global --list'
osRunCb( com2 ,
  function(ret_ary){
    for (var ind in ret_ary ){
        if (ret_ary[ind].match(/(name|email)/)) $('#g_user').append(ret_ary[ind].replace(/.*=/,'') + ' &nbsp; ')
    }
    $('#gitconf').append( sRed(com2) + '<br/>' + replaceTabSpc(ret_ary.join('<br/>')) + '<br/>' )
  })

var com3 = 'cat ~/.gitignore_global'
osRunCb(com3,
  function(ret_ary){
      $('#gitconf').append( sRed(com3) + '<br/>' + replaceTabSpc(ret_ary.join('<br/>')) + '<br/>' )
  })

findLocalRepos()

// ipc関連初期化
const {ipcRenderer} = require('electron')
toggleDevTools = function(){  ipcRenderer.send('ipcDevTool', 'ping')   }
toggleFullScreen = function(){  ipcRenderer.send('ipcFullScreen', 'ping')   }


if (!fs.existsSync('userdata')) fs.mkdir('userdata')


//enterなら候補1に確定、それ以外ならキー押すごとに検索
$('#filter_l_repo').keyup(function(e){
    if (e.which == 13 && top_filtered_repo) {
      setRepoPath( top_filtered_repo )
      return ;
    }
    filterLocalRepos($('#filter_l_repo').val())
})

$('#filter_filelist').keyup(function(e){
    if (e.which == 13) makePaneFilelist( $('#filter_filelist').val() )
})
$('#filter_log').keyup(function(e){
    if (e.which == 13) makePaneLog( $('#filter_log').val() )
})
$('#filter_user').keyup(function(e){
    if (e.which == 13) makePaneUser( $('#filter_user').val() )
})
