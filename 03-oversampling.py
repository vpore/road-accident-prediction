
import pandas as pd
import matplotlib.pyplot as plt
from imblearn.over_sampling import SMOTE

df_model = pd.read_csv('model-data.csv')

class_counts = df_model['labels'].value_counts()
print(class_counts)

sm = SMOTE(sampling_strategy='minority', random_state=7)

oversampled_trainX, oversampled_trainY = sm.fit_resample(df_model.drop('labels', axis=1), df_model['labels'])
oversampled_train = pd.concat([pd.DataFrame(oversampled_trainY), pd.DataFrame(oversampled_trainX)], axis=1)
print(oversampled_train['labels'].value_counts())

oversampled_trainX1, oversampled_trainY1 = sm.fit_resample(oversampled_train.drop('labels', axis=1), oversampled_train['labels'])
oversampled_train1 = pd.concat([pd.DataFrame(oversampled_trainY1), pd.DataFrame(oversampled_trainX1)], axis=1)
print(oversampled_train1['labels'].value_counts())

# oversampled_train1.to_csv('model-data-os.csv')

data = pd.read_csv('model-data-os.csv')

data['labels'] = data['labels'].replace({0: 'Slight', 1: 'Serious', 2: 'Fatal'})

# Severity proportion
severity_counts = data["labels"].value_counts()
severity_percentage = (severity_counts / severity_counts.sum()) * 100
plt.figure(figsize=(12, 8))
plt.bar(severity_counts.index, severity_counts)
plt.xlabel('Severity')
plt.ylabel('Counts')
plt.title('The distribution of accidents severity')
legend_labels = [f'{label} ({percentage:.2f}%)' for label, percentage in zip(severity_counts.index, severity_percentage)]
plt.legend(legend_labels, title='Severity', loc='upper right')
plt.show()