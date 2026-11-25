# Adding real cake photos

Until a cake has a photo, the site shows a matching illustration (birthday, chocolate, cheesecake, cupcakes, wedding, loaf, ribbon). It looks tidy, but real photos of **your** cakes will make the shop look far more professional.

## Good photos (phone camera is enough)
- Shoot in daylight near a window. Avoid the flash.
- Plain background (a white board, table or cloth) and a clean plate.
- Shoot from slightly above, with the whole cake in the frame.
- Keep it **square**, around 1000 x 1000 px, saved as JPG and under about 300 KB. Squoosh (squoosh.app) can shrink photos for free.
- Use your own photos. Do not copy photos from other cake shops' websites (copyright). Free stock sites such as Unsplash or Pexels allow free use, but always read the licence on each photo.

## Two ways to add them

**A. From the Admin panel (easiest)**
Admin > Cakes > Edit > choose a photo file. It uploads and shows a preview.
Photos uploaded this way are saved in `backend/uploads`. After deploying to free hosting these files can disappear when the server restarts (see DEPLOY.md).

**B. As part of the website (survives deployment)**
1. Put the photo files in `frontend/public/cakes/`, for example `chocolate-fudge.jpg`.
2. Either open Admin > Cakes > Edit and write `/cakes/chocolate-fudge.jpg` in the "paste a photo link" box,
3. or write `"image": "/cakes/chocolate-fudge.jpg"` for that cake in `database/seed-cakes.json` and run `npm run seed` again (this resets test data).

## Home page banner photo
Put a landscape-friendly photo in `frontend/public/` (for example `hero.jpg`) and set `heroImage: '/hero.jpg'` in `frontend/src/siteConfig.js`.

## Shop details
Phone, WhatsApp, email, address and opening hours are set in `frontend/src/siteConfig.js`. They appear in the footer and on the Contact page. Anything left empty is hidden.
