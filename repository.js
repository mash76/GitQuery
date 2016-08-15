
//init 画面表示  レコメンドパスを指定 現在多くリポジトリのあるパスを優先
showGitInit = function(){
    toggleRepoList('gitinit_pane',"toggle")

    // 複数リポジトリのあるフォルダは その人の作業フォルダであろう
    var reco_paths = []
    for (var ind in _G.local_repos){
        var path = path2dir(_G.local_repos[ind]).replace(/(.*)(\/.*?)$/,'$1')
        if (!reco_paths[path]) {
          reco_paths[path] =1
        }else{
          reco_paths[path]++
        }
    }
    $('#init_recommend_path').html('')
    for (var ind in reco_paths){
        $('#init_recommend_path').append(
          '<a onClick="$(\'#init_path\').val($(this).text())" href="javascript:void(0);">' +
          ind + '</a> ' + reco_paths[ind] + '<br/>')
    }
}

showConfig = function(){
    var command = 'cat ' + _G.current_repo_path + '/config'
    osRunCb(command,
      function(ret_ary){

          for (var ind in ret_ary){
              ret_ary[ind] = ret_ary[ind].replace(/(.*)(=)(.*)/, sGrayBlue('$1') + '$2' + sGrayRed('$3'))
          }
          $('#pane_config').html(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) + '<br/>')
          $('#pane_config').append('<pre class="code m0">' + ret_ary.join('<br/>') + '</pre>')
      }
    )
}

gitInit = function(){
  osRunOut('git init ' + $('#init_path').val(),'init_result')
  clog('inited')
  findLocalRepos('refresh')
}

showGitClone = function(){
    toggleRepoList('gitclone_pane',"toggle")

    var reco_paths = []
    for (var ind in _G.local_repos){
        var path = path2dir(_G.local_repos[ind]).replace(/(.*)(\/.*?)$/,'$1')
        if (!reco_paths[path]) {
          reco_paths[path] = 1
        }else{
          reco_paths[path]++
        }
    }
    $('#clone_recommend_path').html('')
    for (var ind in reco_paths){
        $('#clone_recommend_path').append('<a onClick="$(\'#clone_dir\').val($(this).text())" href="javascript:void(0);">' + ind + '</a> ' + reco_paths[ind] + '<br/>')
    }
}

gitSubmoduleAdd = function(){

  var com = "git submodule add '" + $('#submodule_url').val() + "' '" + $('#submodule_name').val() + "'"
  osRunCb(com,
    function(ret_ary,stderr){
      $('#submodule_details').html('')
      $('#submodule_details').append(sRed(com) + " " + sGray(ret_ary.length) + '<br/>')
      $('#submodule_details').append(replaceTabSpc(ret_ary.join('<br/>')) )
      $('#submodule_details').append(replaceTabSpc(stderr.replace(/\n/,'<br/>')) +'<br/>')
      showGitmodules('append')
  })

}

showGitmodules = function(action){ // append replace

  if (!action.match(/(append|replace)/)) alert('showGitmodules action:' + action)
  if (action == 'replace') $('#submodule_details' ).html('')


  var git_command = 'cat ' + path2dir( _G.current_repo_path ) + '/.gitmodules'
  osRunCb(git_command,
    function(ret_ary,stderr){
      for (var ind in ret_ary){
          ret_ary[ind] = ret_ary[ind].replace(/(.*)(=)(.*)/, sGrayBlue('$1') + '$2' + sGrayRed('$3'))
      }

      $('#submodule_details').append(sRed(git_command) + " " + sGray(ret_ary.length))
      $('#submodule_details').append('<pre class="code">' + ret_ary.join('<br/>') + '</pre>')
  })

  var git_com2 = 'git submodule status'
  osRunCb(git_com2,
    function(ret_ary,stderr){
      $('#submodule_details').append(sRed(git_com2) + " " + sGray(ret_ary.length) + '<br/>')
      $('#submodule_details').append(replaceTabSpc(ret_ary.join('<br/>')) + '<br/><br/>')
  })
  //togglePaneCurrentRepoDesc('pane_submodule','down')
}

