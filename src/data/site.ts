/**
 * Brand settings in one place.
 * INSTAGRAM: the shop's Instagram username, without the @. Every "Order" button opens a DM to it.
 */
export const SITE = {
  name: 'Nine to Five',
  tagline: 'Good style works overtime',
  instagram: 'ninetofive.eg',
}

export const instagramProfile = () => `https://instagram.com/${SITE.instagram}`
/** ig.me opens a direct-message chat with the account (app on phones, web on desktop). */
export const instagramDM = () => `https://ig.me/m/${SITE.instagram}`
