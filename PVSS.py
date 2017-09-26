import gmpy2
import codecs
from gmpy2 import mpz
import time
import sys

#uses Miller-Rabin primality test, which is always correct when it  yields False, but has a chance to incorrectly yield True.
#anyway, this function is not called by any other function inside the scope of this file
def findPrime(nbits,rs):
	test = mpz(1)
	while not gmpy2.is_prime(test):	
		test = gmpy2.mpz_urandomb(rs,nbits-1)+2**(nbits-1)
	return test

#currently testing for small (known, correct) values of prime p
def test(args):
	print args
	p,n,t,secret = [mpz(ele) for ele in args[1:5]]

	if not gmpy2.is_prime(p):
		print "Need a prime"
		return
	ss = PVSS(p)
	pairs = ss.generateTestKeyPairs(n)
	shares = ss.PVSSDistribute(secret, n,t)
	dec = [ss.decryptShare(shares[i], pairs[i][0]) for i in range(n)]
	param1 = [i+1 for i in range(t)]
	param2 = [dec[i] for i in range(t)]
	res = ss.PVSSReconstruct(param1, param2)
	print res


class PVSS:
	def __init__(self,p):
		self.prime = mpz(p)
		self.rs = gmpy2.random_state(gmpy2.f_mod(mpz(time.time()),self.prime))
		self.generatorPrimary = self.sample(self.prime-1)
		self.generatorSecondary = self.sample(self.prime-1)
		self.publicKeys = []

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
		print poly
		result = []
		for i in range(n):
			share = self.evaluatePoly(poly, i+1, self.prime-1)
			#sup.append(share)
			share = gmpy2.powmod(publicKeys[i], share, self.prime)
			result.append(share)
		return result

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
		n = len(xl)
		result = 1
		for i in range(n):
			x = xl[i]
			lambnum = 1
			lambden = 1
			for otherx in xl:
				if not otherx==x:
					lambnum *= otherx
					lambden *= otherx-x

			#lambnum = gmpy2.f_mod(mpz(lambnum), self.prime)
			#lambden = gmpy2.f_mod(mpz(lambden), self.prime)
			#lamb = gmpy2.f_mod(lambnum*gmpy2.invert(lambden,self.prime),self.prime)
			lamb = lambnum / lambden
			print (lambnum,lambden,lamb)
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


if __name__=="__main__":
	test(sys.argv)