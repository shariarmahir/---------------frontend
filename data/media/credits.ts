/**
 * Demo photography for posts and listings, from Wikimedia Commons under
 * the licences below. Shown on /media/credits; replace with real uploads
 * when a backend exists.
 */
export interface ImageCredit {
  src: string;
  title: string;
  author: string;
  license: string;
  source: string;
}

export const imageCredits: ImageCredit[] = [
  { src: "/media/kantha-full.webp", title: "Nakshi Kantha, Sonargaon Folk Art and Craft Museum.jpg", author: "Nahid Sultan", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Nakshi_Kantha,_Sonargaon_Folk_Art_and_Craft_Museum.jpg" },
  { src: "/media/kantha-closeup.webp", title: "Nakshi kantha (Flower motif).JPG", author: "A junaid alam khan", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Nakshi_kantha_(Flower_motif).JPG" },
  { src: "/media/kantha-listing.webp", title: "নকশীকাঁথা .jpg", author: "Sufe", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%E0%A6%A8%E0%A6%95%E0%A6%B6%E0%A7%80%E0%A6%95%E0%A6%BE%E0%A6%81%E0%A6%A5%E0%A6%BE_.jpg" },
  { src: "/media/kacchi.webp", title: "Basmati Kacchi Biryani (2).jpg", author: "Nahian", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Basmati_Kacchi_Biryani_(2).jpg" },
  { src: "/media/kacchi-listing.webp", title: "Kacchi Biryani.jpg", author: "ANKAN", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kacchi_Biryani.jpg" },
  { src: "/media/tiffin.webp", title: "Marmita da avó.jpg", author: "CrisLuiz", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Marmita_da_av%C3%B3.jpg" },
  { src: "/media/mehndi-bride.webp", title: "Bridal Mehndi.JPG", author: "Iramuthusamy", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Bridal_Mehndi.JPG" },
  { src: "/media/mehndi-dark.webp", title: "Mehndi decoration on back side of hands.jpg", author: "Msansari4011", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Mehndi_decoration_on_back_side_of_hands.jpg" },
  { src: "/media/mehndi-listing.webp", title: "Bridal mehndi (henna) is a central wedding tradition 11.jpg", author: "Goutam1962", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Bridal_mehndi_(henna)_is_a_central_wedding_tradition_11.jpg" },
  { src: "/media/carburetor.webp", title: "Mekanik motor - motorcycle mechanic.jpg", author: "madmalaysia", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Mekanik_motor_-_motorcycle_mechanic.jpg" },
  { src: "/media/bike-service.webp", title: "DFC 4703 A mechanic works on a motorcycle engine on the workshop floor focused on repairing the bike amid tools and parts.jpg", author: "PattayaPatrol", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:DFC_4703_A_mechanic_works_on_a_motorcycle_engine_on_the_workshop_floor_focused_on_repairing_the_bike_amid_tools_and_parts.jpg" },
  { src: "/media/calculus.webp", title: "Maths Tutor.jpg", author: "Preply.com Images", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Maths_Tutor.jpg" },
  { src: "/media/circuit.webp", title: "Brno, Oct-2022 (52451521942).jpg", author: "Mitch Altman from Berlin, Germany", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Brno,_Oct-2022_(52451521942).jpg" },
  { src: "/media/house-built.webp", title: "House structure of the villagers in the rural area.jpg", author: "SyedAminul", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:House_structure_of_the_villagers_in_the_rural_area.jpg" },
  { src: "/media/floorplan.webp", title: "Bungalow drawing -- Floor Plan MET DP804276.jpg", author: "Ernest Geldart", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Bungalow_drawing_--_Floor_Plan_MET_DP804276.jpg" },
  { src: "/media/flood.webp", title: "Sariakandi Char Land Flood Affected Bangladesh.jpg", author: "TausifAlHossain", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Sariakandi_Char_Land_Flood_Affected_Bangladesh.jpg" },
  { src: "/media/watercolor.webp", title: "George Chinnery - A River in Ceylon - B2001.2.718 - Yale Center for British Art.jpg", author: "George Chinnery", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:George_Chinnery_-_A_River_in_Ceylon_-_B2001.2.718_-_Yale_Center_for_British_Art.jpg" },
  { src: "/media/dsa-code.webp", title: "Screen-python-code-matplotlib-physics-simulation.jpg", author: "MikeRun", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Screen-python-code-matplotlib-physics-simulation.jpg" },
  { src: "/media/ads-report.webp", title: "Infruid's Self-Service BI Tool Dashboard.jpg", author: "Growthlakes", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Infruid%27s_Self-Service_BI_Tool_Dashboard.jpg" },
  { src: "/media/tax-desk.webp", title: "Aurora electronic calculator DT210 05.jpg", author: "Coyau", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Aurora_electronic_calculator_DT210_05.jpg" },
  { src: "/media/shoot-before.webp", title: "The story of clay pottery 2.jpg", author: "Rayhan9d", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:The_story_of_clay_pottery_2.jpg" },
  { src: "/media/shoot-after.webp", title: "Pair of Decorated Terracotta Pots Against a Window.jpg", author: "A S M Jobaer", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Pair_of_Decorated_Terracotta_Pots_Against_a_Window.jpg" },
  { src: "/media/shoot-listing.webp", title: "001 2021 03 05 Lichtzeltfotografie.jpg", author: "Friedrich Haag", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:001_2021_03_05_Lichtzeltfotografie.jpg" },
  { src: "/media/event-tree.webp", title: "Syed Nazrul College Tree Plantation Rally.JPG", author: "Anup Sadi", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Syed_Nazrul_College_Tree_Plantation_Rally.JPG" },
  { src: "/media/event-cleanup.webp", title: "Volunteer garbage collector.jpg", author: "Caroline Mshanga", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Volunteer_garbage_collector.jpg" },
  { src: "/media/event-blood.webp", title: "Blood Donation Camp - Baranagar Mission.jpg", author: "Ramakrishna Math and Ramakrishna Mission Belur Math", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Blood_Donation_Camp_-_Baranagar_Mission.jpg" },
  { src: "/media/event-relief.webp", title: "Emergency Relief Distribution among Flood Affected Families by Needy Foundation.jpg", author: "Needy Foundation (NF)", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Emergency_Relief_Distribution_among_Flood_Affected_Families_by_Needy_Foundation.jpg" },
  { src: "/media/shop-grocery.webp", title: "Bangladeshi grocery shop in Zinjira, Keraniganj.jpg", author: "Marufish from Alor Setar, Malaysia", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Bangladeshi_grocery_shop_in_Zinjira,_Keraniganj.jpg" },
  { src: "/media/shop-fuchka.webp", title: "Panipuri,Lakhimpur.jpg", author: "Rumi Borah~aswiki", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Panipuri,Lakhimpur.jpg" },
  { src: "/media/fashion-jamdani.webp", title: "Jamdani Saree shop in sonargaon.jpg", author: "Fahad Faisal", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Jamdani_Saree_shop_in_sonargaon.jpg" },
  { src: "/media/rent-flat.webp", title: "Residential buildings, taken from Habibullah Bahar College, Dhaka.jpg", author: "Yahya", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Residential_buildings,_taken_from_Habibullah_Bahar_College,_Dhaka.jpg" },
  { src: "/media/team-cricket.webp", title: "Wanstead & Snaresbrook CC cricket nets, Wanstead, London 04.jpg", author: "Acabashi", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Wanstead_%26_Snaresbrook_CC_cricket_nets,_Wanstead,_London_04.jpg" },
  { src: "/media/challenge-hackathon.webp", title: "Junction 2015.jpg", author: "Vmuru", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Junction_2015.jpg" },
  { src: "/media/civic-waste.webp", title: "Dhaka South City Corporation sanitation workers remove sacrificial animal waste, Hazaribagh, Dhaka, Bangladesh, 2019-08-13 (PID-0037426).jpg", author: "Press Information Department", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Dhaka_South_City_Corporation_sanitation_workers_remove_sacrificial_animal_waste,_Hazaribagh,_Dhaka,_Bangladesh,_2019-08-13_(PID-0037426).jpg" },
  { src: "/media/civic-flood.webp", title: "Rain filled Dhaka Street,2014.jpg", author: "Aashaa", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Rain_filled_Dhaka_Street,2014.jpg" },
];
