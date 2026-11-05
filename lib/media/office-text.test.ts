import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { legacyText, officeText, xmlText } from "./office-text.ts";

const inflate = async (raw: Uint8Array) => new Uint8Array(inflateRawSync(raw));

/** A minimal zip: each file stored or deflated, with its central directory. */
function zip(files: { name: string; text: string; deflate?: boolean }[]): Uint8Array {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name);
    const raw = Buffer.from(f.text);
    const data = f.deflate ? deflateRawSync(raw) : raw;
    const method = f.deflate ? 8 : 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, data);
    centrals.push(central, name);
    offset += 30 + name.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, end]));
}

test("Word and PowerPoint XML turn into one line per paragraph", () => {
  assert.equal(xmlText('<w:p><w:r><w:t>সালোক</w:t></w:r><w:r><w:t xml:space="preserve">সংশ্লেষণ</w:t></w:r></w:p><w:p><w:r><w:t>A &amp; B &#2453;</w:t></w:r></w:p>'), "সালোকসংশ্লেষণ\nA & B ক");
});

test("a .docx gives its body text, deflated or stored", async () => {
  const xml = "<w:document><w:body><w:p><w:r><w:t>নিউটনের প্রথম সূত্র</w:t></w:r></w:p><w:p><w:r><w:t>বস্তু স্থির থাকে</w:t></w:r></w:p></w:body></w:document>";
  for (const deflate of [true, false]) {
    const bytes = zip([{ name: "[Content_Types].xml", text: "<Types/>" }, { name: "word/document.xml", text: xml, deflate }]);
    assert.equal(await officeText(bytes, inflate), "নিউটনের প্রথম সূত্র\nবস্তু স্থির থাকে");
  }
});

test("a .pptx gives its slides in order, numbered", async () => {
  const slide = (t: string) => `<p:sld><a:p><a:r><a:t>${t}</a:t></a:r></a:p></p:sld>`;
  const bytes = zip([
    { name: "ppt/slides/slide10.xml", text: slide("শেষ"), deflate: true },
    { name: "ppt/slides/slide2.xml", text: slide("মাঝে"), deflate: true },
    { name: "ppt/slides/slide1.xml", text: slide("শুরু") },
  ]);
  assert.equal(await officeText(bytes, inflate), "[স্লাইড 1]\nশুরু\n\n[স্লাইড 2]\nমাঝে\n\n[স্লাইড 10]\nশেষ");
});

test("anything that is not a Word or PowerPoint zip gives null", async () => {
  assert.equal(await officeText(new TextEncoder().encode("just text"), inflate), null);
  assert.equal(await officeText(zip([{ name: "xl/workbook.xml", text: "<x/>" }]), inflate), null);
});

test("old binary files give their UTF-16 runs, or null when there is too little", () => {
  const body = "বাংলাদেশের নদী ব্যবস্থা ও তার প্রভাব নিয়ে আজকের পাঠ";
  const utf16 = Buffer.from(body, "utf16le");
  const noise = Buffer.from([0, 1, 2, 3, 255, 254, 9, 0]);
  const text = legacyText(new Uint8Array(Buffer.concat([noise, utf16, noise, Buffer.from(" and the rivers of the delta move south", "utf16le"), noise])));
  assert.ok(text?.includes(body));
  assert.ok(text?.includes("rivers of the delta"));
  assert.equal(legacyText(new Uint8Array(Buffer.concat([noise, Buffer.from("short", "utf16le")]))), null);
});
