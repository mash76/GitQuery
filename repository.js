
//init 画面表示  レコメンドパスを指定 現在多くリポジトリのあるパスを優先
showGitInit = function(){
    if ($('#gitinit_pane').css('display') == 'block'){
        $('#gitinit_pane').slideUp(10)
    }else{
        $('#gitinit_pane').slideDown(10)

        var reco_paths = []
        for (var ind in local_repos){
            var path = path2dir(local_repos[ind]).replace(/(.*)(\/.*?)$/,'$1')
            if (!reco_paths[path]) {
              reco_paths[path] =1
            }else{
              reco_paths[path]++
            }
        }
        $('#init_recommend_path').html('')
        for (var ind in reco_paths){
            $('#init_recommend_path').append('<a onClick="$(\'#init_path\').val($(this).text())" href="javascript:void(0);">' + ind + '</a> ' + reco_paths[ind] + '<br/>')
        }
    }
}

gitInit = function(){
  osRunOut('git init ' + $('#init_path').val(),'init_result')
  console.log('inited')
  findLocalRepos(true)
}




showGitClone = function(){
    if ($('#gitclone_pane').css('display') == 'block'){
        $('#gitclone_pane').slideUp(10)
    }else{
        $('#gitclone_pane').slideDown(10)

        var reco_paths = []
        for (var ind in local_repos){
            var path = path2dir(local_repos[ind]).replace(/(.*)(\/.*?)$/,'$1')
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
}

showGitmodules = function(){
  var git_command = 'cat ' + path2dir( current_repo_path ) + '/.gitmodules'
  osRunCb(git_command,
    function(ret_ary){
      $('#repo_out').html(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>')
      $('#repo_out').append(ret_ary.join('<br/>'))

      togglePaneCurrentRepoDesc('gitmodule')
  })
}

showRemoteBranches = function(){
    //osRunOut('git branch -r','repo_out');
    osRunCb('git branch -r',
        function(ret_ary){

          var dirs = []
          for ( var ind in ret_ary){
              if (ret_ary[ind].match(/\//)){
                var path = ret_ary[ind].replace(/(.*?)(\/.*)/,'$1')
                console.log(path)
              }
          }

          $('#repo_out').html(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>')

          $('#repo_out').append(ret_ary.join('<br/>'))
        }
    );
}

showStashList = function(){
  var com = 'git stash list'
  osRunCb(com,function(ret_ary){

      $('#repo_out').html( sRed(com) + " " + sGray(ret_ary.length) + '<br/>' )
      $('#repo_out').append( replaceTabSpc(ret_ary.join('<br/>')) + '<br/>' )
      $('#stash_count').html(ret_ary.length)
  });
}

showIgnore = function(){
  $('#repo_out').html('')

  var git_command = 'cat .gitignore'
  osRunCb(git_command,
      function(ret_ary){
          $('#repo_out').append(s150(sBold('ignore setting<br/>')) + sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>' +
                               ret_ary.join('<br/>') + '<br/><br/>')
  })
  var com2 = "git status --ignored -s | grep '!!'"
  osRunCb(com2,
      function(ret_ary){
          $('#repo_out').append(s150(sBold('ignored files<br/>')) + sRed(com2) + " " + sGray(ret_ary.length) + '<br/>' +
                               ret_ary.join('<br/>'))
          togglePaneCurrentRepoDesc('ignore')
  })
}

showBranchList = function() {
    var git_command = 'git branch'
    osRunCb(git_command,function(ret_ary){
          $('#repo_out').html(sRed(git_command) + " " + sGray(ret_ary.length) + '<br/>' )
          for (var ind in ret_ary ){
              var v1 = ret_ary[ind].trim()
              $('#repo_out').append('<span onclick="checkOut(\'' + v1 + '\')" class="btn">' + v1 +'</span><br/>')
          }
          togglePaneCurrentRepoDesc('branch')
    })
}

toggleRepoList = function (action){  //action == up down

  if (action == "up" || $('#local_repo_pane').css('display') == 'block' ){
      console.log("toggle repo list")
      $('#local_repo_pane').slideUp(10)
  }else{
      $('#local_repo_pane').slideDown(10)
      $('#filter_l_repo').val('')
      filterLocalRepos('')
      $('#filter_l_repo').focus()
  }
}

//個別のペーンを出す方式に
togglePaneCurrentRepoDesc = function (key){
  //初回なら閉じる
  if (key == "") {
      $('#repo_out').slideUp(10)
      return
  }
  //開いてる項目を押したら閉じる
  if (repo_btn_prev_push == key && $('#repo_out').css('display') == 'block' ){
      $('#repo_out').slideUp(10)
  }else{
      $('#repo_out').slideDown(10)
  }
  repo_btn_prev_push=key
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
    var com = "git checkout '" + branch_name+ "'"
    osRunOut(com,'repo_out' )
}

// is_refresh 強制再読み込みフラグ
findLocalRepos = function(is_refresh){ // search
  //保存ファイルがなければ取得
  file_fullpath = save_path　+ '/local_repos.txt'
  console.log('is_refresh',is_refresh)
  if (fs.existsSync(file_fullpath) && is_refresh != true ){
    console.log('local_repos.txt')
    var text = fs.readFileSync(file_fullpath, 'utf-8');
    local_repos = JSON.parse(text)
    toggleRepoList("down")
    filterLocalRepos('')

  }else{
    console.log('find')
    osRunCb("find ~ -type d -maxdepth 5 | egrep '/\.git$' ",
      function( ret_ary ){
          local_repos = ret_ary

          fs.writeFile(file_fullpath, JSON.stringify(ret_ary), function (error) {
               if (error != null) {
                  alert('error : ' + error);
                  return;
               }
            });
          toggleRepoList("down")
          filterLocalRepos('')
      }
    )
  }
}



delGit = function(path){
    var com = 'rm -rf ' + path
    //console.log(com);
    osRunOut( com ,'repo_out')
    findLocalRepos(true)

}
delDir = function(path){
    var com = 'rm -rf ' + path2dir(path)
    //console.log(com);
    osRunOut( com ,'repo_out')
    findLocalRepos(true)
}

//ローカルリポジトリ一覧を表示
filterLocalRepos = function (filter){

  $('#local_repo_list').html("<table>");
  top_filtered_repo =""
  for (var ind in local_repos){
      var full_path = local_repos[ind]
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
                                '<span onClick="delGit(local_repos[' + ind + '])" class="btn">delGit</span> </td><td>' +
                                '<span onClick="delDir(local_repos[' + ind + '])" class="btn">delDir</span> </td><td>' +
                                '</td></tr>')
  }
  $('#local_repo_list').append("</table>");

}

openPaneCenter = function( pane_name ){
  $('div[pane=center]').hide()
  $('#' + pane_name).slideDown(10)
}

// set local repository
setRepoPath = function(full_path) {
    console.log(full_path)

    current_repo_path = full_path
    execOption.cwd = path2dir(current_repo_path)

    $('#current_repo_name').html( path2pjname(full_path) )
    $('#current_repo_path').html( full_path )
    $('#local_repo_pane').slideUp(10)

    his_repo[current_repo_path] = "";
    $('#his_repo').html("")
    for (var name in his_repo){
      $('#his_repo').append('<span onClick="setRepoPath(\'' + name + '\');" class="history s80">' + path2pjname(name) + '</span> ');
    }

    showStashList();

    setCurrentBranchName()
    togglePaneCurrentRepoDesc("") // close

    //repository basic info
    osRunOneLine('git submodule status | wc -l', 'submodule_count')
    osRunOneLine('du -d0 -h', 'current_repo_size')
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

    //ファイル一覧
    // osRunCb('ls ' + full_path ,
    //   function(ret_ary){
    //       $('#c_repo_pane').html("")
    //       for (var ind in ret_ary){
    //           file_disp = ret_ary[ind]
    //           var stat = fs.statSync(full_path + '/' + file_disp )
    //           if (stat.isDirectory()) file_disp = sBlue(file_disp)
    //           $('#c_repo_pane').append(file_disp + '<br/>')
    //
    //           if (stat.isFile()) {
    //               var ret = fs.readFileSync (full_path + '/' + file_disp)
    //               ret = ret.toString().substring(0,500).replace(/\n/g,'<br/>')
    //               $('#c_repo_pane').append('<div name="file_detail" class="m10 hide">' + s60(sSilver(ret)) + '</div>')
    //           }
    //       }
    //   }
    // )
    $('#repo_info').show() // 初回のrepo選択時は隠しているので
}
