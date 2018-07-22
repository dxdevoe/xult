fin = open("map.csv","r")
fout = open("mapout.txt","w")

fout.write("[\n") 

for line in fin:
  fout.write("[" + line + "],\n")