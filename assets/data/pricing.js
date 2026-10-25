/* Pricing data. SAMPLE DATA - edit freely. */
window.KITELISH_DATA = window.KITELISH_DATA || {};
window.KITELISH_DATA.pricing = {
  "plans": [
    {
      "id": "m1",
      "months": 1,
      "discount": 0
    },
    {
      "id": "m3",
      "months": 3,
      "discount": 0.05
    },
    {
      "id": "m6",
      "months": 6,
      "discount": 0.1
    }
  ],
  "defaultPlan": "m3",
  "rounding": {
    "USD": 1,
    "VND": 10000
  },
  "packages": [
    {
      "id": "explorer",
      "sessionsPerMonth": 4,
      "monthly": {
        "USD": 56,
        "VND": 1400000
      }
    },
    {
      "id": "maker",
      "sessionsPerMonth": 8,
      "monthly": {
        "USD": 104,
        "VND": 2600000
      },
      "featured": true
    },
    {
      "id": "inventor",
      "sessionsPerMonth": 12,
      "monthly": {
        "USD": 144,
        "VND": 3600000
      }
    }
  ]
};
