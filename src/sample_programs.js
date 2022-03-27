const TEXT_SECTION_START = Uint32Array.from([0x400000])[0];

const FIB = Object.freeze({
  text: Uint32Array.from(
    [
      537591817,
      537657345,
      537395201,
      18469,
      20517,
      0,
      291504137,
      0,
      0,
      0,
      359399434,
      0,
      0,
      268435475,
      0,
      0,
      16421,
      0,
      268435470,
      0,
      0,
      0,
      291504138,
      0,
      0,
      560726015,
      16797733,
      17383456,
      20989989,
      0,
      268500982,
      0,
      0,
      0,
      3735928559,
      0
    ]
  ),
  data: Uint32Array.from(
    [
      0,
      0,
      0,
      0,
    ]
  ),
  entry: TEXT_SECTION_START
});

export {
  FIB,
};

