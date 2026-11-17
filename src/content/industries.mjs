// INDUSTRIES: hub + 4 industry pages (from the industries listed on the original site).
import { a, c, IND, S } from './helpers.mjs';

export const hub = {
  path: '/industries/', template: 'hubPage', group: 'industries', label: 'Industries',
  title: 'Industries We Serve: Automotive, Assembly & More | Rivers',
  description: 'Material handling racks, carts, repair, and rework for automotive OEMs and suppliers, assembly and manufacturing, warehousing and distribution, and automation.',
  h1: 'Industries We Serve', kicker: 'Built for demanding manufacturing environments.',
  image: 'forklift-moving-assembly-rack', slides: ['forklift-moving-assembly-rack', 'yellow-automotive-handling-racks'],
  summary: 'Automotive, assembly and manufacturing, warehousing and distribution, and automation.',
  band: 'Rivers provides custom material handling cart and rack fabrication for automotive, assembly, and industrial applications.',
  intro: {
    heading: 'Equipment Designed Around Your Industry',
    text: [
      'Different industries put different demands on material handling equipment. Automotive programs need part protection and fast changeovers. Assembly lines need line-side presentation and ergonomic carts. Warehouses need durable, stackable storage, and automation needs repeatable part location.',
      'Each page below explains how we approach racks, carts, repair, and rework for that industry, with links to the equipment and services most used there.',
    ],
    image: ['forklift-moving-assembly-rack', 'Forklift moving a loaded assembly rack'],
  },
  childrenHeading: 'Industries',
  related: ['/racks/', '/carts/', '/fabrication/repair-refurbishing-modification/'],
};

const ind = (p) => ({ template: 'servicePage', group: 'industries', breadcrumbs: [S.industries], ...p });

