// utils/packages.js
// productId / planId are the PayPal sandbox catalog product + billing plan IDs
// (created via the PayPal API). Having them here stops resolvePackages() from
// re-creating a new product/plan on every subscribe.
export const packages = {
  basic: {
    name: "Basic Package",
    price: 10000, // $100.00
    productId: "PROD-6CX74452V6951143B",
    planId: "P-684419862B557374NNJNEUYI",
  },
  standard: {
    name: "Standard Package",
    price: 20000, // $200.00
    productId: "PROD-42D64181A30169445",
    planId: "P-5R130930AP4260322NJNEUYY",
  },
  premium: {
    name: "Premium Package",
    price: 50000, // $500.00
    productId: "PROD-4K271943G2343071Y",
    planId: "P-0CJ2474516277003JNJNEUZA",
  },
};
