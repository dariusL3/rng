import gmpy2
import codecs
from gmpy2 import mpz
import time
import sys
#from Crypto.Hash import SHA256
from py_ecc.secp256k1 import secp256k1 as ec
from rscode import RSCode
from ethereum.utils import sha3,encode_int32

#uses Miller-Rabin primality test, which is always correct when it  yields False, but has a chance to incorrectly yield True.
#anyway, this function is not called by any other function inside the scope of this file
def findPrime(nbits):
	rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),60))
	test = mpz(1)
	while not gmpy2.is_prime(test):	
		test = gmpy2.mpz_urandomb(rs,nbits-1)+2**(nbits-1)
	return test

def tostr(ls):
	#print ls
	res = "["
	for ele in ls:
		ele = mpz(ele)
		res += ele.digits(10) + ", "
	return res[:-2] + "]"

def conc(ls):
	res = ""
	for s in ls :
		res += s + ", "
	return res[:-2]

def evaluatePoly(poly, x, modulo):
	result = mpz('0')
	for coef in poly:
		result *= x
		result = gmpy2.f_mod(result, modulo)
		result += coef
		result = gmpy2.f_mod(result, modulo)
	return result

def test(args):
	n,t,secret = [mpz(ele) for ele in args[1:]]
	a = 0;
	b = 7;
	ss = PVSS(n,t)
	ss.generateTestKeyPairs(n)
	print "Setup..."
	print "Using Elliptic Curve : y^2 = x^3 + " + str(b) + " over Z" + str(ss.prime)
	print "Generators: " + tostr(ss.generatorPrimary) + " , " + tostr(ss.generatorSecondary)
	print "Party secret keys : " + tostr(ss.secretKeys)
	print "Party public keys : " + conc([tostr(k) for k in ss.publicKeys])

	print "\nDistribution..."
	shares,proof = ss.PVSSDistribute(secret)
	
	print "Proof (v): "+ conc([tostr(v) for v in proof[0]])
	print "Proof (e): "+ mpz(codecs.encode(str(proof[1]),'hex'),16).digits()
	print "Proof (z): "+tostr(proof[2])
	print "...Proof valid !" if ss.verifyZKP(shares,proof[0],proof[1],proof[2],True) else "...Bad Proof !"
	
	print "\nReconstruction..."
	dec = [ss.decryptWithProof(shares, i) for i in range(n)] 
	indexes = ss.getRandomCollection(t,n)
	param1 = [i+1 for i in indexes]
	print "\nPicking t parties at random\n-> " + tostr(param1)
	param2 = [dec[i] for i in indexes]
	print "Decrypted Secrets : " + conc([tostr(d) for d in dec]) + " => " + conc([tostr(d) for d in param2])
	res = ss.PVSSReconstruct(param1, param2)
	print "...Recovered secret: "+tostr(res)



