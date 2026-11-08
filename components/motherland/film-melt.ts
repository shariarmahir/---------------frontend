import { OFFSET_SECONDS, filmRegion, navyShare, stepWord, wordTone, type Tone, type WordTone } from "@/lib/motherland-film-tone";

/** The title to melt into the film: where it is on the page, its words, and how to draw it. */
export interface MeltLine {
  el: Element;
  /** The width of the units `words` and `draw` work in. */
  width: number;
  words: number[][];
  draw: (mask: CanvasRenderingContext2D) => void;
}

const READ_FILM_EVERY_MS = 250;
const MIN_FRAME_MS = 30;
/** After a link is clicked the melt stands still, so the next page gets the processor. */
const LEAVING_MS = 4000;
const MELT_IN_MS = 2600;
/** A frame slower than this counts against the device; past the limit the page falls back to the plain letters. */
const SLOW_FRAME_SECONDS = 0.07;
const SLOW_FRAME_LIMIT = 45;
/** All the melt reads of the film: a tiny copy, a few times a second, so a 4K film keeps its pace. */
const COPY_WIDTH = 64;
const COPY_HEIGHT = 36;
/** The title's two words. */
const MAX_WORDS = 2;
/** The page's own colours, as the shader takes them. */
const COLOUR: Record<Tone, [number, number, number]> = { navy: [0.043, 0.094, 0.286], gold: [0.894, 0.69, 0.153], white: [1, 0.99, 0.96] };

const VERTEX = `#version 300 es
out vec2 uv;
void main() {
  uv = vec2(gl_VertexID & 1, (gl_VertexID >> 1) & 1) * 2.0;
  gl_Position = vec4(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0);
}`;

