pragma solidity ^0.4.19;

contract PVSS{
    uint n;
    //uint t;
    // uint registerCount;
    // uint commitCount;
    // uint openCount;

    // struct Point{
    //     uint256 x;
    //     uint256 y;
    // }
    uint256 constant hx = 55066263022277343669578718895168534326250603453777594175500187360389116729240;
    uint256 constant hy = 32670510020758816978083085130507043184471273380659243275938904335757337482424;
    uint256 constant gx = 12491534207990215330120135635581023921030258456695817555828929191238709288092;
    uint256 constant gy = 104340201949375786418227580263545657674427888456142663625569746313246079959670;
    // uint256[4] pkxs;
    // uint256[4] pkys;
    // uint256[] decryptions;
    // uint256[] decryptIndex;
    // uint256[16] mypows;
    // mapping(address => uint) partyIndexes;
    // mapping(address => bytes32) commits;
    // mapping(uint => Point) opens;
    
    uint256 constant p = 115792089237316195423570985008687907853269984665640564039457584007908834671663;
    uint256 constant a = 0;
    uint256 constant b = 7;
    uint256 constant q = 115792089237316195423570985008687907852837564279074904382605163141518161494337;
    address owner;
    uint8 stage; // 0: register, 1: commit-open, 2: recover

    event RegisterReady();
    event Decryption(address decrypterAddress, uint256 sharerIndex, uint256 e, uint256 z, uint256 x, uint256 y);
    event CommitReady();
    event Recover();
    event PublicKey(uint256 index, address partyAddress, uint256 x, uint256 y );
    event Share(uint256 shareIndex, address partyAddress, uint256 e, uint256 z, uint256 shx, uint256 shy, uint256 vx, uint256 vy);
    //event Proof0(uint256 partyIndex, uint256 e); //e
    //event Proof1(uint256 shareindex, address partyAddress, uint256 z); //z
    //event Proof2(uint256 shareindex, address partyAddress, uint256 x, uint256 y); //v
    event Commit(address partyAddress, bytes32 comm);
    event Open(address partyAddress, uint256 x, uint256 y);
    // event Beacon(bytes32 beacon);
    
    function PVSS() public{
        owner = msg.sender;
        n = 0;
        stage = 2;
        //t = 2;
        // registerCount = 1;
        // commitCount = 0;
        // openCount = 0;
        // (hx, hy) = (55066263022277343669578718895168534326250603453777594175500187360389116729240,
        //         32670510020758816978083085130507043184471273380659243275938904335757337482424);
        // (gx, gy) = (12491534207990215330120135635581023921030258456695817555828929191238709288092,
        //         104340201949375786418227580263545657674427888456142663625569746313246079959670);
        // p = 115792089237316195423570985008687907853269984665640564039457584007908834671663;
        // a = 0;
        // b = 7;
        // q = 115792089237316195423570985008687907852837564279074904382605163141518161494337;
        //pkxs = new uint256[](4);
        //pkys = new uint256[](4);
    }
    
    function register(uint256 pkx, uint256 pky) payable{
        // TODO : verify public key
        // then emit the key and increment n
        if (stage!=0) return;
        n++;
        PublicKey(n, msg.sender, pkx, pky );
        // if (registerCount==n){
        //     return;
        // }
        // pkxs[registerCount-1] = pkx;
        // pkys[registerCount-1] = pky;
        // partyIndexes[msg.sender] = registerCount;
        // registerCount++;
        // if (registerCount==n){
        //     CommitReady(true);
        // } 
        // return pkxs.length;
    }
    
    // function getPK() view returns (uint256, uint256, uint256){
    //     return (pkxs[0], pkxs[3], pkys[3]);
    // }
    
    // function registerAll(uint count, uint256[8] xys) payable{
    //     for (uint i=0;i<count;i++){
    //         pkxs[i] = xys[2*i];
    //         pkys[i] = xys[2*i+1];
    //     }
    // }
    
    function evaluatePoly(uint256[] poly, uint256 x0) pure returns (uint256){
        uint l = poly.length;
        uint256 result = 0;
        for (uint i=0;i<l;i++){
            result = mulmod(result,x0,q);
            result = addmod(result,poly[i],q);
        }
        return result;
    }
    
    function computeCommitOpen(uint256 sec) pure returns (bytes32,uint256,uint256){
        uint256 openx;
        uint256 openy;
        (openx,openy) = mul(sec,hx,hy);
        bytes32 comm = keccak256(openx,openy);
        return (comm,openx,openy);
    }
    
    function computeProof(uint256[4] bases, uint256[4] pows, uint256 sec, uint256 w) pure returns (uint256, uint256){
        uint256[4] memory localPows;
        
        (localPows[0],localPows[1]) = mul(w,bases[0],bases[1]);
        (localPows[2],localPows[3]) = mul(w,bases[2],bases[3]);
        bytes32 rawE = keccak256(pows,localPows);
        uint256 numE = uint256(rawE) % q;
        uint256 z = addmod(w, q-mulmod(sec,numE,q),q);
        return (numE,z);
    }
    
    function computeShareAndProof(uint256 eva, uint256 pkx, uint256 pky, uint256 w) pure returns (uint256,uint256,uint256,uint256,uint256,uint256){
        uint256[4] memory localPows;
        uint256 e;
        uint256 z;
        (localPows[0],localPows[1]) = mul(eva,pkx,pky);
        (localPows[2],localPows[3]) = mul(eva,gx,gy);
        (e,z) = computeProof([pkx,pky,gx,gy],localPows,eva,w);
        return (e,z,localPows[0],localPows[1],localPows[2],localPows[3]);
    }
    
    function getH() pure returns (uint256,uint256){
        return (hx,hy);
    }
    
    function getG() pure returns (uint256,uint256){
        return (gx,gy);
    }
    
    function getN() view returns (uint256){return n;}
    function getT() view returns (uint256){return n/2;}
    
    function computeDecryptionAndProof(uint256 sk, uint256 pkx, uint256 pky, uint256 shx, uint256 shy, uint256 w) pure returns (uint256,uint256,uint256,uint256){
        uint256[4] memory locals;
        // uint256 decx;
        // uint256 decy;
        (locals[0],locals[1]) = mul(inv(sk,q),shx,shy);
        // uint256 e;
        // uint256 z;
        (locals[2],locals[3]) = computeProof([hx,hy,locals[0],locals[1]],[pkx,pky,shx,shy],sk,w);
        return (locals[2],locals[3],locals[0],locals[1]);
    }
    
    // function computeCommonE(uint256[] eArr) pure returns (uint256){
    //     return sha3(eArr);
    // }
    
    function nextStage() payable{
        if (msg.sender==owner){
            if (stage==2){
                n = 0;
                RegisterReady();
                stage = 0;
            }
            else if (stage==0){
                CommitReady();
                stage = 1;
            }
            else {
                Recover();
                stage = 2;
            }
        }
    }
    
    function share(uint256 partyIndex, uint256 e, uint256 z, uint256[4] pows) payable{
        if (stage!=1) return;
        Share(partyIndex, msg.sender, e, z, pows[0], pows[1], pows[2], pows[3]);
    }
    function commit(bytes32 comm) payable{
        if (stage!=1) return;
        Commit(msg.sender, comm);
    }
    
    function open(uint256 x, uint256 y) payable{
        if (stage!=1) return;
        Open(msg.sender,x,y);
        // if (sha3(x,y) == commits[msg.sender]){
        //     opens[partyIndexes[msg.sender]] = Point(x,y);
        //     openCount++;
        //     if (openCount == commitCount){
        //         finalize();
        //     }
        //     return true;
        // }
        // return true;
    }
    
    function verifyOpen(uint256 x, uint256 y, bytes32 c) pure returns (bool){
        return keccak256(x,y)==c;
    }
    
    // TODO
    // function verifyCodingTh(uint256[4] shares) returns (bool){
    //     return true;
    // }
    
    function computeVerifierHash(uint256 e, uint256 z, uint256[8] nums) pure returns(uint256){
        uint256[6] memory locals;

        (locals[0],locals[1]) = mul(z,nums[0],nums[1]);
        (locals[4],locals[5]) = mul(e,nums[4],nums[5]);
        (locals[0],locals[1]) = add(locals[0],locals[1],locals[4],locals[5]);
        
        (locals[2],locals[3]) = mul(z,nums[2],nums[3]);
        (locals[4],locals[5]) = mul(e,nums[6],nums[7]);
        (locals[2],locals[3]) = add(locals[2],locals[3],locals[4],locals[5]);
        bytes32 rawE = keccak256(nums[4],nums[5],nums[6],nums[7],locals[0],locals[1],locals[2],locals[3]);
        uint256 numE = uint256(rawE) % q;
        return numE;
    }

    function verifyZKP(uint256 e, uint256 z, uint256[8] nums) pure returns(bool){
        return computeVerifierHash(e,z,nums)==e;
    }
    
//     function verifyZKPs(uint256 e, uint256[4] z, uint256[16] pows) view returns (bytes32){
//         bytes32[4]  memory arr;
//         //for (uint i=0;i<2;i++){
// //        arr[i] = verifyZKPPart(e,z[i],[pkxs[i],pkys[i],gx,gy,pows[4*i],pows[4*i+1],pows[4*i+2],pows[4*i+3]]);
//         //arr[0] = verifyZKPPart(e,z[0],[pkxs[0],pkys[0],gx,gy,pows[0],pows[1],pows[2],pows[3]]);
//         //arr[1] = verifyZKPPart(e,z[1],[pkxs[1],pkys[1],gx,gy,pows[4],pows[5],pows[6],pows[7]]);
//         arr[2] = verifyZKPPart(e,z[2],[pkxs[2],pkys[2],gx,gy,pows[8],pows[9],pows[10],pows[11]]);
//         arr[2] = verifyZKPPart(e,z[2],[pkxs[2],pkys[2],gx,gy,pows[8],pows[9],pows[10],pows[11]]);
//         arr[3] = verifyZKPPart(e,z[3],[pkxs[3],pkys[3],gx,gy,pows[12],pows[13],pows[14],pows[15]]);
//         //bytes32 num1 = verifyZKPPart(0,1,[uint256(1),2,3,4,5,6,7,8]);
//         //bytes32 num2 = verifyZKPPart(0,1,[uint256(1),2,3,4,5,6,7,8]);
//         //bytes32 num3 = verifyZKPPart(0,1,[uint256(1),2,3,4,5,6,7,8]);
//         //uint256 num4 = verifyZKPPart(0,1,[uint256(1),2,3,4,5,6,7,8]);

//         return arr[0];
//         //return sha3(arr);
//     }
    
    // function requestDecryption(uint[] missingOpens){

    // }

// base1x,base1y, base2x,base2y, pow... 
    function submitDecryption(uint256 sharerIndex, uint256 e, uint256 z, uint256 decx, uint256 decy) payable{
        if (stage!=2) return;
        Decryption(msg.sender, sharerIndex, e, z, decx, decy);
    }

    function computeBeacon(uint256[] secxys) pure returns (uint256,uint256){
        uint256 resultx = 0;
        uint256 resulty = 0;
        uint l = secxys.length/2;
        for (uint i =0;i<l;i++){
            (resultx,resulty) = add(resultx,resulty,secxys[2*i],secxys[2*i+1]);
        }
        return (resultx,resulty);
    }

    function reconstruct(uint256[] inds, uint256[] decs) pure returns (uint256,uint256){
        uint tin = inds.length;
        uint256 resultx = 0;
        uint256 resulty = 0;
        uint256 tempx = 0;
        uint256 tempy = 0;
        for (uint i=0;i<tin;i++){
            (tempx,tempy) = mul(computeLambda(tin,inds,i),decs[2*i],decs[2*i+1]);
            (resultx,resulty) = add(resultx, resulty, tempx, tempy);
        }
        return (resultx,resulty);
    }
    
    function computeLambda(uint tin, uint256[] inds, uint i) pure returns (uint256){
        uint256 lamb = 1;
        for (uint j=0;j<tin;j++){
            if (i==j) {continue;}
            else{
                lamb = mulmod(lamb,inds[j],q);
                lamb = mulmod(lamb,inv(addmod(inds[j],q-inds[i],q),q),q);
            }
        }
        return lamb;
    }
//    "55066263022277343669578718895168534326250603453777594175500187360389116729240","32670510020758816978083085130507043184471273380659243275938904335757337482424"

    function isInf(uint256 x, uint256 y) pure returns (bool) {
        return (x | y) == 0;
    }

    function inv(uint256 num, uint256 m) pure returns (uint256){
        uint256 r1 = m;
        uint256 r2 = num;
        uint256 s1 = 1;
        uint256 s2 = 0;
        uint256 t1 = 0;
        uint256 t2 = 1;
        uint256 t3 = 0;
        uint256 s3 = 0;
        uint256 rr = 0;
        uint256 qin = 0;
        while (r2 != 0){
            qin = r1 / r2;
            rr = r1 % r2;
            r1 = r2;
            s3 = s2;
            t3 = t2;
            r2 = rr;
            s2 = addmod(s1, m - mulmod(s2,qin,m),m);
            s1 = s3;
            t2 = addmod(t1, m - mulmod(t2,qin,m),m);
            t1 = t3;
        }
        return t1;
    }

    function add(uint256 x1, uint256 y1, uint256 x2, uint256 y2) pure returns (uint256, uint256) {
        if (isInf(x1,y1)){
            return (x2,y2);
        }
        if (isInf(x2,y2)){
            return (x1,y1);
        }
        if (x1 == x2){
            if (y1 == y2){
                return double(x1,y1);
            }
            return (0,0);
        }
        //uint256 m = mulmod(addmod(a,mulmod(mulmod(3,x1,p),x1,p)) , inv(mulmod(2,y1,p)))
        uint256 m = mulmod(addmod(y1,p-y2,p) , inv(addmod(x1,p-x2,p),p), p);
        uint256 x = addmod(mulmod(m,m,p),addmod(p-x1,p-x2,p), p);
        uint256 y = p - addmod(y1,mulmod(m,addmod(x,p-x1,p),p),p);
        
        return (x,y);
    }

    function double(uint256 x1, uint256 y1) pure returns (uint256, uint256){
        uint256 m = mulmod(addmod(a,mulmod(mulmod(3,x1,p),x1,p),p) , inv(mulmod(2,y1,p),p),p);
        uint256 x = addmod(mulmod(m,m,p),addmod(p-x1,p-x1,p), p);
        uint256 y = p - addmod(y1,mulmod(m,addmod(x,p-x1,p),p),p);
        
        return (x,y);
    }

    function mul(uint256 k, uint256 x, uint256 y) pure returns (uint256,uint256){
        uint256 resultx = 0;
        uint256 resulty = 0;
        uint256 num = k;
        uint256 currentx = x;
        uint256 currenty = y;
        while (num != 1){
            if (num%2!=0){
                (resultx,resulty) = add(resultx,resulty,currentx,currenty);
            }
            (currentx,currenty) = double(currentx,currenty);
            num >>= 1;
        }
        (resultx,resulty) = add(resultx,resulty,currentx,currenty);
        return (resultx,resulty);
    }
    
    // function simple(bool inp, bool inp2) pure returns (bool){
    //     return true;
    // }
}


