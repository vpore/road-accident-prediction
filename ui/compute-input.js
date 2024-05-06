
export function compute_input(
  hour,
  age_vehicle,
  age_driver,
  engine_cap,
  gender,
  vehicle_type,
  day,
  weather,
  trafficsignal_dis,
  junction_dis,
  roundabout_dis,
  sliproad_dis,
  singcrg_dis,
  doublecrg_dis,
  manoeuvre,
  coordinatesData,
  inputData
) {
  for (let i = 0; i < coordinatesData.length; i++) {
    var inputEntry = {
      Latitude: coordinatesData[i][1],
      Longitude: coordinatesData[i][0],
      Time: hour,
      Age_of_Vehicle: age_vehicle,
      Engine_Capacity: engine_cap,
      Day_of_Week_Monday: day == 1 ? 1 : 0,
      Day_of_Week_Saturday: day == 6 ? 1 : 0,
      Day_of_Week_Sunday: day == 0 ? 1 : 0,
      Day_of_Week_Thursday: day == 4 ? 1 : 0,
      Day_of_Week_Tuesday: day == 2 ? 1 : 0,
      Day_of_Week_Wednesday: day == 3 ? 1 : 0,
      Junction_Control_Give_way_or_uncontrolled: trafficsignal_dis[i]
        ? 0
        : junction_dis[i],
      Junction_Control_Not_at_junction: trafficsignal_dis[i]
        ? 0
        : junction_dis[i]
        ? 0
        : 1,
      Junction_Detail_Not_at_junction: junction_dis[i] ? 0 : 1,
      Junction_Detail_Roundabout: roundabout_dis[i] ? 1 : 0,
      Junction_Detail_Slip_road: sliproad_dis[i] ? 1 : 0,
      Light_Conditions_Daylight: hour > 6 && hour < 19 ? 1 : 0,
      Road_Surface_Conditions_wet:
        weather == "rain" || weather == "snow" ? 1 : 0,
      Road_Type_Roundabout: roundabout_dis[i] ? 1 : 0,
      Road_Type_Single_carriageway: singcrg_dis[i],
      Urban_or_Rural_Area_Urban: 1,
      Weather_Conditions_rain: weather == "rain" ? 1 : 0,
      Weather_Conditions_snow: weather == "snow" ? 1 : 0,
      Age_Band_of_Driver_21_25: age_driver >= 21 && age_driver <= 25 ? 1 : 0,
      Age_Band_of_Driver_26_35: age_driver >= 26 && age_driver <= 35 ? 1 : 0,
      Age_Band_of_Driver_36_45: age_driver >= 36 && age_driver <= 45 ? 1 : 0,
      Age_Band_of_Driver_46_55: age_driver >= 46 && age_driver <= 55 ? 1 : 0,
      Age_Band_of_Driver_56_65: age_driver >= 56 && age_driver <= 65 ? 1 : 0,
      Age_Band_of_Driver_66_75: age_driver >= 66 && age_driver <= 75 ? 1 : 0,
      Age_Band_of_Driver_Over_75: age_driver > 75 ? 1 : 0,
      Junction_Location_At_junction: junction_dis[i],
      Junction_Location_At_main_road: singcrg_dis[i],
      Junction_Location_At_roundabout: roundabout_dis[i],
      Junction_Location_At_slip_road: sliproad_dis[i],
      Junction_Location_Not_at_junction: junction_dis[i] ? 0 : 1,
      Sex_of_Driver_Male: gender == "male" ? 1 : 0,
      Vehicle_Manoeuvre_goal: manoeuvre[i] == 10 ? 1 : 0,
      Vehicle_Manoeuvre_keep_left: manoeuvre[i] == 12 ? 1 : 0,
      Vehicle_Manoeuvre_keep_right: manoeuvre[i] == 13 ? 1 : 0,
      Vehicle_Manoeuvre_left: manoeuvre[i] == 0 ? 1 : 0,
      Vehicle_Manoeuvre_right: manoeuvre[i] == 1 ? 1 : 0,
      Vehicle_Manoeuvre_sharp_left: manoeuvre[i] == 2 ? 1 : 0,
      Vehicle_Manoeuvre_sharp_right: manoeuvre[i] == 3 ? 1 : 0,
      Vehicle_Manoeuvre_slight_left: manoeuvre[i] == 4 ? 1 : 0,
      Vehicle_Manoeuvre_slight_right: manoeuvre[i] == 5 ? 1 : 0,
      Vehicle_Manoeuvre_straight: manoeuvre[i] == 6 ? 1 : 0,
      Vehicle_Manoeuvre_u_turn: manoeuvre[i] == 9 ? 1 : 0,
      Vehicle_Type_Car: vehicle_type == "car" ? 1 : 0,
      Vehicle_Type_Motorcycle: vehicle_type == "bike" ? 1 : 0,
    };

    var X_new = Object.values(inputEntry);
    inputData.push(X_new);
  }
}