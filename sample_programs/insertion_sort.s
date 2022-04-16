	.text
	.file	"insertion_sort.c"
	.globl	swap                    # -- Begin function swap
	.p2align	4, 0x90
	.type	swap,@function
swap:                                   # @swap
	.cfi_startproc
# %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	movq	%rdi, -8(%rbp)
	movl	%esi, -12(%rbp)
	movl	%edx, -16(%rbp)
	movq	-8(%rbp), %rax
	movslq	-12(%rbp), %rcx
	movl	(%rax,%rcx,4), %edx
	movl	%edx, -20(%rbp)
	movq	-8(%rbp), %rax
	movslq	-16(%rbp), %rcx
	movl	(%rax,%rcx,4), %edx
	movq	-8(%rbp), %rax
	movslq	-12(%rbp), %rcx
	movl	%edx, (%rax,%rcx,4)
	movl	-20(%rbp), %edx
	movq	-8(%rbp), %rax
	movslq	-16(%rbp), %rcx
	movl	%edx, (%rax,%rcx,4)
	popq	%rbp
	.cfi_def_cfa %rsp, 8
	retq
.Lfunc_end0:
	.size	swap, .Lfunc_end0-swap
	.cfi_endproc
                                        # -- End function
	.globl	insertion_sort          # -- Begin function insertion_sort
	.p2align	4, 0x90
	.type	insertion_sort,@function
insertion_sort:                         # @insertion_sort
	.cfi_startproc
# %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$32, %rsp
	movq	%rdi, -8(%rbp)
	movl	%esi, -12(%rbp)
	movl	$1, -16(%rbp)
.LBB1_1:                                # =>This Loop Header: Depth=1
                                        #     Child Loop BB1_3 Depth 2
	movl	-16(%rbp), %eax
	cmpl	-12(%rbp), %eax
	jge	.LBB1_8
# %bb.2:                                #   in Loop: Header=BB1_1 Depth=1
	movl	-16(%rbp), %eax
	movl	%eax, -20(%rbp)
.LBB1_3:                                #   Parent Loop BB1_1 Depth=1
                                        # =>  This Inner Loop Header: Depth=2
	xorl	%eax, %eax
                                        # kill: def $al killed $al killed $eax
	cmpl	$0, -20(%rbp)
	movb	%al, -21(%rbp)          # 1-byte Spill
	jle	.LBB1_5
# %bb.4:                                #   in Loop: Header=BB1_3 Depth=2
	movq	-8(%rbp), %rax
	movl	-20(%rbp), %ecx
	subl	$1, %ecx
	movslq	%ecx, %rdx
	movl	(%rax,%rdx,4), %ecx
	movq	-8(%rbp), %rax
	movslq	-20(%rbp), %rdx
	cmpl	(%rax,%rdx,4), %ecx
	setg	%sil
	movb	%sil, -21(%rbp)         # 1-byte Spill
.LBB1_5:                                #   in Loop: Header=BB1_3 Depth=2
	movb	-21(%rbp), %al          # 1-byte Reload
	testb	$1, %al
	jne	.LBB1_6
	jmp	.LBB1_7
.LBB1_6:                                #   in Loop: Header=BB1_3 Depth=2
	movq	-8(%rbp), %rdi
	movl	-20(%rbp), %esi
	movl	-20(%rbp), %eax
	subl	$1, %eax
	movl	%eax, %edx
	callq	swap
	movl	-20(%rbp), %eax
	addl	$-1, %eax
	movl	%eax, -20(%rbp)
	jmp	.LBB1_3
