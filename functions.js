exec = require('child_process').exec
http = require('http')
fs = require('fs')

window.jQuery = window.$ = require('./jquery-3.1.0.js')

s60= function(str){ return '<span style="font-size:60%;">'+str+'</span>'}
s80= function(str){ return '<span style="font-size:80%;">'+str+'</span>'}
s120= function(str){ return '<span style="font-size:120%;">'+str+'</span>'}
s150= function(str){ return '<span style="font-size:150%;">'+str+'</span>'}

sRed= function(str){ return '<span style="color:red;">'+str+'</span>'}
sBlue= function(str){ return '<span style="color:blue;">'+str+'</span>'}
sPink= function(str){ return '<span style="color:DeepPink;">'+str+'</span>'}
sGray= function(str){ return '<span style="color:gray;">'+str+'</span>'}
sGray2 = function(str){ return '<span style="color:darkGray;">'+str+'</span>'}
sSilver= function(str){ return '<span style="color:silver;">'+str+'</span>'}

sBold= function(str){ return '<span style="font-weight:bold;">'+str+'</span>'}

path2pjname =function(full_path){ return full_path.replace(/\/.git/,'').replace(/.*\//,'') } // 後ろの.gitと 直前のスラッシュまでを除去
path2dir =function(full_path){ return full_path.replace(/\/.git/,'') }

url2link = function(line ){ return line.replace(/(http.*?) /, '<span onClick="osrun(\'open $1\')" class="btn">$1</span> ')}
escapeHTML = function(html) { return $('<div>').text(html).html() }




//osコマンド非同期実行
osrun = function(command , out_html_id){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {
    ret_ary = stdout.trim().split(/\n/)
    outText( command, out_html_id, ret_ary )
  });
}
//一行だけ返す
osRunOneLine = function(command , out_html_id){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {
    $('#' + out_html_id).html(stdout.trim())
  });
}

osRunCb = function(command , cb){
  console.log(command)
  exec(command,execOption, (error, stdout, stderr) => {
    ret_ary = stdout.trim().split(/\n/)
    if (typeof cb == "function") ret_ary = cb(ret_ary)
  });
}
osRunOut = function(command , out_html_id ){
  console.log(command)
  exec(command, (error, stdout, stderr) => {
    ret_ary = stdout.trim().split(/\n/)
    if (typeof cb == "function") ret_ary = cb(ret_ary)
    outText( command, out_html_id, ret_ary )

  });
}

outText = function(git_command,id_tag,ret_ary){
  if (typeof ret_ary != "object" || ret_ary.length == 0 || ret_ary == null) return
  var ret_out_str = ret_ary.join('<br/>') + '<br/>'
  if (id_tag){
      $('#' + id_tag).html(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>' + ret_out_str )
  }
}
outHtml =function(git_command,id_tag,ret_ary){
  if (typeof ret_ary != "object" || ret_ary.length == 0 || ret_ary == null) return
  var ret_out_str = ret_ary.join('<br/>')
  if (id_tag){
      $('#' + id_tag).html(sRed(escapeHTML(git_command)) + " " + sGray(ret_ary.length) + '<br/>' +
                       escapeHTML(ret_out_str) )
  }
}
