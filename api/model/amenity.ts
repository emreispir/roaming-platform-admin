/**
 * AdminApp API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export type Amenity = 'Accounting' | 'Airport' | 'Amusement_Park' | 'Aquarium' | 'Art_Gallery' | 'Atm' | 'Bakery' | 'Bank' | 'Bar' | 'Beauty_Salon' | 'Bicycle_Store' | 'Book_Store' | 'Bowling_Alley' | 'Bus_Station' | 'Cafe' | 'Campground' | 'Car_Dealer' | 'Car_Rental' | 'Car_Repair' | 'Car_Wash' | 'Casino' | 'Cemetery' | 'Church' | 'City_Hall' | 'Clothing_Store' | 'Convenience_Store' | 'Courthouse' | 'Dentist' | 'Department_Store' | 'Doctor' | 'DrugStore' | 'Electrician' | 'Electronics_Store' | 'Embassy' | 'Fire_Station' | 'Florist' | 'Funeral_Home' | 'Furniture_Store' | 'Gas_Station' | 'Gym' | 'Hair_Care' | 'Hardware_Store' | 'Hindu_Temple' | 'Home_Goods_Store' | 'Hospital' | 'Insurance_Agency' | 'Jewelry_Store' | 'Laundry' | 'Lawyer' | 'Library' | 'Light_Rail_Station' | 'Liquor_Store' | 'Local_Government_Office' | 'Locksmith' | 'Lodging' | 'Meal_Delivery' | 'Meal_Takeaway' | 'Mosque' | 'Movie_Rental' | 'Movie_Theater' | 'Moving_Company' | 'Museum' | 'Night_Club' | 'Painter' | 'Park' | 'Parking' | 'Pet_Store' | 'Pharmacy' | 'Physiotherapist' | 'Plumber' | 'Police' | 'PostOffice' | 'Primary_School' | 'Secondary_School' | 'Real_Estate_Agency' | 'Restaurant' | 'Roofing_Contractor' | 'Rv_Park' | 'School' | 'Shoe_Store' | 'Shopping_Mall' | 'Spa' | 'Stadium' | 'Storage' | 'Store' | 'Subway_Station' | 'Supermarket' | 'Synagogue' | 'Taxi_Stand' | 'Tourist_Attracton' | 'Train_Station' | 'Transit_Station' | 'Travel_Agency' | 'University' | 'Veterinary_Care' | 'Zoo' | 'Administrative_Area_Level_1' | 'Administrative_Area_Level_2' | 'Administrative_Area_Level_3' | 'Administrative_Area_Level_4' | 'Administrative_Area_Level_5' | 'Administrative_Area_Level_6' | 'Administrative_Area_Level_7' | 'Archipelago' | 'Colloquial_Area' | 'Continent' | 'Country' | 'Establishment' | 'Finance' | 'Floor' | 'Food' | 'General_Contractor' | 'Geocode' | 'Health' | 'Intersection' | 'Landmark' | 'Locality' | 'Natural_Feature' | 'Neighborhood' | 'Place_Of_Worship' | 'Plus_Code' | 'Point_Of_Interest' | 'Political' | 'Post_Box' | 'Postal_Code' | 'Postal_Code_Prefix' | 'Postal_Code_Suffix' | 'Postal_Town' | 'Premise' | 'Room' | 'Route' | 'Street_Address' | 'Street_Number' | 'Sublocality' | 'Sublocality_Level_1' | 'Sublocality_Level_2' | 'Sublocality_Level_3' | 'Sublocality_Level_4' | 'Sublocality_Level_5' | 'Subpremise' | 'Town_Square' | 'Grocery_Or_Supermarket' | 'Unknown' | 'Dog_Park';

export const Amenity = {
    Accounting: 'Accounting' as Amenity,
    Airport: 'Airport' as Amenity,
    Amusement_Park: 'Amusement_Park' as Amenity,
    Aquarium: 'Aquarium' as Amenity,
    Art_Gallery: 'Art_Gallery' as Amenity,
    Atm: 'Atm' as Amenity,
    Bakery: 'Bakery' as Amenity,
    Bank: 'Bank' as Amenity,
    Bar: 'Bar' as Amenity,
    Beauty_Salon: 'Beauty_Salon' as Amenity,
    Bicycle_Store: 'Bicycle_Store' as Amenity,
    Book_Store: 'Book_Store' as Amenity,
    Bowling_Alley: 'Bowling_Alley' as Amenity,
    Bus_Station: 'Bus_Station' as Amenity,
    Cafe: 'Cafe' as Amenity,
    Campground: 'Campground' as Amenity,
    Car_Dealer: 'Car_Dealer' as Amenity,
    Car_Rental: 'Car_Rental' as Amenity,
    Car_Repair: 'Car_Repair' as Amenity,
    Car_Wash: 'Car_Wash' as Amenity,
    Casino: 'Casino' as Amenity,
    Cemetery: 'Cemetery' as Amenity,
    Church: 'Church' as Amenity,
    City_Hall: 'City_Hall' as Amenity,
    Clothing_Store: 'Clothing_Store' as Amenity,
    Convenience_Store: 'Convenience_Store' as Amenity,
    Courthouse: 'Courthouse' as Amenity,
    Dentist: 'Dentist' as Amenity,
    Department_Store: 'Department_Store' as Amenity,
    Doctor: 'Doctor' as Amenity,
    DrugStore: 'DrugStore' as Amenity,
    Electrician: 'Electrician' as Amenity,
    Electronics_Store: 'Electronics_Store' as Amenity,
    Embassy: 'Embassy' as Amenity,
    Fire_Station: 'Fire_Station' as Amenity,
    Florist: 'Florist' as Amenity,
    Funeral_Home: 'Funeral_Home' as Amenity,
    Furniture_Store: 'Furniture_Store' as Amenity,
    Gas_Station: 'Gas_Station' as Amenity,
    Gym: 'Gym' as Amenity,
    Hair_Care: 'Hair_Care' as Amenity,
    Hardware_Store: 'Hardware_Store' as Amenity,
    Hindu_Temple: 'Hindu_Temple' as Amenity,
    Home_Goods_Store: 'Home_Goods_Store' as Amenity,
    Hospital: 'Hospital' as Amenity,
    Insurance_Agency: 'Insurance_Agency' as Amenity,
    Jewelry_Store: 'Jewelry_Store' as Amenity,
    Laundry: 'Laundry' as Amenity,
    Lawyer: 'Lawyer' as Amenity,
    Library: 'Library' as Amenity,
    Light_Rail_Station: 'Light_Rail_Station' as Amenity,
    Liquor_Store: 'Liquor_Store' as Amenity,
    Local_Government_Office: 'Local_Government_Office' as Amenity,
    Locksmith: 'Locksmith' as Amenity,
    Lodging: 'Lodging' as Amenity,
    Meal_Delivery: 'Meal_Delivery' as Amenity,
    Meal_Takeaway: 'Meal_Takeaway' as Amenity,
    Mosque: 'Mosque' as Amenity,
    Movie_Rental: 'Movie_Rental' as Amenity,
    Movie_Theater: 'Movie_Theater' as Amenity,
    Moving_Company: 'Moving_Company' as Amenity,
    Museum: 'Museum' as Amenity,
    Night_Club: 'Night_Club' as Amenity,
    Painter: 'Painter' as Amenity,
    Park: 'Park' as Amenity,
    Parking: 'Parking' as Amenity,
    Pet_Store: 'Pet_Store' as Amenity,
    Pharmacy: 'Pharmacy' as Amenity,
    Physiotherapist: 'Physiotherapist' as Amenity,
    Plumber: 'Plumber' as Amenity,
    Police: 'Police' as Amenity,
    PostOffice: 'PostOffice' as Amenity,
    Primary_School: 'Primary_School' as Amenity,
    Secondary_School: 'Secondary_School' as Amenity,
    Real_Estate_Agency: 'Real_Estate_Agency' as Amenity,
    Restaurant: 'Restaurant' as Amenity,
    Roofing_Contractor: 'Roofing_Contractor' as Amenity,
    Rv_Park: 'Rv_Park' as Amenity,
    School: 'School' as Amenity,
    Shoe_Store: 'Shoe_Store' as Amenity,
    Shopping_Mall: 'Shopping_Mall' as Amenity,
    Spa: 'Spa' as Amenity,
    Stadium: 'Stadium' as Amenity,
    Storage: 'Storage' as Amenity,
    Store: 'Store' as Amenity,
    Subway_Station: 'Subway_Station' as Amenity,
    Supermarket: 'Supermarket' as Amenity,
    Synagogue: 'Synagogue' as Amenity,
    Taxi_Stand: 'Taxi_Stand' as Amenity,
    Tourist_Attracton: 'Tourist_Attracton' as Amenity,
    Train_Station: 'Train_Station' as Amenity,
    Transit_Station: 'Transit_Station' as Amenity,
    Travel_Agency: 'Travel_Agency' as Amenity,
    University: 'University' as Amenity,
    Veterinary_Care: 'Veterinary_Care' as Amenity,
    Zoo: 'Zoo' as Amenity,
    Administrative_Area_Level_1: 'Administrative_Area_Level_1' as Amenity,
    Administrative_Area_Level_2: 'Administrative_Area_Level_2' as Amenity,
    Administrative_Area_Level_3: 'Administrative_Area_Level_3' as Amenity,
    Administrative_Area_Level_4: 'Administrative_Area_Level_4' as Amenity,
    Administrative_Area_Level_5: 'Administrative_Area_Level_5' as Amenity,
    Administrative_Area_Level_6: 'Administrative_Area_Level_6' as Amenity,
    Administrative_Area_Level_7: 'Administrative_Area_Level_7' as Amenity,
    Archipelago: 'Archipelago' as Amenity,
    Colloquial_Area: 'Colloquial_Area' as Amenity,
    Continent: 'Continent' as Amenity,
    Country: 'Country' as Amenity,
    Establishment: 'Establishment' as Amenity,
    Finance: 'Finance' as Amenity,
    Floor: 'Floor' as Amenity,
    Food: 'Food' as Amenity,
    General_Contractor: 'General_Contractor' as Amenity,
    Geocode: 'Geocode' as Amenity,
    Health: 'Health' as Amenity,
    Intersection: 'Intersection' as Amenity,
    Landmark: 'Landmark' as Amenity,
    Locality: 'Locality' as Amenity,
    Natural_Feature: 'Natural_Feature' as Amenity,
    Neighborhood: 'Neighborhood' as Amenity,
    Place_Of_Worship: 'Place_Of_Worship' as Amenity,
    Plus_Code: 'Plus_Code' as Amenity,
    Point_Of_Interest: 'Point_Of_Interest' as Amenity,
    Political: 'Political' as Amenity,
    Post_Box: 'Post_Box' as Amenity,
    Postal_Code: 'Postal_Code' as Amenity,
    Postal_Code_Prefix: 'Postal_Code_Prefix' as Amenity,
    Postal_Code_Suffix: 'Postal_Code_Suffix' as Amenity,
    Postal_Town: 'Postal_Town' as Amenity,
    Premise: 'Premise' as Amenity,
    Room: 'Room' as Amenity,
    Route: 'Route' as Amenity,
    Street_Address: 'Street_Address' as Amenity,
    Street_Number: 'Street_Number' as Amenity,
    Sublocality: 'Sublocality' as Amenity,
    Sublocality_Level_1: 'Sublocality_Level_1' as Amenity,
    Sublocality_Level_2: 'Sublocality_Level_2' as Amenity,
    Sublocality_Level_3: 'Sublocality_Level_3' as Amenity,
    Sublocality_Level_4: 'Sublocality_Level_4' as Amenity,
    Sublocality_Level_5: 'Sublocality_Level_5' as Amenity,
    Subpremise: 'Subpremise' as Amenity,
    Town_Square: 'Town_Square' as Amenity,
    Grocery_Or_Supermarket: 'Grocery_Or_Supermarket' as Amenity,
    Unknown: 'Unknown' as Amenity,
    Dog_Park: 'Dog_Park' as Amenity
};

