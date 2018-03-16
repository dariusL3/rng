var arr = new Uint32Array(8)
//console.log(crypto)
//var fs = require('fs')
fs.open('/dev/urandom', 'r', (err,fd) =>{
  if (err){
    console.log("fdsfdsj")
    return
  }
  read(fd,arr,0,32,0,(err, bytesRead, buffer)=>{
    console.log(bytesRead)
  })
})
//var arr = new Uint32Array(8)
//crypto.getRandomValues(arr)
//console.log(arr)
var pks = []
var addressMap = {}
var validShares = {}
var validDecryptions = {}
var commits = {}
var opens = {}
var decryptions = {}
//var bnContract = web3.eth.contract([{"constant":true,"inputs":["uint256","uint256","uint256","uint256"],"name":"bn256Add","outputs":[{"name":"","type":"uint256"}]}])
var bn = bnContract.at('0xeca15d1a68ecba6d5970bfcf9841e17b0b94e042')
var sks = ['23729686430471474665028963781270542949392357800926127418281145529763290269226', '62938281150811623687266951480678035234964384494475466853359337797946206621653', '52142278597844297784492602082913737415963648415606110279710404758220024324629', '4964866513109948150107856446081734846191697543369454747009359413204953833110', '8398784383134070565423169828443327653321794853232052366121826089259339335214', '113385837810791710969499806893207547662321218200893224802460215750752248498457', '65793496865552822397203396904798869506079127538271744446451091905757816784937', '75225778975903647149650737289605714501370169287190503601816246804569203949579', '51923447634821324016999154849938037575129351509686591152225259037745901488575', '74600063639957000740175569536178937952210390666568550965123197698989601513944', '30014984811878427663767102793416930197800352643613931643158195010647715701197', '56340310102386180784033530287027173277044813128873340740782777001467450140112', '70651695064641333979042899425724744459953747271727793514900492190228354847018', '5605032507364069610831643211264821993001848048808438661167765823620635704514', '46691099815534540933618781994048706060237125679354324409685741524179990094730']
var pkxys = ['34772521793302182986451243176193986207414529206890353029197029729309620819741', '100189241954701278789352169960596919536065870376729370844632733970615582338725', '94091396045760285365128875343275662687556485068585467123307424667545095329315', '106881602860219715939968759067355735077391305911584764187965463435139246313960', '88576436946466256675084543645139846213486627945467547568698383856562552206968', '44677027077314333112046473887135682844554390218143784936256366651540270624745', '87787884399354903247920489603571832690336530433286164096880741153450657561164', '49420600347759085865022052271376963175369465754489590213858654701396148318958', '68913290211548988136689840454972261963402693994558126198420967743174633292468', '37528503147127220650406057090034600074662142567103285819078184538053822226715', '115052302241208342654311462271119167931133045369878242149811895027983924925277', '53496272684191462453410036788198593063013883772631357185632445767301160958424', '9038309061111645868879055151606682467627986025101023895763449772292414146271', '67365963797129332688706313104028270863435165465353149599709301334205280504052', '113600855949376854438551837144081736206642840505097228705220257901326378107526', '25375044772237400539656979421999531222828944628281902207506565099979720107755', '67511270485422814580077771161536076634243414483093658020368476117266850993521', '53263054908131555804705967410923987113425044102876254229374810931614218741747', '113233852466338402651101338859403883097677590847857888011535335412238923104238', '29905870396347961922482918196537945134582283170463499850691343118683252346079', '39162478147332870068085907932025851838304281890043219211969675440476927777517', '62397114872877676156782798711161045981692677215232166985881192819716358264305', '25204019194058018258534625113057356160537664151405080045979362003817986360022', '111085021161513979783192877117254130011122981598803325254501342608840795661638', '100700525882087917513258675517505407703430054473336785994031133695849750176298', '47673880175206325514293248109153820066404488944879213939028946843011288463933', '92998688344772086681744429826892074375499869908542924166416511736016305448810', '3993640677281403912965938733314007917943997790110976491516300228290002348521', '60630743629030706612066825780386872000243994809619481336690021258780898534373', '55252928304780627889468506715109511880615809176042370039473089266924037565382']
userDict = [baoanh,hari,htram,chipu,mytam,alice,bob,lily]
var hRaw = pvss.getH.call()
var h = {'x':hRaw[0],'y':hRaw[1]}
var gRaw = pvss.getG.call()
var g = {'x':gRaw[0],'y':gRaw[1]}
var commitCount = 0
var openCount = 0
var n = 0
var t = 0
var myKeyIndex = 1
var myOpen
// for (j=1;j<n;j++){
//   if (userDict[j]==myAddr){
//     myKeyIndex = j+1
//   }
// }
var earlyQuitters = []
var lateQuitters = []
var myAddr = null


