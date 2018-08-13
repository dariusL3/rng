var pks = []
var addressMap = {}
var validShares = {}
var validDecryptions = {}
var commits = {}
var opens = {}
var decryptions = {}
var secretKeyMap = {}
secretKeyMap[web3.eth.accounts[0]] = web3.toBigNumber("16612456370303379032547207265779060850076966813142457885348845322249735655656"),
secretKeyMap[web3.eth.accounts[1]] = web3.toBigNumber("113916990190477628314065263898480535170726057723351145512654389754862395844"),
secretKeyMap[web3.eth.accounts[2]] = web3.toBigNumber("69697861974285815027675721123502764175226254252001432509860348204754717113527"),
secretKeyMap[web3.eth.accounts[3]] = web3.toBigNumber("20679705100028533210444515434735879302484634388346709613886962617160072212719")

//var bnContract = web3.eth.contract([{"constant":true,"inputs":["uint256","uint256","uint256","uint256"],"name":"bn256Add","outputs":[{"name":"","type":"uint256"}]}])
//var bn = bnContract.at('0x0000000000000000000000000000000000000006')
//var pvssContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getG","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"},{"name":"c","type":"bytes32"}],"name":"verifyOpen","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"partyIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"pows","type":"uint256[4]"}],"name":"share","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"sk","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"shx","type":"uint256"},{"name":"shy","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeDecryptionAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"num","type":"uint256"},{"name":"m","type":"uint256"}],"name":"inv","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getN","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"isInf","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"sec","type":"uint256"}],"name":"computeCommitOpen","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"poly","type":"uint256[]"},{"name":"x0","type":"uint256"}],"name":"evaluatePoly","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"verifyZKP","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getH","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"tin","type":"uint256"},{"name":"inds","type":"uint256[]"},{"name":"i","type":"uint256"}],"name":"computeLambda","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"computeVerifierHash","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"eva","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeShareAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"bases","type":"uint256[4]"},{"name":"pows","type":"uint256[4]"},{"name":"sec","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"sharerIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"decx","type":"uint256"},{"name":"decy","type":"uint256"}],"name":"submitDecryption","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x1","type":"uint256"},{"name":"y1","type":"uint256"}],"name":"double","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"x1","type":"uint256"},{"name":"y1","type":"uint256"},{"name":"x2","type":"uint256"},{"name":"y2","type":"uint256"}],"name":"add","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"inds","type":"uint256[]"},{"name":"decs","type":"uint256[]"}],"name":"reconstruct","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"secxys","type":"uint256[]"}],"name":"computeBeacon","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"k","type":"uint256"},{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"mul","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"nextStage","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"comm","type":"bytes32"}],"name":"commit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"RegisterReady","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"decrypterAddress","type":"address"},{"indexed":false,"name":"sharerIndex","type":"uint256"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Decryption","type":"event"},{"anonymous":false,"inputs":[],"name":"CommitReady","type":"event"},{"anonymous":false,"inputs":[],"name":"Recover","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"index","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"PublicKey","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"shareIndex","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"shx","type":"uint256"},{"indexed":false,"name":"shy","type":"uint256"},{"indexed":false,"name":"vx","type":"uint256"},{"indexed":false,"name":"vy","type":"uint256"}],"name":"Share","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"comm","type":"bytes32"}],"name":"Commit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Open","type":"event"}]);
//var pvss = pvssContract.at('0x6571d28be636781e3b93ad41fd950c6d95b3c8ff')
var q = new web3.BigNumber('21888242871839275222246405745257275088548364400416034343698204186575808495617')
var scrapeContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getG","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"},{"name":"commitment","type":"bytes32"}],"name":"verifyOpen","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"partyIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"pows","type":"uint256[4]"}],"name":"share","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"secretKey","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"shx","type":"uint256"},{"name":"shy","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeDecryptionAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"scalar","type":"uint256"},{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"g1mul","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"num","type":"uint256"},{"name":"modulo","type":"uint256"}],"name":"inv","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getN","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x1","type":"uint256"},{"name":"y1","type":"uint256"},{"name":"x2","type":"uint256"},{"name":"y2","type":"uint256"}],"name":"g1add","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"secret","type":"uint256"}],"name":"computeCommitOpen","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"myPolynomial","type":"uint256[]"},{"name":"x0","type":"uint256"}],"name":"evaluatePoly","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"verifyZKP","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getH","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"input","type":"uint256[12]"}],"name":"verifyZKP","outputs":[{"name":"ret","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getParty","outputs":[{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getGen1","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"rawShare","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"randomizer","type":"uint256"}],"name":"computeShareAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"bases","type":"uint256[4]"},{"name":"pows","type":"uint256[4]"},{"name":"secret","type":"uint256"},{"name":"randomizer","type":"uint256"}],"name":"computeProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"clearParties","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"sharerIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"decx","type":"uint256"},{"name":"decy","type":"uint256"}],"name":"submitDecryption","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"partyIndexes","type":"uint256[]"},{"name":"decryptedShares","type":"uint256[]"}],"name":"reconstruct","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"contributions","type":"uint256[]"}],"name":"computeBeacon","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"nextStage","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"commitment","type":"bytes32"}],"name":"commit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"RegisterReady","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"decrypterAddress","type":"address"},{"indexed":false,"name":"sharerIndex","type":"uint256"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Decryption","type":"event"},{"anonymous":false,"inputs":[],"name":"CommitReady","type":"event"},{"anonymous":false,"inputs":[],"name":"Recover","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"index","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"PublicKey","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"shareIndex","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"shx","type":"uint256"},{"indexed":false,"name":"shy","type":"uint256"},{"indexed":false,"name":"vx","type":"uint256"},{"indexed":false,"name":"vy","type":"uint256"}],"name":"Share","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"comm","type":"bytes32"}],"name":"Commit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Open","type":"event"}]);
// var scrapeContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getG","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"},{"name":"c","type":"bytes32"}],"name":"verifyOpen","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"partyIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"pows","type":"uint256[4]"}],"name":"share","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"sk","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"shx","type":"uint256"},{"name":"shy","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeDecryptionAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"scalar","type":"uint256"},{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"g1mul","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"num","type":"uint256"},{"name":"m","type":"uint256"}],"name":"inv","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getN","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x1","type":"uint256"},{"name":"y1","type":"uint256"},{"name":"x2","type":"uint256"},{"name":"y2","type":"uint256"}],"name":"g1add","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"sec","type":"uint256"}],"name":"computeCommitOpen","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"poly","type":"uint256[]"},{"name":"x0","type":"uint256"}],"name":"evaluatePoly","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"verifyZKP","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getH","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getParty","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tin","type":"uint256"},{"name":"inds","type":"uint256[]"},{"name":"i","type":"uint256"}],"name":"computeLambda","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"computeVerifierHash","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"eva","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeShareAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"bases","type":"uint256[4]"},{"name":"pows","type":"uint256[4]"},{"name":"sec","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sharerIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"decx","type":"uint256"},{"name":"decy","type":"uint256"}],"name":"submitDecryption","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"inds","type":"uint256[]"},{"name":"decs","type":"uint256[]"}],"name":"reconstruct","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"secxys","type":"uint256[]"}],"name":"computeBeacon","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"nextStage","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"comm","type":"bytes32"}],"name":"commit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"addr","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"RegisterReady","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"decrypterAddress","type":"address"},{"indexed":false,"name":"sharerIndex","type":"uint256"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Decryption","type":"event"},{"anonymous":false,"inputs":[],"name":"CommitReady","type":"event"},{"anonymous":false,"inputs":[],"name":"Recover","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"index","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"PublicKey","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"shareIndex","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"shx","type":"uint256"},{"indexed":false,"name":"shy","type":"uint256"},{"indexed":false,"name":"vx","type":"uint256"},{"indexed":false,"name":"vy","type":"uint256"}],"name":"Share","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"comm","type":"bytes32"}],"name":"Commit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Open","type":"event"}]);
// Private:
// var scr = scrapeContract.at("0x48c1bdb954c945a57459286719e1a3c86305fd9e")
// Ropsten:
// var scr = scrapeContract.at("0xe767322db2f802e271bc08dce23758fddba14ae4")
// Rinkeby:
//  var scr = scrapeContract.at("0x29bef9ebef843b8a836a035c9b8abc146848094c");
//  var scr = scrapeContract.at("0x950c1013C7Cd097AE39dAA9F30F7319b8712B282");
var scr = scrapeContract.at("0xc0e15e11306334258d61fee52a22d15e6c9c59e0");

