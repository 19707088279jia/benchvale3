// Single source for navigation, catalogue categories, and family destinations.
// Families may exist before listings; never create placeholder product records.
export const categories = [
  {
    "name": "Analytical",
    "anchor": "analytical",
    "icon": "equipment",
    "description": "Product sourcing support for analytical laboratory workflows. Share your method, specifications, or preferred manufacturer.",
    "navLabel": "Analytical",
    "families": [],
    "groups": [
      {
        "name": "Analytical Instruments",
        "items": [
          {
            "name": "Biochemistry Analyzers",
            "search": "biochemistry"
          },
          {
            "name": "Elemental Analysis",
            "search": "elemental"
          },
          {
            "name": "TOC Analyzers",
            "search": "toc"
          },
          {
            "name": "Moisture Analysis",
            "search": "moisture"
          }
        ]
      },
      {
        "name": "Spectroscopy",
        "items": [
          {
            "name": "Elemental Analysis",
            "search": "elemental"
          },
          {
            "name": "Fluorescence",
            "search": "fluorescence"
          },
          {
            "name": "FTIR",
            "search": "ftir"
          },
          {
            "name": "UV/Vis/NIR",
            "search": "uv vis nir"
          }
        ]
      },
      {
        "name": "Chemical & Petrochemical Testing",
        "items": [
          {
            "name": "Automatic & Manual Titrators",
            "search": "titrator"
          },
          {
            "name": "Karl Fischer Moisture Meters",
            "search": "karl fischer"
          },
          {
            "name": "Combustion / IC Analyzers",
            "search": "combustion"
          },
          {
            "name": "Sulfur / Halogen / Chlorine Analysis",
            "search": "sulfur halogen chlorine"
          }
        ]
      },
      {
        "name": "Materials & Physical Testing",
        "items": [
          {
            "name": "Density Meters",
            "search": "density"
          },
          {
            "name": "Viscosity / Flow Testers",
            "search": "viscosity flow"
          },
          {
            "name": "Polarimeters",
            "search": "polarimeter"
          },
          {
            "name": "Particle Size Analysis",
            "search": "particle size"
          },
          {
            "name": "Refractometers",
            "search": "refractometer"
          },
          {
            "name": "Thermal Analyzers",
            "search": "thermal"
          }
        ]
      }
    ]
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
        "page": "products/2ml-autosampler-vial.html",
        "icon": "vial",
        "description": "Vials for sample introduction."
      },
      {
        "name": "Caps & Septa",
        "search": "cap",
        "page": "products/9mm-cap-septa.html",
        "icon": "cap",
        "description": "Closures for autosampler vials."
      },
      {
        "name": "Chromatography Consumables",
        "search": "chromatography",
        "icon": "vial",
        "description": "Routine chromatography supplies."
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
        "page": "products/hdpe-bottles.html",
        "icon": "bottle",
        "description": "Containers for collected samples."
      },
      {
        "name": "Reagent Bottles",
        "search": "reagent bottle",
        "page": "products/hdpe-bottles.html",
        "icon": "bottle",
        "description": "Bottles for laboratory reagents."
      },
      {
        "name": "Water Testing Supplies",
        "search": "water testing",
        "icon": "bottle",
        "description": "Supplies for water workflows."
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
        "page": "products/syringe-filters.html",
        "icon": "filter",
        "description": "Membrane sample filtration."
      },
      {
        "name": "SPE Cartridges",
        "search": "spe cartridge",
        "page": "products/spe-cartridges.html",
        "icon": "spe",
        "description": "Solid-phase extraction formats."
      },
      {
        "name": "Filtration",
        "search": "filtration",
        "icon": "filter",
        "description": "Sample filtration supplies."
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
        "page": "products/90mm-petri-dish.html",
        "icon": "dish",
        "description": "Dishes for routine laboratory use."
      },
      {
        "name": "General Labware",
        "search": "general lab",
        "icon": "dish",
        "description": "Everyday laboratory essentials."
      },
      {
        "name": "Lab Containers",
        "search": "container",
        "icon": "bottle",
        "description": "Routine laboratory containers."
      },
      {
        "name": "General Consumables",
        "search": "general lab",
        "icon": "dish",
        "description": "Supplies for everyday bench work."
      },
      {
        "name": "Mixing & Stirring",
        "search": "benchtop",
        "icon": "vortex",
        "description": "Benchtop mixing and stirring."
      },
      {
        "name": "Mixers & Shakers",
        "search": "vortex",
        "page": "products/vortex-mixer.html",
        "icon": "vortex",
        "description": "Mixing for sample workflows."
      },
      {
        "name": "Heating & Stirring",
        "search": "stirring",
        "page": "products/hotplate-magnetic-stirrer.html",
        "icon": "hotplate",
        "description": "Benchtop heating and stirring."
      },
      {
        "name": "Benchtop Equipment",
        "search": "benchtop",
        "icon": "equipment",
        "description": "Equipment for routine bench work."
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
        "search": "centrifuge tube",
        "icon": "tube",
        "description": "Tubes for sample processing."
      },
      {
        "name": "Microtubes",
        "search": "microtube",
        "icon": "microtube",
        "description": "Small-volume sample handling."
      },
      {
        "name": "Sample Storage",
        "search": "sample",
        "icon": "tube",
        "description": "Sample-handling containers."
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
        "page": "products/pipette-tips.html",
        "icon": "tips",
        "description": "Tips for routine liquid handling."
      },
      {
        "name": "Serological Pipettes",
        "search": "serological pipette",
        "page": "products/serological-pipettes.html",
        "icon": "pipette",
        "description": "Pipettes for liquid transfer."
      },
      {
        "name": "Liquid Transfer",
        "search": "transfer",
        "icon": "pipette",
        "description": "Routine transfer supplies."
      }
    ]
  }
];
export const categoryUrl = (category) => `products.html?category=${category.anchor}`;
export const familyUrl = (category, family) => family.page || `products.html?filter=${category.anchor}&search=${encodeURIComponent(family.search)}`;

// Directory topics guide navigation; they do not create verified product families or listings.
export const directoryUrl = (category, topic) => topic.page || `${categoryUrl(category)}&search=${encodeURIComponent(topic.search)}`;
