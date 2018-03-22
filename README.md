# 22/3:
	- redesigned interfacce
	- properly implemented client-side entropy sampling (crypto.getRandomValues)
	- dapp functioning correctly

# 15/3:
	- updated smart contract code
	- uploaded private net folder used for testing - extended from Vincent Chu's github project (https://github.com/vincentchu/eth-private-net)
	- functionalities all added (and working properly) except for coding-theory-based verification
	- for now, tests have been done for up to 6 parties, all with valid results (in various possible scenarios)

# 17/1:
	- added an implementation of SCRAPE as contract
	- heavy computations are in the form of pure / view functions (which makes them effectively client-side, see "Solidity function types" for clarification)
	- added a runtime transcript (log)

# 20/11:
	- added actual-elliptic-curve implementation of PVSS
	- uses secp256k1 curve (to match major cryptocurrencies)

# 6/11:
	- added implementation for SCRAPE protocol
	- added reconstructing party's proof in PVSS
	- all implementations are for demonstration and do not involve creating dummy entities / simulating internet connections etc.
	- added a simple implementation for Reed-Solomon code (for verification phase)
	- mainly manipulates the matrices G and H, using SymPy library
	- note that SymPy does not come with mpz support or Zp-typed elements, so it should only be used for small numbers

# 3/11:
	- computations now take place on an elliptic curve group with prime order
	- new implementation class : dummyEC. It is used for giving small-sized demonstrations. Need to switch to an ECC library for practical use

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
