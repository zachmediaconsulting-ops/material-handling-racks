// Rack Repair page: same content and layout as the original site, plus links to related services.
import { band, button, carousel, hero, linkCards } from '../components.mjs';
import { capabilitiesFlag, capabilitiesLists, contact, projectGallery } from '../shared.mjs';

export const page = {
  path: '/rack-repair/',
  title: 'Rack Repair – Rivers Industrial Racks',
  description: 'Steel rack repair in Michigan for automotive, assembly, and industrial material handling racks: weld repair, forklift damage, bent frames, worn dunnage, and component replacement.',
  ogImage: 'repaired-material-handling-rack',
  label: 'Steel Rack Repair',
  summary: 'Weld repair, forklift damage, bent frames, and worn components fixed so racks return to service.',
  image: 'repaired-material-handling-rack',
  group: 'fabrication',
  breadcrumbs: [{ label: 'Fabrication', href: '/fabrication/' }, { label: 'Repair, Refurbishing & Modification', href: '/fabrication/repair-refurbishing-modification/' }],
  schema: 'Service',
};

export function render({ cardFor }) {
  return [
    hero({
      kicker: 'Restore strength, extend service life, and keep your rack fleet working.',
      title: 'Rack Repair', size: 'xl', fit: 3.4,
      slides: ['rack-repair-before', 'repaired-material-handling-rack'],
      buttons: [{ text: 'Learn More', href: '#Learn-More', style: 'xl' }],
    }),
    band('Extend the life of your rack fleet, reduce replacement costs, and keep production moving with rack repair services built around fast turnaround, dependable workmanship, and long-term value.', 'Start'),
    `<section class="section reveal" id="Learn-More"><div class="box">
      <div class="split">
        <div class="col"><h2 class="h2">Michigan Steel Rack Repair Services</h2><div class="text">
          <p>Rivers provides professional rack repair services for automotive, assembly, and industrial material handling applications. We repair damaged steel racks, shipping racks, returnable racks, and custom material handling racks to restore strength, function, and service life.</p>
          <p>From cracked welds and damaged structural components to worn dunnage and other high-use areas, our team has the fabrication experience to bring existing racks back into working condition.</p>
          <p><i>Scroll down to learn more about our rack repair capabilities, common repair needs, and the types of material handling racks we service.</i></p>
        </div></div>
        <div class="col">${carousel([['rack-repair-before', 'Damaged rack before repair'], ['rack-repair-after', 'The same rack after repair'], ['repaired-racks-ready-to-ship', 'Repaired racks ready to ship']], 'Rack repair photos')}</div>
      </div>
      <div class="btn-row">${button({ text: 'Contact Us', href: '#Contact', style: 'lg', iconName: 'comment' })}</div>
    </div></section>`,
    `<section class="section section--gray reveal" id="Services"><div class="box"><div class="col center" id="New-Rack">
      <h2 class="h2">Material Handling Rack Repair Gallery</h2>
      <div class="text narrow">
        <p>See how Rivers restores damaged, worn, and high-use material handling racks to help extend fleet life and reduce unnecessary replacement costs.</p>
        <p>Our rack repair work addresses structural damage, failed welds, worn components, dunnage issues, and other conditions that can take valuable equipment out of service.</p>
        <p><strong>View the gallery below to see examples of rack repairs, rebuilds, and restored equipment completed for demanding manufacturing environments.</strong></p>
      </div>
      ${button({ text: 'View Gallery', href: '#Gallery' })}
    </div></div></section>`,
    projectGallery({ after: `<div class="btn-row">${button({ text: 'Contact Us', href: '#Contact', style: 'lg', iconName: 'comment' })}</div>` }),
    linkCards({
      heading: 'Related Rack Repair & Rework Services',
      intro: 'Repair is often one part of a larger plan for a rack fleet. These services are commonly combined with it.',
      pages: ['/fabrication/rack-fleet-refurbishment/', '/fabrication/steel-rack-modification/', '/rack-changeovers-reworks/', '/capabilities/dunnage/', '/racks/shipping-racks/', '/racks/automotive-racks/'].map(cardFor),
    }),
    capabilitiesFlag(),
    capabilitiesLists(),
    contact(),
  ].join('\n');
}
