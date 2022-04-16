.text
.globl __start

.globl gcd
gcd:
  # a0 is a
  # a1 is b
  # while a != b
  #   if a > b
  #     a = a - b 
  #   else
  #     b = b - a
  # return a
  gcd_precheck:
    beq $a0, $a1, gcd_done
    bgt $a0, $a1, gcd_a_less_b

  gcd_b_less_a:
    sub $a1, $a1, $a0
    b gcd_precheck

  gcd_a_less_b:
    sub $a0, $a0, $a1
    b gcd_precheck


  gcd_done:
    jr $ra

.text
__start:
  li  $a0, 78
  li  $a1, 63
  sub $sp, $sp, 4
  sw  $ra, ($sp)
  nop 
  nop
  nop
  nop
  nop
  jal gcd
  lw  $ra, ($sp)
  add $sp, $sp, 4
  .word 0xDEADBEEF

.data