var names = ['blank','baoanh','hari','htram','chipu','mytam','alice','bob','lily']
listenAll()

function nextStage(){
  unlock(myAddr)
  pvss.nextStage.sendTransaction({from:myAddr,value:0})
}

function registerPKs(){
  unlock(myAddr)
  var arrayOfStuff = ['34772521793302182986451243176193986207414529206890353029197029729309620819741', '100189241954701278789352169960596919536065870376729370844632733970615582338725', '94091396045760285365128875343275662687556485068585467123307424667545095329315', '106881602860219715939968759067355735077391305911584764187965463435139246313960', '88576436946466256675084543645139846213486627945467547568698383856562552206968', '44677027077314333112046473887135682844554390218143784936256366651540270624745', '87787884399354903247920489603571832690336530433286164096880741153450657561164', '49420600347759085865022052271376963175369465754489590213858654701396148318958'];
  for (i=0;i<n;i++){pvss.register.sendTransaction(arrayOfStuff[2*i],arrayOfStuff[2*i+1],{from:myAddr,value:0});}
}

function reg(){
  unlock(myAddr)
  pvss.register.sendTransaction(pkxys[myKeyIndex*2],pkxys[myKeyIndex*2+1],{from:myAddr,value:0})
}

function makeCommit(sec){
  n = pvss.getN.call()
  t = pvss.getT.call()
  if (earlyQuitters.indexOf(myAddr)>=0) return;
  var i = addressMap[myAddr]
  unlock(myAddr)
  var poly = []
  var temp = sec
  for (j=0;j<t;j++){
    poly.push(web3.toBigNumber(temp)%12345)
    temp = web3.sha3(temp)
  }
  poly = poly.reverse()
  //console.log(poly)
  var w = web3.toBigNumber(web3.sha3(sks[i],2))%12345
  for (j=1;j<=n;j++){
    var eva = pvss.evaluatePoly.call(poly,j)
    var bundle = pvss.computeShareAndProof.call(eva,pks[j].x,pks[j].y,w)
    //console.log('PVSS : '+bundle)
    //console.log([bundle[0],bundle[1],pks[j].x,pks[j].y,g.x,g.y,bundle[2],bundle[3],bundle[4],bundle[5]])
    //"37572485641464810811674262211444686034255026064564237914961939126625119068469","39499300114265887830383085376472869823712072390449808331335063304164995746037",["88576436946466256675084543645139846213486627945467547568698383856562552206968","44677027077314333112046473887135682844554390218143784936256366651540270624745","12491534207990215330120135635581023921030258456695817555828929191238709288092","104340201949375786418227580263545657674427888456142663625569746313246079959670","100703117421101238723074381214209003957033271380026246829167863984226374813745","96529545864132649455376865966635984308362854510557236358103877655267153418621","17402524776812194897852332389881393279599234971629596244138977150301040605315","64101867774861829844617136465646973559257247227272967231523512682925797200735"]
    //var e = bundle[0]
    //var z = bundle[1]
    //var pows = [bundle[2],bundle[3],bundle[4],bundle[5]]
    pvss.share.sendTransaction(j,bundle[0].toString(10),bundle[1].toString(10),[bundle[2].toString(10),bundle[3].toString(10),bundle[4].toString(10),bundle[5].toString(10)],{from:myAddr,value:0})
    // chec = pvss.verifyZKP.call(bundle[0].toString(10),bundle[1].toString(10),[pks[j].x.toString(10),pks[j].y.toString(10),g.x.toString(10),g.y.toString(10),bundle[2].toString(10),bundle[3].toString(10),bundle[4].toString(10),bundle[5].toString(10)])
    // if (!chec){
    //   console.log("Verify Fail ! ")
    //   console.log([bundle[0],pvss.computeVerifierHash.call(bundle[0],bundle[1],[pks[j].x,pks[j].y,g.x,g.y,bundle[2],bundle[3],bundle[4],bundle[5]])])
    // }
  }
  var bundle = pvss.computeCommitOpen.call(sec)
  myOpen = {'x':bundle[1],'y':bundle[2]}
  pvss.commit.sendTransaction(bundle[0],{from:myAddr,value:0})
  //console.log(comm)
}

