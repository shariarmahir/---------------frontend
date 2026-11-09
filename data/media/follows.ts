/**
 * Who follows whom among the demo members (handle → the handles they
 * follow). Mutual-follower lines, "আপনাকে অনুসরণ করে" and the followers tab
 * read from it; the viewer's own follows live in the browser store, seeded
 * from Mahir's row here.
 */
export const follows: Record<string, readonly string[]> = {
  mahir: ["anik", "shapla", "jalal", "rahima"],
  shapla: ["mahir", "rahima", "moyna", "arif", "hasina"],
  rahima: ["shapla", "nusrat", "moyna", "kamal", "farhana"],
  anik: ["mahir", "tanvir", "sajid", "nusrat", "selim", "nabila"],
  tanvir: ["anik", "mahir", "rokeya", "sajid"],
  mitu: ["sumaiya", "rupa", "nabila", "farhana"],
  rafi: ["kamal", "babul", "selim", "monir"],
  nusrat: ["rahima", "anik", "mitu", "farhana", "sajid", "mahir"],
  joy: ["sabbir", "tanvir", "anik", "nabila"],
  sumaiya: ["mitu", "tareq", "nabila", "rupa"],
  arif: ["mahir", "shapla", "jalal", "monir", "joy"],
  taslima: ["hasina", "moyna", "rupa", "shapla"],
  nabila: ["mitu", "sumaiya", "anik", "joy"],
  sajid: ["anik", "tanvir", "selim", "mahir", "nusrat"],
  rupa: ["mitu", "taslima", "sumaiya", "hasina"],
  kamal: ["babul", "rafi", "selim", "rahima"],
  babul: ["kamal", "rafi", "moyna"],
  hasina: ["taslima", "shapla", "moyna", "rupa"],
  moyna: ["rahima", "hasina", "babul", "shapla"],
  sabbir: ["joy", "jalal", "rokeya", "monir"],
  jalal: ["mahir", "monir", "rokeya", "arif", "sabbir"],
  rokeya: ["jalal", "monir", "sabbir", "tanvir"],
  monir: ["jalal", "rokeya", "arif", "rafi"],
  selim: ["sajid", "anik", "kamal", "tareq"],
  tareq: ["selim", "sumaiya", "farhana", "sajid"],
  farhana: ["nusrat", "rahima", "tareq", "mitu"],
};
