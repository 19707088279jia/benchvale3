// Single source for navigation, catalogue categories, and family destinations.
// Families may exist before listings; never create placeholder product records.
export const categories = [
  {
    "name": "Analytical",
    "anchor": "analytical",
    "icon": "equipment",
    "description": "Analytical product families will appear here as catalogue data becomes available.",
    "navLabel": "Analytical",
    "families": []
  },
  {
    "name": "Chromatography",
    "anchor": "chromatography",
    "icon": "vial",
    "description": "Vials, closures, and consumables for HPLC and GC sample-introduction workflows.",
    "navLabel": "Chromatography",
    "families": [
      {
        "name": "Autosampler Vials",
        "search": "autosampler vial",
        "page": "products/2ml-autosampler-vial.html"
      },
      {
        "name": "Caps & Septa",
        "search": "cap",
        "page": "products/9mm-cap-septa.html"
      },
      {
        "name": "Chromatography Consumables",
        "search": "chromatography"
      }
    ]
  },
  {
    "name": "Environmental & Water",
    "anchor": "environmental-water",
    "icon": "bottle",
    "description": "Containers and supplies for field sampling, water testing, and environmental workflows.",
    "navLabel": "Environmental & Water",
    "families": [
      {
        "name": "Sample Bottles",
        "search": "sample bottle",
        "page": "products/hdpe-bottles.html"
      },
      {
        "name": "Reagent Bottles",
        "search": "reagent bottle",
        "page": "products/hdpe-bottles.html"
      },
      {
        "name": "Water Testing Supplies",
        "search": "water testing"
      }
    ]
  },
  {
    "name": "Sample Preparation",
    "anchor": "sample-preparation",
    "icon": "filter",
    "description": "Filtration and extraction formats selected around the sample and method.",
    "navLabel": "Sample Prep",
    "families": [
      {
        "name": "Syringe Filters",
        "search": "syringe filter",
        "page": "products/syringe-filters.html"
      },
      {
        "name": "SPE Cartridges",
        "search": "spe cartridge",
        "page": "products/spe-cartridges.html"
      },
      {
        "name": "Filtration",
        "search": "filtration"
      }
    ]
  },
  {
    "name": "General Lab",
    "anchor": "general-lab",
    "icon": "dish",
    "description": "Routine labware, mixing, stirring, and benchtop equipment for everyday laboratory work.",
    "navLabel": "General Lab",
    "families": [
      {
        "name": "Petri Dishes",
        "search": "petri dish",
        "page": "products/90mm-petri-dish.html"
      },
      {
        "name": "General Labware",
        "search": "general lab"
      },
      {
        "name": "Lab Containers",
        "search": "container"
      },
      {
        "name": "General Consumables",
        "search": "general lab"
      },
      {
        "name": "Mixing & Stirring",
        "search": "benchtop"
      },
      {
        "name": "Mixers & Shakers",
        "search": "vortex",
        "page": "products/vortex-mixer.html"
      },
      {
        "name": "Heating & Stirring",
        "search": "stirring",
        "page": "products/hotplate-magnetic-stirrer.html"
      },
      {
        "name": "Benchtop Equipment",
        "search": "benchtop"
      }
    ]
  },
  {
    "name": "Life Science",
    "anchor": "life-science",
    "icon": "tube",
    "description": "Centrifuge tubes, microtubes, and related sample-handling formats.",
    "navLabel": "Life Science",
    "families": [
      {
        "name": "Centrifuge Tubes",
        "search": "centrifuge tube"
      },
      {
        "name": "Microtubes",
        "search": "microtube"
      },
      {
        "name": "Sample Storage",
        "search": "sample"
      }
    ]
  },
  {
    "name": "Pipettes & Liquid Handling",
    "anchor": "liquid-handling",
    "icon": "pipette",
    "description": "Pipettes, tips, and transfer products for routine liquid handling.",
    "navLabel": "Pipettes & Liquid Handling",
    "families": [
      {
        "name": "Pipette Tips",
        "search": "pipette tips",
        "page": "products/pipette-tips.html"
      },
      {
        "name": "Serological Pipettes",
        "search": "serological pipette",
        "page": "products/serological-pipettes.html"
      },
      {
        "name": "Liquid Transfer",
        "search": "transfer"
      }
    ]
  }
];
export const categoryUrl = (category) => `products.html?category=${category.anchor}`;
export const familyUrl = (category, family) => family.page || `${categoryUrl(category)}&search=${encodeURIComponent(family.search)}`;
