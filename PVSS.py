import gmpy2
import codecs
from gmpy2 import mpz
import time
import sys
from Crypto.Hash import SHA256

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
		#print newInd
		return newInd

#correctness not assured, but the majority of non-generators fail this test
#Note: no longer used
def simpleGeneratorTest(g, p):
	if g==0: return False
	for smallp in [2,3,5,7]:
		if gmpy2.gcd(p-1,smallp) > 1:
			if gmpy2.powmod(g,(p-1)/smallp,p) == 1:
				return False
	return True

def test(args):
	p,n,t,secret = [mpz(ele) for ele in args[1:5]]
	ss = PVSS(p,1)
	pairs = ss.generateTestKeyPairs(n)
	[shares,proof,allX] = ss.PVSSDistribute(secret, n,t)
	#print "Proof: "+str(proof)
	#print ss.verifyZKP(shares,proof[0],proof[1],proof[2])
	#print ss.generatorSecondary
	#print pairs

	dec = [ss.decryptShare(shares[i], pairs[i][0]) for i in range(n)] 
	indexes = ss.getRandomCollection(t,n)
	print "Chosen indexes: " + str(indexes)
	param1 = [allX[i] for i in indexes]
	param2 = [dec[i] for i in indexes]
	print "Decrypted Secrets : " + str(dec) + " => " + str(param2)
	res = ss.PVSSReconstruct(param1, param2)
	print "Recovered secret: "+str(res)
	with open("secret.txt","r") as f:
		print "Read: " +f.readline()



