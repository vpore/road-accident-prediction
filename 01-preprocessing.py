
import pandas as pd
# import tensorflow as tf

# Data Visualization
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import LabelEncoder

accident_data = pd.read_csv('dataset/Accident_Information.csv')
vehicle_data = pd.read_csv('dataset/Vehicle_Information.csv')

# ---- Data Preprocessing - Accident Data ----

accident_data.columns = accident_data.columns.str.strip()
# print(accident_data.head())
# print(accident_data.info())
# print(accident_data.describe())

# Drop irrelevant columns
irrelavant_columns = ['1st_Road_Class', '1st_Road_Number', '2nd_Road_Class', '2nd_Road_Number', 'Date', 'Did_Police_Officer_Attend_Scene_of_Accident', 'Local_Authority_(District)', 'Local_Authority_(Highway)', 'Location_Easting_OSGR', 'Location_Northing_OSGR', 'LSOA_of_Accident_Location', 'Pedestrian_Crossing-Human_Control', 'Pedestrian_Crossing-Physical_Facilities', 'Police_Force', 'Year','InScotland']
accident_data = accident_data.drop(irrelavant_columns, axis=1)
num_duplicates = accident_data['Accident_Index'].duplicated().sum()
# print('Duplicate Accident Data Entries - ', num_duplicates)
accident_data = accident_data.drop_duplicates(subset='Accident_Index', keep='first')

# Simplify certain columns
def simplify(description):
    if 'darkness' in description.lower():
        return 'Darkness'
    elif 'ice' in description.lower():
        return 'Snow'    
    else:
        return description

def simplify_road(description):
    if 'dry' in description.lower():
        return 'dry'
    else:
        return 'wet'

def simplify_weather(description):
    if 'raining' in description.lower():
        return 'rain'
    elif 'fog' in description.lower():
        return 'rain'
    elif 'snowing' in description.lower():
        return 'snow'
    elif 'unknown' in description.lower():
        return 'fine'
    elif 'fine' in description.lower():
        return 'fine'
    else:
        return description

accident_data['Weather_Conditions'] = accident_data['Weather_Conditions'].apply(simplify_weather)
accident_data['Light_Conditions'] = accident_data['Light_Conditions'].apply(simplify)
accident_data['Road_Surface_Conditions'] = accident_data['Road_Surface_Conditions'].apply(simplify)
accident_data['Road_Surface_Conditions'] = accident_data['Road_Surface_Conditions'].apply(simplify_road)
# accident_data['Weather_Conditions'] = accident_data['Weather_Conditions'].apply(simplify)

# Replace the empty data with NaN
accident_data.replace("", float("NaN"), inplace=True)
accident_data.replace(" ", float("NaN"), inplace=True)
accident_data.replace("Data missing or out of range", float("NaN"), inplace=True)
accident_data.replace("Other junction", float("NaN"), inplace=True)
accident_data.replace("Other", float("NaN"), inplace=True)

# Count missing value of each columns
count_missing_value = accident_data.isna().sum() / accident_data.shape[0] * 100
count_missing_value_df = pd.DataFrame(count_missing_value.sort_values(ascending=False), columns=['Missing%'])

# Visualize the percentage of Missing value in each column
missing_value_df = count_missing_value_df[count_missing_value_df['Missing%'] > 0]
plt.figure(figsize=(15, 10))
missing_value_graph = sns.barplot(y = missing_value_df.index, x = "Missing%", data=missing_value_df, orient="h")
missing_value_graph.set_title("Percentage Missing value of each feature", fontsize = 20)
missing_value_graph.set_ylabel("Features")
# plt.show()

# print('\nMissing values %\n', count_missing_value_df.head(10))

# Drop columns with greater % of missing values
missing_value_40_df = count_missing_value_df[count_missing_value_df['Missing%'] > 40]
accident_data.drop(missing_value_40_df.index, axis=1, inplace=True)

fig, axes = plt.subplots(2, 2, figsize=(8, 6))

# Imputation by max value count
accident_data['Junction_Control'].replace(float("NaN"), "Give way or uncontrolled", inplace=True)
accident_data['Junction_Control'].replace("Stop sign", "Give way or uncontrolled", inplace=True)
accident_data['Junction_Control'].replace("Authorised person", "Give way or uncontrolled", inplace=True)
jc_counts = accident_data['Junction_Control'].value_counts()
axes[0,0].bar(jc_counts.index, jc_counts)
axes[0,0].set_title('Junction Control')

wc_counts = accident_data['Weather_Conditions'].value_counts()
axes[0,1].bar(wc_counts.index, wc_counts)
axes[0,1].set_title('Weather Conditions')
accident_data['Weather_Conditions'].replace(float("NaN"), "fine", inplace=True)

