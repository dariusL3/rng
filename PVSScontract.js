pragma solidity ^0.4.0;

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
    uint stage;

    event RegisterReady();
    event Decryption(uint256 shareindex, address partyAddress, uint256 x, uint256 y);
    event CommitReady();
    //event OpenReady(bool status);
    event PublicKey(uint256 index, address partyAddress, uint256 x, uint256 y );
    event Share(uint256 shareindex, address partyAddress, uint256 e, uint256 z, uint256 shx, uint256 shy, uint256 vx, uint256 vy);
    //event Proof0(uint256 partyIndex, uint256 e); //e
    //event Proof1(uint256 shareindex, address partyAddress, uint256 z); //z
    //event Proof2(uint256 shareindex, address partyAddress, uint256 x, uint256 y); //v
    event Commit(address partyAddress, bytes32 comm);
    event Open(address partyAddress, uint256 x, uint256 y);
    // event Beacon(bytes32 beacon);
    
    function PVSS() public{
        owner = msg.sender;
        n = 0;
        stage = 0;
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
        if (stage!= 0) return;
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
    
    function computeProof(uint256[4] bases, uint256[4] pows, uint256 sec, uint256 w) pure returns (uint256, uint256){
        uint256[4] memory localPows;
        
        (localPows[0],localPows[1]) = mul(w,bases[0],bases[1]);
        (localPows[2],localPows[3]) = mul(w,bases[2],bases[3]);
        bytes32 rawE = sha3(pows,localPows);
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
    
    function nextStage(){
        if (msg.sender==owner){
            if (stage==0){
                CommitReady();
            }
            else if (stage == 1){
                OpenReady();
            }
            else {
                RegisterReady();
            }
            stage++;
            if (stage==3) stage = 0;
        }
    }
    
    function commit(uint256 partyInd, uint256 e, uint256[] z, bytes32 comm, uint256[] pows) payable{
        if (stage != 1 || z.length != n) return;
        Commit(msg.sender, comm);
        for (uint i=0;i<n;i++){
            Share(i+1,msg.sender, e, z[i], pows[4*i], pows[4*i+1], pows[4*i+2], pows[4*i+3]);
        }
        
        // if (commitCount == n) {return false;}
        // bytes32 s;
        // if (true){ //if (verifyZKPs(e,z,pows)==s){
        //     commits[msg.sender] = comm;
        //     for (uint i=0;i<n;i++){
        //         Share(i+1, partyIndexes[msg.sender], pows[4*i], pows[4*i+1]);
        //     }
        //     commitCount++;
        //     if (commitCount == t){
        //         OpenReady(true);
        //     }
        //     else if (commitCount == n){
        //         CommitReady(false);
        //     }
        //     return true;
        // }
        // return false;
    }
    
    function open(uint256 x, uint256 y) payable{
        if (stage!=2) return;
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
        return sha3(x,y)==c;
    }
    
    // TODO
    // function verifyCodingTh(uint256[4] shares) returns (bool){
    //     return true;
    // }
    
    function computeVerifierHash(uint256 e, uint256 z, uint256[8] nums) view returns(uint256){
        uint256[6] memory locals;

        (locals[0],locals[1]) = mul(z,nums[0],nums[1]);
        (locals[4],locals[5]) = mul(e,nums[4],nums[5]);
        (locals[0],locals[1]) = add(locals[0],locals[1],locals[4],locals[5]);
        
        (locals[2],locals[3]) = mul(z,nums[2],nums[3]);
        (locals[4],locals[5]) = mul(e,nums[6],nums[7]);
        (locals[2],locals[3]) = add(locals[2],locals[3],locals[4],locals[5]);
        bytes32 rawE = sha3(nums[4],nums[5],nums[6],nums[7],locals[0],locals[1],locals[2],locals[3]);
        uint256 numE = uint256(rawE) % q;
    }

    function verifyZKP(uint256 e, uint256 z, uint256[8] nums) view returns(bool){
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
    function submitDecryption(uint shareindex, uint partyIndex, uint256 e, uint256 z, uint256[8] nums) payable{
        // if (verify1ZKP(e,z,nums)){
        //     return true;
        // }
        // return false;
    }

    function computeBeacon(uint256 count, uint256[] secxys) pure returns (uint256,uint256){
        uint256 resultx = 0;
        uint256 resulty = 0;
        for (uint i =0;i<count;i++){
            (resultx,resulty) = add(resultx,resulty,secxys[i],secxys[count+i]);
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
0x9bc2998994e93fdb54a9f491705c9afad47f3cb9