class PVSS:
	def __init__(self,p,method):
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

	# Lambda described in the Reconstruction section
	# the result is reduced mod p-1
	# lambda is set to zero if and only if its denominator is not invertible mod p-1
	def computeAllLambda(self,xl):
		n = len(xl)
		result = []
		for i in range(n):
			x = xl[i]
			lambnum = 1
			lambden = 1
			for otherx in xl:
				if not otherx==x:
					lambnum *= otherx
					#lambnum = gmpy2.f_mod(lambnum, self.prime-1)
					lambden *= otherx-x


			temp = gmpy2.gcd(lambnum,lambden)
			if lambden < 0:
				temp = -temp
			lambnum /= temp
			lambden /= temp
			lambnum = gmpy2.f_mod(lambnum, self.prime-1)
			#print "Lambda " + str(i) + ": " + str(lambnum) + " / " + str(lambden)
			if gmpy2.gcd(lambden,self.prime-1) == 1:
				lamb = lambnum * gmpy2.invert(lambden,self.prime-1)
			else:
				lamb = 0
			lamb = gmpy2.f_mod(lamb, self.prime-1)
			result.append(int(lamb))
		return result

	# *Tight* set being sets of n numbers where any t-number collection, when fed to computeAllLambda(), yields no zero
	def findTightSet(self,n,t):
		result = []
		print "Threshold : " + str(min(self.prime,5*n*t))
		loopCount = 0
		while loopCount < 1000 * gmpy2.factorial(n) / gmpy2.factorial(t):
			loopCount += 1
			xl = [ele+1 for ele in self.getRandomCollection(n,self.prime)]
			b = self.assessSet(t,xl)
			if b:
				print "Accepted !"
				return xl
		return result

	# returns True or False. Used as suplement for findTightSet(). Receives a t-number collection as input
	def assessSet(self,t,xl):
		n = len(xl)
		print "Set: " + str(xl)
		indexes = range(t)
		while len(indexes) > 0:
			coll = [xl[ind] for ind in indexes]
			temp = self.computeAllLambda(coll)
			if 0 in temp:
				print "Discarded with anti-proof: " + str(coll) + " -> " + str(temp)
				return False
			indexes = nextCollection(indexes, n)
		return True

	def sample(self, upper):
		result = 1
		while result <= 1: 
			result = gmpy2.mpz_random(self.rs, upper)
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

	def PVSSDistribute(self, s, n, t):
		publicKeys = self.publicKeys
		s = mpz(s)
		secret = gmpy2.powmod(self.generatorPrimary, s, self.prime)
		with open("secret.txt","w") as f:
			f.write(secret.digits(10)+"\n")
		poly = [self.sample(self.prime) for i in range(t-1)]
		poly.append(s)
		preSecrets = []
		shares = []
		allX = self.findTightSet(n,t)
		if len(allX) == 0:
			print "Error !"
			return []
		shareCount = 0
		x = 0
		loopCount = 0
		for i in range(n):
			temp = self.evaluatePoly(poly, allX[i], self.prime-1)
			preSecrets.append(temp)
			temp = gmpy2.powmod(publicKeys[i], temp, self.prime)
			shares.append(temp)
		proof = self.generateZKP(preSecrets, shares)
		print "Prime facts: " + str([self.prime,self.facs,self.exes])
		print "Generators: " + str(self.generatorPrimary) + " , " + str(self.generatorSecondary)
		print "Evaluations: " + str(preSecrets)
		print "Shares: " + str(shares)
		print "X list: " + str(allX)
		return [shares, proof, allX]

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
		t = len(xl)
		result = 1
		for i in range(t):
			x = xl[i]
			lambnum = 1
			lambden = 1
			for otherx in xl:
				if not otherx==x:
					lambnum *= otherx
					
					lambden *= otherx-x
					

			temp = gmpy2.gcd(lambnum,lambden)
			if lambden < 0:
				temp = -temp
			lambnum /= temp
			lambden /= temp
			lambnum = gmpy2.f_mod(lambnum, self.prime-1)
			#lambden = gmpy2.f_mod(lambden, self.prime-1)
			
			if gmpy2.gcd(lambden,self.prime-1) == 1:
				lamb = lambnum * gmpy2.invert(lambden,self.prime-1)
			else:
				lamb = 0
			lamb = gmpy2.f_mod(lamb, self.prime-1)
			print "Lambda (" + str(x) + ") : " + str(lamb)
			temp = gmpy2.powmod(dSecrets[i],lamb, self.prime)
			result = gmpy2.f_mod(temp*result, self.prime)
		return result

	def generateKeyPair(self):
		secretKey = self.prime-1
		while not gmpy2.gcd(secretKey, self.prime-1) == 1:
			secretKey = self.sample(self.prime-1)
		publicKey = gmpy2.powmod(self.generatorPrimary, secretKey, self.prime)
		return [secretKey, publicKey]

	def generateTestKeyPairs(self, n):
		pairs = []
		pks = []
		for i in range(n):
			p = self.generateKeyPair()
			pairs.append(p)
			pks.append(p[1])
		self.publicKeys = pks
		return pairs

	def decryptShare(self, share, secretKey):
		share = mpz(share)
		secretKey = mpz(secretKey)
		inv = gmpy2.invert(secretKey,self.prime-1)
		result = gmpy2.powmod(share,inv,self.prime)
		return result

	def generateZKP(self,preSecrets,shares):
		vArr = []
		wArr = []
		n = len(preSecrets)

		h = SHA256.new()
		for i in range(n):
			vArr.append(gmpy2.powmod(self.generatorSecondary, preSecrets[i], self.prime))
			w = self.sample(self.prime-1)
			wArr.append(w)
			temp = (gmpy2.powmod(self.publicKeys[i],w,self.prime),gmpy2.powmod(self.generatorSecondary,w,self.prime))
			temp = (temp[0].digits(10), temp[1].digits(10))
			#print temp
			h.update(bytes(temp[0]))
			h.update(bytes(temp[1]))
		#print wArr
		e = mpz(h.hexdigest(),base=16)
		e = gmpy2.f_mod(e,self.prime-1)
		
		zArr = [gmpy2.f_mod(wArr[i]-preSecrets[i]*e, self.prime-1) for i in range(n)]

		return [vArr,e,zArr]

	def verifyZKP(self,shares,vArr,e,zArr):
		n = len(shares)
		h = SHA256.new()
		for i in range(n):
			temp = (gmpy2.powmod(self.publicKeys[i],zArr[i],self.prime)*gmpy2.powmod(shares[i],e,self.prime),\
				gmpy2.powmod(self.generatorSecondary,zArr[i],self.prime)*gmpy2.powmod(vArr[i],e,self.prime))
			temp = (gmpy2.f_mod(temp[0],self.prime), gmpy2.f_mod(temp[1], self.prime))
			temp = (temp[0].digits(10), temp[1].digits(10))
			#print temp
			h.update(bytes(temp[0]))
			h.update(bytes(temp[1]))
		eVerify = mpz(h.hexdigest(),base=16)
		eVerify = gmpy2.f_mod(eVerify,self.prime-1)
		
		return eVerify==e

if __name__=="__main__":
	test(sys.argv)