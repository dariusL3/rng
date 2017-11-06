import gmpy2
import codecs
from gmpy2 import mpz
import time
import sys
from Crypto.Hash import SHA256
from dummyEC import dummyEC
from rscode import RSCode

#uses Miller-Rabin primality test, which is always correct when it  yields False, but has a chance to incorrectly yield True.
#anyway, this function is not called by any other function inside the scope of this file
def findPrime(nbits):
	rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),60))
	test = mpz(1)
	while not gmpy2.is_prime(test):	
		test = gmpy2.mpz_urandomb(rs,nbits-1)+2**(nbits-1)
	return test

# Algorithm RFN - 9.6, V.Shoup
# returns a random prime p of at least nbits bits and the factorization of p-1
def findFactoredNeighboredPrime(nbits):
	rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),60))
	m = mpz(2**(nbits-1))
	test = mpz(1)
	while not gmpy2.is_prime(test+1) or test < mpz(2**(nbits-1)):
		seq = [m]
		temp = m
		# Algorithm 9.5, V.Shoup
		# constructs a random non-increasing sequence with m as maximum 
		while temp > 1:
			temp = gmpy2.mpz_random(rs,temp) + 1
			seq.append(temp)
		test = mpz(1)
		seq.reverse()
		primes = []

		for num in seq:
			if gmpy2.is_prime(num):
				test *= num
				primes.append(num)
				if test > 2**(nbits-1):
					break

	return (test+1,primes)

# receives a list of primes as input (possible duplicates)
# returns the corresponding set (no dups) and the list of exponent for each prime
def organizeFacts(facs):
	count = 1
	s1 = [facs[0]]
	s2 = [1]
	for fac in facs[1:]:
		if fac == facs[count-1]:
			s2[count-1] += 1
		else:
			s1.append(fac)
			s2.append(1)
			count += 1
	return (s1,s2)

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

# returns a collection different from the input. Apply it continously starting from the smallest collection (0,1,...)
# to obtain all collections along the way
def nextCollection(indexes,n):
	k = len(indexes)
	cur = 1
	while cur <= k and indexes[k-cur] >= n-cur:
		cur += 1
	if cur == k+1:
		return []
	else:
		newInd = [ele for ele in indexes]
		val = indexes[k-cur] + 1
		for i in range(k-cur,k):
			newInd[i] = val
			val += 1
		return newInd

#correctness not assured, but the majority of non-generators fail this test
#depecrated
def simpleGeneratorTest(g, p):
	if g==0: return False
	for smallp in [2,3,5,7]:
		if gmpy2.gcd(p-1,smallp) > 1:
			if gmpy2.powmod(g,(p-1)/smallp,p) == 1:
				return False
	return True

def evaluatePoly(poly, x, modulo):
	result = mpz('0')
	for coef in poly:
		result *= x
		result = gmpy2.f_mod(result, modulo)
		result += coef
		result = gmpy2.f_mod(result, modulo)
	return result

