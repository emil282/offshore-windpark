# Details for wind-turbines-data_WT.js

## Distance regularities for the wind turbines and other objects

<img width="517" alt="Bildschirmfoto 2023-08-15 um 10 00 46" src="https://github.com/ifgiscope/wind-turbines/assets/61976072/f86d8b4a-93fc-4bf9-9dda-51291ad97175">

Distances are getting measured by the amount of cells in between:

<img width="324" alt="Bildschirmfoto 2023-08-15 um 10 01 35" src="https://github.com/ifgiscope/wind-turbines/assets/61976072/7621a14b-e2f9-46bd-9af5-4f3ba515e9df">

Energy calculation ($`tiles[]` is the amount of tiles):

Old:
$`tiles[small turbines]  +  2 * tiles[big turbines]  =  tiles[residential area]`

New:
Using the exact energy gain for this two wind turbine modells:
Small: https://www.wind-turbine-models.com/turbines/1297-enercon-e-141-ep4
Big: https://www.wind-turbine-models.com/turbines/69-enercon-e-70-e4-2.300