export const pages = [
  ind({
    path: IND.auto, label: 'Automotive',
    title: 'Automotive Racks, Repair & Changeovers | Rivers Industrial Racks',
    description: 'Material handling racks, carts, dunnage, repair, and program changeovers for automotive OEMs and Tier 1, 2, and 3 suppliers.',
    h1: 'Material Handling for the Automotive Industry', kicker: 'For OEMs, tier suppliers, and program launches.',
    image: 'automotive-hood-rack', slides: ['yellow-automotive-handling-racks', 'automotive-hood-rack'],
    summary: 'Racks, dunnage, repair, and changeovers for OEMs and tier suppliers.',
    band: 'Automotive programs run on tight timelines, high part values, and constant change. Material handling equipment has to keep up with all three.',
    intro: { heading: 'Supporting Automotive Programs From Launch to End of Life', text: [
      'We work with automotive manufacturing at every level: OEM manufacturing, Tier 1 suppliers, Tier 2 and Tier 3 suppliers, vehicle assembly, component manufacturing, and automotive program launches.',
      'That work spans the life of a program: <a href="/racks/automotive-racks/">new racks</a> and <a href="/capabilities/dunnage/">dunnage</a> for the launch, <a href="/rack-repair/">repair</a> and <a href="/fabrication/rack-fleet-refurbishment/">refurbishment</a> while it runs, and <a href="/rack-changeovers-reworks/">changeovers</a> when the next program arrives.',
    ], image: ['automotive-panel-assembly-rack', 'Automotive panel loaded in an assembly rack'] },
    applications: { heading: 'Automotive Applications', items: [
      a('Returnable shipping', '<a href="/racks/shipping-racks/">Shipping racks</a> that carry parts from supplier to OEM and come back for reuse.'),
      a('Body and panel parts', '<a href="/racks/panel-racks/">Panel racks</a> that protect hoods, doors, and body panels.'),
      a('Line-side delivery', '<a href="/carts/tugger-carts/">Tugger carts</a> and <a href="/carts/mother-daughter-carts/">mother/daughter systems</a> for assembly lines.'),
    ] },
    challenges: { heading: 'Automotive Challenges We Help Solve', items: [
      c('Program changes', 'A new part or platform makes racks obsolete.', '<a href="/rack-changeovers-reworks/">Changeovers</a> rework existing racks for the new part.'),
      c('Damaged returnable fleets', 'Racks come back bent, cracked, or missing dunnage.', '<a href="/rack-repair/">Repair</a> returns them to service.'),
      c('Part damage claims', 'Parts arrive scratched or dented.', 'Part-specific <a href="/capabilities/dunnage/">dunnage</a> protects appearance surfaces.'),
      c('Launch timing', 'Packaging must be ready for start of production.', '<a href="/capabilities/prototyping/">Prototypes</a> and early design keep launches on schedule.'),
    ] },
    features: { title: 'What We Provide', items: ['Automotive part racks', 'Returnable shipping racks', 'Custom dunnage', 'Tugger and line-side carts', 'Prototype racks'] },
    options: { title: 'Fleet Services', items: ['Automotive program changeovers', 'Steel rack repair', 'Fleet refurbishment', 'Rack modification', 'Dunnage reconfiguration'] },
    industries: { heading: 'Automotive Segments We Serve', text: ['From vehicle assembly plants to component suppliers, our racks and services support the entire automotive supply chain.'],
      uses: ['OEM Manufacturing', 'Tier 1 Suppliers', 'Tier 2 & Tier 3 Suppliers', 'Vehicle Assembly', 'Component Manufacturing', 'Program Launches'] },
    related: ['/racks/automotive-racks/', '/rack-changeovers-reworks/', '/rack-repair/', '/racks/panel-racks/', '/capabilities/dunnage/', '/carts/tugger-carts/'],
  }),
  ind({
    path: IND.asm, label: 'Assembly & Manufacturing',
    title: 'Racks & Carts for Assembly and Manufacturing | Rivers',
    description: 'Line-side racks, WIP and in-process carts, kitting carts, and part presentation equipment for assembly operations and production lines.',
    h1: 'Racks & Carts for Assembly and Manufacturing', kicker: 'Parts at the line, in the right place, at the right time.',
    image: 'assembly-rack-on-tugger-cart', slides: ['assembly-rack-on-tugger-cart', 'multi-level-assembly-rack'],
    summary: 'Line-side racks, WIP carts, and kitting carts for production lines.',
    band: 'Assembly lines depend on parts arriving complete, undamaged, and presented so operators can work without searching or reaching.',
    intro: { heading: 'Material Handling for the Production Floor', text: [
      'We build equipment for assembly operations, production lines, work-in-process, line-side material delivery, parts sequencing, and component staging. Each piece is designed around how parts move from storage to the operator’s hands.',
      'Our assembly racks and carts, including the blue rack on an orange tugger cart in our gallery, bring parts to the line in a fixed, repeatable presentation.',
    ], image: ['multi-level-assembly-rack', 'Multi-level assembly rack'] },
    applications: { heading: 'Assembly Applications', items: [
      a('Line-side presentation', 'Racks and <a href="/carts/tilt-carts/">tilt carts</a> that present parts to operators.'),
      a('Work in process', '<a href="/carts/wip-carts/">WIP carts</a> and <a href="/carts/in-process-carts/">in-process carts</a> between operations.'),
      a('Kitting and sequencing', '<a href="/carts/picking-carts/">Picking carts</a> and kits delivered in build order.'),
    ] },
    challenges: { heading: 'Assembly Challenges We Help Solve', items: [
      c('Line stoppages', 'Missing or wrong parts stop the line.', 'Defined part positions make shortages and errors obvious.'),
      c('Operator strain', 'Reaching and bending all shift causes fatigue.', 'Ergonomic heights and tilted presentation reduce strain.'),
      c('Forklift traffic', 'Forklifts in assembly areas create safety risks.', 'Tugger and mother/daughter carts reduce forklift use.'),
      c('Changing models', 'New models need different parts at the line.', 'Adjustable and reworkable equipment follows the change.'),
    ] },
    features: { title: 'What We Provide', items: ['Line-side racks', 'WIP and in-process carts', 'Picking and kitting carts', 'Tugger carts', 'Custom dunnage'] },
    options: { title: 'Services', items: ['Cart and rack repair', 'Modification for new models', 'Dunnage reconfiguration', 'Prototypes for new lines', 'Engineering and design'] },
    industries: { heading: 'Assembly Operations We Support', text: ['Our equipment supports everything from small assembly cells to high-volume production lines.'],
      uses: ['Assembly Operations', 'Production Lines', 'Work-In-Process', 'Line-Side Material Delivery', 'Parts Sequencing', 'Component Staging'] },
    related: ['/carts/wip-carts/', '/carts/in-process-carts/', '/carts/tugger-carts/', '/carts/picking-carts/', '/capabilities/dunnage/', '/capabilities/engineering-design/'],
  }),
  ind({
    path: IND.wh, label: 'Warehousing & Distribution',
    title: 'Warehouse Racks & Returnable Packaging | Rivers Industrial Racks',
    description: 'Stackable racks, steel containers, pallets, and carts for parts storage, internal material movement, staging, and reusable shipping systems.',
    h1: 'Racks & Containers for Warehousing and Distribution', kicker: 'Store more, move safely, ship reusably.',
    image: 'stacked-steel-containers', slides: ['stacked-steel-containers', 'stacked-blue-assembly-racks'],
    summary: 'Stackable racks, containers, pallets, and returnable packaging for storage and shipping.',
    band: 'Warehouses and distribution operations need equipment that stores parts densely, moves them safely, and stands up to years of reuse.',
    intro: { heading: 'Durable Equipment for Storage and Movement', text: [
      'We support internal material movement, parts storage, reusable shipping systems, facility transport, staging and storage, and returnable packaging.',
      '<a href="/racks/stack-racks/">Stackable racks</a> and <a href="/carts/parts-bins-rigid-containers/">steel containers</a> like those in our gallery use vertical space, while <a href="/racks/shipping-racks/">returnable shipping racks</a> replace throwaway packaging.',
    ], image: ['stacked-blue-assembly-racks', 'Stacked blue racks in storage'] },
    applications: { heading: 'Warehousing Applications', items: [
      a('Dense storage', 'Stackable racks and containers that use vertical space.'),
      a('Returnable packaging', 'Reusable racks and containers that replace expendable packaging.'),
      a('Internal transport', 'Carts and pallets that move material between areas.'),
    ] },
    challenges: { heading: 'Warehousing Challenges We Help Solve', items: [
      c('Limited floor space', 'Storage spreads across the floor.', 'Stackable racks and containers store vertically.'),
      c('Packaging waste', 'Expendable packaging is bought and thrown away.', 'Reusable steel packaging lasts for many trips.'),
      c('Damaged equipment', 'Racks and containers get bent and broken.', 'Damaged equipment can be <a href="/rack-repair/">repaired</a>.'),
      c('Unsafe stacks', 'Damaged racks make stacks unstable.', 'Repairs restore stacking features.'),
    ] },
    features: { title: 'What We Provide', items: ['Stackable racks', 'Steel containers and bins', 'Steel pallets', 'Wire baskets', 'Utility and tugger carts'] },
    options: { title: 'Services', items: ['Rack and container repair', 'Fleet refurbishment', 'Custom dunnage', 'Color coding and ID', 'Container studies'] },
    industries: { heading: 'Warehousing Uses', text: ['Our equipment supports in-plant warehouses, distribution centers, and returnable packaging programs.'],
      uses: ['Internal Material Movement', 'Parts Storage', 'Reusable Shipping Systems', 'Facility Transport', 'Staging & Storage', 'Returnable Packaging'] },
    related: ['/racks/stack-racks/', '/carts/parts-bins-rigid-containers/', '/racks/steel-pallets/', '/racks/shipping-racks/', '/container-study/', '/fabrication/rack-fleet-refurbishment/'],
  }),
  ind({
    path: IND.robo, label: 'Automation & Robotics',
    title: 'Automation-Compatible Racks for Robotic Picking | Rivers',
    description: 'Racks, carts, and fixtures with precise, repeatable part location for robotic load/unload, automated material handling, and fixture integration.',
    h1: 'Automation-Compatible Racks & Fixtures', kicker: 'Repeatable part location robots can count on.',
    image: 'cart-locator-detail', slides: ['blue-automation-carts', 'cart-locator-detail'],
    summary: 'Racks and fixtures with repeatable part location for robotic picking.',
    band: 'Robots don’t adapt to a part that’s a little out of place. Automation-compatible racks present every part in the same position, every time.',
    intro: { heading: 'Part Presentation for Automation', text: [
      'We build for robotic load/unload applications, automation-compatible racks, precision part presentation, repeatable part location, fixture integration, and automated material handling.',
      'The automation carts in our gallery use defined part positions and locators so robots and operators find parts in the same place every cycle. Precise <a href="/capabilities/laser-cutting/">locator plates</a>, <a href="/capabilities/cnc-machining/">machined pins</a>, and rigid frames make that repeatability possible.',
    ], image: ['blue-automation-carts', 'Blue automation carts with defined part positions'] },
    applications: { heading: 'Automation Applications', items: [
      a('Robotic load/unload', 'Racks that present parts for robots to pick or receive.'),
      a('Fixture integration', 'Fixtures and locators built into racks and carts.'),
      a('Automated material flow', 'Carts and racks that work with automated delivery systems.'),
    ] },
    challenges: { heading: 'Automation Challenges We Help Solve', items: [
      c('Missed picks', 'Part position varies and robots miss.', '<a href="/racks/pin-racks/">Pin racks</a> and locators hold parts in repeatable positions.'),
      c('Rack-to-rack variation', 'Each rack presents parts slightly differently.', 'Consistent fabrication keeps every rack the same.'),
      c('Wear over time', 'Locators wear and accuracy drifts.', 'Replaceable locators restore accuracy during <a href="/rack-repair/">repair</a>.'),
      c('Cell changes', 'A new part or robot needs a different presentation.', 'Racks are <a href="/rack-changeovers-reworks/">reworked</a> for the new cell.'),
    ] },
    features: { title: 'What We Provide', items: ['Automation-compatible racks', 'Pin racks and locators', 'WIP carts with fixed positions', 'Integrated fixtures', 'Precise plate and machined parts'] },
    options: { title: 'Services', items: ['Locator replacement', 'Rework for new cells', 'Prototypes for pick trials', 'Engineering and design', 'Fleet consistency checks'] },
    industries: { heading: 'Automation Applications We Support', text: ['Our automation-ready equipment serves robotic cells in automotive and general manufacturing.'],
      uses: ['Robotic Load / Unload', 'Automation-Compatible Racks', 'Precision Part Presentation', 'Repeatable Part Location', 'Fixture Integration', 'Automated Material Handling'] },
    related: ['/racks/pin-racks/', '/carts/wip-carts/', '/capabilities/laser-cutting/', '/capabilities/cnc-machining/', '/capabilities/prototyping/', '/rack-changeovers-reworks/'],
  }),
];
