const TEXT_SECTION_START = Uint32Array.from([0x400000])[0];
const PROGRAMS = [];
const FIB = ({
  name: "fib",
  text:
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
  ,
  data:
    [
      0,
      0,
      0,
      0,
    ]
  ,
  entry: TEXT_SECTION_START,
  src: `
.text

addi    $t3, $zero, 9     # n
addi    $t4, $zero, 1     # constant 1
addi    $t0, $zero, 1     # Current result
move    $t1, $zero        # Previous result
move    $t2, $zero        # temp

# check if n == 0 or 1
nop
beq     $t3, $zero, case_n_0
nop

case_n_1:
    nop
    bne     $t3, $t4, fib_loop      # if n != 1: goto fib_loop
    nop
    beq     $zero, $zero, done      # goto done
    nop

case_n_0:
    move    $t0, $zero              # current = 0
    nop
    beq     $zero, $zero, done      # goto done
    nop

fib_loop:
    nop 
    beq     $t3, $zero, done
    nop
    addi    $t3, $t3, -1            # n = n - 1
    move    $t2, $t0                # tmp = current
    add     $t0, $t0, $t1           # current = current + prev
    move    $t1, $t2                # prev = tmp
    nop
    beq     $zero, $zero, fib_loop  #  goto fib_loop
    nop

done:
    nop
.word 0XDEADBEEF 
  `
});

const RUNNING_SUM = (
  { "entry": 4194312, "text": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 604505064, 8225, 8921121, 554237951, 486604797, 0, 3735928559, 0, 0, 0], "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0], "name": "running_sum", "src": ".text\n.global __start\nnop\nnop\n\n__start:\n  addiu $t0, $0, 1000\n  addu  $a0, $0, $0\n\nsum_loop:\n  addu  $a0, $a0, $t0\n  sub   $t0, $t0, 1\n  bgt   $t0, $0, sum_loop\n\ndone:\n  .word 0xDEADBEEF\n\n.data\n.word 0\n" }
);

const GCD = (
  { "entry": 4194356, "text": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 277151754, 0, 10749994, 337641476, 0, 10758178, 268500985, 0, 8724514, 268500982, 0, 65011720, 0, 604241998, 604307519, 599654396, 2948530176, 0, 0, 0, 0, 0, 202375168, 0, 2411659264, 0, 599588868, 3735928559], "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0], "name": "gcd", "src": ".text\n.globl __start\n\n.globl gcd\ngcd:\n  # a0 is a\n  # a1 is b\n  # while a != b\n  #   if a \u003e b\n  #     a = a - b \n  #   else\n  #     b = b - a\n  # return a\n  gcd_precheck:\n    beq $a0, $a1, gcd_done\n    bgt $a0, $a1, gcd_a_less_b\n\n  gcd_b_less_a:\n    sub $a1, $a1, $a0\n    b gcd_precheck\n\n  gcd_a_less_b:\n    sub $a0, $a0, $a1\n    b gcd_precheck\n\n\n  gcd_done:\n    jr $ra\n\n.text\n__start:\n  li  $a0, 78\n  li  $a1, 63\n  sub $sp, $sp, 4\n  sw  $ra, ($sp)\n  nop \n  nop\n  nop\n  nop\n  nop\n  jal gcd\n  lw  $ra, ($sp)\n  add $sp, $sp, 4\n  .word 0xDEADBEEF\n\n.data\n\n" }
);

PROGRAMS.push(FIB, RUNNING_SUM, GCD);

PROGRAMS.forEach(e => {
  e.text = Uint32Array.from(e.text);
  e.data = Uint32Array.from(e.data);
});

export {
  FIB,
  PROGRAMS
};

