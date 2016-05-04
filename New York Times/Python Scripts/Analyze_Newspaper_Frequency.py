import pandas as pd 
import collections
import matplotlib.pyplot as plt

# This script taks a year range and plot the frequency of the newspaper articles about immigration in that range

news_data = pd.read_csv("data/Imigration_news_data_clean_1850-2005.csv")

start_year, end_year= 1990,2000

year_list = []
count = 0
for index, row in news_data.iterrows():
	try:
		year = int(row.date[:4])
		if ( year >= start_year and year <= end_year):
			year_list.append(year)
	except Exception as e:
		print index


year_freq = collections.Counter(year_list)

print year_freq

plt.hist(year_list)
plt.title("Year Histogram")
plt.xlabel("Value")
plt.ylabel("Frequency")
plt.show()

