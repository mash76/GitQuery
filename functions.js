exec = require('child_process').exec
http = require('http')
fs = require('fs')

window.jQuery = window.$ = require('./jquery-3.1.0.js')

s60= function(str){ return '<span style="font-size:60%;">'+str+'</span>'}
s80= function(str){ return '<span style="font-size:80%;">'+str+'</span>'}
s120= function(str){ return '<span style="font-size:120%;">'+str+'</span>'}
s150= function(str){ return '<span style="font-size:150%;">'+str+'</span>'}
s200= function(str){ return '<span style="font-size:200%;">'+str+'</span>'}

sGrayRed=   function(str){ return '<span style="color:#bb4444;">'+str+'</span>'}
sGrayBlue=  function(str){ return '<span style="color:#4444bb;">'+str+'</span>'}
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

// json をテキスト保存  [] でなく {} で初期化すること
saveJson = function(path,jsondata){
  clog("save " + path)
  fs.writeFile(path, JSON.stringify(jsondata),
    function (error) {
       if (error != null) {
          alert('error : ' + error)
          return;
       }
       clog('saved ' + path , JSON.stringify(jsondata))
    })
}

loadJson = function(path){

  clog("load try " + path)
  if (!fs.existsSync(path)) return false;
  var text = fs.readFileSync(path, 'utf-8');
  clog('load ok' , text)
  ret_ary = JSON.parse(text)
  return ret_ary
}

//osコマンド非同期実行 結果出力不要のとき
osrun = function(command , out_html_id){
  clog(command)
  exec(command,execOption, (error, stdout, stderr) => {
    if (error) clog('error',error)
    if (stderr) clog('stderr',stderr)
  });
}
//一行だけ返す sqlを返さない。一行だけ、項目だけ出したい時に
osRunOneLine = function(command , out_html_id){
  clog(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) clog('error',error)
    if (stderr) clog('stderr',stderr)

    $('#' + out_html_id).html(stdout.trim())
  });
}

//独自のコールバックで処理したいとき
osRunCb = function(command , cb){
  clog(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) clog('error',error)
    if (stderr) clog('stderr',stderr)

    ret_ary = []
    if (stdout != "") ret_ary = stdout.trim().split(/\n/)


    if (typeof cb == "function") ret_ary = cb(ret_ary,stderr)
  });
}


// 特定idのhtmlタグに出力したいとき   action = append replace
osRunOut = function(command , out_html_id , action , cb){

  if (!action.match(/(append|replace)/)) alert('osRunOut action:' + action)
  if (action == 'replace') $('#' + out_html_id ).html('')

  clog(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) clog('error',error)
    if (stderr) clog('stderr',stderr)

    var ret_ary = escapeHTML(stdout).split(/\n/)
    $('#' + out_html_id).append(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) + '<br/>')
    $('#' + out_html_id).append( replaceTabSpc(ret_ary.join('<br/>')))
    $('#' + out_html_id).append( sRed(stderr.replace(/\n/g,'<br/>')))

    if (typeof cb == "function") cb()
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

//textファイルを5個作る
debugAddText = function (){
    var utime = new Date().getTime()
    for (var ind in [1,2,3,4,5]){
      osRunOut("echo 'abcde' > " + utime + "_" + ind + ".txt",'pane_debug_detail','replace')
    }
}
// txtファイルを　1/2の確率で 中身書き足し
debugEditText = function (){
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 5;' | while read LINE; do echo 'aaaa'>>${LINE}; done ",'pane_debug_detail','replace'  )
}
// txtファイルを3割の確率で削除
debugDelText = function (){
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 7;' | xargs rm ",'pane_debug_detail','replace'  )
}
