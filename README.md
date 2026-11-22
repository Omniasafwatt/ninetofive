# Nine to Five — Good style works overtime

Storefront for Nine to Five, casual wear for girls on the move. The look comes from the brand card: brick red and maroon, soft grey, wide uppercase Jost type, the NTF monogram cropped large, and a thin red rule.

**No checkout.** Every "Order on Instagram" button opens a DM with the shop (`ig.me/m/<username>`) and copies a ready-made order message (piece, colour, size, link), so the customer only has to paste it and send.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Set your Instagram

Open `src/data/site.ts` and set `instagram` to the shop's username, without the @.

## Pages

- `/`: hero, "your day" moments (Work hours, Campus days, On the go, After five), new in, why Nine to Five, how to order
- `/shop`: filter by moment (`?moment=`) and category (`?category=`), sort by price
- `/product/:slug`: gallery, colour and size, Order on Instagram, ask a question, details
- `/about`
- `/admin`: edit products, moments and photos (default passcode `9to5`)

## Structure

```
src/
  data/        site.ts (Instagram), products, collections (= moments), images
  components/  Navbar, Footer, ProductCard, Logo (traced NTF monogram), Img, Reveal, Toast, Icons
  pages/       Home, Shop, ProductPage, AboutPage, NotFound
  lib/         instagram.ts (order message + DM), ease.ts, storage.ts
  admin/       content editor
```

Content edits made in `/admin` are saved in that browser only (IndexedDB). To publish them for everyone, export a backup and commit it as the new seed, or connect a backend.

The redesign doesn't use the old storefront files any more: `src/components/{layout,product,rack,sections,ui,checkout}`, `src/hooks`, `src/context/{Accent,Bag}Context.tsx`, `src/context/SmoothScroll.tsx`, `src/lib/{gsap,orders,pricing}.ts`, `src/pages/{Checkout,Collections,CollectionPage,LookbookPage}.tsx` and `src/admin/pages/Orders.tsx`. `tsconfig.json` excludes them, and you can delete them safely.