def test(args):
	p,a,b,gx,gy,n,t,secret = [mpz(ele) for ele in args[1:9]]
	g = (gx,gy)
	ss = PVSS(p,a,b,g,n,t)
	ss.generateTestKeyPairs(n)
	print "Setup..."
	print "Using Elliptic Curve : y^2 = " + a.digits(10) + "x^3 + " + b.digits(10) + " over Z" + p.digits(10)
	print "Generators: " + tostr(ss.generatorPrimary) + " , " + tostr(ss.generatorSecondary)
	print "Party secret keys : " + tostr(ss.secretKeys)
	print "Party public keys : " + conc([tostr(k) for k in ss.publicKeys])

	print "\nDistribution..."
	shares,proof = ss.PVSSDistribute(secret)
	
	print "Proof (v): "+ conc([tostr(v) for v in proof[0]])
	print "Proof (e): "+proof[1].digits()
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
	#depecrated
	def __init__(self,p,method):
		self.order = 0
		if method == 0:
			self.prime = mpz(p)
			self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
			self.generatorPrimary = 0
			self.generatorSecondary = 0
			while not simpleGeneratorTest(self.generatorPrimary,self.prime):
				self.generatorPrimary = self.sample(self.prime-1)
			while (not simpleGeneratorTest(self.generatorSecondary,self.prime)) or self.generatorSecondary == self.generatorPrimary :
				self.generatorSecondary = self.sample(self.prime-1)
			self.publicKeys = []
		else:
			(p,facs) = findFactoredNeighboredPrime(p)
			self.prime = mpz(p)
			self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
			(self.facs,self.exes) = organizeFacts(facs)
			self.generatorPrimary = self.findGenerator()
			self.generatorSecondary = self.generatorPrimary
			while self.generatorSecondary == self.generatorPrimary:
				self.generatorSecondary = self.findGenerator()

	def __init__(self,p_in,a_in,b_in,g_in,n,t):
		self.publicKeys = []
		self.secretKeys = []
		self.prime = mpz(p_in)
		self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
		self.ec = dummyEC(a_in,b_in,p_in)
		self.ec.setGenerator(g_in)
		self.order = self.ec.q
		self.generatorPrimary = self.samplePoint()
		self.generatorSecondary = self.generatorPrimary
		while self.generatorSecondary == self.generatorPrimary:
			self.generatorSecondary = self.samplePoint()
		self.n = n
		self.t = t
		self.generateTestKeyPairs(n)
		self.code = RSCode(n,t)


	# Algorithm 11.1, V.Shoup
	# facs, exes being the prime factorization of p-1
	def findGenerator(self):
		facs = self.facs
		exes = self.exes
		l = len(facs)
		result = 1
		for i in range(l):
			test = 1
			alp = 1
			temp = (self.prime-1)/facs[i]
			while test == 1:
				alp = self.sample(self.prime-1)
				test = gmpy2.powmod(alp,temp,self.prime)
			temp = (self.prime-1) / gmpy2.powmod(facs[i],exes[i],self.prime-1)
			temp = gmpy2.powmod(alp,temp,self.prime)
			result *= temp
			result = gmpy2.f_mod(result,self.prime)
		return result

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
				result.append(num)
		return result

	def sample(self, upper):
		result = 1
		while result <= 1: 
			result = gmpy2.mpz_random(self.rs, upper)
			return result

	def samplePoint(self):
		if self.ec:
			ind = gmpy2.mpz_random(self.rs, self.order-1)
		return self.ec.field[ind]

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
		s = mpz(s)
		n = self.n
		t = self.t
		secret = self.ec.mul(self.generatorPrimary, s)
		print "Secret : " + tostr(secret)
		poly = [self.sample(self.order) for i in range(t-1)]
		poly.append(s)
		preSecrets = []
		shares = []
		
		for i in range(1,n+1):
			temp = self.evaluatePoly(poly, i, self.order)
			preSecrets.append(temp)
			temp = self.ec.mul(publicKeys[i-1], temp)
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
		result = (-1,-1)
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
			temp = self.ec.mul(d,lamb)
			result = self.ec.add(result, temp)
		return result

	def generateKeyPair(self):
		secretKey = self.sample(self.order-1)+1
		publicKey = self.ec.mul(self.generatorPrimary, secretKey)
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
		inv = gmpy2.invert(secretKey,self.order)
		result = self.ec.mul(share,inv)
		return result

	def generateZKP(self,preSecrets,shares):
		vArr = []
		wArr = []
		n = len(preSecrets)

		h = SHA256.new()
		for i in range(n):
			vArr.append(self.ec.mul(self.generatorSecondary, preSecrets[i]))
			w = self.sample(self.order)
			wArr.append(w)
			temp = (self.ec.mul(self.publicKeys[i],w),self.ec.mul(self.generatorSecondary,w))
			#temp = (temp[0].digits(10), temp[1].digits(10))
			#print temp
			h.update(bytes(str(self.publicKeys[i])))
			h.update(bytes(str(self.generatorSecondary)))
			h.update(bytes(str(temp)))
			#h.update(bytes(temp[1]))
		#print wArr
		e = mpz(h.hexdigest(),base=16)
		e = gmpy2.f_mod(e,self.order)
		
		zArr = [gmpy2.f_mod(wArr[i]-preSecrets[i]*e, self.order) for i in range(n)]

		return [vArr,e,zArr]

	def decryptWithProof(self,shares,index):
		i = index
		dec = self.decryptShare(shares[i], self.secretKeys[i])
		print "Decryption (" + str(i) + ") : " + tostr(dec)
		proof = self.generate1ZKP(self.secretKeys[i],self.generatorPrimary,self.publicKeys[i])
		print "Proof : " + tostr(proof[0]) + ", " + tostr(proof[1]) + ", " + proof[2].digits() + ", " + proof[3].digits()
		print "...Proof valid !" if self.verify1ZKP(proof,self.generatorPrimary,self.publicKeys[i],True) else "...Bad proof !"
		return dec


	def generate1ZKP(self,ex,gen1,gen2):
		h = SHA256.new()
		sh = self.ec.mul(gen1, ex)
		v = self.ec.mul(gen2, ex)
		w = self.sample(self.order)
		
		temp = (self.ec.mul(gen1,w),self.ec.mul(gen2,w))
		
		h.update(bytes(str(gen1)))
		h.update(bytes(str(gen2)))
		h.update(bytes(str(temp)))
		
		e = mpz(h.hexdigest(),base=16)
		e = gmpy2.f_mod(e,self.order)
		z = gmpy2.f_mod(w-ex*e, self.order)
		return [v,sh,e,z]

	def verify1ZKP(self,proof,gen1,gen2,verbal):
		v,sh,e,z = proof
		if verbal : print "Verifying ZKP..."
		h = SHA256.new()
		if verbal : print "e = " + e.digits(10) +"\nIntermediates"

		temp = (self.ec.add(self.ec.mul(gen1,z),self.ec.mul(sh,e)),\
			self.ec.add(self.ec.mul(gen2,z),self.ec.mul(v,e)))
		if verbal : print conc([tostr(ele) for ele in temp])
		h.update(bytes(str(gen1)))
		h.update(bytes(str(gen2)))
		h.update(bytes(str(temp)))

		eVerify = h.hexdigest()
		eVerify = mpz(eVerify,base=16)
		eVerify = gmpy2.f_mod(eVerify,self.order)
		if verbal : print "Recovered e : " + eVerify.digits(10)
		return eVerify==e

	def verifyZKP(self,shares,vArr,e,zArr,verbal):
		if verbal : print "\nVerification..."
		self.verifyByCode(vArr,verbal)
		n = len(shares)
		h = SHA256.new()
		if verbal : print "\ne = " + e.digits(10) +"\nIntermediates"
		for i in range(n):
			temp = (self.ec.add(self.ec.mul(self.publicKeys[i],zArr[i]),self.ec.mul(shares[i],e)),\
				self.ec.add(self.ec.mul(self.generatorSecondary,zArr[i]),self.ec.mul(vArr[i],e)))
			if verbal : print conc([tostr(ele) for ele in temp])
			h.update(bytes(str(self.publicKeys[i])))
			h.update(bytes(str(self.generatorSecondary)))
			h.update(bytes(str(temp)))
		eVerify = h.hexdigest()
		eVerify = mpz(eVerify,base=16)
		eVerify = gmpy2.f_mod(eVerify,self.order)
		if verbal : print "Recovered e : " + eVerify.digits(10)
		return eVerify==e

	def verifyByCode(self,vArr,verbal):
		randomVec = [int(gmpy2.mpz_random(self.rs,self.order)) for i in range(self.n-self.t)]
		codewordInDual = self.code.getCodewordInDual(randomVec)
		codewordInDual = [gmpy2.f_mod(mpz(int(ele)),self.order) for ele in codewordInDual]
		if verbal : print "Random codeword from dual : " + tostr(codewordInDual)
		if verbal : print "Intermediates"

		product = (mpz(-1),mpz(-1))
		for vi,ci in zip(vArr,codewordInDual):
			temp = self.ec.mul(vi,ci)
			if verbal : print str(ci) + " x " + tostr(vi) + " = " + tostr(temp)
			product = self.ec.add(product,temp)
		if verbal : print "Product : " + tostr(product)
		if product[0] == -1:
			if verbal : print "...Codeword valid : v"
		else:
			if verbal : print "...Bad codeword : v"


if __name__=="__main__":
	test(sys.argv)