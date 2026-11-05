import { LIGHT_COLS, LIGHT_ROWS, NAVY_FROM, lightMap, settleLight } from "@/lib/motherland-film-tone";

/** A shape to melt into the film: where it is on the page, and how to draw it there. */
export interface MeltShape {
  el: Element;
  /** The width of the units `draw` works in. */
  width: number;
  /** Red marks letters, green the sun. */
  draw: (mask: CanvasRenderingContext2D) => void;
}

const READ_LIGHT_EVERY_MS = 250;
const MIN_FRAME_MS = 30;
/** The film inside the letters is a soft part of the picture, so it can change less often than the film itself. */
const FILM_EVERY_MS = 66;
/** After a link is clicked the melt stands still, so the next page gets the processor. */
const LEAVING_MS = 4000;
const MELT_IN_MS = 2600;
/** A frame slower than this counts against the device; past the limit the page falls back to the plain letters. */
const SLOW_FRAME_SECONDS = 0.07;
const SLOW_FRAME_LIMIT = 45;

const VERTEX = `#version 300 es
out vec2 uv;
void main() {
  uv = vec2(gl_VertexID & 1, (gl_VertexID >> 1) & 1) * 2.0;
  gl_Position = vec4(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0);
}`;

/*
 * Inside the letters the picture is the film itself, carried towards navy or gold: the
 * film's own light and colour keep moving through them. Which of the two is decided by the
 * settled light around each point, so the colours flow slowly into each other, and a slow
 * tide keeps them moving wherever both can be read. The letters' colour seeps out a little
 * into the film around them, and their edge has no hard line.
 */
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D film, light, mask;
uniform vec4 filmBox;
uniform float time, reveal;
in vec2 uv;
out vec4 color;
const vec3 NAVY = vec3(0.043, 0.094, 0.286);
const vec3 GOLD = vec3(0.894, 0.690, 0.153);
const vec3 SUN = vec3(0.957, 0.165, 0.255);
void main() {
  vec2 f = uv * filmBox.zw + filmBox.xy;
  vec3 here = texture(film, f).rgb;
  float settled = texture(light, f).r;
  float around = max(settled * settled, 0.001);
  float tide = sin(uv.x * 6.0 - uv.y * 2.5 - time * 0.3);
  float navy = smoothstep(-0.22, 0.22, log(around / ${NAVY_FROM}) / 0.9 + tide * 0.32);
  vec3 ink = mix(GOLD, NAVY, navy);
  vec3 through = (here - vec3(settled)) * 0.42;

  vec2 shape = textureLod(mask, uv, mix(5.0, 0.35, reveal)).rg;
  float seep = textureLod(mask, uv, 4.5).r * 0.7 + textureLod(mask, uv, 3.0).r * 0.3;
  float letters = shape.r * 0.97 * reveal;
  float sun = shape.g * 0.97 * reveal;
  float halo = seep * 0.2 * reveal * (1.0 - letters - sun);

  float alpha = letters + sun + halo;
  color = vec4((ink + through) * letters + (SUN + through * 0.7) * sun + ink * halo, alpha);
}`;

function program(gl: WebGL2RenderingContext) {
  const made = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(made, shader);
  }
  gl.linkProgram(made);
  return gl.getProgramParameter(made, gl.LINK_STATUS) ? made : null;
}

function texture(gl: WebGL2RenderingContext, unit: number, minFilter: number) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/**
 * Melts the shapes into the film. The video element is left alone at its full resolution;
 * this canvas lies over it and draws only the letters. Returns a stop function, or null
 * where WebGL 2 is missing; `onLost` says the context went or the device is too slow. Either
 * way the page keeps its plain vector letters.
 */
export function startMelt({ canvas, video, shapes, onStart, onLost }: { canvas: HTMLCanvasElement; video: HTMLVideoElement; shapes: MeltShape[]; onStart: () => void; onLost: () => void }) {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
  const reader = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const maskCanvas = document.createElement("canvas");
  const mask = maskCanvas.getContext("2d");
  const made = gl && program(gl);
  if (!gl || !reader || !mask || !made) return null;

  reader.canvas.width = LIGHT_COLS;
  reader.canvas.height = LIGHT_ROWS;
  gl.useProgram(made);
  gl.bindVertexArray(gl.createVertexArray());
  texture(gl, 0, gl.LINEAR);
  texture(gl, 1, gl.LINEAR);
  texture(gl, 2, gl.LINEAR_MIPMAP_LINEAR);
  (["film", "light", "mask"] as const).forEach((name, i) => gl.uniform1i(gl.getUniformLocation(made, name), i));
  const filmBox = gl.getUniformLocation(made, "filmBox");
  const time = gl.getUniformLocation(made, "time");
  const reveal = gl.getUniformLocation(made, "reveal");

  const layout = () => {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = maskCanvas.width = Math.round(box.width * ratio);
    canvas.height = maskCanvas.height = Math.round(box.height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);

    mask.setTransform(1, 0, 0, 1, 0, 0);
    mask.fillStyle = "#000";
    mask.fillRect(0, 0, canvas.width, canvas.height);
    for (const shape of shapes) {
      const at = shape.el.getBoundingClientRect();
      const scale = (at.width / shape.width) * ratio;
      mask.setTransform(scale, 0, 0, scale, (at.left - box.left) * ratio, (at.top - box.top) * ratio);
      shape.draw(mask);
    }
    gl.activeTexture(gl.TEXTURE2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    placeFilm();
  };

  /** Where this canvas falls on the film, as object-fit: cover and the zoom show it. */
  const placeFilm = () => {
    if (!video.videoWidth) return;
    const box = canvas.getBoundingClientRect();
    const shown = video.getBoundingClientRect();
    const scale = Math.max(shown.width / video.videoWidth, shown.height / video.videoHeight);
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;
    const left = shown.left + (shown.width - width) / 2;
    const top = shown.top + (shown.height - height) / 2;
    gl.uniform4f(filmBox, (box.left - left) / width, (box.top - top) / height, box.width / width, box.height / height);
  };

  let settled: Float32Array | null = null;
  let target: Float32Array | null = null;
  const bytes = new Uint8Array(LIGHT_COLS * LIGHT_ROWS);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  let raf = 0;
  let last = 0;
  let nextRead = 0;
  let seen = -1;
  let nextFilm = 0;
  let leaving = 0;
  let begun = 0;
  let slow = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (document.hidden || now < leaving || now - last < MIN_FRAME_MS || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (canvas.getBoundingClientRect().bottom < 0) return;
    const seconds = last ? Math.min((now - last) / 1000, 0.1) : 0;
    const slowFrame = last > 0 && now - last > SLOW_FRAME_SECONDS * 1000;
    last = now;
    slow = slowFrame ? slow + 1 : Math.max(0, slow - 1);
    if (slow > SLOW_FRAME_LIMIT) {
      cancelAnimationFrame(raf);
      onLost();
      return;
    }

    if (video.currentTime !== seen && now >= nextFilm) {
      seen = video.currentTime;
      nextFilm = now + FILM_EVERY_MS;
      gl.activeTexture(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }
    if (now >= nextRead) {
      nextRead = now + READ_LIGHT_EVERY_MS;
      reader.drawImage(video, 0, 0, LIGHT_COLS, LIGHT_ROWS);
      target = lightMap(reader.getImageData(0, 0, LIGHT_COLS, LIGHT_ROWS).data);
      settled ??= target.slice();
    }
    if (!settled || !target) return;
    settleLight(settled, target, seconds, bytes);
    gl.activeTexture(gl.TEXTURE1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, LIGHT_COLS, LIGHT_ROWS, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);

    if (!begun) {
      begun = now;
      placeFilm();
      onStart();
    }
    const opening = Math.min(1, (now - begun) / MELT_IN_MS);
    gl.uniform1f(reveal, opening * opening * (3 - 2 * opening));
    gl.uniform1f(time, now / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const onClick = (event: MouseEvent) => {
    if ((event.target as Element).closest?.('a[href^="/"]')) leaving = performance.now() + LEAVING_MS;
  };
  const onContextLost = () => {
    cancelAnimationFrame(raf);
    onLost();
  };
  const resized = new ResizeObserver(layout);
  resized.observe(canvas);
  video.addEventListener("loadedmetadata", placeFilm);
  canvas.addEventListener("webglcontextlost", onContextLost);
  document.addEventListener("click", onClick, true);
  layout();
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    resized.disconnect();
    video.removeEventListener("loadedmetadata", placeFilm);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    document.removeEventListener("click", onClick, true);
  };
}