showRemoteBranches = function(){

    //osRunOut('git branch -r','repo_out');
    osRunCb('git branch -r',
        function(ret_ary){

          var dirs = []
          for ( var ind in ret_ary){
              if (ret_ary[ind].match(/\//)){
                var path = ret_ary[ind].replace(/(.*?)(\/.*)/,'$1')
                clog(path)
              }
          }
          $('#pane_re_branch').html(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>')
          $('#pane_re_branch').append(ret_ary.join('<br/>'))
        }
    )
}

showStashList = function(){
  var com = 'git stash list'
  osRunCb(com,function(ret_ary){

      $('#pane_stash').html( sRed(com) + " " + sGray(ret_ary.length) + '<br/>' )
      $('#pane_stash').append( replaceTabSpc(ret_ary.join('<br/>')) + '<br/>' )
      $('#stash_count').html(ret_ary.length)
  })
}

showIgnore = function(){
  $('#pane_ignore').html('')

  var git_command = 'cat .gitignore'
  osRunCb(git_command,
      function(ret_ary){
          $('#pane_ignore').append(s150(sBold('ignore setting<br/>')) + sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>' +
                               ret_ary.join('<br/>') + '<br/><br/>')
  })
  var com2 = "git status --ignored -s | grep '!!'"
  osRunCb(com2,
      function(ret_ary){
          $('#pane_ignore').append(s150(sBold('ignored files<br/>')) + sRed(com2) + " " + sGray(ret_ary.length) + '<br/>' +
                               ret_ary.join('<br/>'))
          togglePaneCurrentRepoDesc('pane_ignore','toggle')
  })
}

showBranchList = function(action) {

  if (!action.match(/(append|replace)/)) alert('showBranchList action:' + action)
  if (action == 'replace') $('#local_branch_details' ).html('')

    var git_command = 'git branch'
    osRunCb(git_command,function(ret_ary){
          $('#local_branch_details').append(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>' )
          for (var ind in ret_ary ){
              var v1 = ret_ary[ind].trim()
              $('#local_branch_details').append(
                '<span onclick="checkOut(\'' + v1 + '\')" class="btn">' +
                v1 +'</span><br/>')
          }
          var act = 'toggle'
          if (action == 'append') act = 'down'

          togglePaneCurrentRepoDesc('local_branch',act)

    })
}

toggleRepoList = function (key,action){  //action == up down toggle

  if (!action.match(/up|down|toggle/)) alert('toggleRepoList action invalid' + action)

  if (action == "toggle" ){
    if ($('#' + key).css('display') == 'block' ){
      action = "up"
    }else{
      action = "down"
    }
  }

  $('div[pane=top]').slideUp(10)

  if (action == "up" ){
      $('#' + key).slideUp(10)
  }else{
      $('#' + key).slideDown(10)
      $('#filter_l_repo').val('')
      filterLocalRepos('')
      $('#filter_l_repo').focus()
  }
}

//個別のペーンを出す方式に
togglePaneCurrentRepoDesc = function (key,action){

  if (!action.match(/up|down|toggle/)) alert('togglePaneCurrentRepoDesc action invalid' + action)

  if (action == "toggle" ){
    if ($('#' + key).css('display') == 'block' ){
      action = "up"
    }else{
      action = "down"
    }
  }
  $('div[pane=repo]').slideUp(10)

  //開いてる項目を押したら閉じる
  if (action == "up" ){
      $('#' + key).slideUp(10)
  }else{
      $('#' + key).slideDown(10)
  }
  repo_prev_push=key
}

setCurrentBranchName = function(){
    osRunCb('git branch',function(ret_ary){
        for (var ind in ret_ary){
            if (ret_ary[ind].match(/\*/)){
                $('#c_branch').html(ret_ary[ind].replace("*","").trim())
            }
        }
    })
}

checkOut = function ( branch_name ){
    $('#repo_out').html('')
    var com = "git checkout '" + branch_name + "'"
    osRunOut(com,'repo_out','append',
      function(){
          setRepoPath(_G.current_repo_path)
      }
   )
}

// is_refresh 強制再読み込みフラグ
findLocalRepos = function(is_refresh){ // search

  if (is_refresh == undefined || !is_refresh.match(/(refresh|cache)/)) alert('findLocalRepos isRefresh:' + is_refresh);

  //保存ファイルがなければ取得
  var file_fullpath = _G.save_path　+ '/local_repos.txt'
  clog('is_refresh',is_refresh)
  _G.local_repos = loadJson(file_fullpath)

  if (_G.local_repos && is_refresh == 'cache' ){
    clog('get from file local repos ',file_fullpath,_G.local_repos)
    $('#repo_count').html(_G.local_repos.length)
    toggleRepoList('local_repo_pane',"down")
    filterLocalRepos('')
  }else{
    clog('find')
    osRunCb("find ~ -type d -maxdepth 5 | egrep '/\.git$' ",
      function( ret_ary ){
          _G.local_repos = ret_ary
          $('#repo_count').html(_G.local_repos.length)
          saveJson(file_fullpath,_G.local_repos)
          toggleRepoList('local_repo_pane',"down")
          filterLocalRepos('')
      }
    )
  }
}

delGit = function(path){
    var com = 'rm -rf ' + path
    osRunOut( com ,'repo_out')
    findLocalRepos('refresh')
}
delDir = function(path){
    var com = 'rm -rf ' + path2dir(path)
    osRunOut( com ,'repo_out')
    findLocalRepos('refresh')
}

//ローカルリポジトリ一覧を表示
filterLocalRepos = function (filter){

  $('#local_repo_list').html("<table>");
  top_filtered_repo =""
  for (var ind in _G.local_repos){
      var full_path = _G.local_repos[ind]
      fname = path2pjname(full_path)
      fname_disp = fname

      if (filter) {
          var re = new RegExp('('+filter+')','i')
          if (!fname.match(re)) continue;

          if (!top_filtered_repo) top_filtered_repo = full_path
          fname_disp = fname_disp.replace(re,sRed('$1'))
      }
      $('#local_repo_list').prepend('<tr><td> <a href="javascript:void(0)" onClick="setRepoPath(\'' + full_path + '\')" class="btn s150">' +
                                fname_disp + '</span> </td><td> ' +
                                ' &nbsp; ' + sGray(full_path.replace(fname,sGray2(fname)) ) + '</td><td>' +
                                '<span onClick="delGit(_G.local_repos[' + ind + '])" class="btn">delGit</span> </td><td>' +
                                '<span onClick="delDir(_G.local_repos[' + ind + '])" class="btn">delDir</span> </td><td>' +
                                '</td></tr>')
  }
  $('#local_repo_list').append("</table>");

}

openPaneCenter = function( pane_name ){
  $('div[pane=center]').hide()
  $('#' + pane_name).slideDown(10)
}

showHisRepo = function(){

  $('#his_repo').html("")
  for (var name in _G.his_repo){
    $('#his_repo').append('<span onClick="setRepoPath(\'' + name + '\');" class="history s80">' + path2pjname(name) + '</span> ');
  }

}

gitRemoteRm = function (repo_name){
  clog('gitRemoteRm ' + repo_name)
  command = "git remote rm '" + repo_name + "'"
  osRunCb(command,
  function(ret_ary){
      $('#pane_remote_detail' ).html(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) + '<br/>')
      $('#pane_remote_detail' ).append( ret_ary.join('<br/>'))
      showRemoteRepos('append')
  })
}

gitRemoteAdd = function(){
    command = "git remote add '" + $('#remote_name').val() + "' '" + $('#remote_url').val() + "'"
    osRunCb(command,
    function(ret_ary){
        $('#pane_remote_detail' ).html(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) + '<br/>')
        $('#pane_remote_detail' ).append( ret_ary.join('<br/>'))
        showRemoteRepos('append')
    })
}

showRemoteRepos = function(action){ // append replace

    if (!action.match(/(append|replace)/)) alert('showRemoteRepos action:' + action)
    if (action == 'replace') $('#pane_remote_detail' ).html('')

    clog("showRemoteRepos")
    command = 'git remote -v'
    osRunCb(command,
        function(ret_ary){
          for (var ind in ret_ary){
              ret_ary[ind] = url2link(ret_ary[ind])
              if (ret_ary[ind].match(/fetch/)) {
                  var r_branch = ret_ary[ind].trim().replace(/\s+.*/,'')
                  ret_ary[ind] += '  <span onClick="gitRemoteRm(\'' + r_branch + '\')" class="btn">del</span>'
              }
          }
          $('#pane_remote_detail' ).append( sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) )
          $('#pane_remote_detail' ).append( '<pre class="code m0" >' + ret_ary.join('\n') + '</pre>' )
        }
    )
}

