
    makePaneUser = function(filter){
        var git_command = 'git log --pretty=format:"%an" | sort | uniq -c | sort -r '
        if (filter) git_command += " | egrep -i '" + filter + "'"
        osRunCb(git_command,
          function(ret_ary){
            out_str = sRed(git_command) + " " + ret_ary.length + '<br/>'
            out_str += "<table>"
            for (var ind in ret_ary) {

                var line = ret_ary[ind].trim()
                line_ary = line.match(/(\d+ )(.*$)/)

                class_str =""
                if (ind <= 20) class_str = 'class="s120"'
                if (ind <= 10) class_str = 'class="s150"'

                out_str += '<tr><td ' + class_str + '>' + sSilver((parseInt(ind) + 1 )) + '</td>' +
                              '<td ' + class_str + '><span onClick="makePaneLog(\'' + line_ary[2] + '\')" class="btn">' + matchRed(line_ary[2],filter) + '</span></td>' +
                              '<td ' + class_str + '>' + line_ary[1] + '</td></tr>'
            }
            out_str += '<table>'
            $('#pane_user_detail').html(out_str)
            openPaneCenter('pane_user');
            $('#filter_user').focus()
          }
        )
    }

    makePaneFilelist = function(filter,base_command){

        $('#pane_filelist_detail').html('')
        $('#pane_filelist_detail_r').html('')

        //ファイル検索
        var git_command = 'git ls-files '
        if (base_command) git_command = base_command

        if (filter) git_command += " | egrep -i '" + filter + "'"
        git_command += ' | head -1000'
        osRunCb(git_command,
          function( ret_ary){

              $('#pane_filelist_detail_r').append(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>')
              var str_out =""
              for (var ind in ret_ary){
                  str_out += '<a onClick="fileStat(\'' + ret_ary[ind].trim() + '\')" href="javascript:void(0);" >' + matchRed(ret_ary[ind],filter) + '</a><br/>'
              }
              $('#pane_filelist_detail_r').append(str_out )

              openPaneCenter('pane_filelist');
              $('#filter_filelist').focus()
        })


        //スラッシュのないもの

        //拡張子でまとめ

        //dir 1階層でまとめ
        var com1 = "git ls-files | egrep -i '\/' | perl -ple 's/(.*?\\/)(.*)/$1/' | sort | uniq -c | head -100"
        //com1 = "git ls-files | egrep -i '\/' | sort | uniq -c | head -10"
        console.log(com1)
        var str_out1 = ""
        var str_out2 = ""
        var writeLeftPane = function(){
            if (str_out1 && str_out2) $('#pane_filelist_detail').append(str_out1 + str_out2 )
        }

        osRunCb(com1,
          function( ret_ary){
              console.log('str_out1',ret_ary)
              str_out1 ="<table>"
              for (var ind in ret_ary){
                  var ary = ret_ary[ind].trim().split(/\s+/)
                  str_out1 += '<tr><td> <a onClick="fileStat(\'' + ary[1].trim() + '\')" href="javascript:void(0);" >' + matchRed(ary[1],filter) + '</a> </td><td> ' + ary[0] + ' </td></tr>'
              }
              str_out1 +="</table>"
              writeLeftPane()
          }
        )

        //dir 2階層でまとめ
        var com2 = "git ls-files | egrep -i '\\/.*\\/' | perl -ple 's/(.*?\\/.*?\\/)(.*)/$1/' | sort | uniq -c"
        osRunCb(com2,
          function( ret_ary){
            str_out2 = "<table>"
            for (var ind in ret_ary){
                var ary = ret_ary[ind].trim().split(/\s+/)
                str_out2 += '<tr><td> <a onClick="fileStat(\'' + ary[1].trim() + '\')" href="javascript:void(0);" >' + matchRed(ary[1],filter) + '</a> </td><td> ' + ary[0] + ' </td></tr>'
            }
            str_out2 +="</table>"
            writeLeftPane()
          }
        )
    }

    fileStat = function(filepath){

      $('#pane_file_detail_1').html("")
      $('#pane_file_detail_2').html("")

      var git_command = 'git log --oneline --follow --name-status --date=short --pretty=format:" %ad %h  %an %s " '  + filepath.trim()
      osRunCb(git_command,
        function(ret_ary){
          console.log('retary',ret_ary)

          var htmlstr = s150(sBold(filepath)) + '<br/>'
          htmlstr += sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>'
          var str_out = ret_ary.join('<br/>')
          $('#pane_file_detail_1').append( htmlstr + str_out + '<br/><br/>')
      })

      var git_command2 = 'git log -p --oneline --pretty=format:" %ad %x09 %h %x09 %an %x09 %s" '  + filepath.trim()
      osRunCb(git_command2,
        function(ret_ary){
          var htmlstr = s150(sBold('diff')) + '<br/>' +
                       sRed(escapeHTML(git_command2)) + " " + sGray(ret_ary.length) + '<br/>'
          for (var ind in ret_ary){
            ret_ary[ind] = escapeHTML(ret_ary[ind]).replace(/ /,'&nbsp;')
          //  str_out += '<a onClick="fileStat(\'' + ret_ary[ind].trim() + '\')" href="javascript:void(0);" >' + ret_ary[ind].replace(new RegExp('(' + filter.trim() + ')','ig'),sRed('$1') ) + '</a><br/>'
          }
          ret_ary = diffColor(ret_ary)

          var str_out2 = ret_ary.join('<br/>')
          $('#pane_file_detail_2').append( htmlstr + str_out2 )

          openPaneCenter('pane_file');
      })


    }

    makePaneLog = function( filter ){
         var git_command = 'git log --date=relative --pretty=format:"<tr><td nowrap > %ad %x09 %h %x09 %an %x09 %s </td></tr>"'

        $('#filter_log').val(filter) // 引数で来たフィルターもテキストボックスにセット

         filter_ary = filter.trim().split(/\s+/)
         for (var ind in filter_ary){
            git_command += " | egrep -i '" + filter_ary[ind] + "'"
         }
         git_command += ' | head -1000'

         osRunCb(git_command,
           function(ret_ary){
             $('#pane_log_detail').html('')
             $('#pane_log_detail').append(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>')
             var str_out = ret_ary.join('')
             str_out = str_out.replace(/\t/g,'</td><td nowrap >')
             for (var ind in filter_ary){
                if (!filter_ary[ind]) continue;
                str_out = str_out.replace(new RegExp('(' + filter_ary[ind].trim() + ')','ig'),sRed('$1') )
             }
            $('#pane_log_detail').append('<table>' + str_out + '</table>')
            openPaneCenter('pane_log');
            $('#filter_log').focus()
         })
     }

     makePaneStatus = function(){

         osRunOut('git status -s -b','pane_status_detail')

         $('#pane_status_detail').html('')
         var com2 = 'git diff --cached #最後のcommitと現在変更してstageしたものの違い'
         osRunCb(com2,
           function(ret_ary){
             for (var ind in ret_ary){
               ret_ary[ind] = escapeHTML(ret_ary[ind]).replace(/ /,'&nbsp;')
             }
             ret_ary = diffColor(ret_ary)
             var ret_out_str = ret_ary.join('<br/>')
             $('#pane_status_detail').append('<br/>' + sRed(escapeHTML(com2)) + " " + sGray(ret_ary.length) + '<br/>' + ret_out_str )
           }
         )

         var com3 = 'git diff #addした後の再変更'
         osRunCb(com3,
           function(ret_ary){
             for (var ind in ret_ary){
               ret_ary[ind] = escapeHTML(ret_ary[ind]).replace(/ /,'&nbsp;')
             }
             ret_ary = diffColor(ret_ary)
             var ret_out_str = ret_ary.join('<br/>')

             $('#pane_status_detail').append('<br/>' + sRed(escapeHTML(com3)) + " " + sGray(ret_ary.length) + '<br/>' + ret_out_str )
           }
         )
         openPaneCenter('pane_status');
     }