accident_data['Junction_Detail'] = accident_data['Junction_Detail'].fillna(accident_data['Junction_Detail'].mode()[0])
accident_data['Junction_Detail'].replace("Mini-roundabout", "Roundabout", inplace=True)
accident_data['Junction_Detail'].replace("More than 4 arms (not roundabout)", "Crossroads", inplace=True)
accident_data['Junction_Detail'].replace("Private drive or entrance", "Slip road", inplace=True)
accident_data['Junction_Detail'].replace("T or staggered junction", "Crossroads", inplace=True)
jd_counts = accident_data['Junction_Detail'].value_counts()
axes[1,0].bar(jd_counts.index, jd_counts)
axes[1,0].set_title('Junction Detail')

rsc_counts = accident_data['Road_Surface_Conditions'].value_counts()
axes[1,1].bar(rsc_counts.index, rsc_counts)
axes[1,1].set_title('Road Surface Conditions')
accident_data['Road_Surface_Conditions'].replace(float("NaN"), "dry", inplace=True)

accident_data['Road_Type'].replace("Unknown", "Single carriageway", inplace=True)
accident_data['Road_Type'].replace("One way street", "Single carriageway", inplace=True)
accident_data['Road_Type'].replace("Slip road", "Single carriageway", inplace=True)
rt_counts = accident_data['Road_Type'].value_counts()

plt.tight_layout()
# plt.show()

# Imputation by corresponding class Mean value
accident_data['Latitude'] = accident_data['Latitude'].fillna(accident_data['Latitude'].mean())
accident_data['Longitude'] = accident_data['Longitude'].fillna(accident_data['Longitude'].mean())

count_missing_value = accident_data.isna().sum() / accident_data.shape[0] * 100
count_missing_value_df = pd.DataFrame(count_missing_value.sort_values(ascending=False), columns=['Missing%'])
# print('\nMissing values %\n', count_missing_value_df.head(5))

# Datatype correcting
accident_data['Time'] = pd.to_datetime(accident_data['Time'],format='%H:%M').dt.hour

# accident_data.to_csv('pp-acc-data.csv')

# ---- Data Preprocessing - Vehicle Data ----

vehicle_data.columns = vehicle_data.columns.str.strip()
# print(vehicle_data.head())
# print(vehicle_data.info())
# print(vehicle_data.describe())

# Drop irrelevant columns
irrelavant_columns = ['Driver_Home_Area_Type', 'Driver_IMD_Decile', 'Hit_Object_in_Carriageway', 'Hit_Object_off_Carriageway', 'Journey_Purpose_of_Driver', 'make', 'model', 'Propulsion_Code', 'Towing_and_Articulation', 'Vehicle_Leaving_Carriageway', 'Vehicle_Location.Restricted_Lane', 'Vehicle_Reference', 'Was_Vehicle_Left_Hand_Drive', 'Year']
vehicle_data = vehicle_data.drop(irrelavant_columns, axis=1)
num_duplicates = vehicle_data['Accident_Index'].duplicated().sum()
# print('Duplicate Vehicle Data Entries- ', num_duplicates)
vehicle_data = vehicle_data.drop_duplicates(subset='Accident_Index', keep='first')

# Simplify certain columns
def simplify(description):
    if 'car' in description.lower() or 'vehicle' in description.lower():
        return 'Car'
    elif 'motorcycle' in description.lower():
        return 'Motorcycle'
    elif 'goods' in description.lower() or 'bus' in description.lower() or 'Minibus' in description.lower():
        return 'Bus'
    else:
        return 'Motorcycle'

def simplify_gender(description):
    if 'not known' in description.lower():
        return 'Male'
    else:
        return description

vehicle_data['Vehicle_Type'] = vehicle_data['Vehicle_Type'].apply(simplify)
vehicle_data['Sex_of_Driver'] = vehicle_data['Sex_of_Driver'].apply(simplify_gender)

# Replace the empty data with NaN
vehicle_data.replace("", float("NaN"), inplace=True)
vehicle_data.replace(" ", float("NaN"), inplace=True)
vehicle_data.replace("Data missing or out of range", float("NaN"), inplace=True)
vehicle_data.replace("Other/Not known (2005-10)", float("NaN"), inplace=True)

# Count missing value of each columns
count_missing_value = vehicle_data.isna().sum() / vehicle_data.shape[0] * 100
count_missing_value_df = pd.DataFrame(count_missing_value.sort_values(ascending=False), columns=['Missing%'])

