# import matplotlib.pyplot as plt



# D = {u'Label1':26, u'Label2': 17, u'Label3':30}

# plt.bar(range(len(D)), D.values(), align='center')
# plt.xticks(range(len(D)), D.keys())

# plt.show()

from pandas import *

d = {'one' : Series([1., 2., 3.], index=['a', 'b', 'c']),
    'two' : Series([1., 2., 3., 4.], index=['a', 'b', 'c', 'd'])}

df = DataFrame(d)
print df
# #print df

# print "DF", type(df['one']), "\n", df['one']

dfList = df['one'].tolist()

print "DF list", dfList, type(dfList)