import gmpy2
import codecs
from gmpy2 import mpz
import time
import sys
from Crypto.Hash import SHA256

class dummyEC:
	# def __init__():
	# 	self.a = 0
	# 	self.b = 0
	# 	self.p = 0
	# 	self.generator = (0,0)

	def __init__(self,a_in,b_in,p_in):
		self.a = mpz(a_in)
		self.b = mpz(b_in)
		self.p = mpz(p_in)
		self.generator = (0,0)
		self.field = []
		self.sqrtCheats = {mpz(0):mpz(0)}
		self.q = 0
		for i in range(1,self.p//2+1):
			sq = gmpy2.f_mod(mpz(i*i),self.p)
			self.sqrtCheats[sq] = mpz(i)
		#print self.sqrtCheats
		self.points = []

		for i in range(self.p):
			x = mpz(i)
			y = self.findY(x)
			if y != None:
				if y == 0 :
					self.points.append((x,y))
				else: 
					self.points += [(x,y),(x,self.p-y)]
		#self.orders = [self.findOrder(point) for point in self.points]
		#print self.orders

	def setFun(self,param1, param2):
		self.a = param1
		self.b = param2

	def setGenerator(self,g):
		gen = (mpz(g[0]),mpz(g[1]))
		self.generator = gen
		temp = gen
		self.field = [gen]
		order = 1
		while True:
			order += 1
			temp = self.add(temp,gen)
			if (temp[0] != -1):
				self.field.append(temp)
			else:
				self.q = order
				break
			

	def add(self,p1,p2):
		#print p1
		#print p2
		x1,y1 = (mpz(p1[0]),mpz(p1[1]))
		x2,y2 = (mpz(p2[0]),mpz(p2[1]))
		m = mpz(0)
		if x1 == -1:
			return (x2,y2)
		elif x2 == -1:
			return (x1,y1)
		elif x1 == x2:
			if y1 == y2 and y1 != 0:
				m = gmpy2.f_mod((3*x1*x1+self.a)*gmpy2.invert(2*y2,self.p),self.p)
			else:
				return (mpz(-1),mpz(-1))
		else:
			m = gmpy2.f_mod((y2-y1) * gmpy2.invert(x2-x1,self.p),self.p)
		x = gmpy2.f_mod(m*m-x1-x2,self.p)
		y = gmpy2.f_mod(-y1-m*(x-x1),self.p)
		return (x,y)

	def mul(self,p1,k):
		#print p1
		#print k
		if k==0 or p1[0] == -1:
			return (mpz(-1),mpz(-1))
		temp = p1
		for i in range(k-1):
			temp = self.add(temp,p1)
		return temp

	def findOrder(self,p1):
		p1 = (mpz(p1[0]),mpz(p1[1]))
		temp = self.add(p1,p1)
		res = 1
		#print p1
		while (temp != p1):
		#	print temp
			temp = self.add(temp,p1)
			res += 1
		#print res
		return res

	def findY(self,x):
		temp = gmpy2.f_mod(x*x*x + self.a*x + self.b, self.p)
		res = self.sqrtCheats.get(temp)
		if res == None:
			return None
		else:
			return res