# Visualize the percentage of Missing value in each column
missing_value_df = count_missing_value_df[count_missing_value_df['Missing%'] > 0]
plt.figure(figsize=(15, 10))
missing_value_graph = sns.barplot(y = missing_value_df.index, x = "Missing%", data=missing_value_df, orient="h")
missing_value_graph.set_title("Percentage Missing value of each feature", fontsize = 20)
missing_value_graph.set_ylabel("Features")
# plt.show()

# print('\nMissing values %\n', count_missing_value_df.head(10))

# Drop columns with greater % of missing values
missing_value_40_df = count_missing_value_df[count_missing_value_df['Missing%'] > 40]
vehicle_data.drop(missing_value_40_df.index, axis=1, inplace=True)

fig, axes = plt.subplots(2, 2, figsize=(8, 6))

# Imputation by median value
agev_counts = vehicle_data['Age_of_Vehicle'].value_counts()
axes[0,1].bar(agev_counts.index, agev_counts)
axes[0,1].set_title('Age of Vehicle')
vehicle_data['Age_of_Vehicle'] = vehicle_data['Age_of_Vehicle'].fillna(vehicle_data['Age_of_Vehicle'].median())

ec_counts = vehicle_data['Engine_Capacity_.CC.'].value_counts()
axes[1,0].hist(ec_counts, bins=100, alpha=0.7)
axes[1,0].set_title('Engine_Capacity_.CC.')
axes[1,0].grid(True)
vehicle_data['Engine_Capacity_.CC.'] = vehicle_data['Engine_Capacity_.CC.'].fillna(vehicle_data['Engine_Capacity_.CC.'].median())

plt.tight_layout()
# plt.show()

fig, axes = plt.subplots(2, 2, figsize=(8, 6))

# Imputation by max value count
vehicle_data['Age_Band_of_Driver'] = vehicle_data['Age_Band_of_Driver'].fillna(vehicle_data['Age_Band_of_Driver'].mode()[0])
vehicle_data['Age_Band_of_Driver'].replace("Nov-15", "26 - 35", inplace=True)
vehicle_data['Age_Band_of_Driver'].replace("06-Oct", "26 - 35", inplace=True)
aged_counts = vehicle_data['Age_Band_of_Driver'].value_counts()
axes[1,0].bar(aged_counts.index, aged_counts)
axes[1,0].set_title('Age_Band_of_Driver')

vehicle_data['Junction_Location'].replace("Mid Junction - on roundabout or on main road", "At junction", inplace=True)
vehicle_data['Junction_Location'].replace("Cleared junction or waiting/parked at junction exit", "At junction", inplace=True)
vehicle_data['Junction_Location'].replace("Approaching junction or waiting/parked at junction approach", "Approaching junction", inplace=True)
vehicle_data['Junction_Location'].replace("Entering main road", "At main road", inplace=True)
vehicle_data['Junction_Location'].replace("Leaving main road", "At main road", inplace=True)
vehicle_data['Junction_Location'].replace("Entering roundabout", "At roundabout", inplace=True)
vehicle_data['Junction_Location'].replace("Leaving roundabout", "At roundabout", inplace=True)
vehicle_data['Junction_Location'].replace("Entering from slip road", "At slip road", inplace=True)


