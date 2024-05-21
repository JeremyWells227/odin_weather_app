#!/usr/bin/env python3

import numpy as np
import pandas as pd
import json

data = pd.read_csv('weather_conditions.csv',index_col='code')

with open("weather_conditions.json",'w') as fout:
    json_data = data.to_json()
    if json_data:
        loaded = json.loads(json_data)
        pp = json.dumps(loaded,indent=2)
        fout.write(pp)


