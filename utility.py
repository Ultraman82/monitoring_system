import math


def calc_ang_gps(old_lat, old_lng, new_lat, new_lng):
    lat_dif = new_lat - old_lat
    lng_dif = new_lng - old_lng

    R = 6371000                               # radius of Earth in meters
    phi_1 = math.radians(old_lat)
    phi_2 = math.radians(new_lat)

    delta_phi = math.radians(new_lat-old_lat)
    delta_lambda = math.radians(new_lng-old_lng)

    a = math.sin(delta_phi/2.0)**2 +\
        math.cos(phi_1)*math.cos(phi_2) *\
        math.sin(delta_lambda/2.0)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    meters = R*c

    return math.atan2(lng_dif, lat_dif) * 180 / math.pi, meters