showDotGit = function(){

  //ファイル一覧
  var command = 'ls ' + _G.current_repo_path
  osRunCb( command,
    function(ret_ary){
        $('#dotgitfiles_detail').html("")
        $('#dotgitfiles_detail').append(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) + '<br/>')

        for (var ind in ret_ary){
            file_disp = ret_ary[ind]
            var stat = fs.statSync(_G.current_repo_path + '/' + file_disp )
            if (stat.isDirectory()) file_disp = sBlue(file_disp)
            $('#dotgitfiles_detail').append(file_disp + '<br/>')

            if (stat.isFile()) {
                var ret = fs.readFileSync (_G.current_repo_path + '/' + file_disp)
                ret = ret.toString().substring(0,500).replace(/\n/g,'<br/>')
                $('#dotgitfiles_detail').append('<div name="file_detail" class="m10 hide">' + s60(sSilver(ret)) + '</div>')
            }
        }
    }
  )
}

// set local repository
setRepoPath = function(full_path) {
    clog(full_path)

    _G.current_repo_path = full_path
    execOption.cwd = path2dir(_G.current_repo_path)

    $('#current_repo_name').html( path2pjname(full_path) )
    $('#current_repo_path').html( full_path )
    $('#local_repo_pane').slideUp(10)

    _G.his_repo[_G.current_repo_path] = "";
    saveJson(_G.save_path　+ '/his_select_repo.txt' , _G.his_repo)
    showHisRepo()

    showStashList()

    //ブランチ

    setCurrentBranchName()
    togglePaneCurrentRepoDesc("local_branch",'up') // close

    //remoteなければグレーに
    osRunCb('git remote -v',function(ret_ary){

        if (ret_ary.length　== 0) {
          $('#remote_menu').css('background-color','gray')
        }else{
          $('#remote_menu').css('background-color','white')
        }
    })

    //repository basic info
    osRunOneLine('git submodule status | wc -l', 'submodule_count')
    osRunOneLine("du -d0 -h | perl -pne 's/(\\t.*)//' " , 'current_repo_size') //タブ以降の . を削除
    osRunOneLine('git ls-files | wc -l', 'br_files_ct')
    osRunOneLine('git log --oneline | wc -l', 'br_commit_ct')
    //osRunOneLine('git log --date=relative --pretty=format:"%ad  : %h  : %an : %s" | head -1', 'latest_commit')
    osRunOneLine('git log --date=relative --pretty=format:"%ad" | head -1', 'latest_commit')
    osRunOneLine('git log --pretty=format:"%an" | sort | uniq | wc -l', 'br_member_ct')

    // local branch & remote branch
    osRunCb('git branch',function( ret_ary ){
        $('#local_branch_ct').html(ret_ary.length)
    })
    osRunCb('git branch -r',function( ret_ary ){
        $('#remote_branch_ct').html(ret_ary.length)
    })

    makePaneLog('')

    showDotGit()
    $('#repo_info').show() // 初回のrepo選択時は隠しているので
}
