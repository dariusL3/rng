# 9/10:
	- added some comments (function description)
	- the protocol now adopts implementations of several algorithms in V.Shoup's book
	 to generate prime p with factorization of p-1, and find a generator

# 8/10: 
	- PVSS works properly for seemingly arbitrary prime, but only some small pairs of n,t
	- alternate usage: PVSS.py <p> <n> <t> <pre-secret>. If p is not prime, it will be replaced by a random p-bit prime.
	- using very simple test for identifying generator. Only *usually* correct, but is nonetheless an improvement where there was previously no test
	- using Generate-then-test method to find x(i) sets that evaluate all Lagrange terms into a desired pattern. If the generate-then-test yields a result, the PVSS will always work corectly. Otherwise, the search stops due to retries running out, and the protocol is considered terminated

# 25/9: 
	- small-magnitude tests passed. PVSS working properly
	- example usage: python PVSS.py <prime> <n> <t> <pre-secret>. Main flow:
	- create PVSS object , given the prime
	- call generateTestKeyPairs(n), which outputs the list of n (sk,pk) pairs
	- call PVSSDistribute(n,t,secret), which outputs n shares of the secret as described by the DDH PVSS
	- call decryptShare(share, secretKey) to obtain the decryption of secret share for one party
	- call PVSSReconstruct(<list-of-t-parties>,<list-of-t-decrypted-shares>), which returns the reconstructed secret
The secret is written to the file "secret.txt"

# 23/9: 
	- repository created
	- initial code uploaded 
	- unfinished functions: decryptShare, PVSSReconstruct