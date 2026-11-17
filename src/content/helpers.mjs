// Shorthands used by the content files.
export const a = (h, p) => ({ h, p });                              // application / point card
export const c = (h, problem, solution) => ({ h, problem, solution }); // challenge card

export const IND = {
  auto: '/industries/automotive/',
  asm: '/industries/assembly-manufacturing/',
  wh: '/industries/warehousing-distribution/',
  robo: '/industries/automation-robotics/',
};

// Breadcrumb parents
export const S = {
  capabilities: { label: 'Capabilities', href: '/capabilities/' },
  carts: { label: 'Carts', href: '/carts/' },
  racks: { label: 'Racks', href: '/racks/' },
  fabrication: { label: 'Fabrication', href: '/fabrication/' },
  repair: { label: 'Repair, Refurbishing & Modification', href: '/fabrication/repair-refurbishing-modification/' },
  industries: { label: 'Industries', href: '/industries/' },
  about: { label: 'About', href: '/about/' },
};
