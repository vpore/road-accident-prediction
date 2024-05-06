
import pandas as pd
import numpy as np

data = pd.read_csv('pp-data.csv')

# print(data.info())
data_type_counts = data.dtypes.value_counts()
print('\n\nBEFORE ENCODING -')
print(data_type_counts)

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

df_model.drop(['Accident_Severity'], axis = 1, inplace = True)
print(df_model.shape)

# df_model.to_csv('model-data.csv')

for i in dummies:
    dummies[i] = np.asarray(dummies[i]).astype('float32')

mod_data = pd.read_csv('model-data.csv')
mod_data_type_counts = mod_data.dtypes.value_counts()
print('\n\nAFTER ENCODING -')
print(mod_data_type_counts)