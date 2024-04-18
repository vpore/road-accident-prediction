import pandas as pd
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2
from sklearn.preprocessing import LabelEncoder

data = pd.read_csv('pp-data.csv')

# Label Encoding
label_encoding_features = ['Day_of_Week', 'Junction_Control', 'Junction_Detail', 'Light_Conditions', 'Road_Surface_Conditions', 'Road_Type', 'Urban_or_Rural_Area', 'Weather_Conditions', 'Age_Band_of_Driver', 'Junction_Location', 'Sex_of_Driver', 'Vehicle_Type']
for feature in label_encoding_features:
    data[feature] = LabelEncoder().fit_transform(data[feature])


data['Accident_Severity'] = LabelEncoder().fit_transform(data['Accident_Severity'])

data = data.drop(['Accident_Index'], axis=1)

X = data.iloc[:,2:]
X=X.astype('int')
y = data.iloc[:,1]
y=y.astype('int')

bestfeatures = SelectKBest(score_func=chi2, k=10)
fit = bestfeatures.fit(X,y)
dfscores = pd.DataFrame(fit.scores_)
dfcolumns = pd.DataFrame(X.columns)

featureScores = pd.concat([dfcolumns,dfscores],axis=1)
featureScores.columns = ['Specs','Score']
print(featureScores.nlargest(21,'Score'))