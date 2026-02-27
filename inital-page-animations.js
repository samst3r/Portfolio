import {
  animate,
  utils,
  createDraggable,
  spring,
  svg,
  stagger,
  splitText,
} from "https://esm.sh/animejs";

animate(svg.createDrawable(".st0"), {
  draw: ["0 0", "0 1", "1 1"],
  ease: "inOutQuad",
  duration: 2000,
  delay: stagger(100),
  loop: true,
});
