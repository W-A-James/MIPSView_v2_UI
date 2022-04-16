rout_files = running_sum.rout 
rdata_files = running_sum.rdata

cc = mips-img-linux-gnu-gcc
as = mips-img-linux-gnu-as
ld = mips-img-linux-gnu-ld
read_elf = mips-img-linux-gnu-readelf
as_flags = -march=r2000 -g --no-trap -msoft-float -O0
cc_flags = -march=r2000 -mfp32 -mno-check-zero-division -mno-llsc -mcompact-branches=never -fno-delayed-branch -Og -g -c
ld_flags = -nolibc -nostdlib -nodefaultlibs -static --Ttext 0x400000 --no-omagic --architecture r2000
rout = ./compile_to_rout
objdump = mips-img-linux-gnu-objdump

all: $(rdata_files) $(rout_files)

%.json: %.rout %.rdata
	./rout_to_json -progName $*

%.rout: %.dump %.entry
	export E_PT=$$(cat $*.entry) && echo $$E_PT && $(rout) --entry $$(echo $$E_PT) --infile $*.dump --outfile $*.rout

%.rdata: %.data
	$(rout) --infile $< --outfile $@

%.o: %.S
	$(as) $(as_flags) $< -o $@

%.l: %.o
	$(ld) $(ld_flags) $< -o $@

%.dump: %.l
	$(objdump) -s -z --section=.text $< > $@

%.data: %.l
	./link.sh $< $@

%.entry: %.l
	./get_entry.sh $< > $@

.PHONY: clean
clean:
	rm -f *.o *.dump *.data *.l *.rdata *.rout 
