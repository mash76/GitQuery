
//init 画面表示  レコメンドパスを指定 現在多くリポジトリのあるパスを優先
showGitInit = function(){
    toggleTopPanes('gitinit_pane',"toggle")

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

  osRunOut('git init ' + $('#init_path').val(),'init_result','replace')
  console.log('inited')
  findLocalRepos('refresh')
}

showGitClone = function(){
    toggleTopPanes('gitclone_pane',"toggle")

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

      if (ret_ary.length == 0){
        $('#submodule_btncolor').attr('class','silver')
      }else{
        $('#submodule_btncolor').attr('class','btn')
      }

      $('#submodule_count').html(ret_ary.length)
      $('#submodule_details').append(sRed(git_com2) + " " + sGray(ret_ary.length) + '<br/>')
      $('#submodule_details').append(replaceTabSpc(ret_ary.join('<br/>')) + '<br/><br/>')
  })
}

showStashList = function(){
  var com = 'git stash list'
  osRunCb(com,function(ret_ary){

      $('#pane_stash_list').html( sRed(com) + " " + sGray(ret_ary.length) )
      for (var ind in ret_ary){
        var hash = ret_ary[ind].match(/.*?}/)[0]
        ret_ary[ind] = ret_ary[ind].replace(hash,
                  '<a href="javascript:void(0);" onClick="showStashDetail(\'' + hash + '\')">' + hash + '</a> ' ) + 
                  '<a href="javascript:void(0);" onClick="gitStashDrop(\'' + hash + '\'); showStashList()">drop</a> ' + 
                  '<a href="javascript:void(0);" onClick="gitStashApply(\'' + hash + '\'); showStashList()">apply</a> '     

      }



      if (ret_ary.length == 0){
        $('#stash_btncolor').attr('class','silver')
      }else{
        $('#stash_btncolor').attr('class','btn')
      }

      $('#pane_stash_list').append( '<pre class="code">' + ret_ary.join('\n') + '</pre>' )
      $('#stash_count').html(ret_ary.length)
  })
}
showStashDetail = function(hash){

  $('#pane_stash_detail').html('')

  var com = 'git diff --name-only HEAD...' + hash
  osRunCb(com,function(ret_ary){

      $('#pane_stash_detail').append( sRed(com) + " " + sGray(ret_ary.length) )
      ret_ary = diffColor(ret_ary)
      $('#pane_stash_detail').append( '<pre class="code">' + ret_ary.join('\n') + '</pre>' )

      var com2 = 'git diff HEAD...' + hash
      osRunCb(com2,function(ret_ary){

          $('#pane_stash_detail').append( sRed(com2) + " " + sGray(ret_ary.length) )
          ret_ary = diffColor(ret_ary)
          $('#pane_stash_detail').append( '<pre class="code">' + ret_ary.join('\n') + '</pre>' )
      })
  })
}
gitStashDrop = function(hash){
    osRunOut("git stash drop " + hash , 'pane_stash_detail' , 'replace' )
}
gitStashApply = function(hash){
    osRunOut("git stash apply " + hash , 'pane_stash_detail' , 'replace' )
}