// new address on server
//var scr = scrapeContract.at("0x0575c6f50d35add560712329c04ef48cfd31371c")
//var sks = ['23729686430471474665028963781270542949392357800926127418281145529763290269226', '62938281150811623687266951480678035234964384494475466853359337797946206621653', '52142278597844297784492602082913737415963648415606110279710404758220024324629', '4964866513109948150107856446081734846191697543369454747009359413204953833110', '8398784383134070565423169828443327653321794853232052366121826089259339335214', '113385837810791710969499806893207547662321218200893224802460215750752248498457', '65793496865552822397203396904798869506079127538271744446451091905757816784937', '75225778975903647149650737289605714501370169287190503601816246804569203949579', '51923447634821324016999154849938037575129351509686591152225259037745901488575', '74600063639957000740175569536178937952210390666568550965123197698989601513944', '30014984811878427663767102793416930197800352643613931643158195010647715701197', '56340310102386180784033530287027173277044813128873340740782777001467450140112', '70651695064641333979042899425724744459953747271727793514900492190228354847018', '5605032507364069610831643211264821993001848048808438661167765823620635704514', '46691099815534540933618781994048706060237125679354324409685741524179990094730']
//var pkxys = ["15400898925924455628697357282025745367589073532452415905242735956559240731427", "4919152878048538306242985099310395611145625949517312084286299641399166558785", "10258025139104058285545966716903633983855924984714039508767946031811872348253", "15282087134189015320120457047216214552694786352979094862070376529284523902849", "14751985779927353460996002795418016081979181642253522995887982240019595030051", "10064298872762686998027049432020498779115184662647643502679226802367474358457", "568992174122975438292557394327391198480432464193661096323007725913085629496", "9647229775619093579142847019704042800207628543738185122526085358572640334161", "2874637237272695918993573127061989299104957782877089032706985926147182245936", "10553403605943910809059305461329669053244628614122668037291339063352523816598", "21406494936141235510188499327683028203075849557053295342822501023395531496324", "7165862762694227577337093146851788157622437235259549452777597100675934781286", "19493020885868951830273378509226065088559913413712520720770487828421613371061", "9471377077049251286500514207780267762633909405790132490739490070510605992581", "16399740574646406973981522489445141767505696277111596586657467798529555657592", "19895348605052578409888882616478083032522777542087074628689797715812099063110", "202561064708343536024141333315320367099652780561787295791908615057133653158", "3379215778667905875779087367532994091499213311895784914473827256302841823884", "16477700291243905588586343391363567352742606153085869653545374464444987005853", "17629973926450989733078156017208783228356844324839671253654148793649170817993", "2193552295367462585689224551735806958976518450617417711760573937174402551631", "21244157943624350301990219756644772768894148009553308127079396257074528340302", "3204753275630051955422751242793477746313487048808286596885769502061857937033", "4252740130668790000843121156672588875016694221120970120553760861728288912402", "1637742718243523892114739719661670968178938722824365067127248254450710946790", "7640813462988188570081923601519783748689367568068059657803377412445886032467", "15163819783967521722056740496341349907361316705460212403557865674348088615721", "21579005203954683345798124024029703617597314996695188632186311501913424695522", "2226547209079735155620753524162611291345744081438392334225675821807962043718", "21593203190276775135889802705781421839944657343838673666579604670124712992801"]
//var pkx = ["11655703947628810334007442092807708051406086351334322039849186005567856981652", "10213630684869928383643426791489517789275227822779214232740744937822047008251", "1169420823860038403109251633157999552421728058657356784313616318466336908292", "8932278178094578639461668104498667708633133057823638635926855093396471038138", "1466449501059930744860594791649808764242889933114186241653878792582258951124", "877889502329241721872406732623755692535735360322461256603614320304803840635", "2602954992065707056235014801371059993126429220542078433693830800483803050891", "15144502804283378162179808461885314284873660631361676058273122367823832113829", "1148180649048226841109214511119830762671543589097972797854323141059119017238", "21813400092222235094685001528455594485620505680400588863548301413444914755010", "10075788313516031437038181283025754493558100165914056958845071857190924683347", "11188544593330130984550760342736931164913763467442670151367905217552159587560", "21328111853149307922989254244467356387758726401104527354215570781381579377416", "8896460759755855746460253942647358773224400375261900115905595339708020691592", "19727837367303171261406687755862871373139809549345695562853289220695188710135"]
//var pky = ["8859750448564257432051951267491958100393879143799794085952149058882303067241", "5893092873515628822449268743156826871218416726702850184127545744895864750795", "13811573636418888331738467198156864364752645181141123356798436922210322773847", "6773634131210533086131582145017610307420403316781704377992146016302888261846", "21755034013257843658161437111541494230717067415560682316154845369236382686180", "16518852887335934754392843464895458859613343607762351497435792687257781802770", "12265842225815120101651255838194986786771544427010765069070356083119104025875", "3419083891538977006194251383120828545257312226885188264647180718936623042801", "17524435015240289827246216587568610947177920809130663760797995668283528854909", "12428992982850424805364744311937876555178225908814212771860924106005284285608", "574636507562348454015371457657441212099260340951140388355063094490129342321", "19672426612231044108598412821514820321229805524742629699860401667524074470460", "14953435073499841676264067232746066891497008946121135344036655256756201576185", "21756994568732018728826650609479397747363732838338436199001239056239472666218", "70610963290575571270895337475085936084723515407581526445916556933536471790"]