/*
 * Each word is one solid colour, navy, gold or white, with the film's light moving faintly
 * through it. A change melts slowly across the word on a leaning edge, soft but never
 * blurred, with a pale glow riding it. Around the letters the film deepens under gold and
 * white and lifts under navy, softly and following their shapes, with no panel behind.
 */
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D film, mask;
uniform vec4 filmBox;
uniform vec2 span[${MAX_WORDS}];
uniform vec3 inkFrom[${MAX_WORDS}];
uniform vec3 inkTo[${MAX_WORDS}];
uniform float sweep[${MAX_WORDS}];
uniform float reveal, lean;
in vec2 uv;
out vec4 color;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 SHINE = vec3(1.0, 0.97, 0.86);
const vec3 DEEP = vec3(0.016, 0.035, 0.11);
const vec3 LIFT = vec3(1.0, 0.98, 0.93);
void main() {
  int pick = 0;
  float best = 1e9;
  for (int i = 0; i < ${MAX_WORDS}; i++) {
    float away = max(span[i].x - uv.x, uv.x - span[i].y);
    if (away < best) { best = away; pick = i; }
  }
  vec2 word = span[pick];
  float size = word.y - word.x;
  float along = (uv.x - word.x - uv.y * lean) / size;
  float start = -lean / size - 0.1;
  float s = sweep[pick];
  float front = mix(start, 1.1, s * s * (3.0 - 2.0 * s));
  float soft = max(fwidth(along) * 1.5, 0.05);
  vec3 ink = mix(inkFrom[pick], inkTo[pick], 1.0 - smoothstep(front - soft, front + soft, along));
  vec3 around = mix(inkFrom[pick], inkTo[pick], 1.0 - smoothstep(front - 0.2, front + 0.2, along));
  float glow = s > 0.0 && s < 1.0 ? exp(-pow((along - front) / 0.07, 2.0)) * 0.5 : 0.0;

  float light = dot(texture(film, uv * filmBox.zw + filmBox.xy).rgb, LUMA);
  vec3 inked = mix(ink * (0.94 + 0.12 * light), SHINE, glow);

  float letters = textureLod(mask, uv, mix(5.0, 0.0, reveal)).r * reveal;
  float near = textureLod(mask, uv, 2.5).r;
  float far = textureLod(mask, uv, 4.5).r;
  float navy = smoothstep(0.35, 0.08, dot(around, LUMA));
  float ground = min(0.72, (near * 0.5 + far * 0.75) * mix(0.82, 0.6, navy)) * reveal * (1.0 - letters);
  color = vec4(inked * letters + mix(DEEP, LIFT, navy) * ground, letters + ground);
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
 * Melts the hero's title into the film. The video element is left alone at its full
 * resolution; this canvas lies over it and draws only the letters. Returns a stop function,
 * or null where WebGL 2 is missing or would run in software; `onLost` says the context went
 * or the device is too slow. Either way the page keeps its plain vector letters.
 */
export function startMelt({ canvas, video, line, onStart, onLost }: { canvas: HTMLCanvasElement; video: HTMLVideoElement; line: MeltLine; onStart: () => void; onLost: () => void }) {
  // Only on a real graphics chip: drawn in software, the melt held a 4K film back to 0.6 of its pace.
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, failIfMajorPerformanceCaveat: true });
  const reader = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const maskCanvas = document.createElement("canvas");
  const mask = maskCanvas.getContext("2d");
  const made = gl && program(gl);
  if (!gl || !reader || !mask || !made) return null;

  reader.canvas.width = COPY_WIDTH;
  reader.canvas.height = COPY_HEIGHT;
  gl.useProgram(made);
  gl.bindVertexArray(gl.createVertexArray());
  texture(gl, 0, gl.LINEAR);
  texture(gl, 1, gl.LINEAR_MIPMAP_LINEAR);
  const at = (name: string) => gl.getUniformLocation(made, name);
  gl.uniform1i(at("film"), 0);
  gl.uniform1i(at("mask"), 1);
  const filmBox = at("filmBox");
  const spanAt = at("span");
  const fromAt = at("inkFrom");
  const toAt = at("inkTo");
  const sweepAt = at("sweep");
  const reveal = at("reveal");
  const lean = at("lean");

  const inkFrom = new Float32Array(MAX_WORDS * 3);
  const inkTo = new Float32Array(MAX_WORDS * 3);
  const sweeps = new Float32Array(MAX_WORDS);

  const layout = () => {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = maskCanvas.width = Math.round(box.width * ratio);
    canvas.height = maskCanvas.height = Math.round(box.height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const place = line.el.getBoundingClientRect();
    const scale = place.width / line.width;
    mask.setTransform(1, 0, 0, 1, 0, 0);
    mask.fillStyle = "#000";
    mask.fillRect(0, 0, canvas.width, canvas.height);
    mask.setTransform(scale * ratio, 0, 0, scale * ratio, (place.left - box.left) * ratio, (place.top - box.top) * ratio);
    mask.fillStyle = "#f00";
    line.draw(mask);
    gl.uniform2fv(spanAt, line.words.flatMap(([left, right]) => [(place.left - box.left + left * scale) / box.width, (place.left - box.left + right * scale) / box.width]));
    // The edge leans about 20 degrees, whatever the canvas's shape.
    gl.uniform1f(lean, (box.height / box.width) * 0.36);
    gl.activeTexture(gl.TEXTURE1);
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

  /** How much of a word's film navy can be read on. */
  const shareBehind = (word: number[]) => {
    const place = line.el.getBoundingClientRect();
    const scale = place.width / line.width;
    const area = filmRegion(
      { left: place.left + word[0] * scale, top: place.top, width: (word[1] - word[0]) * scale, height: place.height },
      video.getBoundingClientRect(),
      { width: video.videoWidth, height: video.videoHeight },
      { width: COPY_WIDTH, height: COPY_HEIGHT },
    );
    return navyShare(reader.getImageData(area.left, area.top, area.width, area.height).data);
  };

  let words: WordTone[] | null = null;

  let raf = 0;
  let last = 0;
  let nextRead = 0;
  let begun = 0;
  let slow = 0;
  let leaving = 0;

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

    const reading = now >= nextRead;
    if (reading) {
      nextRead = now + READ_FILM_EVERY_MS;
      reader.drawImage(video, 0, 0, COPY_WIDTH, COPY_HEIGHT);
      gl.activeTexture(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, reader.canvas);
      words ??= line.words.map((word, i) => wordTone(shareBehind(word) > 0.5 ? "navy" : "gold", i * OFFSET_SECONDS));
    }
    if (!words) return;
    words.forEach((word, i) => stepWord(word, seconds, reading ? shareBehind(line.words[i]) : undefined));
    const opening = begun ? Math.min(1, (now - begun) / MELT_IN_MS) : 0;
    // Nothing on the canvas changes between readings unless a colour is on its way across a word.
    if (begun && !reading && opening === 1 && words.every((word) => word.sweep === 1)) return;
    words.forEach((word, i) => {
      inkFrom.set(COLOUR[word.from], i * 3);
      inkTo.set(COLOUR[word.tone], i * 3);
      sweeps[i] = word.sweep;
    });
    gl.uniform3fv(fromAt, inkFrom);
    gl.uniform3fv(toAt, inkTo);
    gl.uniform1fv(sweepAt, sweeps);

    if (!begun) {
      begun = now;
      placeFilm();
      onStart();
    }
    gl.uniform1f(reveal, opening * opening * (3 - 2 * opening));
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
