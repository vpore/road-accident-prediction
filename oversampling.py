
import pandas as pd

df_model = pd.read_csv('model-data.csv')

class_counts = df_model['labels'].value_counts()
print(class_counts)

from imblearn.over_sampling import SMOTE
sm = SMOTE(sampling_strategy='minority', random_state=7)

oversampled_trainX, oversampled_trainY = sm.fit_resample(df_model.drop('labels', axis=1), df_model['labels'])
oversampled_train = pd.concat([pd.DataFrame(oversampled_trainY), pd.DataFrame(oversampled_trainX)], axis=1)
print(oversampled_train['labels'].value_counts())

oversampled_trainX1, oversampled_trainY1 = sm.fit_resample(oversampled_train.drop('labels', axis=1), oversampled_train['labels'])
oversampled_train1 = pd.concat([pd.DataFrame(oversampled_trainY1), pd.DataFrame(oversampled_trainX1)], axis=1)
print(oversampled_train1['labels'].value_counts())

# oversampled_train1.to_csv('model-data-os.csv')