vehicle_data['Vehicle_Manoeuvre'].replace("Going ahead other", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Parked", "goal", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Turning right", "right", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Going ahead right-hand bend", "sharp right", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Moving off", "depart", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Going ahead left-hand bend", "sharp left", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Changing lane to right", "slight right", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Reversing", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Slowing or stopping", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("U-turn", "u-turn", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Turning left", "left", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Overtaking moving vehicle - offside", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Waiting to go - held up", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Waiting to turn right", "keep right", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Overtaking - nearside", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Waiting to turn left", "keep left", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Overtaking static vehicle - offside", "straight", inplace=True)
vehicle_data['Vehicle_Manoeuvre'].replace("Changing lane to left", "slight left", inplace=True)


# jl_counts = vehicle_data['Junction_Location'].value_counts()
# print(jl_counts)
# print()
# vm_counts = vehicle_data['Vehicle_Manoeuvre'].value_counts()
# print(vm_counts)
# print()
# x1_counts = vehicle_data['X1st_Point_of_Impact'].value_counts()
# print(x1_counts)

plt.tight_layout()
# plt.show()

diff_cols = ['X1st_Point_of_Impact']
vehicle_data = vehicle_data.drop(diff_cols, axis=1)

count_missing_value = vehicle_data.isna().sum() / vehicle_data.shape[0] * 100
count_missing_value_df = pd.DataFrame(count_missing_value.sort_values(ascending=False), columns=['Missing%'])
# print('\nMissing values %\n', count_missing_value_df.head(5))

print()
unique_counts = vehicle_data.nunique()
# print(unique_counts)

# vehicle_data.to_csv('pp-vec-data.csv')

# data = pd.merge(accident_data, vehicle_data, on='Accident_Index', how='inner')
# data.to_csv('pp-data.csv')

df = pd.read_csv('pp-data.csv')
amb_cols = ['Number_of_Casualties','Number_of_Vehicles','Speed_limit','Unnamed: 0','Unnamed: 0_x','Unnamed: 0_y']
final = df.drop(amb_cols, axis=1)
# final.to_csv('final-pp-data.csv')

# # Label Encoding
# ad_label_encoding_features = ['Day_of_Week', 'Junction_Control', 'Junction_Detail', 'Light_Conditions', 'Road_Surface_Conditions', 'Road_Type', 'Urban_or_Rural_Area', 'Weather_Conditions']
# for feature in ad_label_encoding_features:
#     accident_data[feature] = LabelEncoder().fit_transform(accident_data[feature])

# vd_label_encoding_features = ['Age_Band_of_Driver', 'Junction_Location', 'Sex_of_Driver', 'Vehicle_Manoeuvre', 'Vehicle_Type', 'X1st_Point_of_Impact']
# for feature in vd_label_encoding_features:
#     vehicle_data[feature] = LabelEncoder().fit_transform(vehicle_data[feature])

# ---- Merge data - Accident Data + Vehicle Data ----

# data = pd.merge(accident_data, vehicle_data, on='Accident_Index', how='inner')
# data.to_csv('pp-data-encoded.csv')




# ---- EDA - Accident Data ----

data = pd.read_csv('pp-data.csv')

# Severity proportion
severity_counts = data["Accident_Severity"].value_counts()
severity_percentage = (severity_counts / severity_counts.sum()) * 100
plt.figure(figsize=(12, 6))
plt.bar(severity_counts.index, severity_counts)
plt.xlabel('Severity')
plt.ylabel('Counts')
plt.title('The distribution of accidents severity')
legend_labels = [f'{label} ({percentage:.2f}%)' for label, percentage in zip(severity_counts.index, severity_percentage)]
plt.legend(legend_labels, title='Severity', loc='upper right')
# plt.show()

# Mean speed limit of each severity
mean_speed_limit = data.groupby('Accident_Severity')["Speed_limit"].mean().round(2)
plt.figure(figsize=(8, 6))
plt.bar(mean_speed_limit.index, mean_speed_limit)
plt.xlabel('Severity')
plt.ylabel('Mean Speed Limit')
plt.title('Speed_limit of each Severity')
plt.xticks(rotation=0)
for x, y in enumerate(mean_speed_limit):
    plt.text(x, y, str(y), ha='center', va='bottom')
# plt.show()

# Junction Control grouped by accident severity
data.groupby('Accident_Severity')['Junction_Control'].value_counts().unstack().plot.bar(
    figsize=(22, 8),
    ylabel='Counts',
    width=.9
)
plt.title("Junction Control grouped by Accident Severity", fontsize = 22)
# plt.show()

# Weekly view with hours
data.groupby('Day_of_Week')['Time'].value_counts().unstack().plot.bar(
    figsize=(22, 8),
    ylabel='Counts',
    width=.9
)
plt.title("Accidents Weekly change in a view of hour", fontsize = 22)
# plt.show()


# Light conditions grouped by accident severity
data.groupby('Accident_Severity')['Light_Conditions'].value_counts().unstack().plot.bar(
    figsize=(22, 8),
    ylabel='Counts',
    width=.9
)
plt.title("Light conditions grouped by Accident Severity", fontsize = 22)
# plt.show()

# Age band of driver grouped by accident severity
data.groupby('Accident_Severity')['Age_Band_of_Driver'].value_counts().unstack().plot.bar(
    figsize=(22, 8),
    ylabel='Counts',
    width=.9
)
plt.title("Age Band of Driver grouped by Accident Severity", fontsize = 22)
# plt.show()

# Propulsion grouped by accident severity
data.groupby('Accident_Severity')['Propulsion_Code'].value_counts().unstack().plot.bar(
    figsize=(22, 8),
    ylabel='Counts',
    width=.9
)
plt.title("Propulsion of Vehicle grouped by Accident Severity", fontsize = 22)
# plt.show()

# Vehicle Type grouped by accident severity
data.groupby('Accident_Severity')['Vehicle_Type'].value_counts().unstack().plot.bar(
    figsize=(22, 8),
    ylabel='Counts',
    width=.9
)
plt.title("Vehicle Type grouped by Accident Severity", fontsize = 22)
# plt.show()