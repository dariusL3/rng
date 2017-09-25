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