.LBB1_7:                                #   in Loop: Header=BB1_1 Depth=1
	movl	-16(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -16(%rbp)
	jmp	.LBB1_1
.LBB1_8:
	addq	$32, %rsp
	popq	%rbp
	.cfi_def_cfa %rsp, 8
	retq
.Lfunc_end1:
	.size	insertion_sort, .Lfunc_end1-insertion_sort
	.cfi_endproc
                                        # -- End function
	.globl	append_to_string        # -- Begin function append_to_string
	.p2align	4, 0x90
	.type	append_to_string,@function
append_to_string:                       # @append_to_string
	.cfi_startproc
# %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$32, %rsp
	movq	%rdi, -8(%rbp)
	movl	%esi, -12(%rbp)
	movl	%edx, -16(%rbp)
	cmpl	$0, -16(%rbp)
	je	.LBB2_2
# %bb.1:
	movq	-8(%rbp), %rdi
	movl	-12(%rbp), %edx
	movabsq	$.L.str, %rsi
	movb	$0, %al
	callq	sprintf
	movl	%eax, -20(%rbp)
	jmp	.LBB2_3
.LBB2_2:
	movq	-8(%rbp), %rdi
	movl	-12(%rbp), %edx
	movabsq	$.L.str.1, %rsi
	movb	$0, %al
	callq	sprintf
	movl	%eax, -20(%rbp)
.LBB2_3:
	movl	-20(%rbp), %eax
	addq	$32, %rsp
	popq	%rbp
	.cfi_def_cfa %rsp, 8
	retq
.Lfunc_end2:
	.size	append_to_string, .Lfunc_end2-append_to_string
	.cfi_endproc
                                        # -- End function
	.globl	arr_to_string           # -- Begin function arr_to_string
	.p2align	4, 0x90
	.type	arr_to_string,@function
arr_to_string:                          # @arr_to_string
	.cfi_startproc
# %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$48, %rsp
	movq	%rdi, -16(%rbp)
	movl	%esi, -20(%rbp)
	movl	-20(%rbp), %eax
	addl	$3, %eax
	subl	$1, %eax
	movl	%eax, -24(%rbp)
	movl	$1, -40(%rbp)
	movl	$0, -36(%rbp)
.LBB3_1:                                # =>This Loop Header: Depth=1
                                        #     Child Loop BB3_3 Depth 2
	movl	-36(%rbp), %eax
	cmpl	-20(%rbp), %eax
	jge	.LBB3_7
# %bb.2:                                #   in Loop: Header=BB3_1 Depth=1
	movq	-16(%rbp), %rax
	movslq	-36(%rbp), %rcx
	movl	(%rax,%rcx,4), %edx
	movl	%edx, -44(%rbp)
.LBB3_3:                                #   Parent Loop BB3_1 Depth=1
                                        # =>  This Inner Loop Header: Depth=2
	cmpl	$0, -44(%rbp)
	jle	.LBB3_5
# %bb.4:                                #   in Loop: Header=BB3_3 Depth=2
	movl	-44(%rbp), %eax
	cltd
	movl	$10, %ecx
	idivl	%ecx
	movl	%eax, -44(%rbp)
	movl	-24(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -24(%rbp)
	jmp	.LBB3_3
.LBB3_5:                                #   in Loop: Header=BB3_1 Depth=1
	jmp	.LBB3_6
.LBB3_6:                                #   in Loop: Header=BB3_1 Depth=1
	movl	-36(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -36(%rbp)
	jmp	.LBB3_1
.LBB3_7:
	movslq	-24(%rbp), %rdi
	callq	malloc
	movq	%rax, -32(%rbp)
	cmpq	$0, -32(%rbp)
	jne	.LBB3_9
# %bb.8:
	movabsq	$.L.str.2, %rdi
	movb	$0, %al
	callq	printf
	movq	$0, -8(%rbp)
	jmp	.LBB3_16
.LBB3_9:
	movq	-32(%rbp), %rax
	movb	$91, (%rax)
	movl	$0, -36(%rbp)
.LBB3_10:                               # =>This Inner Loop Header: Depth=1
	movl	-36(%rbp), %eax
	cmpl	-20(%rbp), %eax
	jge	.LBB3_15
# %bb.11:                               #   in Loop: Header=BB3_10 Depth=1
	movq	-32(%rbp), %rax
	movslq	-40(%rbp), %rcx
	addq	%rcx, %rax
	movq	-16(%rbp), %rcx
	movslq	-36(%rbp), %rdx
	movl	(%rcx,%rdx,4), %esi
	movl	-36(%rbp), %edi
	movl	-20(%rbp), %r8d
	subl	$1, %r8d
	cmpl	%r8d, %edi
	setne	%r9b
	andb	$1, %r9b
	movzbl	%r9b, %edx
	movq	%rax, %rdi
	callq	append_to_string
	movl	%eax, -48(%rbp)
	cmpl	$-1, -48(%rbp)
	jne	.LBB3_13
# %bb.12:
	movq	$0, -8(%rbp)
	jmp	.LBB3_16
.LBB3_13:                               #   in Loop: Header=BB3_10 Depth=1
	movl	-48(%rbp), %eax
	addl	-40(%rbp), %eax
	movl	%eax, -40(%rbp)
# %bb.14:                               #   in Loop: Header=BB3_10 Depth=1
	movl	-36(%rbp), %eax
	addl	$1, %eax
	movl	%eax, -36(%rbp)
	jmp	.LBB3_10
.LBB3_15:
	movq	-32(%rbp), %rax
	movq	%rax, -8(%rbp)
.LBB3_16:
	movq	-8(%rbp), %rax
	addq	$48, %rsp
	popq	%rbp
	.cfi_def_cfa %rsp, 8
	retq
.Lfunc_end3:
	.size	arr_to_string, .Lfunc_end3-arr_to_string
	.cfi_endproc
                                        # -- End function
	.globl	main                    # -- Begin function main
	.p2align	4, 0x90
	.type	main,@function
main:                                   # @main
	.cfi_startproc
# %bb.0:
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset %rbp, -16
	movq	%rsp, %rbp
	.cfi_def_cfa_register %rbp
	subq	$16, %rsp
	movabsq	$arr, %rdi
	movl	$20, %esi
	callq	insertion_sort
	movabsq	$arr, %rdi
	movl	$20, %esi
	callq	arr_to_string
	movq	%rax, -8(%rbp)
	movq	-8(%rbp), %rsi
	movabsq	$.L.str.3, %rdi
	movb	$0, %al
	callq	printf
	movq	-8(%rbp), %rdi
	movl	%eax, -12(%rbp)         # 4-byte Spill
	callq	free
	xorl	%eax, %eax
	addq	$16, %rsp
	popq	%rbp
	.cfi_def_cfa %rsp, 8
	retq
.Lfunc_end4:
	.size	main, .Lfunc_end4-main
	.cfi_endproc
                                        # -- End function
	.type	arr,@object             # @arr
	.data
	.globl	arr
	.p2align	4
arr:
	.long	97                      # 0x61
	.long	33                      # 0x21
	.long	17                      # 0x11
	.long	30                      # 0x1e
	.long	31                      # 0x1f
	.long	76                      # 0x4c
	.long	52                      # 0x34
	.long	7                       # 0x7
	.long	50                      # 0x32
	.long	30                      # 0x1e
	.long	73                      # 0x49
	.long	50                      # 0x32
	.long	0                       # 0x0
	.long	6                       # 0x6
	.long	43                      # 0x2b
	.long	73                      # 0x49
	.long	12                      # 0xc
	.long	12                      # 0xc
	.long	44                      # 0x2c
	.long	21                      # 0x15
	.size	arr, 80

	.type	DEFAULT_SIZE,@object    # @DEFAULT_SIZE
	.section	.rodata,"a",@progbits
	.globl	DEFAULT_SIZE
	.p2align	2
DEFAULT_SIZE:
	.long	10                      # 0xa
	.size	DEFAULT_SIZE, 4

	.type	.L.str,@object          # @.str
	.section	.rodata.str1.1,"aMS",@progbits,1
.L.str:
	.asciz	"%d "
	.size	.L.str, 4

	.type	.L.str.1,@object        # @.str.1
.L.str.1:
	.asciz	"%d]"
	.size	.L.str.1, 4

	.type	.L.str.2,@object        # @.str.2
.L.str.2:
	.asciz	"Failed to allocate string\n"
	.size	.L.str.2, 27

	.type	.L.str.3,@object        # @.str.3
.L.str.3:
	.asciz	"%s\n"
	.size	.L.str.3, 4

	.ident	"clang version 10.0.0-4ubuntu1 "
	.section	".note.GNU-stack","",@progbits
	.addrsig
	.addrsig_sym swap
	.addrsig_sym insertion_sort
	.addrsig_sym append_to_string
	.addrsig_sym sprintf
	.addrsig_sym arr_to_string
	.addrsig_sym malloc
	.addrsig_sym printf
	.addrsig_sym free
	.addrsig_sym arr
