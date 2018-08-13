pragma solidity ^0.4.20;

contract scrape{
    //bn128 bn;
    // bn : 0xd6c7eb3fa02068d17d334a3007c38005aee112b0
    uint n;
    uint256 constant hx = 13948819542717789835963376875155601763567176492584669418761374464658768458469;
    uint256 constant hy = 18075546999948929667045307191033175061228884850938363576861812662076385892563;
    uint256 constant gx = 1;
    uint256 constant gy = 21888242871839275222246405745257275088696311157297823662689037894645226208583-2;

    uint256 constant p = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    uint256 constant q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    address[] parties;
    uint8 stage; // 0: register, 1: commit-open, 2: recover

    event RegisterReady();
    event Decryption(address decrypterAddress, uint256 sharerIndex, uint256 e, uint256 z, uint256 x, uint256 y);
    event CommitReady();
    event Recover(); 
    event PublicKey(uint256 index, address partyAddress, uint256 x, uint256 y );
    event Share(uint256 shareIndex, address partyAddress, uint256 e, uint256 z, uint256 shx, uint256 shy, uint256 vx, uint256 vy);
    
    event Commit(address partyAddress, bytes32 comm);
    event Open(address partyAddress, uint256 x, uint256 y);

    constructor(){
        //bn = bn128(addr);
        n = 0;
        // Rink : parties = [939046903098941181224282911163092470506894942317, 1100767734151412461845577779739415970198233201333, 1178960056632461530694387909290887668615058789155, 516111912339161617641496976812369129975090439762];
        stage = 2;
    }
    
    function register(uint256 pkx, uint256 pky) payable{
        //if (stage!=0) return;
        n++;
        parties.push(msg.sender);
        PublicKey(n, msg.sender, pkx, pky );
    }
    
    
    function evaluatePoly(uint256[] poly, uint256 x0) pure returns (uint256){
        uint l = poly.length;
        uint256 result = 0;
        for (uint i=0;i<l;i++){
            result = mulmod(result,x0,q);
            result = addmod(result,poly[i],q);
        }
        return result;
    }
    
    function computeCommitOpen(uint256 sec) view returns (bytes32,uint256,uint256){
        uint256 openx;
        uint256 openy;
        (openx,openy) = g1mul(sec,hx,hy);
        bytes32 comm = keccak256(openx,openy);
        return (comm,openx,openy);
    }
    
    function computeProof(uint256[4] bases, uint256[4] pows, uint256 sec, uint256 w) view returns (uint256, uint256){
        uint256[4] memory localPows;
        
        (localPows[0],localPows[1]) = g1mul(w,bases[0],bases[1]);
        (localPows[2],localPows[3]) = g1mul(w,bases[2],bases[3]);
        bytes32 rawE = keccak256(pows,localPows);
        uint256 numE = uint256(rawE) % q;
        uint256 z = addmod(w, q-mulmod(sec,numE,q),q);
        return (numE,z);
    }
    
    function computeShareAndProof(uint256 eva, uint256 pkx, uint256 pky, uint256 w) view returns (uint256,uint256,uint256,uint256,uint256,uint256){
        uint256[4] memory localPows;
        uint256 e;
        uint256 z;
        (localPows[0],localPows[1]) = g1mul(eva,pkx,pky);
        (localPows[2],localPows[3]) = g1mul(eva,gx,gy);
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

    function getParty(uint index) view returns (address){
        if (index >= n) return 0;
        return parties[index];
    }
    
    function computeDecryptionAndProof(uint256 sk, uint256 pkx, uint256 pky, uint256 shx, uint256 shy, uint256 w) view returns (uint256,uint256,uint256,uint256){
        uint256[4] memory locals;
        (locals[0],locals[1]) = g1mul(inv(sk,q),shx,shy);
        (locals[2],locals[3]) = computeProof([hx,hy,locals[0],locals[1]],[pkx,pky,shx,shy],sk,w);
        
        return (locals[2],locals[3],locals[0],locals[1]);

    }
    
    function nextStage() payable{
        // if (msg.sender==owner){
        //     if (stage==2){
        //         n = 0;
        //         RegisterReady();
        //         stage = 0;
        //     }
        //     else if (stage==0){
        //         CommitReady();
        //         stage = 1;
        //     }
        //     else {
        //         Recover();
        //         stage = 2;
        //     }
        // }
        CommitReady();
    }
    
    function share(uint256 partyIndex, uint256 e, uint256 z, uint256[4] pows) payable{
        //if (stage!=1) return;
        Share(partyIndex, msg.sender, e, z, pows[0], pows[1], pows[2], pows[3]);
    }
    function commit(bytes32 comm) payable{
        //if (stage!=1) return;
        Commit(msg.sender, comm);
    }
    
    function open(uint256 x, uint256 y) payable{
        //if (stage!=1) return;
        Open(msg.sender,x,y);
    }
    
    function verifyOpen(uint256 x, uint256 y, bytes32 c) pure returns (bool){
        return keccak256(x,y)==c;
    }
    
    // TODO
    // function verifyCodingTh(uint256[4] shares) returns (bool){
    //     return true;
    // }
    
    function computeVerifierHash(uint256 e, uint256 z, uint256[8] nums) view returns(uint256){
        uint256[6] memory locals;

        (locals[0],locals[1]) = g1mul(z,nums[0],nums[1]);
        (locals[4],locals[5]) = g1mul(e,nums[4],nums[5]);
        (locals[0],locals[1]) = g1add(locals[0],locals[1],locals[4],locals[5]);
        
        (locals[2],locals[3]) = g1mul(z,nums[2],nums[3]);
        (locals[4],locals[5]) = g1mul(e,nums[6],nums[7]);
        (locals[2],locals[3]) = g1add(locals[2],locals[3],locals[4],locals[5]);
        bytes32 rawE = keccak256(nums[4],nums[5],nums[6],nums[7],locals[0],locals[1],locals[2],locals[3]);
        uint256 numE = uint256(rawE) % q;
        return numE;
    }

    function verifyZKP(uint256 e, uint256 z, uint256[8] nums) view returns(bool){
        return computeVerifierHash(e,z,nums)==e;
    }

// base1x,base1y, base2x,base2y, pow... 
    function submitDecryption(uint256 sharerIndex, uint256 e, uint256 z, uint256 decx, uint256 decy) payable{
        //if (stage!=2) return;
        Decryption(msg.sender, sharerIndex, e, z, decx, decy);
    }

    function computeBeacon(uint256[] secxys) pure returns (bytes32){
        //uint256 resultx = 0;
        //uint256 resulty = 0;
        //uint l = secxys.length/2;
        //for (uint i =0;i<l;i++){
        //    (resultx,resulty) = g1add(resultx,resulty,secxys[2*i],secxys[2*i+1]);
        //}
        return keccak256(secxys);
    }

    function reconstruct(uint256[] inds, uint256[] decs) view returns (uint256,uint256){
        uint tin = inds.length;
        uint256 resultx = 0;
        uint256 resulty = 0;
        uint256 tempx = 0;
        uint256 tempy = 0;
        for (uint i=0;i<tin;i++){
            (tempx,tempy) = g1mul(computeLambda(tin,inds,i),decs[2*i],decs[2*i+1]);
            (resultx,resulty) = g1add(resultx, resulty, tempx, tempy);
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
    
    function g1mul(uint256 scalar, uint256 x, uint256 y) public view returns(uint256, uint256) {
        return tuplify(subg1mul(scalar,x,y));
    }
    
    function g1add(uint256 x1, uint256 y1, uint256 x2, uint256 y2) public view returns(uint256,uint256) {
        return tuplify(subg1add(x1,y1,x2,y2));
    }
    
    function tuplify(uint256[2] input) private pure returns (uint256,uint256){
        return (input[0],input[1]);
    }
    
    // function showBn() public view returns (address){
    //     return bn;
    // }


    function getGen1() public pure returns (uint256,uint256){
      return (1,21888242871839275222246405745257275088696311157297823662689037894645226208583-2);
    }

    function subg1mul(uint256 scalar, uint256 x, uint256 y) private view returns(uint256[2] ptr) {
      // With a public key (x, y), this computes p = scalar * (x, y).
      uint256[3] memory input;
      input[0] = x;
      input[1] = y;
      input[2] = scalar;
    
      assembly {
        // call ecmul precompile
        if iszero(staticcall(40001, 0x07, input, 0x60, ptr, 0x40)) {
          revert(12,12)
        }
      }
    }
    
    function subg1add(uint256 x1, uint256 y1, uint256 x2, uint256 y2) private view returns(uint256[2] ptr) {
      uint256[4] memory input;
      input[0] = x1;
      input[1] = y1;
      input[2] = x2;
      input[3] = y2;
    
      assembly {
        // call ecmul precompile
        if iszero(staticcall(501, 0x06, input, 0x80, ptr, 0x40)) {
          revert(14,14)
        }
      }
    }

    // pk(2), v(4), sh(2), g2inv(4) 
    function verifyZKP(uint256[12] input) public view returns(uint256 ret) {
      assembly {
        // call ecmul precompile
        if iszero(staticcall(260001, 0x08, input, 0x120, ret, 0x20)) {
          revert(14,14)
        }
      }
    }
}