//userDict = [baoanh,hari,htram,chipu,mytam,alice,bob,lily]
//unlock(myAddr)
var hRaw = 0
var h = {'x':web3.toBigNumber('13948819542717789835963376875155601763567176492584669418761374464658768458469'),'y':web3.toBigNumber('18075546999948929667045307191033175061228884850938363576861812662076385892563')}
var gRaw = 0
var g = {'x':1,'y':web3.toBigNumber('21888242871839275222246405745257275088696311157297823662689037894645226208581')}

// scr.getH.call(function(error, result){
//   if(!error){
//     hRaw = result;
//     h = {'x':hRaw[0],'y':hRaw[1]};
//     scr.getG.call(function(error, result){
//       if(!error){
//           gRaw = result;
//           g = {'x':gRaw[0],'y':gRaw[1]};
//           keyGen();
//       }
//       else
//           console.error(error);
//     });
//   }
//   else
//       console.error(error);
// })


var commitCount = 0
var openCount = 0
var n = 0
var t = 0
var myOpen = {}
var joined = false

//var earlyQuitters = [alice]
//var lateQuitters = []//[chipu,htram]
var myAddr = null
var password = null


var names = ['blank','baoanh','hari','htram','chipu','mytam','alice','bob','lily']
listenAll()

function getCustomRan(){
  var arr = new Uint32Array(8)
  crypto.getRandomValues(arr)
  console.log("Random : " + arr)
  var res = aggregateNums(arr).mod(q)
  return res
}

