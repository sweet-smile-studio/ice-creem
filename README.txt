SWEET SMILE — 3D ICE CREAM BUILDER V4

WHAT THIS IS
This is the next production prototype of the Sweet Smile interactive ice-cream experience.
It is intentionally built as a browser 3D product-builder architecture rather than a normal static
website. The current character is a procedural 3D blockout; the supplied front/side/back PNGs are
included as the source-of-truth references for the final model.

IMPORTANT
The final character should NOT be rebuilt as a separate video for every flavor.
The scalable solution is one rigged 3D character + reusable animations + interchangeable 3D objects.

CURRENTLY IMPLEMENTED
- 3D browser scene
- supplied clean shop background
- procedural 3D character blockout
- character front/side/back references
- cone or cup
- up to 3 scoops
- 5 flavors
- 4 toppings
- real-time price
- removable recipe items
- character action states: scoop, sprinkle, toss, place, celebrate, reset
- interactive 3D product object placement
- finish modal + bag count
- responsive layout
- drag-to-look interaction in the scene

NEXT PRODUCTION STEP
1. Create the final character as a rigged GLB from the supplied 3-view references.
2. Replace the procedural blockout with the GLB.
3. Add hand IK / object attachment points.
4. Add reusable animation clips:
   idle, reach, grab, scoop, place, sprinkle, throw, celebrate, reset.
5. Create proper 3D cone, cup, scoop and topping assets.
6. Animate object handoffs so the character visibly performs each action.
7. Add camera choreography and polished lighting.
8. Add sound and micro-interactions.
9. Optimize for mobile.
10. Integrate the finished game module into WordPress.

RUNNING LOCALLY
For the cleanest local test, serve this folder with a local web server:
python -m http.server 8000
Then open:
http://localhost:8000

The page uses Three.js from a CDN, so internet access is required unless Three.js is downloaded
locally into a vendor folder.

SOURCE-OF-TRUTH CHARACTER FILES
assets/character_front.png
assets/character_side.png
assets/character_back.png

SOURCE-OF-TRUTH ENVIRONMENT
assets/shop_background.jpg

DO NOT CHANGE WITHOUT USER APPROVAL
- character identity/design
- brand name
- core builder concept
- maximum 3 scoops
- game-like interaction
- warm premium visual direction
- requirement that the character actually performs actions


TESTING — IMPORTANT
Do NOT double-click index.html.
Run a local web server from this folder instead.

Windows:
1. Open Command Prompt/PowerShell in this folder.
2. Run: python -m http.server 8000
3. Open: http://localhost:8000

Mac/Linux:
1. Open Terminal in this folder.
2. Run: python3 -m http.server 8000
3. Open: http://localhost:8000

The Three.js library is loaded from a CDN, so the browser needs internet access.
