
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
var com3 = 'cat ~/.gitignore_global'
osRunCb(com3,
  function(ret_ary){
      $('#gitconf').append( sRed(com3) + '<br/>' + replaceTabSpc(ret_ary.join('<br/>')) + '<br/>' )
  })

var com2 = 'git config --global --list'
osRunCb( com2 ,
  function(ret_ary){
    for (var ind in ret_ary ){
        //userとemail表示
        if (ret_ary[ind].match(/(name|email)/)) $('#g_user').append(ret_ary[ind].replace(/.*=/,'') + ' &nbsp; ')
        //色をつける
        ret_ary[ind] = ret_ary[ind].replace(/(.*)(=)(.*)/, sGrayBlue('$1') + '$2' + sGrayRed('$3'))
    }
    $('#gitconf').append( sRed(com2) + '<br/>' + ret_ary.join('<br/>') + '<br/>' )
  })

findLocalRepos('cache')

// ipc関連初期化
const {ipcRenderer} = require('electron')
toggleDevTools = function(){  ipcRenderer.send('ipcDevTool', 'ping')   }
toggleFullScreen = function(){  ipcRenderer.send('ipcFullScreen', 'ping')   }


//保存ファイル読み込み
if (!fs.existsSync('userdata')) fs.mkdir('userdata')

_G.his_repo = loadJson(_G.save_path　+ '/his_select_repo.txt')
if (!_G.his_repo) _G.his_repo = {}
showHisRepo()


document.onkeydown = function(e){
  console.log('metakyu kyu : ',e.metaKey,e.key)

  if (e.metaKey && e.key == "1") {
      filterLocalRepos('')
      toggleTopPanes('local_repo_pane',"toggle")
  }
  if (e.metaKey && e.key == "2") {  // branches
    showBranchList('replace','list')
    toggleRepoDescPanes('local_branch','toggle')
  }
  if (e.metaKey && e.key == "3") {  // status
      makePaneStatus('replace')
  }

  if (e.metaKey && e.key == "4") {  // files
      makePaneFilelist('');
      openPaneCenter('pane_filelist');
  }
  if (e.metaKey && e.key == "5") {  // commits
      makePaneLog('')
  }
  if (e.metaKey && e.key == "6") {  // users
      makePaneUser('')
      openPaneCenter('pane_user')
  }
  if (e.metaKey && e.key == "7") {  // command
      openPaneCenter('pane_gitcommand')
      $('#git_usercommand').focus()
  }

  if (e.metaKey && e.key == "9") toggleFullScreen();
  if (e.metaKey && e.key == "d") toggleDevTools();

  //open edit
  if (e.metaKey && e.key == "e") {
      $('#repo_edit_pane').slideToggle(10)
      $('#btn_open_sublime3').focus()
  }
  if (e.metaKey && e.key == "o") {
      $('#repo_edit_pane').slideToggle(10);
      $('#btn_open_sublime3').focus()
  }
}



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
