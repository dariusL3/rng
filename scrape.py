import PVSS
import gmpy2
from gmpy2 import mpz

import sys
from PVSS import *


def test(args):
	p,a,b,gx,gy,n,remain = [mpz(ele) for ele in args[1:9]]
	t = n // 2
	g = (gx,gy)
	ss = PVSS(p,a,b,g,n,t)
	ss.generateTestKeyPairs(n)
	randomVec = [ss.sample(ss.order) for i in range(n)]
	print "Setup..."
	print "Using Elliptic Curve : y^2 = " + a.digits(10) + "x^3 + " + b.digits(10) + " over Z" + p.digits(10)
	print "Generators: " + tostr(ss.generatorPrimary) + " , " + tostr(ss.generatorSecondary)
	print "Party secret keys : " + tostr(ss.secretKeys)
	print "Party public keys : " + conc([tostr(k) for k in ss.publicKeys])

	print "\nCommit..."
	valid = True
	sharesof = []
	commits = []
	for i,val in enumerate(randomVec):
		print "\nParty " + str(i+1) + " deals" 
		commitment = ss.ec.mul(ss.publicKeys[i],val)
		print "Commitment : " + tostr(commitment)
		commits.append(commitment)
		shares,proof = ss.PVSSDistribute(val)
		sharesof.append(shares)

		if not ss.verifyZKP(shares,proof[0],proof[1],proof[2],False):
			valid = False

	print "\nReveal..."
	if valid:
		print "...All proofs valid !"
	onlineParties = ss.getRandomCollection(remain,n)
	
	opened = [False for i in range(n)]
	recoveredRandomVec = [None for i in range(n)]
	for p in onlineParties:
		opened[p] = True
	for i,shares in enumerate(sharesof):
		if opened[i]:
			recoveredRandomVec[i] = ss.decryptShare(commits[i],ss.secretKeys[i])
			print "Open (" + str(i+1) + ") : " + tostr(recoveredRandomVec[i])

	print "Finalizing protocol with " + remain.digits() + " opens : " + conc([(p+1).digits() for p in onlineParties])
	print "\nRecovery..."
	for i,shares in enumerate(sharesof):
		if not opened[i]:
			dec = [ss.decryptShare(shares[p], ss.secretKeys[p]) for p in onlineParties]
			print "Reconstruct (" + str(i+1) + ")..."	
			print "Decryptions : " + conc([tostr(d) for d in dec])
			res = ss.PVSSReconstruct([(p+1) for p in onlineParties], dec)
			print "...Recovered : " + tostr(res)
			recoveredRandomVec[i] = res

	beacon = (mpz(-1),mpz(-1))
	for point in recoveredRandomVec:
		beacon = ss.ec.add(beacon,point)

	print "\n--> Beacon : " + tostr(beacon)
	print "Correctness check : " + "True" if all(ele[0]==ele[1] for ele in zip([ss.ec.mul(ss.generatorPrimary,r) for r in randomVec],recoveredRandomVec)) else "False"
	



if __name__=="__main__":
	test(sys.argv)