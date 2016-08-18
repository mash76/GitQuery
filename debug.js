// debug用に

//textファイルを5個作る
debugAddText = function (cb){
    var utime = new Date().getTime()
    for (var ind in [1,2,3,4,5]){
      osRunOut("echo 'abcde' > " + utime + "_" + ind + ".txt",'pane_debug_detail','replace',cb)
    }
}
// txtファイルを　1/2の確率で 中身書き足し
debugEditText = function (cb){
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 5;' | while read LINE; do echo 'aaaa'>>${LINE}; done ",'pane_debug_detail','replace',cb  )
}
// txtファイルを3割の確率で削除
debugDelText = function (cb){
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 7;' | xargs rm ",'pane_debug_detail','replace' ,cb )
}

debugEditAndNone = function(){

  var ct = 0
  var ctAdd = function(){
    ct++
    if (ct == 3) {
          osRunOut("git add . ",'pane_debug_detail','append' )
    }
  }
  debugAddText(ctAdd)
  debugEditText(ctAdd)
  debugDelText(ctAdd)
}

debugEditAndStash = function(){

  var ct = 0
  var ctAdd = function(){
    ct++
    if (ct == 3) {
          osRunOut("git add . ",'pane_debug_detail','append' ,function(){
              var dt = new Date()
              osRunOut("git stash save 'debug自動stash" +
                  dt.getFullYear() +　'_' + (dt.getMonth()+1) + '_' + dt.getDate() + '-' +
                  dt.getHours() + '_' + dt.getMinutes() + '_' + dt.getSeconds() + "'",
                  'pane_debug_detail','append' )
          })
    }
  }
  debugAddText(ctAdd)
  debugEditText(ctAdd)
  debugDelText(ctAdd)
}

debugEditAndCommit = function(){

  var ct = 0
  var ctAdd = function(){
    ct++
    if (ct == 3) {
          osRunOut("git add . ",'pane_debug_detail','append' ,function(){
              var dt = new Date()
              osRunOut("git commit -m 'debug自動コミット" +
                  dt.getFullYear() +　'_' + (dt.getMonth()+1) + '_' + dt.getDate() + '-' +
                  dt.getHours() + '_' + dt.getMinutes() + '_' + dt.getSeconds() + "'",
                  'pane_debug_detail','append' )
          })
    }
  }
  debugAddText(ctAdd)
  debugEditText(ctAdd)
  debugDelText(ctAdd)
}
