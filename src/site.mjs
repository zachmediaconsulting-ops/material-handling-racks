// Business facts used across the site. Only information published on the original site lives here.
export const SITE = {
  url: 'https://materialhandlingracks.com',
  name: 'Rivers Industrial Racks',
  legalName: 'Rivers Fabrication',
  tagline: 'American Made Industrial Racks & Carts',
  phone: '1-989-600-9030',
  phoneHref: 'tel:+19896009030',
  hours: '9am–5pm EST',
  address: { street: '1650 E South St Ste 2', city: 'Owosso', region: 'MI', postal: '48867', country: 'US' },
  mapEmbed: 'https://maps.google.com/maps?q=1650%20E%20South%20St%2C%20Owosso%2C%20MI%2048867&t=m&z=7&output=embed&iwloc=near',
  video: 'RTV_gI5bnhw',
  quote: '“Business used to be built on a handshake, a man’s word, and the quality of his work. We still think it should be.”',
  summary: 'We design, manufacture, repair, and rework custom material handling racks, carts, and transport systems for automotive, assembly, and industrial applications throughout Michigan and beyond.',
};

export const addressLine = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postal}`;
