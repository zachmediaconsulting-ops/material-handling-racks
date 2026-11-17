// Home page: same content and layout as the original site, plus links to the new sections.
import { band, button, carousel, contactButtons, hero, linkCards, media, split, video } from '../components.mjs';
import { capabilitiesFlag, capabilitiesLists, contact, projectGallery } from '../shared.mjs';

export const page = {
  path: '/',
  title: 'Rivers Industrial Racks – Custom Material Handling Industrial Racks and Carts.',
  description: 'Rivers Fabrication provides Fast Material Handling Rack Repairs, Quality Changeovers, and Custom Material Handling Rack Builds for automotive and assembly applications.',
  ogImage: 'yellow-automotive-handling-racks',
  label: 'Home',
};

const serviceCard = ({ id, title, aside, text, href }) => `<div class="card" id="${id}">
  ${aside}
  <h2 class="h2">${title}</h2>
  <div class="text">${text.map((p) => `<p>${p}</p>`).join('')}</div>
  ${button({ text: 'Learn More', href })}
</div>`;

export function render({ cardFor }) {
  return [
    hero({
      kicker: 'Over 32+ Years Industry Experience',
      title: 'Material Handling Racks',
      slides: ['yellow-automotive-handling-racks', 'curtained-parts-carts', 'welding'],
      buttons: [
        { text: 'Rack Repairs', href: '#Repair' },
        { text: 'Changeovers/ReWorks', href: '#Changeoever' },
        { text: 'Custom New Builds', href: '#New-Rack' },
      ],
    }),
    band('Rivers provides custom material handling cart and rack fabrication for automotive, assembly, and industrial applications. When you need quality, accuracy, and experience call Rivers.', 'Start'),
    split({
      heading: 'Michigan-Built Custom Material Handling Racks, Repairs & ReWorks',
      text: [
        'We design, manufacture, repair, and rework custom material handling racks, carts, and transport systems for automotive, assembly, and industrial applications throughout Michigan and beyond.',
        'From part-specific shipping racks and returnable packaging to work-in-process racks, assembly carts, and custom material handling systems, every solution is built around the way your parts need to be stored, moved, protected, and presented.',
      ],
      aside: video(),
      after: contactButtons({ drawings: '#Contact', contact: '#Contact' }),
    }),
    `<section class="section section--gray reveal" id="Services"><div class="cards">
      ${serviceCard({ id: 'Repair', title: 'Rack Repair', href: '/rack-repair/',
        aside: carousel([['rack-repair-before', 'Material handling rack before repair'], ['rack-repair-after', 'The same rack after repair and rework']], 'Rack repair before and after'),
        text: ['Material handling racks take abuse.', 'Forklift impacts, damaged welds, bent frames, worn locating points, broken components, and years of repeated use can eventually make an otherwise valuable rack unsafe or unusable.', 'Instead of automatically replacing existing racks, we can inspect, repair, reinforce, and restore them for continued use.'] })}
      ${serviceCard({ id: 'Changeoever', title: 'Rack Changeovers &amp; ReWorks', href: '/rack-changeovers-reworks/',
        aside: media('rack-changeover-hood', 'Rack reworked to carry a newly designed hood', { sizes: '(max-width: 767px) 100vw, 420px' }),
        text: ['Manufacturing programs change. Your racks should be able to change with them.', 'When a component, vehicle platform, assembly process, automation cell, or packaging requirement changes, existing racks may no longer properly support the new application.', 'Rather than scrapping an entire fleet of material handling racks, we can modify and rework existing racks for a new part or program.'] })}
      ${serviceCard({ id: 'New-Rack', title: 'New Rack Design &amp; Fabrication', href: '/racks/',
        aside: media('blue-rack-and-orange-cart', 'Custom material rack and cart', { sizes: '(max-width: 767px) 100vw, 420px' }),
        text: ['Whether you need a single custom prototype or a full production run, we can take your requirements from concept through fabrication. Our custom material handling solutions can be designed around specific components, manufacturing processes, automation systems, shipping requirements, line-side presentation, or reusable packaging programs.'] })}
    </div></section>`,
    linkCards({
      heading: 'Explore Our Racks, Carts & Fabrication Services',
      intro: 'Browse by product or service to see how we approach each type of material handling project.',
      gray: false,
      pages: ['/racks/', '/carts/', '/fabrication/', '/capabilities/', '/industries/', '/container-study/'].map(cardFor),
    }),
    projectGallery({
      heading: 'Assembly Rack & Cart Gallery',
      intro: [
        'Explore examples of custom material handling racks, automotive part racks, shipping frames, WIP systems, and specialized fixtures built for demanding manufacturing environments.',
        'Each project is designed around the specific part, process, and handling requirements of the application—from protecting automotive components in transit to improving line-side presentation, storage, and movement throughout the plant.',
        '<strong>View the gallery below to see the range of custom solutions we build for automotive, assembly, and industrial applications.</strong>',
      ],
      after: `<div class="btn-row">${button({ text: 'Contact Us', href: '#Contact', style: 'lg', iconName: 'comment' })}</div>`,
    }),
    capabilitiesFlag(),
    capabilitiesLists(),
    contact(),
  ].join('\n');
}
