
from nytimesarticle import articleAPI
import random
import csv

# NYT's apit keys. 
keys = ['37d89788d5efde83dfc659b270013451:12:74956961', '8ad11267290079dce882e441bcc1f9ca:7:74956961', '244bab76401428b8b2ab7f577f4ca4f1:16:74956927', '9bf0e7ca08d744af12690aa9a3297db3:7:74860459', 'd9e88ec52f81554582b9113ec483380f:7:74860382', '1c8febf988738d374f75b4c464956a2a:8:74860357', '6b2f41ba1ebef709a0b04afbb9e6787a:11:74818531', 'e7a91ce309bccd906d446b1ee1fd29b9:10:74818531', '5cd382a4d5a806d110bd2ef43ac0fb0a:13:74818531']
key = random.choice(keys)
api = articleAPI(key)


def parse_articles(articles):
    '''
    This function takes in a response to the NYT api and parses
    the articles into a list of dictionaries
    '''
    news = []
    for i in articles['response']['docs']:
        dic = {}
        dic['id'] = i['_id']
        if i['abstract'] is not None:
            dic['abstract'] = i['abstract'].encode("utf8")
        
        if i['lead_paragraph'] is not None:
            dic['lead_paragraph'] = i['lead_paragraph'].encode("utf8")

        dic['headline'] = i['headline']['main'].encode("utf8")
        dic['desk'] = i['news_desk']
        dic['date'] = i['pub_date'][0:10] # cutting time of day.
        dic['section'] = i['section_name']
        if i['snippet'] is not None:
            dic['snippet'] = i['snippet'].encode("utf8")
        dic['source'] = i['source']
        dic['type'] = i['type_of_material']
        dic['url'] = i['web_url']
        dic['word_count'] = i['word_count']
        # locations
        locations = []
        for x in range(0,len(i['keywords'])):
            if 'glocations' in i['keywords'][x]['name']:
                locations.append(i['keywords'][x]['value'])
        dic['locations'] = locations
        # subject
        subjects = []
        for x in range(0,len(i['keywords'])):
            if 'subject' in i['keywords'][x]['name']:
                subjects.append(i['keywords'][x]['value'])
        dic['subjects'] = subjects   
        # organization
        organizations = []
        for x in range(0,len(i['keywords'])):
            if 'organizations' in i['keywords'][x]['name']:
                # if organizations.append(i['keywords'][x]['value']) is not None:
                organizations.append(i['keywords'][x]['value'])
                # .encode("utf8")
        dic['organizations'] = organizations  



        news.append(dic)
    return(news)

def get_articles(date,query):
    '''
    This function accepts a year in string format (e.g.'1980')
    and a query (e.g.'Amnesty International') and it will 
    return a list of parsed articles (in dictionaries)
    for that year.
    '''
    all_articles = []
    for i in range(0,100): #NYT limits pager to first 100 pages. But rarely will you find over 100 pages of results anyway.
        articles = api.search(q = query,
               # fq = {'source':['Reuters','AP', 'The New York Times']},
               # begin_date = date + '0101',
               begin_date = date + '0101',
               end_date = date + '1231',
               sort='oldest',
               page = str(i))
        articles = parse_articles(articles)
        all_articles = all_articles + articles
    return(all_articles)



if __name__ == '__main__':
    Amnesty_all = []
    i = 2006
    while (i < 2010):
        try: 
            print 'Processing' + str(i) + '...'
            Amnesty_year =  get_articles(str(i),'immigration')
            Amnesty_all = Amnesty_all + Amnesty_year
        except Exception as e:
            print e
            key = random.choice(keys) # If the NYT's api key is over limit, the script will switch the key randomly
            api = articleAPI(key)
            print "over limit !!!!!!!!!! switch to the key: ", key
            continue
        i += 1
    keys = Amnesty_all[0].keys()
    with open('Imigration_news_data_clean_1850-2005 _2.csv', 'a') as output_file:
        dict_writer = csv.DictWriter(output_file, keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(Amnesty_all)