showRemoteBranches = function(){

    var git_command = 'git branch -r'
    osRunCb(git_command,
        function(ret_ary){

          var dirs = []
          for ( var ind in ret_ary){
              if (ret_ary[ind].match(/\//)){
                var path = ret_ary[ind].replace(/(.*?)(\/.*)/,'$1')
                console.log(path)
              }
          }

          $('#pane_re_branch').html(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>')
          $('#pane_re_branch').append(ret_ary.join('<br/>'))
          $('#remote_branch_ct').html(ret_ary.length)

        }
    )
}




showIgnore = function(){
  $('#pane_ignore_detail').html('')

  var git_command = 'cat .gitignore'
  osRunCb(git_command,
      function(ret_ary){
          $('#pane_ignore_detail').append(s150(sBold('ignore setting<br/>')) + sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>' +
                               ret_ary.join('<br/>') + '<br/><br/>')


            var com2 = "git status --ignored -s | grep '!!'"
            osRunCb(com2,
                function(ret_ary2){
                    $('#pane_ignore_detail').append(s150(sBold('ignored files<br/>')) + sRed(com2) + " " + sGray(ret_ary2.length) + '<br/>' +
                                         ret_ary2.join('<br/>'))
                    
            })
  })

}

updateIgnore = function(text){
  saveText( path2dir(_G.current_repo_path) + '/.gitignore' , text)
  showIgnore()
  toggleRepoDescPanes('pane_ignore','down')
}

repoDiskSize = function(){
    osRunOut('du -d1 -h ','pane_reposize','replace',
        function(){
            osRunOut('du -d1 -h .git/modules  # submodule repository size','pane_reposize','append')
        });
}

delLocalBranch = function(branchname){
  osRunOut('git branch -d ' + branchname , 'local_branch_details' , 'replace')
  showBranchList('append','list')


}

showBranchList = function(action,treeOrList) {

  if (!action.match(/(append|replace)/)) alert('showBranchList action:' + action)
  if (action == 'replace') $('#local_branch_details' ).html('')

  if (!treeOrList.match(/(tree|list)/)) alert('showBranchList treeOrList:' + treeOrList)

  var git_command = 'git branch'
  if (treeOrList == 'tree') git_command = 'git show-branch'

  osRunCb(git_command,function(ret_ary){
        $('#local_branch_details').append(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>' )

        if (treeOrList == 'list') {
            for (var ind in ret_ary ){
                var v1 = ret_ary[ind].trim()
                $('#local_branch_details').append(
                  '<span onclick="checkOut(\'' + v1 + '\')" class="btn">' +
                  v1 +'</span> <span onClick="delLocalBranch(\'' + v1 + '\')" class="btn" >del</span><br/>')
            }
        }else{
            $('#local_branch_details').append('<pre class="code">' + ret_ary.join("\n") + '</pre>')
        }
  })
  osRunOneLine('git branch | wc -l','local_branch_ct')
}

// fuc名直す top pane郡のトグル
toggleTopPanes = function (key,action){  //action == up down toggle

  if (!action.match(/up|down|toggle/)) alert('toggleTopPanes action invalid' + action)

  if (action == "toggle" ){
    action = "down"
    if ($('#' + key).css('display') == 'block' ) action = "up"
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
toggleRepoDescPanes = function (key,action){

  if (!action.match(/up|down|toggle/)) alert('toggleRepoDescPanes action invalid' + action)

  if (action == "toggle" ){
    action = "down"
    if ($('#' + key).css('display') == 'block' ) action = "up"
  }
  $('div[pane=repo]').slideUp(10)

  //開いてる項目を押したら閉じる
  if (action == "up" ) $('#' + key).slideUp(10)
  else                 $('#' + key).slideDown(10)

  repo_prev_push=key
}

togglePaneStatus = function(key,action){

  if (!action.match(/up|down|toggle/)) alert('togglePaneStatus action invalid' + action)

  if (action == "toggle" ){
    action = "down"
    if ($('#' + key).css('display') == 'block' ) action = "up"
  }
  $('div[pane=status]').slideUp(10)

  //開いてる項目を押したら閉じる
  if (action == "up" ) $('#' + key).slideUp(10)
  else                 $('#' + key).slideDown(10)

}


openPaneCenter = function( pane_name ){
  $('div[pane=center]').hide()
  $('#' + pane_name).slideDown(10)
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
    $('#debug_out').html('')
    var com = "git checkout '" + branch_name + "'"
    osRunOut(com,'debug_out','append',
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
  console.log('is_refresh',is_refresh)
  _G.local_repos = loadJson(file_fullpath)

  if (_G.local_repos && is_refresh == 'cache' ){
    console.log('get from file local repos ',file_fullpath,_G.local_repos)
    $('#repo_count').html(_G.local_repos.length)
    toggleTopPanes('local_repo_pane',"down")
    filterLocalRepos('')
  }else{
    console.log('find')
    osRunCb("find ~ -type d -maxdepth 5 | egrep '/\.git$' ",
      function( ret_ary ){
          _G.local_repos = ret_ary
          $('#repo_count').html(_G.local_repos.length)
          saveJson(file_fullpath,_G.local_repos)
          toggleTopPanes('local_repo_pane',"down")
          filterLocalRepos('')
      }
    )
  }
}

delGit = function(path,checkword){

    console.log('del .Git',path2pjname(path),checkword)

    if (path2pjname(path) != checkword) {
        $('#pane_delete_detail').html(sRed('invalid reponame'))
        return
    }

    var com = 'rm -rf ' + path
    osRunOut( com ,'pane_delete_detail','replace')
    findLocalRepos('refresh')
}
delDir = function(path,checkword){

    console.log('delDir',path2pjname(path),checkword)

    if (path2pjname(path) != checkword) {
        $('#pane_delete_detail').html(sRed('invalid reponame'))
        return
    }

    var com = 'rm -rf ' + path2dir(path)
    osRunOut( com ,'pane_delete_detail','replace')
    findLocalRepos('refresh')
}
reInitDir = function(path,checkword){

    console.log('del .Git',path2pjname(path),checkword)

    if (path2pjname(path) != checkword) {
        $('#pane_delete_detail').html(sRed('invalid reponame'))
        return
    }

    var com = 'rm -rf ' + path
    osRunOut( com ,'pane_delete_detail','replace',
      function(){
          var com2 = 'git init ' + path2dir(path)
          osRunOut( com2 ,'pane_delete_detail','append')
      }
    )
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

          console.log('enterでセット' ,top_filtered_repo)
      }

      var fullpath_disp = sGray(full_path.replace(fname,sGray2(fname)).replace('.Trash',sCrimson('.Trash')))

      $('#local_repo_list').append('<tr><td> <a href="javascript:void(0)" onClick="setRepoPath(\'' + full_path + '\')" class="btn s150">' +
                                fname_disp + '</span> </td><td> ' +
                                ' &nbsp; ' + fullpath_disp + '</td><td>' +
                                '</td></tr>')
  }
  $('#local_repo_list').append("</table>");
}


showHisRepo = function(){

  $('#his_repo').html("")
  for (var name in _G.his_repo){
    $('#his_repo').append('<span onClick="setRepoPath(\'' + name + '\');" class="history s80">' + path2pjname(name) + '</span> ');
  }

}

gitRemoteRm = function (repo_name){
  console.log('gitRemoteRm ' + repo_name)
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

    console.log("showRemoteRepos")
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

          if (ret_ary.length == 0){
            $('div[id^=remote_btncolor]').attr('class','silver')
          }else{
            $('div[id^=remote_btncolor]').attr('class','btn')
          }

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
    console.log(full_path)

    //現在dirセット
    _G.current_repo_path = full_path
    execOption.cwd = path2dir(_G.current_repo_path)

    $('#current_repo_name').html( path2pjname(full_path) )
    $('#current_repo_path').html( full_path )
    $('#local_repo_pane').slideUp(10)

    //履歴
    _G.his_repo[_G.current_repo_path] = "";
    saveJson(_G.save_path　+ '/his_select_repo.txt' , _G.his_repo)
    showHisRepo()

    showStashList()

    //ブランチ
    setCurrentBranchName()
    toggleRepoDescPanes("local_branch",'up') // close

    showRemoteRepos('replace')
    showRemoteBranches()


    //gitignore edit
    console.log('ignorepath' , path2dir(full_path) + '/.gitignore' )
    var ignore_text = loadText( path2dir(full_path) + '/.gitignore' )
    $('#ignore_edit').val(ignore_text)
    console.log('ignoretext', ignore_text)


    //repository basic info
    //osRunOneLine('git submodule status | wc -l', 'submodule_count')
    showGitmodules('replace') //submodule表示を初期化

    osRunOneLine("du -d0 -h | perl -pne 's/(\\t.*)//' " , 'current_repo_size') //ディスク使用量 タブ以降の . を削除
    osRunOneLine('git ls-files | wc -l', 'br_files_ct') //ファイル数
    osRunOneLine('git log --oneline | wc -l', 'br_commit_ct')

    osRunOneLine('git log --date=relative --pretty=format:"%ad" | head -1', 'latest_commit')
    osRunOneLine('git log --pretty=format:"%an" | sort | uniq | wc -l', 'br_member_ct')

    // local branch & remote branch
    showBranchList('replace','list')
    makePaneLog('')

    showDotGit()
    $('#repo_info').show() // 初回のrepo選択時は隠しているので
}