function unlock(addr){
  //console.log(addr)
  if (addr !== undefined){
    myAddr = addr
    web3.personal.unlockAccount(addr,'foobar123')
  }
}

function listenAll(){
	if (myAddr==lily) return;
  var listeners = [pvss.RegisterReady(), pvss.Decryption(), pvss.CommitReady(), pvss.Recover(), pvss.PublicKey(), pvss.Share(), pvss.Commit(), pvss.Open()]
  listeners[0].watch(function(err, result) {  
      if (err) {    
          console.log(err)    
          return;  
      }  
      console.log('Event : Register Ready')
      reg()
  })
  listeners[1].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    var decrypterInd = addressMap[result.args.decrypterAddress]
    var sharerInd = result.args.sharerIndex
    var e = result.args.e
    var z = result.args.z
    var decx = result.args.x
    var decy = result.args.y
    console.log('Event : Decryption - '+[decrypterInd,sharerInd])//,e,z,decx,decy])
    var theShare = validShares[sharerInd][decrypterInd]
    //console.log('Belonging to the share : ' + [theShare.x,theShare.y])
    var verifyResult = pvss.verifyZKP.call(e,z,[h.x,h.y,decx,decy,pks[decrypterInd].x,pks[decrypterInd].y,theShare.x,theShare.y])
    console.log('Verify : ' + verifyResult)
    if (verifyResult){
      var temp = validDecryptions[sharerInd] 
      if (!temp) {
        temp = {}
        temp[decrypterInd] = {'x':decx,'y':decy}
        //console.log("resetting map..")
        validDecryptions[sharerInd] = temp
      }
      else{
        temp[decrypterInd] = {'x':decx,'y':decy}
      }
      //console.log(JSON.stringify(validDecryptions))
      if (Object.keys(temp).length==t){
        var partyIndexes = []
        var decryptions = []
        for (var ind in temp){
          partyIndexes.push(ind)
          decryptions.push(temp[ind].x)
          decryptions.push(temp[ind].y)
        }
        //console.log([partyIndexes,decryptions])
        var reconstructedSecret = pvss.reconstruct.call(partyIndexes,decryptions)
        console.log("Reconstructed : " + [sharerInd,reconstructedSecret])
        if (!opens[sharerInd]){
          opens[sharerInd] = {'x':reconstructedSecret[0],'y':reconstructedSecret[1]}
          openCount++
          if (openCount==commitCount){
            console.log("Finalizing")
            var bundle = []
            for (j=1;j<=n;j++){
              if (opens[j]){
                bundle.push(opens[j].x)
                bundle.push(opens[j].y)
              }
            }
            var beacon = pvss.computeBeacon.call(bundle)
            console.log('Beacon : ' + beacon)
            return
          }
        }
      }
    }
  })
  listeners[2].watch(function(err, result) {
    if (err || pks.length==0) {
      console.log(err)
      return;
    }
    console.log('Event : Commit Ready')
    makeCommit(document.getElementById("seed").value)
  })
  listeners[3].watch(function(err, result) {
    if (err) {
      console.log(err)  
      return;
    }
    console.log('Event : Recover')
    for (i=1;i<=n;i++){
    	if (!commits[i]) continue;		// registered but not committed
      //console.log('Party '+i+' passed commit')
    	var shareSet = validShares[i];
    	if (!shareSet[0]) continue;		// committed but not all shares successfully verified 
      //console.log('Party '+i+' passed verification')
    	if (opens[i]) continue;			// committed and revealed a valid open value
      console.log('Party '+i+" 's reveal missing")
    	var myInd = addressMap[myAddr]
    	var w = web3.toBigNumber(web3.sha3(sks[i],2))%12345
    	// e, z, decx, decy
    	console.log("Producing decryption ")//+[sks[myKeyIndex],pks[myInd].x,pks[myInd].y,shareSet[myInd].x,shareSet[myInd].y,w])
    	var bundle = pvss.computeDecryptionAndProof.call(sks[myKeyIndex],pks[myInd].x,pks[myInd].y,shareSet[myInd].x,shareSet[myInd].y,w)
      pvss.submitDecryption.sendTransaction(i, bundle[0], bundle[1], bundle[2], bundle[3],{from:myAddr,value:0})
    	//console.log(bundle)
    }
  })
  listeners[4].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    console.log('Event : Public Key - '+result.args.index+','+result.args.partyAddress)//+','+result.args.x+','+result.args.y);
    addressMap[result.args.partyAddress] = result.args.index;
    pks[result.args.index] = {'x':result.args.x, 'y': result.args.y};
  })
  listeners[5].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    var partyInd = addressMap[result.args.partyAddress]
    var shareInd = result.args.shareIndex
    var e = result.args.e
    var z = result.args.z
    var shx = result.args.shx
    var shy = result.args.shy
    var vx = result.args.vx
    var vy = result.args.vy
    var mypk = pks[shareInd]
    console.log('Event : Share - '+result.args.shareIndex+','+result.args.partyAddress+',')//+result.args.e+','+result.args.z+','+result.args.shx+','+result.args.shy+','+result.args.vx+','+result.args.vy)
    //console.log("Verifying with : "+[e,z,mypk.x,mypk.y,g[0],g[1],shx,shy,vx,vy])
    verifyResult = pvss.verifyZKP.call(e,z,[mypk.x,mypk.y,g.x,g.y,shx,shy,vx,vy])
    console.log('Verify : '+verifyResult)
    if (verifyResult){
     var temp = validShares[partyInd] 
     if (!temp) {
     	temp = {shareInd: {'x':shx,'y':shy}}
     	//console.log("resetting map..")
     	validShares[partyInd] = temp
     }
     else{
     	
     	temp[shareInd] = {'x':shx,'y':shy}
     	//console.log("Set shares found : " + Object.keys(temp).length)
     }
     //console.log(JSON.stringify(validShares))
     if (Object.keys(temp).length==n){
     	commitCount++
     	temp[0] = "full"
     	console.log("" + commitCount + " commits successfully verified")
     	if (commitCount==t){
     		if (lateQuitters.indexOf(myAddr)>=0) return;
       		pvss.open.sendTransaction(myOpen.x,myOpen.y,{from:myAddr,value:0})
       //console.log("Sent open : "+[myOpen.x,myOpen.y])
     	}
     }
     //console.log(commitCount)
     
    }
  })
  listeners[6].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    console.log('Event : Commit\n'+result.args.partyAddress+','+result.args.comm)
    var partyInd = addressMap[result.args.partyAddress]
    commits[partyInd] = result.args.comm
  })
  listeners[7].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    //console.log('Event : Open')
    var partyInd = addressMap[result.args.partyAddress]
    var x = result.args.x
    var y = result.args.y
    console.log('Event : Open - '+partyInd)
    verifyResult = pvss.verifyOpen.call(x,y,commits[partyInd])
    if (verifyResult){
    	console.log("Successfully verified")
      opens[partyInd] = {'x':x,'y':y}
      openCount++
      //console.log("Count : "+openCount)
      if (openCount==n){
        console.log("Finalizing")
        var bundle = []
        for (j=1;j<=n;j++){
          if (opens[j]){
            bundle.push(opens[j].x)
            bundle.push(opens[j].y)
          }
        }
        var beacon = pvss.computeBeacon.call(bundle)
        console.log('Beacon : ' + beacon)
        return
      }
    }
  })
}
//nextStage()