class PVSS:
	def __init__(self,n,t):
		self.publicKeys = []
		self.secretKeys = []
		self.prime = 115792089237316195423570985008687907853269984665640564039457584007908834671663L;
		self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
		self.order = 115792089237316195423570985008687907852837564279074904382605163141518161494337L;
		self.generatorPrimary = (55066263022277343669578718895168534326250603453777594175500187360389116729240L,32670510020758816978083085130507043184471273380659243275938904335757337482424L)
		self.generatorSecondary = (12491534207990215330120135635581023921030258456695817555828929191238709288092L,104340201949375786418227580263545657674427888456142663625569746313246079959670L)
		self.n = n
		self.t = t
		self.generateTestKeyPairs(n)
		self.code = RSCode(n,t)

	def sample(self, upper):
		result = 1
		while result <= 1: 
			result = gmpy2.mpz_random(self.rs, upper)
			return long(result)

	def getRandomCollection(self, k, n):
		k = int(k)
		n = int(n)
		flags = {}
		
		result = []
		counter = 0
		while counter < k:
			num = gmpy2.mpz_random(self.rs, n)
			if not flags.has_key(num):
				flags[num] = True
				counter += 1
				result.append(int(num))
		return result

	#polynomial is a list of coefficients with descending degree
	def evaluatePoly(self,poly, x, modulo):
		result = mpz('0')
		for coef in poly:
			result *= x
			result = gmpy2.f_mod(result, modulo)
			result += coef
			result = gmpy2.f_mod(result, modulo)
		return result

	#depecrated
	def ShamirDistribute(self, s, n, t):
		s = mpz(s)
		poly = [self.sample(self.prime) for i in range(t-1)]
		poly.append(s)
		print poly
		result = []
		for i in range(n):
			share = self.evaluatePoly(poly, i+1, self.prime)
			result.append(share)
		return result

	def PVSSDistribute(self, s):
		publicKeys = self.publicKeys
		s = long(s)
		n = self.n
		t = self.t
		secret = ec.multiply(self.generatorPrimary, s)
		print "Secret : " + tostr(secret)
		poly = [self.sample(self.order) for i in range(t-1)]
		poly.append(s)
		preSecrets = []
		shares = []
		
		for i in range(1,n+1):
			temp = long(self.evaluatePoly(poly, i, self.order))
			preSecrets.append(temp)
			temp = ec.multiply(publicKeys[i-1], temp)
			shares.append(temp)
		proof = self.generateZKP(preSecrets, shares)
		
		print "Polynomial Coefficients : " + tostr(poly)
		print "Evaluations: " + tostr(preSecrets)
		print "...Shares: " + conc([tostr(s) for s in shares])
		return shares, proof

		#depecrated
	def ShamirReconstruct(self, xl, yl):
		n = len(xl)
		result = 0
		for i in range(n):
			x = xl[i]
			lambnum = 1
			lambden = 1
			for otherx in xl:
				if not otherx==x:
					lambnum *= otherx
					lambden *= otherx-x

			lambnum = gmpy2.f_mod(mpz(lambnum), self.prime)
			lambden = gmpy2.f_mod(mpz(lambden), self.prime)
			lamb = gmpy2.f_mod(lambnum*gmpy2.invert(lambden,self.prime),self.prime)
			print (lambnum,lambden,lamb)
			result += lamb*yl[i]
		return gmpy2.f_mod(result, self.prime)

	def PVSSReconstruct(self, xl, dSecrets):
		t = self.t
		result = (0,0)
		for x,d in zip(xl,dSecrets):
			lambnum = 1
			lambden = 1
			for otherx in xl:
				if not otherx==x:
					lambnum *= otherx
					lambden *= otherx-x
					
			lamb = lambnum * gmpy2.invert(lambden,self.order)
			lamb = gmpy2.f_mod(lamb, self.order)
			print "Lambda (" + str(x) + ") : " + str(lamb)
			temp = ec.multiply(d,long(lamb))
			result = ec.add(result, temp)
		return result

	def generateKeyPair(self):
		secretKey = self.sample(self.order-1)+1
		publicKey = ec.multiply(self.generatorPrimary, secretKey)
		return [secretKey, publicKey]

	def generateTestKeyPairs(self, n):
		sks = []
		pks = []
		for i in range(n):
			p = self.generateKeyPair()
			sks.append(p[0])
			pks.append(p[1])
		self.publicKeys = pks
		self.secretKeys = sks



	def decryptShare(self, share, secretKey):
		secretKey = mpz(secretKey)
		inv = long(gmpy2.invert(secretKey,self.order))
		result = ec.multiply(share,inv)
		return result

	def generateZKP(self,preSecrets,shares):
		vArr = []
		wArr = []
		n = len(preSecrets)

		toBeHashed = bytes('')
		for i in range(n):
			sh = shares[i]
			v = ec.multiply(self.generatorSecondary, preSecrets[i])
			vArr.append(v)
			w = self.sample(self.order)
			wArr.append(w)
			(a1,a2) = (ec.multiply(self.publicKeys[i],w),ec.multiply(self.generatorSecondary,w))
			
			arr = [sh[0],sh[1],v[0],v[1],a1[0],a1[1],a2[0],a2[1]]
			for ele in arr:
				toBeHashed += encode_int32(ele)
		e = sha3(toBeHashed)
		e = mpz(codecs.encode(str(e),'hex'),16)
		zArr = [long(gmpy2.f_mod(wArr[i]-preSecrets[i]*e, self.order)) for i in range(n)]
		e = long(e)
		return [vArr,e,zArr]

	def decryptWithProof(self,shares,index):
		i = index
		dec = self.decryptShare(shares[i], self.secretKeys[i])
		print "Decryption (" + str(i) + ") : " + tostr(dec)
		proof = self.generate1ZKP(self.secretKeys[i],self.generatorPrimary,self.publicKeys[i])
		print "Proof : " + tostr(proof[0]) + ", " + tostr(proof[1]) + ", " + str(proof[2]) + ", " + str(proof[3])
		print "...Proof valid !" if self.verify1ZKP(proof,self.generatorPrimary,self.publicKeys[i],True) else "...Bad proof !"
		return dec

	def generateTest(self,ex,pkx,pky,gx,gy):
		g = (long(gx),long(gy))
		pk = (long(pkx),long(pky))
		ex = long(ex)

		return self.generate1ZKP(ex,pk,g)

	def generate1ZKP(self,ex,gen1,gen2):
		sh = ec.multiply(gen1, ex)
		v = ec.multiply(gen2, ex)
		w = self.sample(self.order)
		
		(a1,a2) = (ec.multiply(gen1,w),ec.multiply(gen2,w))
		print 'As : ' 
		print [a1[0],a1[1],a2[0],a2[1]]
		
		arr = [sh[0],sh[1],v[0],v[1],a1[0],a1[1],a2[0],a2[1]]
		toBeHashed = bytes('')
		for ele in arr:
			toBeHashed += encode_int32(ele)
		e = sha3(toBeHashed)
		e = mpz(codecs.encode(str(e),'hex'),16)
		z = long(gmpy2.f_mod(w-ex*e, self.order))
		e = long(e)
		return [v,sh,e,z]

	def verifyTest(self,e,z,pkx,pky,gx,gy,shx,shy,vx,vy):
		v = (long(vx),long(vy))
		sh = (long(shx),long(shy))
		g = (long(gx),long(gy))
		pk = (long(pkx),long(pky))
		e = long(e)
		z = long(z)
		return self.verify1ZKP([v,sh,e,z],pk,g,True)

	def verify1ZKP(self,proof,gen1,gen2,verbal):
		#print proof
		v,sh,e,z = proof
		if verbal : print "Verifying ZKP..."
		if verbal : print "e = " + str(e) +"\nIntermediates"
		
		a1 = ec.add(ec.multiply(gen1,z),ec.multiply(sh,e))
		a2 = ec.add(ec.multiply(gen2,z),ec.multiply(v,e))
		if verbal: 
			print conc([str(ele) for ele in [a1[0],a1[1],a2[0],a2[1]]])
		arr = [sh[0],sh[1],v[0],v[1],a1[0],a1[1],a2[0],a2[1]]
		toBeHashed = bytes('')
		for ele in arr:
			toBeHashed += encode_int32(ele)
		eVerify = sha3(toBeHashed)
		e = encode_int32(e)
		if verbal : print "Recovered e : " + mpz(codecs.encode(eVerify,'hex'),16).digits()
		return eVerify==e

	def verifyZKP(self,shares,vArr,e,zArr,verbal):
		if verbal : print "\nVerification..."
		self.verifyByCode(vArr,verbal)
		n = len(shares)
		if verbal : print "\ne = " + str(e) +"\nIntermediates"
		toBeHashed = bytes('')
		for i in range(n):
			sh = shares[i]
			v = vArr[i]
			(a1,a2) = (ec.add(ec.multiply(self.publicKeys[i],zArr[i]),ec.multiply(shares[i],e)),\
				ec.add(ec.multiply(self.generatorSecondary,zArr[i]),ec.multiply(vArr[i],e)))
			if verbal : print conc([str(ele) for ele in [a1[0],a1[1],a2[0],a2[1]]])
			arr = [sh[0],sh[1],v[0],v[1],a1[0],a1[1],a2[0],a2[1]]
			for ele in arr:
				toBeHashed += encode_int32(ele)
		eVerify = sha3(toBeHashed)
		e = encode_int32(e)
		if verbal : print "Recovered e : " + mpz(codecs.encode(eVerify,'hex'),16).digits()
		#if verbal : print codecs.encode(str(e),'hex')
		return eVerify==e

	def verifyByCode(self,vArr,verbal):
		randomVec = [int(gmpy2.mpz_random(self.rs,self.order)) for i in range(self.n-self.t)]
		codewordInDual = self.code.getCodewordInDual(randomVec)
		codewordInDual = [gmpy2.f_mod(mpz(int(ele)),self.order) for ele in codewordInDual]
		if verbal : print "Random codeword from dual : " + tostr(codewordInDual)
		if verbal : print "Intermediates"

		product = (0L,0L)
		for vi,ci in zip(vArr,codewordInDual):
			temp = ec.multiply(vi,ci)
			if verbal : print str(ci) + " x " + tostr(vi) + " = " + tostr(temp)
			product = ec.add(product,temp)
		if verbal : print "Product : " + tostr(product)
		if product == (0L,0L):
			if verbal : print "...Codeword valid : v"
		else:
			if verbal : print "...Bad codeword : v"


if __name__=="__main__":
	test(sys.argv)