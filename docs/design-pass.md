# Upwork Helper design pass

## Design basis

The goal is a clear professional cover, not a claim of increased click-through rates. The user asked for stronger compositions and called out arrows crossing text. These original layouts use distinct title, image, supporting detail and callout zones. Arrows point to a callout from its reserved space; they do not cross a headline or portrait. Themes are unchanged.

Sources reviewed for the design direction:
- YouTube Help, thumbnail and title tips: https://support.google.com/youtube/answer/12340300?hl=en
- Upwork, profile examples: https://www.upwork.com/resources/upwork-profile-examples
- Upwork, introduction video: https://www.upwork.com/resources/self-introduction-video-script
- Buffer, thumbnail patterns: https://buffer.com/resources/youtube-thumbnails/
- Arrow composition discussion: https://thumbnailtest.com/guides/arrow-youtube-thumbnail/
- Composition patterns: https://clicktheory.pixelsamy.com/blog/thumbnail-composition-basics
- Portfolio presentation: https://www.rafaelbotelhopt.com/upwork-portfolio-guide

Applied judgment: one focal hierarchy, short text in negative space, visible project imagery, large editable stats and simple personal-intro compositions. Third-party numerical marketing claims were not used as evidence or product promises. Reference imagery was not copied into templates.

## Changes

Ten portfolio and ten intro styles. Service blueprint, Project cover and Impact report replace the weak list/overlap compositions. Three editable stats appear on every stats layout. Original pairing plus Montserrat, Manrope and Anton are served locally from the existing licensed font files. The editor font is unchanged.

Five optional extras: curved arrow, play button, sparkle accents, star strip and accent frame. New layouts use an editable callout pill in reserved space; the original result/screenshot and Meet me retain their integrated extras. An empty callout text hides its words. Extras are browser-local, as are image editing and export.

Style navigation has visible previous/next buttons and stays at two rows. Brand is Upwork Helper with a briefcase/toolbox icon. Client quote starts with neutral placeholders and no rating. All text and stats are examples and the editor asks users to replace them with accurate details.

## Verification

- Unit tests: 12 pass.
- Source TypeScript and Biome checks pass; production build passes.
- Layout suite: 170 checks across desktop, tablet, mobile and all three modes.
- Existing interaction suite expanded to all 20 styles: 77 checks, real PNG downloads, preview/export pixel equality, touch crop, upload/paste/drop/remove, themes and rings, no browser exceptions or server writes.
- Additional editor suite checks carousel navigation, font choices, all five controls, every style's download and editing the third stat on every supported layout.
- Render matrix: 11,520 combinations: 20 styles, applicable aspect ratios, four font settings, default/short/long text and 32 combinations of five extras. No measured text extends outside the canvas. This is a bounds check, not a claim of exhaustive aesthetic correctness.
- Actual pixels inspected in contact sheets of all compositions and long-text/all-extras variants, plus font comparisons and desktop/mobile editor views.

The internal real-photo fixture is an Unsplash photo by Noah Blaine Clark: https://unsplash.com/photos/man-in-white-crew-neck-t-shirt-smiling-644AhjsZNQs . It is not a photo of the owner and is not shipped with the app. The dashboard fixture is an original demonstration image. Repo synthetic fixtures remain the portable automated-test defaults.

Run `node scripts/verify-design-pass.mjs` against a running production build. Run `node scripts/stress-design-pass.mjs` for the render matrix. Set `FACE_FIXTURE` and `SHOT_FIXTURE` to local images to repeat real-image review; otherwise the repo fixtures are used. `APP_URL` selects a deployed site for interaction/layout verification.
