// Every new page, and the menu groups that organise them. The menu, footer sitemap,
// breadcrumbs, category hubs and sitemap.xml are all generated from this list.
import * as capabilities from './capabilities.mjs';
import * as carts from './carts.mjs';
import * as racks from './racks.mjs';
import * as fabrication from './fabrication.mjs';
import * as industries from './industries.mjs';
import * as company from './company.mjs';

const paths = (mod) => mod.pages.map((p) => p.path);

export const PAGES = [capabilities, carts, racks, fabrication, industries, company].flatMap((m) => [m.hub, ...m.pages]);

// Menu groups, in menu order. Existing pages (Steel Rack Repair) are linked here too.
export const GROUPS = [
  { key: 'capabilities', label: 'Capabilities', href: '/capabilities/', items: paths(capabilities) },
  { key: 'carts', label: 'Carts', href: '/carts/', items: paths(carts) },
  { key: 'racks', label: 'Racks', href: '/racks/', items: paths(racks) },
  { key: 'fabrication', label: 'Fabrication', href: '/fabrication/', items: [
    ...paths(fabrication).filter((p) => p !== '/rack-changeovers-reworks/'),
    '/rack-repair/', '/rack-changeovers-reworks/',
  ] },
  { key: 'industries', label: 'Industries', href: '/industries/', items: paths(industries) },
  { key: 'company', label: 'Company', href: '/about/', allLabel: 'About Rivers', items: paths(company) },
];