function keyGen(){
  mySK = secretKeyMap[myAddr]
  scr.g1mul.call(mySK,h.x,h.y, function(error, result){
    if(!error){
      rawPK = result;
      myPK = {'x':rawPK[0], 'y':rawPK[1]}
      console.log("Secret Key :\n"+mySK.toString(10))
      console.log("Public Key :\n"+myPK.x.toString(10) +","+myPK.y.toString(10))
    }
    else
      console.error(error);
  })
}

function aggregateNums(nums){
  var temp = new web3.BigNumber(2)
  temp = temp.pow(32)
  var res = new web3.BigNumber(0)
  for (i1=0;i1<8;i1++){
    res = res.times(temp).plus(nums[i1])
  }
  return res
}

function unlock(addr){
  //console.log(addr)
  if (addr !== undefined){
  // myAddr = web3.eth.accounts[0]
  //   myKeyIndex = userDict.indexOf(addr)
    web3.personal.unlockAccount(addr,password,function(err,res){});
  }
}

function setap(addr, passw){
  if (addr !== undefined){
    myAddr = addr
    // myKeyIndex = userDict.indexOf(addr)
    password = passw
    //console.log(addr + password)
    keyGen()
    connect()
  }
}

function nextStage(){
  unlock(myAddr)
  scr.nextStage.sendTransaction({from:myAddr,value:0,gas:3000000},function(e,r){})
}


