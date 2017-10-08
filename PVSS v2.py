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
def simpleGeneratorTest(g, p):
	if g==0: return False
	for smallp in [2,3,5,7]:
		if gmpy2.gcd(p-1,smallp) > 1:
			if gmpy2.powmod(g,(p-1)/smallp,p) == 1:
				return False
	return True

#currently testing for small (known, correct) values of prime p
def test(args):
	p,n,t,secret = [mpz(ele) for ele in args[1:5]]

	if not gmpy2.is_prime(p):
		p = findPrime(p)
	ss = PVSS(p)
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
	def __init__(self,p):
		self.prime = mpz(p)
		self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
		self.generatorPrimary = 0
		self.generatorSecondary = 0
		while not simpleGeneratorTest(self.generatorPrimary,self.prime):
			self.generatorPrimary = self.sample(self.prime-1)
		while (not simpleGeneratorTest(self.generatorSecondary,self.prime)) or self.generatorSecondary == self.generatorPrimary :
			self.generatorSecondary = self.sample(self.prime-1)
		
		self.publicKeys = []

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

	def findTightSet(self,n,t):
		result = []
		print "Threshold : " + str(min(self.prime,5*n*t))
		loopCount = 0
		while loopCount < 1000 * gmpy2.factorial(n) / gmpy2.factorial(t):
			loopCount += 1
			xl = [ele+1 for ele in self.getRandomCollection(n,min(self.prime,5*n*t))]
			b = self.assessSet(t,xl)
			if b:
				print "Accepted !"
				return xl
		return result


#TODO: make this test 100% correct
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
			
			print "Lambda: " + str(lambnum) + " / " + str(lambden)
			if gmpy2.gcd(lambden,self.prime-1) == 1:
				lamb = lambnum * gmpy2.invert(lambden,self.prime-1)
			else:
				lamb = 0
			lamb = gmpy2.f_mod(lamb, self.prime-1)
			print "=> " + str(lamb)
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