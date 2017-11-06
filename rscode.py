from sympy import *

class RSCode:
	def __init__(self,n,t):
		self.n = n
		self.t = t
		m = [[i**j for i in range(1,n+1)] for j in range(t)]
		self.generatorMat = Matrix(m)
		inter = self.generatorMat.rref()[0]
		inter = inter[:,t:].T*-1
		self.parityMat = inter.row_join(eye(n-t))

	def getCodewordInDual(self,vec):
		vec = Matrix(vec).T
		
		if not vec.shape == (1,self.n-self.t):
			return None
		else:
			#temp = vec*self.parityMat
			#print self.generatorMat*temp.T
			return (vec*self.parityMat).tolist()[0]