function resetLocalStorage(){
  //pks = []
  //addressMap = {}
  validShares = {}
  validDecryptions = {}
  commits = {}
  opens = {}
  decryptions = {}
  commitCount = 0
  openCount = 0
  // n = 0
  // t = 0
}

function reg(){
  if (joined) return;
  unlock(myAddr);
  scr.register.sendTransaction(myPK.x,myPK.y,{from:myAddr,value:0,gas:3000000},function(e,r){})
}

function makeCommit(){
  resetLocalStorage();
  if (!joined) return;
  unlock(myAddr)
  nFixed = n
  tFixed = nFixed/2
  //if (earlyQuitters.indexOf(myAddr)>=0) return;
  
  var sec = getCustomRan()
  var poly = []
  var temp = sec
  for (k=0;k<tFixed;k++){
    poly.push(web3.toBigNumber(temp)%100000000000000)
    temp = web3.toBigNumber(web3.sha3(temp.toString()))
  }
  poly = poly.reverse()
  var w = getCustomRan()
  // console.log("Fucking N = "+nFixed.toString());
  // console.log("POLYN");
  // console.log(poly);
  for (j=1;j<=nFixed;j++){
    var eva = evaluatePoly(poly,j);
    //console.log("PKS : "+pks)
    if (typeof pks[j]=="undefined") return;
    //console.log(pks[j]);
    //console.log("HEYYYY");
    //console.log([eva,pks[j].x,pks[j].y,w]);
    var bundle = scr.computeShareAndProof.call(eva,pks[j].x,pks[j].y,w);
    console.log("Sending share : "+j);
    scr.share.sendTransaction(j,bundle[0].toString(10),bundle[1].toString(10),[bundle[2].toString(10),bundle[3].toString(10),bundle[4].toString(10),bundle[5].toString(10)],{from:myAddr,value:0,gas:3000000},function(e,r){})
    if (j==nFixed){
      var bundle2 = [];
      scr.computeCommitOpen.call(sec,function(error,result){
        if (!error){
          bundle2 = result;
          myOpen = {'x':bundle2[1],'y':bundle2[2]}
          scr.commit.sendTransaction(bundle2[0],{from:myAddr,value:0,gas:3000000},function(e,r){})
        }
        else console.error(error);
      })
    }                  
  }
  
}

