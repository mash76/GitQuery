exec = require('child_process').exec
http = require('http')
fs = require('fs')

window.jQuery = window.$ = require('./jquery-3.1.0.js')

// clog = function(a,b,c){
//   if (!b) console.log(a)
//   else if (!c) console.log(a,b)
//   else console.log(a,b,c)
// }
//console.log = console.log

const BrowserWindow = require('electron').remote.BrowserWindow // windowオブジェクト
const path = require('path')

_G = []
_G.local_repos =[]
local_files =[]
his_repo =[] // リポジトリ選択履歴
_G.current_repo_path = ""
interval_log_filter = null // 入力完了からログ検索までの秒数

_G.log_all = ""
_G.log_lineOrTree = 'line'


_G.save_path = process.cwd() + '/userdata'
execOption = { encoding: 'utf8',
                  timeout: 0,
                  maxBuffer: 2000*1024,  //200*1024
                  killSignal: 'SIGTERM',
                  cwd: '',
                  env: null }

repo_btn_prev_push = "" //リポジトリ以下のBUTTONで直前push したもの
repo_prev_push = ""
top_filtered_repo = ""


s60= function(str){ return '<span style="font-size:60%;">'+str+'</span>'}
s80= function(str){ return '<span style="font-size:80%;">'+str+'</span>'}
s120= function(str){ return '<span style="font-size:120%;">'+str+'</span>'}
s150= function(str){ return '<span style="font-size:150%;">'+str+'</span>'}
s200= function(str){ return '<span style="font-size:200%;">'+str+'</span>'}

sGrayRed=  function(str){ return '<span style="color:#bb4444;">' + str + '</span>'}
sGrayBlue= function(str){ return '<span style="color:#4444bb;">' + str + '</span>'}
sRed=   function(str){ return '<span style="color:red;">' + str + '</span>'}
sBlue=  function(str){ return '<span style="color:blue;">' + str + '</span>'}
sPink=  function(str){ return '<span style="color:DeepPink;">' + str + '</span>'}
sGreen= function(str){ return '<span style="color:green;">' + str + '</span>'}

sBlueRev=  function(str){ return '<span style="color:white; background-color:blue;">' + str + '</span>'}
sPinkRev=  function(str){ return '<span style="color:white; background-color:DeepPink;">' + str + '</span>'}
sGreenRev= function(str){ return '<span style="color:white; background-color:green;">' + str + '</span>'}


sCrimson = function(str){ return '<span style="color:crimson;">' + str + '</span>'}

sGray=  function(str){ return '<span style="color:gray;">' + str + '</span>'}
sGray2 = function(str){ return '<span style="color:darkGray;">' + str + '</span>'}
sSilver= function(str){ return '<span style="color:silver;">' + str + '</span>'}

sBold= function(str){ return '<span style="font-weight:bold;">' + str + '</span>'}

path2pjname =function(full_path){ return full_path.replace(/\/.git/,'').replace(/.*\//,'') } // 後ろの.gitと 直前のスラッシュまでを除去
path2dir =function(full_path){ return full_path.replace(/\/.git/,'') }

url2link = function(line ){ return line.replace(/(http.*?) /, '<span onClick="osrun(\'open $1\')" class="btn">$1</span> ')}

escapeHTML = function(html) { return $('<div>').text(html).html() }
escapeRegExp = function(string) {  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");}
replaceTabSpc = function(str) { return str.replace(/ /ig,'&nbsp;').replace(/\t/ig,'&nbsp;&nbsp;&nbsp;&nbsp;')}
matchRed = function(str,filter) { return str.replace(new RegExp('(' + filter.trim() + ')','ig'),sRed('$1') ) }


setSelect = function (self){
    $(self).parent().children().attr('class','silver'); 
    $(self).attr('class','bold');
}

setSelectBold = function (self){
    $(self).parent().children().removeClass('bold'); 
    $(self).addClass('bold');
}

loadText = function (path){
  console.log(path)
  if (!fs.existsSync(path)) return false;
  var text = fs.readFileSync(path, 'utf-8');
  return text  
}
saveText = function (path,text){
  fs.writeFileSync(path, text)
}

// json をテキスト保存  [] でなく {} で初期化すること
saveJson = function(path,jsondata){
  console.log("save " + path)
  fs.writeFileSync(path, JSON.stringify(jsondata))
}



loadJson = function(path){

  console.log("load try " + path)
  if (!fs.existsSync(path)) return false;
  var text = fs.readFileSync(path, 'utf-8');
  console.log('load ok' , text)
  ret_ary = JSON.parse(text)
  return ret_ary
}

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

    //配列化 最終行の改行取り除いて
    ret_ary = []
    if (stdout != "") ret_ary = stdout.replace(/\n$/,'').split(/\n/) 

    if (typeof cb == "function") ret_ary = cb(ret_ary,stderr)
  });
}


// 特定idのhtmlタグに出力したいとき   action = append replace
osRunOut = function(command , out_html_id , action , cb){

  if (!action.match(/(append|replace)/)) alert('osRunOut action:' + action)
  if (action == 'replace') $('#' + out_html_id ).html('')

  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {

    if (error) console.log('error',error)
    if (stderr) console.log('stderr',stderr)

    var ret_ary = escapeHTML(stdout).split(/\n/)
    $('#' + out_html_id).append(sRed(escapeHTML(command)) + " " + sGray(ret_ary.length) )
    $('#' + out_html_id).append( '<pre class="code">' + ret_ary.join('\n') + '</pre>' )
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
