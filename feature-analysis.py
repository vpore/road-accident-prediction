import pandas as pd
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2
from sklearn.preprocessing import LabelEncoder


data = pd.read_csv('data.csv')
# data.csv contains (Accident_Information.csv + Vehicle_Information.csv) data. The data is NOT preprocessed.

non_numeric_cols = data.select_dtypes(exclude=['number']).columns

# Label Encoding
for feature in non_numeric_cols:
    data[feature] = LabelEncoder().fit_transform(data[feature])

data['Accident_Severity'] = LabelEncoder().fit_transform(data['Accident_Severity'])

data = data.drop(['Accident_Index'], axis=1)

X = data.iloc[:, [1, 2, 3, 4] + list(range(6, len(data.columns)))]
X=X.astype('int')
y = data.iloc[:,5]
y=y.astype('int')

bestfeatures = SelectKBest(score_func=chi2, k=10)
fit = bestfeatures.fit(X,y)
dfscores = pd.DataFrame(fit.scores_)
dfcolumns = pd.DataFrame(X.columns)

featureScores = pd.concat([dfcolumns,dfscores],axis=1)
featureScores.columns = ['Specs','Score']
print(featureScores.nlargest(21,'Score'))