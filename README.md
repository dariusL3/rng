# 23/9: repository created. Initial code uploaded
Unfinished functions: decryptShare, PVSSReconstruct
# 25/9: small-magnitude tests passed. PVSS working properly

Example usage: python PVSS.py <prime> <n> <t> <pre-secret>
Main flow:
	- create PVSS object , given the prime
	- call generateTestKeyPairs(n), which outputs the list of n (sk,pk) pairs
	- call PVSSDistribute(n,t,secret), which outputs n shares of the secret as described by the DDH PVSS
	- call decryptShare(share, secretKey) to obtain the decryption of secret share for one party
	- call PVSSReconstruct(<list-of-t-parties>,<list-of-t-decrypted-shares>), which returns the reconstructed secret
The secret is written to the file "secret.txt"

# 8/10: PVSS works properly for seemingly arbitrary prime, but only some small pairs of n,t
Alternate usage: PVSS.py <p> <n> <t> <pre-secret>. If p is not prime, it will be replaced by a random p-bit prime.
	- using very simple test for identifying generator. Only *usually* correct, but is nonetheless an improvement where there was previously no test
	- using Generate-then-test method to find x(i) sets that evaluate all Lagrange terms into a desired pattern. If the generate-then-test yields a result, the PVSS will always work corectly. Otherwise, the search stops due to retries running out, and the protocol is considered terminated