function listenAll(){
  var listeners = [scr.RegisterReady(), scr.Decryption(), scr.CommitReady(), scr.Recover(), scr.PublicKey(), scr.Share(), scr.Commit(), scr.Open()]
  listeners[0].watch(function(err, result) {  
      if (err) {    
          console.log(err)    
          return;  
      }  
      console.log('Event : Register Ready')
      //reg()
  })
  listeners[1].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    if (Object.keys(addressMap).length==0) return;
    var decrypterInd = addressMap[result.args.decrypterAddress]
    var sharerInd = result.args.sharerIndex
    var e = result.args.e
    var z = result.args.z
    var decx = result.args.x
    var decy = result.args.y
    console.log('Event : Decryption - '+[decrypterInd,sharerInd])//,e,z,decx,decy])
    if (typeof validShares[sharerInd]=="undefined") return;
    var theShare = validShares[sharerInd][decrypterInd]
    //console.log('Belonging to the share : ' + [theShare.x,theShare.y])
    //console.log([e,z,decx,decy,pks[decrypterInd].x,pks[decrypterInd].y,theShare.x,theShare.y])
    var verifyResult = 0;
    scr.verifyZKP.call(e,z,[h.x,h.y,decx,decy,pks[decrypterInd].x,pks[decrypterInd].y,theShare.x,theShare.y],function(error,result){
      if (!error){
        verifyResult = result;
        console.log('Verify : ' + verifyResult)
        if (verifyResult){
          var temp = validDecryptions[sharerInd] 
          if (!temp) {
            //console.log("Inside")
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
            //console.log("Insider")
            var partyIndexes = []
            var decryptions = []
            for (var ind in temp){
              partyIndexes.push(ind)
              decryptions.push(temp[ind].x)
              decryptions.push(temp[ind].y)
            }
            //console.log([partyIndexes,decryptions])
            var reconstructedSecret = 0;
            scr.reconstruct.call(partyIndexes,decryptions,function(error,result){
              if (!error){
                reconstructedSecret = result;
                console.log("Reconstructed : " + [sharerInd,reconstructedSecret])
                if (!opens[sharerInd]){
                  opens[sharerInd] = {'x':reconstructedSecret[0],'y':reconstructedSecret[1]}
                  openCount++
                  if (openCount==commitCount){
                    console.log("Finalizing")
                    var bundle = []
                    for (j3=1;j3<=n;j3++){
                      if (opens[j3]){
                        bundle.push(opens[j3].x)
                        bundle.push(opens[j3].y)
                      }
                    }
                    var beacon = 0;
                    scr.computeBeacon.call(bundle,function(error,result){
                      if (!error){
                        beacon = result;
                        console.log('Beacon : ' + beacon.toString(10));
                        updateResult(beacon);
                        resetLocalStorage();
                      }
                      else console.error(error);
                    })
                    return
                  }
                }
              }
              else console.error(error);
            })   
          }
        }
      }
      else console.error(error);
    })
  })
  listeners[2].watch(function(err, result) {
    if (err || pks.length==0) {
      console.log(err)
      return;
    }
    console.log('Event : Commit Ready')
    //makeCommit()
  })
  listeners[3].watch(function(err, result) {
    if (err) {
      console.log(err)  
      return;
    }
    console.log('Event : Recover')
  })
  listeners[4].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    var ind = result.args.index ;
    console.log('Event : Public Key - '+ind+','+web3.toBigNumber(result.args.partyAddress).toString(16))//+','+result.args.x+','+result.args.y);
    //console.log(result.args.partyAddress);
    //console.log(myAddr);
    if (result.args.partyAddress==myAddr) joined = true;
    addressMap[result.args.partyAddress] = ind;
    pks[ind] = {'x':result.args.x, 'y': result.args.y};
    if (ind>n) n=ind;
  })
  listeners[5].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    var partyInd = addressMap[result.args.partyAddress]
    // console.log("PARTY");
    // console.log(partyInd);
    var shareInd = result.args.shareIndex
    var e = result.args.e
    var z = result.args.z
    var shx = result.args.shx
    var shy = result.args.shy
    var vx = result.args.vx
    var vy = result.args.vy
    var thatPK = pks[shareInd]
    console.log('Event : Share - '+shareInd+','+partyInd)//+result.args.e+','+result.args.z+','+result.args.shx+','+result.args.shy+','+result.args.vx+','+result.args.vy)
    // console.log("Verifying Share : "+[shx.toString(10),shy.toString(10)])
    // console.log("With v : " + [vx.toString(10),vy.toString(10)])
    // console.log("With e : " + e.toString(10))
    // console.log("With z : " + z.toString(10))
    var verifyResult = 0;
    scr.verifyZKP.call(e,z,[thatPK.x,thatPK.y,g.x,g.y,shx,shy,vx,vy],function(error,result){
      if (!error){
        verifyResult = result;
        console.log('Verify : '+verifyResult)
        if (verifyResult){
        var temp = validShares[partyInd] 
        if (!temp) {
          temp = {}
          temp[shareInd] = {'x':shx,'y':shy}
          validShares[partyInd] = temp
        }
        else{
          
          temp[shareInd] = {'x':shx,'y':shy}
        }
          if (Object.keys(temp).length==n){
            commitCount++
            temp[0] = "full"
            console.log("" + commitCount + " commits successfully verified")
          }     
        }
      }
      else console.error(error);
    })
  })
  listeners[6].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    var partyInd = addressMap[result.args.partyAddress]
    console.log('Event : Commit\n'+partyInd+','+result.args.comm)
    
    commits[partyInd] = result.args.comm
  })
  listeners[7].watch(function(err, result) {
    if (err) {
      console.log(err)
      return;
    }
    if (pks.length == 0) return;
    var partyInd = addressMap[result.args.partyAddress]
    var x = result.args.x
    var y = result.args.y
    console.log('Event : Open - '+partyInd)
    var verifyResult = 0
    scr.verifyOpen.call(x,y,commits[partyInd],function(error,result){
      if (!error){
        verifyResult = result;
        if (verifyResult){
          console.log("Successfully verified")
          opens[partyInd] = {'x':x,'y':y}
          openCount++
          if (openCount==commitCount){
            console.log("Finalizing")
            var bundle = []
            for (j2=1;j2<=n;j2++){
              if (opens[j2]){
                bundle.push(opens[j2].x)
                bundle.push(opens[j2].y)
              }
            }
            var beacon = 0
            scr.computeBeacon.call(bundle,function(error,result){
              if (!error){
                beacon = result;
                console.log('Beacon : ' + beacon.toString(10));
                updateResult(beacon);
                resetLocalStorage();
              }
              else console.error(error);
            })
            return
          }
        }
      }
      else console.error(error);
    })
  })
}

