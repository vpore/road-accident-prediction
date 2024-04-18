
import pandas as pd
import numpy as np

data = pd.read_csv('pp-data.csv')

print(data.info())

for col in ['Accident_Severity', 'Day_of_Week', 'Junction_Control', 'Junction_Detail', 'Light_Conditions',
            'Road_Surface_Conditions', 'Road_Type', 'Urban_or_Rural_Area', 'Weather_Conditions',
            'Age_Band_of_Driver', 'Junction_Location', 'Sex_of_Driver', 'Vehicle_Manoeuvre', 'Vehicle_Type']:
    data[col] = data[col].astype('category')

num_cols = ['Latitude', 'Longitude', 'Time',
            'Age_of_Vehicle', 'Engine_Capacity_.CC.']

cat_cols = ['Day_of_Week', 'Junction_Control', 'Junction_Detail', 'Light_Conditions','Road_Surface_Conditions',
            'Road_Type', 'Urban_or_Rural_Area', 'Weather_Conditions', 'Age_Band_of_Driver', 'Junction_Location',
            'Sex_of_Driver', 'Vehicle_Manoeuvre', 'Vehicle_Type']

target_col = ['Accident_Severity']

cols = cat_cols + num_cols + target_col

df_model = data[cols].copy()

dummies = pd.get_dummies(df_model[cat_cols], drop_first=True)
df_model = pd.concat([df_model[num_cols], df_model[target_col], dummies], axis=1)

df_model['labels'] = df_model['Accident_Severity'].replace({'Slight': 0, 'Serious': 1, 'Fatal':2})
df_model.drop(['Accident_Severity'], axis = 1, inplace = True)
print(df_model.shape)

for i in dummies:
    dummies[i] = np.asarray(dummies[i]).astype('float32')

# df_model.to_csv('model-data.csv')

# unique_values = {col: data[col].unique() for col in cat_cols}

# max_length = max(len(arr) for arr in unique_values.values())

# padded_values = {col: np.pad(unique_values, (0, max_length - len(unique_values)), 'constant', constant_values=np.nan)
#                  for col, unique_values in unique_values.items()}

# unique_values_df = pd.DataFrame(padded_values)
# unique_values_df.to_csv('unique_values.csv', index=False)