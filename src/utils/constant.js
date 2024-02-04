module.exports = {
  COLOR_MAPPING: {
    cable: 'blue',
    water_tower: 'blue',
    motorway: 'red',
    motorway_link: 'red',
    service: 'red',
    tertiary: 'red',
    trunk_link: 'red',
    trunk: 'red',
    unclassified: 'red',
    primary: 'red',
    secondary_link: 'red',
    residential: 'red',
    commercial: 'red',
    retail: 'red',
    governmental: 'yellow',
    village_green: 'yellow',
    courtyard: 'yellow',
    garages: 'yellow',
    mixed: 'yellow',
    yard: 'yellow',
    industrial: 'yellow',
    construction: 'yellow',
    planned_construction: 'yellow',
    brownfield: 'yellow',
    depot: 'yellow',
    yes: 'transparent',
    secondary: 'red',
    park: 'green',
    pond: 'green',
    farmland: 'green',
    plaza: 'green',
    recreation_ground: 'green',
    leisure: 'green',
    meadow: 'green',
    flowerbed: 'green',
    greenfield: 'green',
    forest: 'green',
    farmyard: 'green',
    allotments: 'green',
    plant_nursery: 'green',
    grass: 'green',
    orchard: 'green',
    apiary: 'green',
    animal_keeping: 'green',
    greenhouse_horticulture: 'green',
    bed: 'green',
    river: 'green',
    infrastructure: 'darkgrey',
    jail: 'darkgrey',
    stadium: 'darkgrey',
    school: 'darkgrey',
    cemetery: 'darkgrey',
    churchyard: 'darkgrey',
    military: 'darkgrey',
    railway: 'darkgrey',
    religious: 'darkgrey',
    education: 'darkgrey',
    scrub: 'darkgrey',
    dead_allotments: 'darkgrey',
    parking: 'darkorange',
    hospital: 'white',
    landuse: 'yellow',
    default: 'transparent'
  },
  MAIN_CATEGORIES: {
    Roads: 'red',
    'Commercial and Residential': 'yellow',
    'Critical facilities': 'darkgrey',
    'Critical infrastructure': 'black',
    'Parks and open spaces': 'green'
  },
  RISK_WEIGHTS: {
    road: 1.5,
    residential: 1.2,
    commercial: 1.3,
    park: 0.8,
    farmland: 0.7,
    forest: 0.6,
    industrial: 1.4,
    railway: 1.6,
    airport: 2.0,
    water: 0.9,
    mountain: 1.8,
    desert: 1.1,
    urban: 1.5,
    rural: 1.0,
    school: 1.7,
    hospital: 1.7,
    stadium: 1.4,
    construction: 1.5,
    military: 2.0,
    cemetery: 1.0,
    churchyard: 1.0,
    religious: 1.0,
    governmental: 1.0,
    jail: 1.0,
    grass: 0.8,
    scrub: 0.8,
    plaza: 0.9,
    recreation_ground: 0.8,
    leisure: 0.8,
    meadow: 0.7,
    flowerbed: 0.7,
    greenfield: 0.7,
    farmyard: 0.7,
    allotments: 0.7,
    plant_nursery: 0.7,
    orchard: 0.7,
    apiary: 0.7,
    animal_keeping: 0.7,
    greenhouse_horticulture: 0.7,
    bed: 0.7,
    village_green: 1.0,
    courtyard: 1.0,
    garages: 1.0,
    mixed: 1.0,
    yard: 1.0,
    brownfield: 1.4,
    depot: 1.4,
    parking: 1.3,
    retail: 1.3,
    motorway: 1.8,
    motorway_link: 1.8,
    service: 1.2,
    tertiary: 1.2,
    secondary: 1.3,
    trunk_link: 1.5,
    trunk: 1.5,
    unclassified: 1.1,
    primary: 1.4,
    secondary_link: 1.3,
    cycleway: 0.9,
    abandoned: 1.0,
    light_rail: 1.6,
    rail: 1.6,
    second_hand: 1.0,
    default: 1.0
  },
  LAND_TYPES: [ 'landuse', 'highway', 'amenity', 'natural', 'leisure', 'building', 'railway', 'aeroway', 'waterway', 'tourism', 'historic', 'shop',
    'amenity', 'hospital', 'parking', 'highway', 'power', 'man_made' ],
  API_QUERY: ({ polygonString }) => `[out:json][timeout:25];
  (
    // Primary roads within the bounding box
    way(poly:"${polygonString}")["primary"];
    relation(poly:"${polygonString}")["primary"];

    // Secondary roads within the bounding box
    way(poly:"${polygonString}")["secondary"];
    relation(poly:"${polygonString}")["secondary"];

    // Land use data
    way(poly:"${polygonString}")["landuse"];
    relation(poly:"${polygonString}")["landuse"];

    // Highway data
    way(poly:"${polygonString}")["highway"];
    relation(poly:"${polygonString}")["highway"];

    // Natural features
    way(poly:"${polygonString}")["natural"];
    relation(poly:"${polygonString}")["natural"];

    // Amenities
    way(poly:"${polygonString}")["amenity"];
    relation(poly:"${polygonString}")["amenity"];

    // Leisure areas
    way(poly:"${polygonString}")["leisure"];
    relation(poly:"${polygonString}")["leisure"];

    // Buildings
    way(poly:"${polygonString}")["building"];
    relation(poly:"${polygonString}")["building"];

    // Railway data
    way(poly:"${polygonString}")["railway"];
    relation(poly:"${polygonString}")["railway"];

    // Aeroway data
    way(poly:"${polygonString}")["aeroway"];
    relation(poly:"${polygonString}")["aeroway"];

    // Waterway data
    way(poly:"${polygonString}")["waterway"];
    relation(poly:"${polygonString}")["waterway"];

    // Tourism data
    way(poly:"${polygonString}")["tourism"];
    relation(poly:"${polygonString}")["tourism"];

    // Historic data
    way(poly:"${polygonString}")["historic"];
    relation(poly:"${polygonString}")["historic"];

    // Shop data
    way(poly:"${polygonString}")["shop"];
    relation(poly:"${polygonString}")["shop"];

    // Hospitals
    node(poly:"${polygonString}")["amenity"="hospital"];
    way(poly:"${polygonString}")["amenity"="hospital"];
    relation(poly:"${polygonString}")["amenity"="hospital"];

    // Parking areas
    node(poly:"${polygonString}")["amenity"="parking"];
    way(poly:"${polygonString}")["amenity"="parking"];
    relation(poly:"${polygonString}")["amenity"="parking"];
    
    // Roads (general query for all types of roads)
    way(poly:"${polygonString}")["highway"];
    relation(poly:"${polygonString}")["highway"];

    // Power cables
    way(poly:"${polygonString}")["power"="cable"];
    relation(poly:"${polygonString}")["power"="cable"];

    // Power lines
    way(poly:"${polygonString}")["power"="line"];
    relation(poly:"${polygonString}")["power"="line"];

    // Power towers
    node(poly:"${polygonString}")["power"="tower"];
    way(poly:"${polygonString}")["power"="tower"];
    relation(poly:"${polygonString}")["power"="tower"];

    // Water Towers
    node(poly:"${polygonString}")["man_made"="water_tower"];
    way(poly:"${polygonString}")["man_made"="water_tower"];
    relation(poly:"${polygonString}")["man_made"="water_tower"];
    
  );
  out body; >; out skel qt;`
};
