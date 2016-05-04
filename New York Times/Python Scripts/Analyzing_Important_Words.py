import pandas as pd 
from sklearn.feature_extraction.text import TfidfTransformer
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob
import operator
import indicoio
import unicodedata

# indicoio.config.api_key = '20dced3972f4ef9e1969b5efdb751099'

indicoio.config.api_key = '88ebdcaa4d4b518cdd35da49134aaddd'

# load data
news_data = pd.read_csv("Imigration_news_data_clean.csv")
print "The total number of news article entries: "
total_length = len(news_data)
print total_length
print "from " + news_data.iloc[0].date + " to " + news_data.iloc[len(news_data) - 1].date


# group data into bins and analyze the keywords of each bin by indico's api
print "How many bins do you want?"
bin_num = int(raw_input())
print "bin number is: " + str(bin_num)
count = 0
general_bin_size = int(total_length/bin_num)
left_over = total_length - general_bin_size * bin_num

all_keyword_list = []

for i in range(bin_num):

	content = ""

	if i == (bin_num - 1):
		bin_size = general_bin_size + left_over
	else:
		bin_size = general_bin_size

	for j in range(bin_size):
		if str(news_data.iloc[count]['headline']) != "nan":
			content += str(news_data.iloc[count]['headline'] + "\n")

		if str(news_data.iloc[count]['abstract']) != "nan":
			content += str(news_data.iloc[count]['abstract'] + "\n")
		
		if str(news_data.iloc[count]['snippet']) != "nan":
			content += str(news_data.iloc[count]['snippet'] + "\n")
		if str(news_data.iloc[count]['lead_paragraph']) != "nan":
			content += str(news_data.iloc[count]['lead_paragraph'] + "\n")
		count += 1
	content = re.sub("[^a-zA-Z \n]+", " ", content)
	tb = TextBlob(content)
	keywords = indicoio.keywords(content, version=2 , top_n = 50)
	keyword_list = sorted(keywords.items(), key=operator.itemgetter(1),reverse=True)

	# clean the words
	new_keyword_list = []
	for keyword in keyword_list:
		clean_keyword = unicodedata.normalize('NFKD', keyword[0]).encode('ascii','ignore')
		new_keyword_list.append((clean_keyword, keyword[1], tb.words.count(keyword[0])))
	all_keyword_list.append(new_keyword_list)

	print "finsih adding bin number: ", i 

	df = pd.DataFrame(all_keyword_list)
	# save the result into the file in every loop
	with open('test3.csv', 'a') as f:
	    df.to_csv(f, header=False)
	all_keyword_list = []
		 