function connect(){
  syncParties();
  startBlockWatcher();
}

function syncParties(){
  n = scr.getN.call();
  for (j1=0;j1<n;j1++){
    var result = scr.getParty.call(j1);
    //console.log(typeof result[0]);
    if (result[0]==myAddr) joined = true;
    addressMap[result[0]] = j1+1;
    pks[j1+1] = {'x':result[1],'y':result[2]};
  }
  console.log("JOINED = "+joined);
}

function startBlockWatcher(){
  var blockWatcher = web3.eth.filter('latest');
  blockWatcher.watch(function(error,result){
    params = [3,4,4,3]
    var sum = params[0] + params[1] + params[2] + params[3]
    if (!error){
      
      watcherCounter = web3.eth.blockNumber % sum;
      var temp = watcherCounter;
      console.log("Block : "+temp);
      if (temp == sum-1){
        reg();
      }
      else if (pks.length == 0) return;
      else if (temp == params[0]-1){
        makeCommit();
      }
      else if (temp == params[0]+params[1]-1){
        if (myOpen.length==0) return;
        scr.open.sendTransaction(myOpen.x,myOpen.y,{from:myAddr,value:0,gas:3000000},function(e,r){});
      }
      else if (temp == params[0]+params[1]+params[2]-1){
        initiateRecover();
      }
    }
    else console.log("Watch failed ! ");
  });
}

function initiateRecover(){
  unlock(myAddr)
  for (i3=1;i3<=n;i3++){
    if (!commits[i3]) continue;		// registered but not committed
    //console.log('Party '+i3+' passed commit')
    var shareSet = validShares[i3];
    if (!shareSet[0]) continue;		// committed but not all shares successfully verified 
    if (opens[i3]) continue;			// committed and revealed a valid open value
    console.log('Party '+i3+" 's reveal missing")
    var myInd = addressMap[myAddr]
    var w = getCustomRan()
    // e, z, decx, decy
    console.log("Producing decryption ")//+[sks[myKeyIndex],pks[myInd].x,pks[myInd].y,shareSet[myInd].x,shareSet[myInd].y,w])
    var bundle = scr.computeDecryptionAndProof.call(mySK,myPK.x,myPK.y,shareSet[myInd].x,shareSet[myInd].y,w);
    scr.submitDecryption.sendTransaction(i3, bundle[0], bundle[1], bundle[2], bundle[3],{from:myAddr,value:0,gas:3000000},function(e,r){});
  }
}

function updateResult(bea){
  var num = new web3.BigNumber(bea)
  document.getElementById("result").innerHTML = document.getElementById("result").innerHTML +'\n'+ num.toString(10)
}

function evaluatePoly(myPolynomial, x0){
  l = myPolynomial.length;
  result = web3.toBigNumber(0);
  for (i2=0;i2<l;i2++){
      result = result*x0 % q;
      result = (result+myPolynomial[i2]) % q;
  }
  return result;
}