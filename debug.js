// debug用に

//textファイルを5個作る
debugAddText = function (cb){
    var utime = new Date().getTime()
    var str = debugRandomStr()
    osRunOut("for i in 1 2 3 4 5; do echo 'dummytext_" + utime + str + "' > debug_" + utime + "_${i}.txt ; done; ls *.txt",'pane_debug_detail','replace',cb)

}
// txtファイルを　1/2の確率で 中身書き足し
debugEditText = function (cb){
    var str = debugRandomStr()
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 5;' | while read LINE; do echo '" + str + "'>>${LINE}; done ",'pane_debug_detail','replace',cb  )
}
// txtファイルを3割の確率で削除
debugDelText = function (cb){
  osRunOut("ls *.txt | perl -lne 'print if rand(10) > 7;' | xargs rm ",'pane_debug_detail','replace' ,cb )
}

debugRandomStr = function(){
  var ary = ['abcde','12345','akasatana','9999999','5555555','22222222aaaa99']
  return ary[ Math.floor(Math.random()*5.99)] +ary[ Math.floor(Math.random()*5.99)];

}

debugEdit = function(){


  debugAddText()
  debugEditText()
  debugDelText()
}

debugEditAndAdd = function(){

  var ct = 0

  var ctAdd = function(){
    ct++
    if (ct == 3) osRunOut("git add . ",'pane_status_detail','append' )
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
          osRunOut("git add . ",'pane_status_detail','append' ,function(){
              var dt = new Date()
              osRunOut("git stash save 'debug自動stash" +
                  dt.getFullYear() +　'_' + (dt.getMonth()+1) + '_' + dt.getDate() + '-' +
                  dt.getHours() + '_' + dt.getMinutes() + '_' + dt.getSeconds() + "'",
                  'pane_status_detail','append',
                      function(){
                          showStashList('replace')
                  })

                  
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
                  'pane_status_detail','append' )
          })
    }
  }
  debugAddText(ctAdd)
  debugEditText(ctAdd)
  debugDelText(ctAdd)
}
