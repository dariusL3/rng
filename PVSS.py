import gmpy2
import codecs
from gmpy2 import mpz
import time

def findPrime(nbits,rs):
	test = mpz(1)
	while not gmpy2.is_prime(test):
		test = gmpy2.mpz_urandomb(rs,nbits-1)+2**(nbits-1)
	return test


class PVSS:
	def __init__(self,p):
		self.prime = mpz(p)
		self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
		self.generatorPrimary = self.sample(self.prime)
		self.generatorSecondary = self.sample(self.prime)
		self.publicKeys = []

	def sample(self, upper):
		result = 1
		while result <= 1: 
			result = gmpy2.mpz_random(self.rs, upper)
			return result

	#polynomial is a list of coefficients with descending degree
	def evaluatePoly(self,poly, x):
		result = mpz('0')
		for coef in poly:
			result *= x
			result = gmpy2.f_mod(result, self.prime)
			result += coef
			result = gmpy2.f_mod(result, self.prime)
		return result

	def ShamirDistribute(self, s, n, t):
		s = mpz(s)
		poly = [self.sample(self.prime) for i in range(t)]
		poly.append(s)
		result = []
		for i in range(n):
			share = self.evaluatePoly(poly, i)
			result.append(share)
		return result

	def PVSSDistribute(self, s, n, t):
		publicKeys = self.publicKeys
		s = mpz(s)
		sup = []
		print "Secret : " + str(gmpy2.powmod(self.generatorPrimary, s, self.prime))
		poly = [self.sample(self.prime) for i in range(t)]
		print poly
		poly.append(s)
		result = []
		for i in range(n):
			share = self.evaluatePoly(poly, i+1)
			sup.append(share)
			share = gmpy2.powmod(publicKeys[i], share, self.prime)
			result.append(share)
		return result+sup

	def ShamirReconstruct(self, xl, yl):
		n = len(xl)
		result = 0
		for i in range(n):
			x = xl[i]
			lamb = 1
			for otherx in xl:
				if not otherx==x:
					lamb *= otherx / (otherx-x)
			result += lamb*yl[i]
		return result

	def PVSSReconstruct(self, xl, dSecrets):
		n = len(xl)
		result = 1
		for i in range(n):
			x = xl[i]
			lamb = 1
			for otherx in xl:
				if not otherx==x:
					lambt = otherx * gmpy2.invert(otherx-x,self.prime)
					#print lambt
					lamb *= lambt

			temp = gmpy2.powmod(dSecrets[i],lamb, self.prime)
			result = gmpy2.f_mod(temp*result, self.prime)
		return result

	def generateKeyPair(self):
		secretKey = self.sample(self.prime)
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

	def decryptShare(self, share, sup, secretKey):
		inv = gmpy2.invert(secretKey,self.prime)
		ver = gmpy2.powmod(self.generatorPrimary,sup,self.prime)
		result = gmpy2.powmod(share,inv,self.prime)
		print (ver == result)
		return result