// deployment
var pvssContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getG","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"},{"name":"c","type":"bytes32"}],"name":"verifyOpen","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"partyIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"pows","type":"uint256[4]"}],"name":"share","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"sk","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"shx","type":"uint256"},{"name":"shy","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeDecryptionAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"num","type":"uint256"},{"name":"m","type":"uint256"}],"name":"inv","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getN","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"isInf","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"sec","type":"uint256"}],"name":"computeCommitOpen","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"poly","type":"uint256[]"},{"name":"x0","type":"uint256"}],"name":"evaluatePoly","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"verifyZKP","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"getH","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"tin","type":"uint256"},{"name":"inds","type":"uint256[]"},{"name":"i","type":"uint256"}],"name":"computeLambda","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"nums","type":"uint256[8]"}],"name":"computeVerifierHash","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"eva","type":"uint256"},{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeShareAndProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"bases","type":"uint256[4]"},{"name":"pows","type":"uint256[4]"},{"name":"sec","type":"uint256"},{"name":"w","type":"uint256"}],"name":"computeProof","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"sharerIndex","type":"uint256"},{"name":"e","type":"uint256"},{"name":"z","type":"uint256"},{"name":"decx","type":"uint256"},{"name":"decy","type":"uint256"}],"name":"submitDecryption","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"pkx","type":"uint256"},{"name":"pky","type":"uint256"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x1","type":"uint256"},{"name":"y1","type":"uint256"}],"name":"double","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"x1","type":"uint256"},{"name":"y1","type":"uint256"},{"name":"x2","type":"uint256"},{"name":"y2","type":"uint256"}],"name":"add","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"inds","type":"uint256[]"},{"name":"decs","type":"uint256[]"}],"name":"reconstruct","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"secxys","type":"uint256[]"}],"name":"computeBeacon","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"k","type":"uint256"},{"name":"x","type":"uint256"},{"name":"y","type":"uint256"}],"name":"mul","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"nextStage","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"comm","type":"bytes32"}],"name":"commit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[],"name":"RegisterReady","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"decrypterAddress","type":"address"},{"indexed":false,"name":"sharerIndex","type":"uint256"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Decryption","type":"event"},{"anonymous":false,"inputs":[],"name":"CommitReady","type":"event"},{"anonymous":false,"inputs":[],"name":"Recover","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"index","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"PublicKey","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"shareIndex","type":"uint256"},{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"e","type":"uint256"},{"indexed":false,"name":"z","type":"uint256"},{"indexed":false,"name":"shx","type":"uint256"},{"indexed":false,"name":"shy","type":"uint256"},{"indexed":false,"name":"vx","type":"uint256"},{"indexed":false,"name":"vy","type":"uint256"}],"name":"Share","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"comm","type":"bytes32"}],"name":"Commit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"partyAddress","type":"address"},{"indexed":false,"name":"x","type":"uint256"},{"indexed":false,"name":"y","type":"uint256"}],"name":"Open","type":"event"}]);
var pvss = pvssContract.new(
   {
     from: web3.eth.accounts[0], 
     data: '0x6060604052341561000f57600080fd5b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600080819055506002600160146101000a81548160ff021916908360ff1602179055506122aa806100826000396000f300606060405260043610610154576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806304c09ce91461015957806309c79dfd1461018957806311028ba3146101da578063183847f11461023057806322554f34146102a9578063338255f3146102d25780633e955225146103125780634082de671461033b57806372939df91461035c57806376680531146103a0578063798340cd146103ed5780637eeba8541461046457806382529fdb146104d557806397ecd968146105055780639a423aa914610585578063a4f35e46146105f2578063aa9a56da14610667578063d106ea0914610706578063d66d6c1014610742578063d89adb1d14610763578063e022d77c146107aa578063e12035f514610803578063e5b6e305146108b8578063e91cac2d1461092d578063ee3743ab1461097d578063f14fcbc814610987575b600080fd5b341561016457600080fd5b61016c6109a3565b604051808381526020018281526020019250505060405180910390f35b341561019457600080fd5b6101c06004808035906020019091908035906020019091908035600019169060200190919050506109f0565b604051808215151515815260200191505060405180910390f35b61022e60048080359060200190919080359060200190919080359060200190919080608001906004806020026040519081016040528092919082600460200280828437820191505050505091905050610a23565b005b341561023b57600080fd5b61027e6004808035906020019091908035906020019091908035906020019091908035906020019091908035906020019091908035906020019091905050610b31565b6040518085815260200184815260200183815260200182815260200194505050505060405180910390f35b34156102b457600080fd5b6102bc610ced565b6040518082815260200191505060405180910390f35b34156102dd57600080fd5b6102fc6004808035906020019091908035906020019091905050610d03565b6040518082815260200191505060405180910390f35b341561031d57600080fd5b610325610da1565b6040518082815260200191505060405180910390f35b61035a6004808035906020019091908035906020019091905050610daa565b005b341561036757600080fd5b6103866004808035906020019091908035906020019091905050610e42565b604051808215151515815260200191505060405180910390f35b34156103ab57600080fd5b6103c16004808035906020019091905050610e51565b604051808460001916600019168152602001838152602001828152602001935050505060405180910390f35b34156103f857600080fd5b61044e600480803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091908035906020019091905050610ee0565b6040518082815260200191505060405180910390f35b341561046f57600080fd5b6104bb6004808035906020019091908035906020019091908061010001906008806020026040519081016040528092919082600860200280828437820191505050505091905050610f77565b604051808215151515815260200191505060405180910390f35b34156104e057600080fd5b6104e8610f8f565b604051808381526020018281526020019250505060405180910390f35b341561051057600080fd5b61056f600480803590602001909190803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091908035906020019091905050610fdc565b6040518082815260200191505060405180910390f35b341561059057600080fd5b6105dc6004808035906020019091908035906020019091908061010001906008806020026040519081016040528092919082600860200280828437820191505050505091905050611118565b6040518082815260200191505060405180910390f35b34156105fd57600080fd5b61062e60048080359060200190919080359060200190919080359060200190919080359060200190919050506114e0565b60405180878152602001868152602001858152602001848152602001838152602001828152602001965050505050505060405180910390f35b341561067257600080fd5b6106e960048080608001906004806020026040519081016040528092919082600460200280828437820191505050505091908060800190600480602002604051908101604052809291908260046020028082843782019150505050509190803590602001909190803590602001909190505061168d565b604051808381526020018281526020019250505060405180910390f35b610740600480803590602001909190803590602001909190803590602001909190803590602001909190803590602001909190505061185f565b005b6107616004808035906020019091908035906020019091905050611913565b005b341561076e57600080fd5b61078d60048080359060200190919080359060200190919050506119c7565b604051808381526020018281526020019250505060405180910390f35b34156107b557600080fd5b6107e66004808035906020019091908035906020019091908035906020019091908035906020019091905050611bbd565b604051808381526020018281526020019250505060405180910390f35b341561080e57600080fd5b61089b60048080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509190803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091905050611e3a565b604051808381526020018281526020019250505060405180910390f35b34156108c357600080fd5b610910600480803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091905050611eef565b604051808381526020018281526020019250505060405180910390f35b341561093857600080fd5b6109606004808035906020019091908035906020019091908035906020019091905050611f84565b604051808381526020018281526020019250505060405180910390f35b61098561201e565b005b6109a1600480803560001916906020019091905050612197565b005b6000807f1b9df533287272a7e645e2f02912f10142d448137a41e36fa749f2fbe4fc1c9c7fe6ae7624588e6fe9995884910789ffef3ef5bd6a2ccf8d482c6a072baca7c276915091509091565b60008160001916848460405180838152602001828152602001925050506040518091039020600019161490509392505050565b60018060149054906101000a900460ff1660ff16141515610a4357610b2b565b7f374bfa601dcc9f096aee03430a1112769e8bd1ec096ce83a57779ec5b076890d84338585856000600481101515610a7757fe5b6020020151866001600481101515610a8b57fe5b6020020151876002600481101515610a9f57fe5b6020020151886003600481101515610ab357fe5b6020020151604051808981526020018873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018781526020018681526020018581526020018481526020018381526020018281526020019850505050505050505060405180910390a15b50505050565b600080600080610b3f61222e565b610b73610b6c8c7ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141610d03565b8989611f84565b826000600481101515610b8257fe5b60200201836001600481101515610b9557fe5b6020020182815250828152505050610c576080604051908101604052807f79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f8179881526020017f483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b88152602001836000600481101515610c0d57fe5b60200201518152602001836001600481101515610c2657fe5b60200201518152506080604051908101604052808d81526020018c81526020018b81526020018a8152508d8961168d565b826002600481101515610c6657fe5b60200201836003600481101515610c7957fe5b6020020182815250828152505050806002600481101515610c9657fe5b6020020151816003600481101515610caa57fe5b6020020151826000600481101515610cbe57fe5b6020020151836001600481101515610cd257fe5b60200201519450945094509450509650965096509692505050565b60006002600054811515610cfd57fe5b04905090565b60008060008060008060008060008060008b99508c985060019750600096506000955060019450600093506000925060009150600090505b600089141515610d8e57888a811515610d5057fe5b049050888a811515610d5e57fe5b0691508899508692508493508198508b8c8289098d03890896508297508b8c8287098d0387089450839550610d3b565b859a505050505050505050505092915050565b60008054905090565b60018060149054906101000a900460ff1660ff16141515610dca57610e3e565b7f5e3c8f6b552a3ff0e973b330d0768aa08ae9dfb0106405d51377c98e032e9b06338383604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001828152602001935050505060405180910390a15b5050565b60008082841714905092915050565b600080600080600080610ea5877f79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f817987f483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8611f84565b809350819450505082826040518083815260200182815260200192505050604051809103902090508083839550955095505050509193909250565b6000806000808551925060009150600090505b82811015610f6b577ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036414185830991507ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd03641418682815181101515610f5057fe5b90602001906020020151830891508080600101915050610ef3565b81935050505092915050565b600083610f85858585611118565b1490509392505050565b6000807f79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f817987f483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8915091509091565b600080600060019150600090505b8581101561110c5780841415610fff576110ff565b7ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141858281518110151561102e57fe5b90602001906020020151830991507ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd03641416110fa7ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141878781518110151561108f57fe5b906020019060200201517ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd03641410388858151811015156110c957fe5b90602001906020020151087ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141610d03565b830991505b8080600101915050610fea565b81925050509392505050565b6000611122612256565b6000806111568686600060088110151561113857fe5b602002015187600160088110151561114c57fe5b6020020151611f84565b84600060068110151561116557fe5b6020020185600160068110151561117857fe5b60200201828152508281525050506111b78786600460088110151561119957fe5b60200201518760056008811015156111ad57fe5b6020020151611f84565b8460046006811015156111c657fe5b602002018560056006811015156111d957fe5b602002018281525082815250505061123f8360006006811015156111f957fe5b602002015184600160068110151561120d57fe5b602002015185600460068110151561122157fe5b602002015186600560068110151561123557fe5b6020020151611bbd565b84600060068110151561124e57fe5b6020020185600160068110151561126157fe5b60200201828152508281525050506112a08686600260088110151561128257fe5b602002015187600360088110151561129657fe5b6020020151611f84565b8460026006811015156112af57fe5b602002018560036006811015156112c257fe5b6020020182815250828152505050611301878660066008811015156112e357fe5b60200201518760076008811015156112f757fe5b6020020151611f84565b84600460068110151561131057fe5b6020020185600560068110151561132357fe5b602002018281525082815250505061138983600260068110151561134357fe5b602002015184600360068110151561135757fe5b602002015185600460068110151561136b57fe5b602002015186600560068110151561137f57fe5b6020020151611bbd565b84600260068110151561139857fe5b602002018560036006811015156113ab57fe5b60200201828152508281525050508460046008811015156113c857fe5b60200201518560056008811015156113dc57fe5b60200201518660066008811015156113f057fe5b602002015187600760088110151561140457fe5b602002015186600060068110151561141857fe5b602002015187600160068110151561142c57fe5b602002015188600260068110151561144057fe5b602002015189600360068110151561145457fe5b60200201516040518089815260200188815260200187815260200186815260200185815260200184815260200183815260200182815260200198505050505050505050604051809103902091507ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036414182600190048115156114d057fe5b0690508093505050509392505050565b6000806000806000806114f161222e565b6000806114ff8d8d8d611f84565b84600060048110151561150e57fe5b6020020185600160048110151561152157fe5b602002018281525082815250505061157a8d7f1b9df533287272a7e645e2f02912f10142d448137a41e36fa749f2fbe4fc1c9c7fe6ae7624588e6fe9995884910789ffef3ef5bd6a2ccf8d482c6a072baca7c276611f84565b84600260048110151561158957fe5b6020020185600360048110151561159c57fe5b60200201828152508281525050506116176080604051908101604052808e81526020018d81526020017f1b9df533287272a7e645e2f02912f10142d448137a41e36fa749f2fbe4fc1c9c81526020017fe6ae7624588e6fe9995884910789ffef3ef5bd6a2ccf8d482c6a072baca7c276815250848f8d61168d565b8092508193505050818184600060048110151561163057fe5b602002015185600160048110151561164457fe5b602002015186600260048110151561165857fe5b602002015187600360048110151561166c57fe5b60200201519850985098509850985098505050509499939850945094509450565b60008061169861222e565b60008060006116ce878b60006004811015156116b057fe5b60200201518c60016004811015156116c457fe5b6020020151611f84565b8560006004811015156116dd57fe5b602002018660016004811015156116f057fe5b602002018281525082815250505061172f878b600260048110151561171157fe5b60200201518c600360048110151561172557fe5b6020020151611f84565b85600260048110151561173e57fe5b6020020186600360048110151561175157fe5b602002018281525082815250505088846040518083600460200280838360005b8381101561178c578082015181840152602081019050611771565b5050505090500182600460200280838360005b838110156117ba57808201518184015260208101905061179f565b5050505090500192505050604051809103902092507ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036414183600190048115156117fe57fe5b0691507ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036414180838a097ffffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036414103880890508181955095505050505094509492505050565b6002600160149054906101000a900460ff1660ff161415156118805761190c565b7f6bcd6fab31e08feeaaac71b7498f19294d68e0b5e67cf435805d0020e2a378ff338686868686604051808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001868152602001858152602001848152602001838152602001828152602001965050505050505060405180910390a15b5050505050565b6000600160149054906101000a900460ff1660ff16141515611934576119c3565b60008081548092919060010191905055507f8e7adf969a64f4532dc9b0aeed36db4d01760f5a01ad64d48351c86a963d1da9600054338484604051808581526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200182815260200194505050505060405180910390a15b5050565b60008060008060007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f611a3e7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f886002097ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f610d03565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f808a7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f8c600309096000080992507ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f80887ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f03897ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f03087ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f8586090891507ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f897ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f038508850987087ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f0390508181945094505050509250929050565b6000806000806000611bcf8989610e42565b15611bdf57868694509450611e2e565b611be98787610e42565b15611bf957888894509450611e2e565b86891415611c2e5785881415611c1c57611c1389896119c7565b94509450611e2e565b60008081915080905094509450611e2e565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f611cbe7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f897ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f038c087ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f610d03565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f887ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f038b080992507ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f80887ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f038b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f03087ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f8586090891507ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f8b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f038508850989087ffffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f0390508181945094505b50505094509492505050565b6000806000806000806000808951955060009450600093506000925060009150600090505b85811015611edc57611eb3611e75878c84610fdc565b8a83600202815181101515611e8657fe5b906020019060200201518b60018560020201815181101515611ea457fe5b90602001906020020151611f84565b8093508194505050611ec785858585611bbd565b80955081965050508080600101915050611e5f565b8484975097505050505050509250929050565b600080600080600080600093506000925060028751811515611f0d57fe5b049150600090505b81811015611f7557611f6084848984600202815181101515611f3357fe5b906020019060200201518a60018660020201815181101515611f5157fe5b90602001906020020151611bbd565b80945081955050508080600101915050611f15565b83839550955050505050915091565b6000806000806000806000809450600093508992508891508790505b600183141515611ff7576000600284811515611fb857fe5b06141515611fd557611fcc85858484611bbd565b80955081965050505b611fdf82826119c7565b80925081935050506001839060020a90049250611fa0565b61200385858484611bbd565b80955081965050508484965096505050505050935093915050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415612195576002600160149054906101000a900460ff1660ff1614156120e357600080819055507f38f3fe060a88a49502a148f4c2a6fc866d17cd93d9226350bd1a23485f3fd7af60405160405180910390a16000600160146101000a81548160ff021916908360ff160217905550612194565b6000600160149054906101000a900460ff1660ff16141561214a577faf0736842f7e8152e20ea782711621405060fd7faa7706653957074afda5aff160405160405180910390a160018060146101000a81548160ff021916908360ff160217905550612193565b7fcfefc010b8a3d89cf0fc5e3f98041ccf0c9257f44f614dcafb761003d044da2d60405160405180910390a16002600160146101000a81548160ff021916908360ff1602179055505b5b5b565b60018060149054906101000a900460ff1660ff161415156121b75761222b565b7f0b6cc2ecff3b94112d44f2dbac8aee8eb02772c07b1e52605f0dc6d726bf0e313382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182600019166000191681526020019250505060405180910390a15b50565b6080604051908101604052806004905b600081526020019060019003908161223e5790505090565b60c0604051908101604052806006905b600081526020019060019003908161226657905050905600a165627a7a72305820afd229b6df71a8541d04306fa9d08302b497ce3f68ffd23224e462d3614f184f0029', 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })