exec = require('child_process').exec
http = require('http')
fs = require('fs')

window.jQuery = window.$ = require('./jquery-3.1.0.js')

s60= function(str){ return '<span style="font-size:60%;">'+str+'</span>'}
s80= function(str){ return '<span style="font-size:80%;">'+str+'</span>'}
s120= function(str){ return '<span style="font-size:120%;">'+str+'</span>'}
s150= function(str){ return '<span style="font-size:150%;">'+str+'</span>'}
s200= function(str){ return '<span style="font-size:200%;">'+str+'</span>'}

sRed=   function(str){ return '<span style="color:red;">'+str+'</span>'}
sBlue=  function(str){ return '<span style="color:blue;">'+str+'</span>'}
sPink=  function(str){ return '<span style="color:DeepPink;">'+str+'</span>'}
sGreen= function(str){ return '<span style="color:green;">'+str+'</span>'}
sGray=  function(str){ return '<span style="color:gray;">'+str+'</span>'}
sGray2 = function(str){ return '<span style="color:darkGray;">'+str+'</span>'}
sSilver= function(str){ return '<span style="color:silver;">'+str+'</span>'}

sBold= function(str){ return '<span style="font-weight:bold;">'+str+'</span>'}

path2pjname =function(full_path){ return full_path.replace(/\/.git/,'').replace(/.*\//,'') } // 後ろの.gitと 直前のスラッシュまでを除去
path2dir =function(full_path){ return full_path.replace(/\/.git/,'') }
url2link = function(line ){ return line.replace(/(http.*?) /, '<span onClick="osrun(\'open $1\')" class="btn">$1</span> ')}

escapeHTML = function(html) { return $('<div>').text(html).html() }
escapeRegExp = function(string) {  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");}
replaceTabSpc = function(str) { return str.replace(/ /ig,'&nbsp;').replace(/\t/ig,'&nbsp;&nbsp;&nbsp;&nbsp;')}
matchRed = function(str,filter) { return str.replace(new RegExp('(' + filter.trim() + ')','ig'),sRed('$1') ) }


//osコマンド非同期実行 結果出力不要のとき
osrun = function(command , out_html_id){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {
    if (error) console.log('error',error)
    if (stderr) console.log('stderr',stderr)
  });
}
//一行だけ返す sqlを返さない。一行だけ、項目だけ出したい時に
osRunOneLine = function(command , out_html_id){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) console.log('error',error)
    if (stderr) console.log('stderr',stderr)

    $('#' + out_html_id).html(stdout.trim())
  });
}

//独自のコールバックで処理したいとき
osRunCb = function(command , cb){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) console.log('error',error)
    if (stderr) console.log('stderr',stderr)

    ret_ary = stdout.trim().split(/\n/)
    if (typeof cb == "function") ret_ary = cb(ret_ary)
  });
}

// 特定idのhtmlタグに出力したいとき
osRunOut = function(command , out_html_id ){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) console.log('error',error)
    if (stderr) console.log('stderr',stderr)

    var ret_ary = escapeHTML(stdout).split(/\n/)
    $('#' + out_html_id).html(s120(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length)) + '<br/>')
    $('#' + out_html_id).append(replaceTabSpc(ret_ary.join('<br/>')))

    $('#' + out_html_id).append( sRed(stderr.replace(/\n/g,'<br/>')))

  });
}

outText = function(git_command,id_tag,ret_ary){
  if (typeof ret_ary != "object" || ret_ary.length == 0 || ret_ary == null) return
  var ret_out_str = ret_ary.join('<br/>') + '<br/>'
  if (id_tag){
      $('#' + id_tag).html(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<hr/>' + ret_out_str )
  }
}

diffColor = function (ary){
    for (var ind in ary){
      var line = ary[ind]
      //line = escapeHTML(line)
       if (line[0]=='-') ary[ind] = sBlue(line)
       if (line[0]=='+') ary[ind] = sGreen(line)
    }
    return ary
}
