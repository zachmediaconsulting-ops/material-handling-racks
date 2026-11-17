// Content blocks that appear on several pages (text from the original site).
import { button, contactSection, flag, gallery, listCards } from './components.mjs';

export const GALLERY = [
  ['orange-parts-carts', 'Orange heavy-duty parts carts staged outdoors'],
  ['stacked-blue-assembly-racks', 'Stacked blue steel assembly racks'],
  ['yellow-automation-carts', 'Yellow and blue automation carts in the shop'],
  ['automation-cart-detail', 'Blue automation cart frame detail'],
  ['blue-automation-carts-2', 'Blue automation carts lined up in the shop'],
  ['blue-automation-carts', 'Row of blue steel automation carts'],
  ['exhaust-part-rack', 'Exhaust component held on a custom mesh-deck rack'],
  ['automotive-hood-rack', 'Automotive hood panel loaded on a custom rack'],
  ['blue-automotive-material-racks', 'Blue automotive material racks'],
  ['orange-tugger-cart-frame', 'Orange tugger cart frame with casters'],
  ['tugger-cart-hitch', 'Tugger cart hitch and caster detail'],
  ['automation-pin-cart', 'Custom automation parts cart with pins'],
  ['blue-rack-cart', 'Blue rack mounted on an orange cart base'],
  ['steel-container-with-dunnage', 'Steel container with formed part dunnage'],
  ['assembly-rack-on-tugger-cart', 'Blue assembly rack on an orange tugger cart'],
  ['yellow-industrial-material-racks', 'Yellow custom industrial material racks'],
  ['forklift-moving-assembly-rack', 'Forklift moving a loaded assembly rack'],
  ['multi-level-assembly-rack', 'Multi-level blue assembly rack'],
  ['automotive-panel-assembly-rack', 'Automotive panel held in a numbered assembly rack'],
  ['large-blue-shipping-rack', 'Large blue material handling rack loaded with parts'],
  ['green-part-hangers', 'Green part hangers for safe part handling'],
  ['welded-steel-frame', 'Welded steel rack frame during fabrication'],
  ['blue-automation-carts-3', 'Blue automation carts with part supports'],
  ['blue-cart-orange-base', 'Blue rack on an orange caster base'],
  ['enclosed-parts-cart', 'Enclosed parts cart with green curtain on an orange base'],
  ['painted-rack-mesh-decks', 'Freshly painted rack with mesh decks'],
  ['painted-rack-base', 'Painted rack base with mesh deck'],
  ['repaired-material-handling-rack', 'Repaired material handling rack'],
  ['cart-locator-detail', 'Part locator detail on a custom cart'],
  ['stackable-steel-container', 'Stackable steel container'],
  ['stacked-steel-containers', 'Rows of stacked steel containers'],
];

export const CONTACT_TEXT = [
  'Have a new rack project, repair, changeover, or rework requirement? Tell us what you’re working on and our team will review the application.',
  'Fill out the form with as much information as possible, including quantities, part details, timing, and any special requirements.',
  '<strong>Have drawings, prints, photos, CAD files, or existing rack designs?</strong> Submit them with your request so we can better understand the project and provide the right solution.',
  'Whether you need a new custom material handling rack, modifications to an existing fleet, or repairs to equipment already in service, send us the details and we’ll help determine the best path forward.',
  '<strong>Fill out the form and submit your drawings to get started.</strong>',
];

export const contact = () => contactSection({
  heading: 'Let’s Talk About Your Material Handling Needs. Send us details.', text: CONTACT_TEXT, formId: 'contact-form',
});

export const capabilitiesFlag = () => flag({
  id: 'Capabilities', title: 'Engineering & Manufacturing Capabilities', text: 'NEW FABRICATION • REPAIRS • REWORKS • PROGRAM CHANGEOVERS',
});

const l = (text, href) => ({ text, href });
export const capabilitiesLists = () => listCards({
  intro: 'We design, fabricate, repair, and rework material handling equipment for automotive, assembly, and industrial manufacturing environments.',
  cards: [
    { title: 'Capabilities and Services', groups: [
      { h: 'Rack Repair & Refurbishment', href: '/fabrication/repair-refurbishing-modification/', items: [l('Structural Rack Repair', '/rack-repair/'), 'Weld Repair', 'Forklift Damage Repair', 'Bent Frame Repair', 'Component Replacement', 'Rack Reinforcement', l('Fleet Refurbishment', '/fabrication/rack-fleet-refurbishment/')] },
      { h: 'ReWork, Modification & Changeovers', href: '/rack-changeovers-reworks/', items: [l('Automotive Program Changeovers', '/rack-changeovers-reworks/'), l('Rack ReWork & Modification', '/fabrication/steel-rack-modification/'), 'New Part Conversions', 'Fixture & Locator Changes', l('Dunnage Reconfiguration', '/capabilities/dunnage/'), 'Capacity Modifications', 'Existing Rack Repurposing'] },
      { h: 'Custom Material Handling Racks', href: '/racks/', items: [l('Automotive Parts Racks', '/racks/automotive-racks/'), l('Returnable Shipping Racks', '/racks/shipping-racks/'), 'WIP & Line-Side Racks', l('Stackable Transport Racks', '/racks/stack-racks/'), 'Custom Part-Specific Racks', 'Forklift-Compatible Racks'] },
      { h: 'Material Handling Carts', href: '/carts/', items: ['Line-Side Carts', 'Assembly Carts', l('Tugger Carts', '/carts/tugger-carts/'), 'Component Transport Carts', 'Custom Mobile Material Handling'] },
      { h: 'Dunnage & Fixtures', href: '/capabilities/dunnage/', items: [l('Custom Dunnage', '/capabilities/dunnage/'), 'Part Locators', 'Protective Contact Surfaces', 'Component Fixtures', 'Part-Specific Supports', 'Line-Side Presentation Systems'] },
    ] },
    { title: 'Industries and Applications', groups: [
      { h: 'Automotive', href: '/industries/automotive/', items: ['OEM Manufacturing', 'Tier 1 Suppliers', 'Tier 2 & Tier 3 Suppliers', 'Vehicle Assembly', 'Component Manufacturing', 'Automotive Program Launches'] },
      { h: 'Assembly & Manufacturing', href: '/industries/assembly-manufacturing/', items: ['Assembly Operations', 'Production Lines', 'Work-In-Process', 'Line-Side Material Delivery', 'Parts Sequencing', 'Component Staging'] },
      { h: 'Industrial Manufacturing', items: ['Heavy Manufacturing', 'Fabrication Facilities', 'Machinery & Equipment', 'Industrial Components', 'Plant Material Handling', 'Reusable Transport Systems'] },
      { h: 'Warehousing & Distribution', href: '/industries/warehousing-distribution/', items: ['Internal Material Movement', 'Parts Storage', 'Reusable Shipping Systems', 'Facility Transport', 'Staging & Storage', 'Returnable Packaging'] },
      { h: 'Automation & Robotics', href: '/industries/automation-robotics/', items: ['Robotic Load / Unload Applications', 'Automation-Compatible Racks', 'Precision Part Presentation', 'Repeatable Part Location', 'Fixture Integration', 'Automated Material Handling'] },
    ] },
  ],
  after: `<div class="btn-row">${button({ text: 'Contact Us', href: '#Contact', style: 'lg', iconName: 'comment' })}</div>`,
});

export const projectGallery = ({ heading, intro, id = 'Gallery', after } = {}) => gallery({ id, heading, intro, images: GALLERY, after });
